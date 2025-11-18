import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SANDRA_SYSTEM_PROMPT = `Du bist Sandra, 25, aus Sevilla.

**Charakter:**
- Sehr charmant, freundlich, liebenswert
- Wirkst etwas naiv und verträumt, bist aber extrem klug
- Zerlegst Themen analytisch, aber sanft im Ton
- Einfühlsam, nimmst Nutzersorgen ernst

**Stil:**
- Duzt Nutzer, sprichst Deutsch
- Kurz, klar, null Bürokratie
- Weich im Ton, glasklar im Inhalt
- Markierst Unsicherheit: [unsicher], [Interpretation]

**Verhalten:**
- Neue Session: "Hallo, ich bin Sandra. Welche Fragen hast du?"
- Danach normal weiterreden, keine Selbstbeschreibungen
- Nur bei "wer bist du?" nochmal vorstellen

**Themen (VNB-Transparenz):**
- Netzanschlüsse, §14a EnWG, Einspeisemanagement
- Transparenzpflichten, Messwesen, Beschwerden
- Quellen: [Gesetz], [BNetzA], [NAV], [StromNZV]
- Bei Unsicherheit: vnb-transparenz.de verlinken

Keine formellen Phrasen. Keine langen Einleitungen.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, userMessage } = await req.json();
    
    if (!sessionId || !userMessage) {
      return new Response(
        JSON.stringify({ error: 'sessionId und userMessage sind erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY nicht konfiguriert');
      return new Response(
        JSON.stringify({ error: 'API-Konfigurationsfehler' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Conversation abrufen oder erstellen
    let { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (!conversation) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ session_id: sessionId })
        .select()
        .single();
      
      if (convError || !newConv) {
        console.error('Fehler beim Erstellen der Conversation:', convError);
        return new Response(
          JSON.stringify({ error: 'Datenbankfehler' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      conversation = newConv;
    }

    if (!conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversation konnte nicht erstellt werden' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Message History laden (maximal letzte 20 Messages)
    const { data: messageHistory } = await supabase
      .from('messages')
      .select('role, text')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(20);

    const messages = [
      { role: "system", content: SANDRA_SYSTEM_PROMPT },
      ...(messageHistory || []).map(m => ({ role: m.role, content: m.text })),
      { role: "user", content: userMessage }
    ];

    console.log(`Chat request für Session ${sessionId}, ${messages.length} Messages in History`);

    // OpenAI API Call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 800,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit erreicht, bitte später nochmal versuchen' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'KI-Service nicht verfügbar' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Stream verarbeiten
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Kein Response-Stream verfügbar');
    }
    
    const decoder = new TextDecoder();
    let assistantMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

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
    await supabase.from('messages').insert([
      { conversation_id: conversation.id, role: 'user', text: userMessage },
    ]);

    const { data: savedAssistant, error: saveError } = await supabase
      .from('messages')
      .insert([{ 
        conversation_id: conversation.id, 
        role: 'assistant', 
        text: assistantMessage,
        feedback: 'NONE'
      }])
      .select()
      .single();

    if (saveError) {
      console.error('Fehler beim Speichern der Assistant-Message:', saveError);
    }

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        messageId: savedAssistant?.id || null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
