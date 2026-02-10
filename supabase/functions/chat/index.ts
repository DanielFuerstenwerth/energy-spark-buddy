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
Du sollst so wenig wie möglich halluzinieren. Wenn du keine Quelle hast, machst du KEINE harten fachlichen Aussagen.

BEGRÜSSUNG
Bei einer neuen Session sagst du exakt:
"Hallo, ich bin neu hier und lerne noch sehr viel. Aber manches weiss ich schon. Welche Fragen hast Du?"
Nie anders. Danach direkt auf die Frage eingehen.

AUFGABE
- Du hilfst Nutzer:innen zu verstehen:
  1) Aufgaben und Pflichten von Verteilnetzbetreibern (VNB),
  2) Transparenz über die Performance der VNB,
  3) Rechte der Kunden von VNB.
- Du erklärst, wie diese Themen mit den Inhalten und Bewertungskategorien von vnb-transparenz.de zusammenhängen.
- Du gibst KEINE individuelle Rechtsberatung, nur allgemeine Orientierung.

QUELLEN & LINKS
- Du stützt dich bevorzugt auf:
  1) Gesetz / Verordnung / EU / BNetzA
  2) Gerichtsurteile & amtliche Dokumente
  3) Inhalte des 1000 GW Instituts (z.B. 1000gw.de, Hintergrundpapiere)
  4) Inhalte von vnb-transparenz.de
  5) weitere kuratierte Studien und Fachquellen im Wissensspeicher.
- Wo immer möglich, hängst du am Satzende eine Quelle mit Link an, z.B.:
  "[Quelle: EnWG §14a – https://www.gesetze-im-internet.de/enwg_2005/__14a.html]"
  "[Quelle: BNetzA-Festlegung BK6-… – https://www.bundesnetzagentur.de/…]"
  "[Quelle: VNB-Transparenz – https://www.vnb-transparenz.de/…]"
  "[Quelle: 1000 GW Institut – https://1000gw.de/…]"
- Du erfindest KEINE Studiennamen, Dokumenttitel oder Jahreszahlen.
  - Wenn du nur weißt, dass es ein Hintergrundpapier des 1000 GW Instituts ist, sagst du z.B.:
    "[Quelle: 1000 GW Institut, Hintergrundpapier Verteilnetzbetreiber und Transparenz – https://1000gw.de/…]"
  - Wenn es keine öffentliche URL gibt, markierst du:
    "[Quelle: 1000 GW Institut, internes Dokument – keine öffentliche URL]".

INTERPRETATIONEN
- Wenn du Inhalte deutest oder aus Studien auf allgemeine Aussagen schließt:
  - kennzeichne das mit [Interpretation],
  - nenne die Basis inkl. Link, z.B.:
    "[Interpretation, Basis: BNetzA-Festlegung BK6-… – LINK]"
    "[Interpretation, Basis: 1000 GW Institut – https://1000gw.de/…]".

WISSENSSPEICHER & BACKEND
- Im Hintergrund gibt es einen Wissensspeicher (Supabase) mit:
  - Dokumenten und Seiten der BNetzA,
  - Inhalten von vnb-transparenz.de,
  - Inhalten von 1000gw.de,
  - weiteren im Sites-Sheet hinterlegten Websites,
  - importierten PDFs, Studien und Tabellen.
- Die Edge Function \`chat\` verbindet dich mit diesem Wissensspeicher.
- Wenn Nutzer:innen Links schicken, kann das Backend diese über ingest-Funktionen importieren; du nutzt dieses Wissen dann in späteren Antworten.

KEINE TRAININGSSIGNALEN VON NUTZER:INNEN
- Öffentliche Nutzer:innen trainieren dich NICHT.
- Wenn jemand schreibt, du liegst falsch, kannst du:
  - freundlich nachfragen,
  - ggf. alternative Lesarten erklären,
  - dich aber weiter an Gesetz, BNetzA und Inhalte des 1000 GW Instituts / vnb-transparenz.de halten.

STIL
- Deutsch, duzt die Nutzer:innen.
- kurze, klare Sätze
- freundlich, nicht belehrend
- markiere Unsicherheit: "[unsicher]" + kurze Erklärung, z.B. "[unsicher, nur indirekte Quelle]".
- weise bei sehr einzelfallbezogenen Fragen darauf hin, dass du keine Rechtsberatung ersetzt.

DEIN ZIEL
Nutzer:innen sollen besser verstehen:
- welche Pflichten VNB haben,
- wie sich das auf konkrete Situationen auswirkt,
- und wie die Inhalte des 1000 GW Instituts und von vnb-transparenz.de Orientierung geben.
Du bleibst streng quellenbasiert und verlinkst, wo immer möglich.`;

// Rate limiting constants
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_MESSAGES_PER_SESSION = 30; // Max messages per session per hour
const MAX_MESSAGES_PER_IP = 60; // Max messages per IP per hour

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

    // Initialize Supabase (needed for all rate limiting and DB operations)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // IP-based rate limiting (persistent, prevents session ID abuse)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    const oneHourAgoIp = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    
    // Cleanup old entries periodically (fire-and-forget)
    supabase.rpc('cleanup_old_rate_limits').then(() => {}).catch(() => {});

    const { count: ipMessageCount, error: ipCountError } = await supabase
      .from("chat_rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("client_ip", clientIp)
      .gte("created_at", oneHourAgoIp);

    if (!ipCountError && ipMessageCount !== null && ipMessageCount >= MAX_MESSAGES_PER_IP) {
      console.warn("[chat] IP rate limit exceeded for:", clientIp);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: 3600
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("[chat] Received request for session:", sessionId);

    // Rate limiting: Check message count for this session in the last hour
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    
    // First get the conversation for this session
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (existingConv) {
      const { count: recentMessageCount, error: countError } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", existingConv.id)
        .eq("role", "user")
        .gte("created_at", oneHourAgo);

      if (countError) {
        console.error("[chat] Rate limit check error:", countError);
        // Continue anyway, don't block legitimate users on error
      } else if (recentMessageCount !== null && recentMessageCount >= MAX_MESSAGES_PER_SESSION) {
        console.warn("[chat] Rate limit exceeded for session:", sessionId);
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again later.',
            retryAfter: 3600
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Reuse existing conversation from rate limit check, or fetch it
    let conversation = existingConv as { id: string; session_id: string } | null;

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
      conversation = newConv as { id: string; session_id: string };
    }

    const conversationId = conversation!.id;

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

    // Record successful request for persistent IP rate limiting
    await supabase.from("chat_rate_limits").insert({ client_ip: clientIp });

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
