import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, topic, priority, sourceType } = await req.json();

    // Validate input
    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[ingest-page] Processing URL:', url);

    // Fetch the HTML content
    const htmlResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VNB-Transparenz-Bot/1.0)',
      },
    });

    if (!htmlResponse.ok) {
      throw new Error(`Failed to fetch URL: ${htmlResponse.status} ${htmlResponse.statusText}`);
    }

    const html = await htmlResponse.text();
    console.log('[ingest-page] Fetched HTML, length:', html.length);

    // Find all PDF links in the HTML
    const pdfUrls = extractPdfUrls(html, url);
    console.log('[ingest-page] Found PDF URLs:', pdfUrls.length);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert into sources table
    const { data, error } = await supabase
      .from('sources')
      .insert({
        url,
        topic: topic || null,
        priority: priority || 2,
        source_type: sourceType || 'unbekannt',
        pdf_urls: pdfUrls.length > 0 ? pdfUrls : null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[ingest-page] Database error:', error);
      throw new Error(`Database error: ${error.message}`);
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
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Extracts all PDF URLs from HTML content
 * Handles both absolute and relative URLs
 */
function extractPdfUrls(html: string, baseUrl: string): string[] {
  const pdfUrls = new Set<string>();
  
  // Regular expression to find href attributes containing .pdf
  // Handles: href="file.pdf", href='/path/file.pdf', href="https://example.com/file.pdf"
  const hrefRegex = /href=["']([^"']+\.pdf[^"']*)["']/gi;
  
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    const pdfUrl = match[1];
    
    try {
      // Convert relative URLs to absolute
      const absoluteUrl = new URL(pdfUrl, baseUrl).href;
      pdfUrls.add(absoluteUrl);
    } catch (e) {
      console.warn('[extractPdfUrls] Invalid URL:', pdfUrl, e);
    }
  }
  
  return Array.from(pdfUrls);
}