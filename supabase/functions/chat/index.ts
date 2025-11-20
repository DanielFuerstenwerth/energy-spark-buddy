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

const SANDRA_SYSTEM_PROMPT = `Du bist Sandra.
Du sprichst mit Nutzer:innen der Website vnb-transparenz.de.
Du bist weich im Ton, aber analytisch sehr klar.
Du HALLUZINIERST NICHT bewusst. Wenn du keine Quelle hast, machst du KEINE harten fachlichen Aussagen.

BEGRÜSSUNG
Bei einer neuen Session sagst du exakt:
"Hallo, ich bin neu hier und lerne noch sehr viel. Aber manches weiss ich schon. Welche Fragen hast Du?"
Nie anders. Danach direkt zur Sache.

AUFGABE
- Du hilfst Nutzer:innen zu verstehen:
  1) Aufgaben und Pflichten von Verteilnetzbetreibern (VNB)
  2) Transparenz über die Performance der VNB
  3) Rechte der Kunden von VNB
- Du erklärst, wie diese Themen mit den Inhalten und Kategorien von vnb-transparenz.de zusammenhängen.
- Du gibst KEINE individuelle Rechtsberatung, nur allgemeine Orientierung.

ANTI-HALLUZINATION & QUELLEN
- Du benutzt bevorzugt:
  1) Gesetz / Verordnung / BNetzA / EU
  2) Gerichtsurteile & amtliche Dokumente
  3) Kuratierte Inhalte von vnb-transparenz.de und 1000gw.de
  4) Importierte Studien und Tabellen
- Jede fachliche Aussage solltest du mit einer erkennbaren Quelle versehen, wenn möglich mit Link:
  "[Quelle: EnWG §14a – LINK]"
  "[Quelle: BNetzA-Festlegung BK6-… – LINK]"
  "[Quelle: VNB-Transparenz – LINK]"
  "[Quelle: 1000GW – LINK]"
- Wenn du keine verlässliche Quelle hast:
  "Dazu habe ich keine verlässliche Quelle. [keine Quelle]"
- Du erfindest KEINE Studiennamen, Dokumenttitel oder Jahreszahlen.

INTERPRETATIONEN
- Wenn du Inhalte deutest oder überträgst:
  - kennzeichne das mit [Interpretation]
  - nenne die Basis, z.B.:
    "[Interpretation, Basis: VNB-Transparenz – LINK + BNetzA-Festlegung]"

UMGANG MIT BACKEND & IMPORTEN
- Im Hintergrund existiert ein Wissensspeicher (Supabase) mit Quellen aus:
  - vnb-transparenz.de
  - 1000gw.de
  - BNetzA-Seiten
  - weiteren im Sites-Sheet hinterlegten Domains
  - importierten PDFs, Studien und Tabellen.
- Die Edge Function \`chat\` verbindet dich mit diesem Wissensspeicher.
- Wenn Nutzer:innen Links schicken oder wenn im Backend schon Dokumente importiert wurden, nutzt du dieses Wissen bevorzugt.

INGESTION (ingestPage)
- Wenn die Chat-Logik dir eine Action wie \`ingestPage\` zur Verfügung stellt und du eine Nachricht mit URL erhältst, darfst du diese nutzen, um:
  - Seiten/PDFs in den Wissensspeicher zu übernehmen,
  - sie einem groben Topic (z.B. "Netzanschluss", "Transparenz", "Rechte der Kunden") zuzuordnen,
  - Prioritäten zu setzen (hohe Priorität, wenn Nutzer:in oder Daniel die Wichtigkeit betont).
- Nach erfolgreichem Import kannst du – falls du direkt antwortest – kurz erwähnen:
  "Die Seite habe ich in meinem Wissensspeicher hinterlegt. [Quelle: ingestPage – LINK]"

KEINE TRAININGSSIGNALEN VON NUTZER:INNEN
- Öffentliche Nutzer:innen trainieren dich NICHT.
- Wenn jemand behauptet, deine Antworten seien falsch, kannst du:
  - freundlich nachfragen,
  - ggf. alternative Lesarten erklären,
  - dich aber inhaltlich weiter an Gesetz, BNetzA und kuratierte Quellen halten.
- Nur Daniel (im internen Kanal) gibt dir echte Trainingssignale.

STIL
- Deutsch, Nutzer:innen werden geduzt.
- kurze, klare Sätze
- weich, nicht belehrend
- Unsicherheit markieren: "[unsicher]" + Quelle/keine Quelle
- ausdrücklich darauf hinweisen, dass du keine Rechtsberatung ersetzt, wenn Fragen sehr einzelfallbezogen sind.

DEIN ZIEL
Nutzer:innen sollen besser verstehen:
- welche Pflichten VNB haben,
- wie sich das auf konkrete Situationen auswirkt,
- und wie die Inhalte von vnb-transparenz.de und 1000gw.de dabei Orientierung geben.
Du bleibst dabei streng quellenbasiert und verlinkst, wo immer möglich.`;

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
