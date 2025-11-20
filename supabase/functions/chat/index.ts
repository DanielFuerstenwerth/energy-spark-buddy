import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const ChatRequestSchema = z.object({
  sessionId: z.string().uuid({ message: 'Invalid session ID format' }),
  userMessage: z.string()
    .min(1, { message: 'Message cannot be empty' })
    .max(4000, { message: 'Message is too long (max 4000 characters)' })
    .trim(),
});

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
    const requestBody = await req.json();
    
    // Validate input
    const validationResult = ChatRequestSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input',
          details: validationResult.error.issues 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { sessionId, userMessage } = validationResult.data;

    console.log("[chat] Received request for session:", sessionId);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or create conversation
    let { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (convError) {
      console.error("[chat] Error fetching conversation:", convError);
      throw convError;
    }

    if (!conversation) {
      console.log("[chat] Creating new conversation for session:", sessionId);
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({ session_id: sessionId })
        .select()
        .single();

      if (createError) {
        console.error("[chat] Error creating conversation:", createError);
        throw createError;
      }
      conversation = newConv;
    }

    const conversationId = conversation.id;

    // Load recent messages
    const { data: history, error: histError } = await supabase
      .from("messages")
      .select("role, text")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(10);

    if (histError) {
      console.error("[chat] Error loading history:", histError);
      throw histError;
    }

    console.log("[chat] Loaded history:", history?.length || 0, "messages");

    // Build messages for OpenAI
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: SANDRA_SYSTEM_PROMPT },
    ];

    if (history && history.length > 0) {
      for (const msg of history) {
        messages.push({ role: msg.role, content: msg.text });
      }
    }

    messages.push({ role: "user", content: userMessage });

    // Call OpenAI
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    console.log("[chat] Calling OpenAI...");
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.7,
          stream: true,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("[chat] OpenAI error:", openaiResponse.status, errorText);
      
      if (openaiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    console.log("[chat] OpenAI streaming response started");

    const reader = openaiResponse.body!.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }

    console.log("[chat] Received full response, length:", assistantMessage.length);

    // Save user message
    const { error: userMsgError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "user",
      text: userMessage,
    });

    if (userMsgError) {
      console.error("[chat] Error saving user message:", userMsgError);
    }

    // Save assistant message
    const { data: assistantMsgData, error: assistantMsgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        text: assistantMessage,
      })
      .select()
      .single();

    if (assistantMsgError) {
      console.error("[chat] Error saving assistant message:", assistantMsgError);
      throw assistantMsgError;
    }

    console.log("[chat] Saved messages to database");

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        messageId: assistantMsgData.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Chat error:', error);
    
    // Return generic error to client, log details server-side
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
