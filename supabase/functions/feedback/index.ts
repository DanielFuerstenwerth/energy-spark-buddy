import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const FeedbackRequestSchema = z.object({
  messageId: z.string().uuid({ message: 'Invalid message ID format' }),
  feedback: z.enum(['UP', 'DOWN', 'NONE'], { 
    errorMap: () => ({ message: 'Feedback must be UP, DOWN, or NONE' })
  }),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    
    // Validate input
    const validationResult = FeedbackRequestSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input',
          details: validationResult.error.issues 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messageId, feedback } = validationResult.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`Feedback update für Message ${messageId}: ${feedback}`);

    const { error } = await supabase
      .from('messages')
      .update({ feedback })
      .eq('id', messageId);

    if (error) {
      console.error('Fehler beim Update:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Feedback error:', error);
    
    // Return generic error to client, log details server-side
    return new Response(
      JSON.stringify({ error: 'Failed to process feedback' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
