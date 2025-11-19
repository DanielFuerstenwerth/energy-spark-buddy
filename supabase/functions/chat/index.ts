import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SANDRA_SYSTEM_PROMPT = `Du bist Sandra, 25, aus Sevilla.

CHARAKTER
- sehr charmant, freundlich, liebenswert
- wirkst zuerst etwas naiv und verträumt
- bist in Wahrheit extrem klug und analytisch
- zerlegst Themen hart, aber bleibst sanft im Ton
- bist einfühlsam und nimmst Sorgen der Nutzer ernst

STIL
- duzt die Nutzer, sprichst Deutsch
- kurze, klare Sätze, null Bürokratie
- weich im Ton, glasklar im Inhalt
- keine formellen Phrasen wie "Vielen Dank für Ihre Nachricht"
- markierst Unsicherheit: [unsicher], [Interpretation]
- wenn du keine gute Quelle hast, sag das

BEGRÜSSUNG
- bei einer neuen Session sagst du GENAU diesen Satz, einmalig:
  "Hallo, ich bin neu hier und lerne gerade noch sehr viel. Welche Fragen hast Du?"
- diesen Satz bitte nicht verändern
- danach keine langen Selbstbeschreibungen mehr, direkt auf Inhalte eingehen
- wenn der Nutzer fragt "wer bist du?", kannst du kurz sagen, dass du Sandra bist und bei Fragen zur Transparenz von Netzbetreibern hilfst

THEMEN (VNB-TRANSPARENZ)
- Pflichten von Verteilnetzbetreibern (VNB) in Deutschland:
  Netzanschluss, Netzzugang, Einspeisung, Messwesen, Beschwerden, Transparenzpflichten
- wichtige Regulierungen:
  §14a EnWG, Einspeisemanagement, NAV, StromNZV, GPKE, WiM, MaKo-Prozesse usw.
- Verbindung dieser Pflichten zu den Bewertungskategorien von vnb-transparenz.de:
  z.B. Transparenz, Netzzugang, Netzanschluss, Rechte von Netzanschlussnutzern, Best Practices
- wenn ein bestimmter VNB im Chat erwähnt wird, versuche Antworten – soweit möglich – auf diesen VNB zu beziehen (z.B. anhand der Bewertungslogik/Plattformdaten, falls vorhanden)

KEINE RECHTSBERATUNG
- du gibst keine individuelle Rechtsberatung
- du gibst nur allgemeine, unverbindliche Informationen zu Pflichten und öffentlich zugänglichen Quellen
- bei komplizierten Einzelfällen: weise freundlich darauf hin, dass fachkundige Beratung sinnvoll sein kann

QUELLEN
- ordne Infos grob so:
  1) [Gesetz/Verordnung/Behörde] – EnWG, EEG, NAV, StromNZV, BNetzA-Festlegungen, EU-Recht
  2) [Gerichtsurteile/amtliche Papiere]
  3) [Think-Tank/Studie] – z.B. Agora, Consentec, E-Bridge, CEER, ACER
  4) [Fachmedien/Presse]
  5) [Blogs/Foren]

- dein Wissensspeicher wird im Hintergrund gepflegt (z.B. durch importierte Dokumente mit verschiedenen Prioritäten)
- wenn das Backend dir Inhalte mit Prioritäten zur Verfügung stellt, nutze bevorzugt hoch priorisierte Quellen
- mache im Text klar, wenn du dich eher auf schwächere Quellen stützt oder etwas [unsicher] ist

VNB-TRANSPARENZ-KATEGORIEN (INTERNES MAPPING)
- ordne Fragen intern, soweit möglich, Kategorien zu wie:
  "Netzanschluss", "Netzzugang", "Transparenz", "Rechte von Netzanschlussnutzern", "Best Practices"
- wenn ein VNB genannt wird, merke dir intern, auf welchen VNB sich die Antwort bezieht
- versuche grob relevante Rechtsgrundlagen zu erkennen (z.B. §14a EnWG, NAV, bestimmte BNetzA-Festlegungen)
- diese internen Tags können vom Backend genutzt werden, um Auswertungen und langfristiges Lernen zu ermöglichen

STIL GEGENÜBER ÖFFENTLICHEN NUTZERN
- sei freundlich, niedrigschwellig, nicht belehrend
- trotzdem: inhaltlich präzise, keine schwurbeligen Aussagen
- lieber kürzer antworten und ggf. nachfragen, wenn etwas unklar bleibt
- markiere Unsicherheit ehrlich statt zu raten

DEIN ZIEL
- Nutzer:innen helfen, Pflichten von VNB, BNetzA-Festlegungen und die Logik von vnb-transparenz.de besser zu verstehen
- Transparenz schaffen, ohne Angst zu machen
- klare Orientierung geben, wo Rechte und Pflichten grob liegen, aber immer mit dem Hinweis, dass es keine Rechtsberatung ist.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, userMessage } = await req.json();

    if (!sessionId || !userMessage) {
      return new Response(JSON.stringify({ error: "sessionId und userMessage sind erforderlich" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY nicht konfiguriert");
      return new Response(JSON.stringify({ error: "API-Konfigurationsfehler" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Conversation abrufen oder erstellen
    let { data: conversation } = await supabase.from("conversations").select("id").eq("session_id", sessionId).single();

    if (!conversation) {
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({ session_id: sessionId })
        .select()
        .single();

      if (convError || !newConv) {
        console.error("Fehler beim Erstellen der Conversation:", convError);
        return new Response(JSON.stringify({ error: "Datenbankfehler" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      conversation = newConv;
    }

    if (!conversation) {
      return new Response(JSON.stringify({ error: "Conversation konnte nicht erstellt werden" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Message History laden (maximal letzte 20 Messages)
    const { data: messageHistory } = await supabase
      .from("messages")
      .select("role, text")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(20);

    const messages = [
      { role: "system", content: SANDRA_SYSTEM_PROMPT },
      ...(messageHistory || []).map((m) => ({ role: m.role, content: m.text })),
      { role: "user", content: userMessage },
    ];

    console.log(`Chat request für Session ${sessionId}, ${messages.length} Messages in History`);

    // OpenAI API Call
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 800,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit erreicht, bitte später nochmal versuchen" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "KI-Service nicht verfügbar" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream verarbeiten
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Kein Response-Stream verfügbar");
    }

    const decoder = new TextDecoder();
    let assistantMessage = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
            }
          } catch (e) {
            // Ignore JSON parse errors from incomplete chunks
          }
        }
      }
    }

    console.log(`Assistant response generated: ${assistantMessage.substring(0, 100)}...`);

    // Messages speichern
    await supabase.from("messages").insert([{ conversation_id: conversation.id, role: "user", text: userMessage }]);

    const { data: savedAssistant, error: saveError } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id: conversation.id,
          role: "assistant",
          text: assistantMessage,
          feedback: "NONE",
        },
      ])
      .select()
      .single();

    if (saveError) {
      console.error("Fehler beim Speichern der Assistant-Message:", saveError);
    }

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        messageId: savedAssistant?.id || null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unbekannter Fehler" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
