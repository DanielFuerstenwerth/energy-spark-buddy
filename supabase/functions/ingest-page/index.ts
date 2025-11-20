import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const IngestPageSchema = z.object({
  url: z.string().url().refine((url) => {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  }, { message: 'Only HTTP and HTTPS protocols are allowed' }),
  topic: z.string().max(100).optional(),
  priority: z.number().int().min(1).max(10).optional(),
  sourceType: z.string().max(100).optional(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with the user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Check if user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody = await req.json();
    
    // Validate input
    const validationResult = IngestPageSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input',
          details: validationResult.error.issues 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { url, topic, priority, sourceType } = validationResult.data;

    console.log('[ingest-page] Fetching URL:', url);
    
    // Fetch with timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    console.log('[ingest-page] HTML fetched, length:', html.length);

    // Extract PDF links
    const pdfUrls = extractPdfUrls(html, url);
    console.log('[ingest-page] Found PDFs:', pdfUrls.length);

    // Use service role for database operations (admin already verified)
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabaseService
      .from('sources')
      .insert({
        url,
        topic: topic || 'Allgemein',
        priority: priority || 2,
        source_type: sourceType || 'unbekannt',
        pdf_urls: pdfUrls.length > 0 ? pdfUrls : null,
      })
      .select()
      .single();

    if (error) {
      console.error('[ingest-page] Database error:', error);
      throw error;
    }

    console.log('[ingest-page] Successfully inserted source:', data.id);

    return new Response(
      JSON.stringify({
        status: 'ok',
        url,
        pdfCount: pdfUrls.length,
        sourceId: data.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[ingest-page] Error:', error);
    
    // Return generic error to client, log details server-side
    const status = (error instanceof Error && error.name === 'AbortError') ? 504 : 500;
    return new Response(
      JSON.stringify({
        error: 'Failed to process page ingestion',
        status: 'error'
      }),
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Extract PDF URLs from HTML content
 * @param html HTML content
 * @param baseUrl Base URL for resolving relative links
 * @returns Array of PDF URLs
 */
function extractPdfUrls(html: string, baseUrl: string): string[] {
  const pdfRegex = /href=["']([^"']*\.pdf[^"']*)["']/gi;
  const matches = html.matchAll(pdfRegex);
  const pdfUrls: string[] = [];

  for (const match of matches) {
    let pdfUrl = match[1];
    
    // Resolve relative URLs
    if (!pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://')) {
      try {
        const base = new URL(baseUrl);
        pdfUrl = new URL(pdfUrl, base).href;
      } catch {
        console.warn('[extractPdfUrls] Could not resolve relative URL:', pdfUrl);
        continue;
      }
    }
    
    pdfUrls.push(pdfUrl);
  }

  // Remove duplicates
  return [...new Set(pdfUrls)];
}
