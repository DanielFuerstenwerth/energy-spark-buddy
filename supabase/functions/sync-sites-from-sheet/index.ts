import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Google Sheet URL (export as CSV)
const SITES_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1_59jD8V5JKy7F9lMxzif669hb7y6-mRFOHB9J5gnFyk/export?format=csv&gid=0';

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
        JSON.stringify({ error: 'Authentication required', status: 'error' }),
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
        JSON.stringify({ error: 'Invalid authentication', status: 'error' }),
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
        JSON.stringify({ error: 'Admin access required', status: 'error' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[sync-sites-from-sheet] Starting sync process...');

    // Validate the Google Sheet URL domain for security
    const sheetUrl = new URL(SITES_SHEET_URL);
    if (!sheetUrl.hostname.includes('docs.google.com')) {
      throw new Error('Invalid sheet URL domain');
    }

    // Fetch the Google Sheet as CSV with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const sheetResponse = await fetch(SITES_SHEET_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!sheetResponse.ok) {
      throw new Error(`Failed to fetch sheet: ${sheetResponse.status}`);
    }

    const csvText = await sheetResponse.text();
    console.log('[sync-sites-from-sheet] Fetched CSV, length:', csvText.length);

    // Parse CSV and extract URLs
    const urls = parseUrlsFromCsv(csvText);
    console.log('[sync-sites-from-sheet] Found URLs:', urls.length);

    if (urls.length === 0) {
      return new Response(
        JSON.stringify({
          status: 'ok',
          siteCount: 0,
          pageCountTotal: 0,
          message: 'No valid URLs found in sheet'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Use service role for invoking ingest-page function
    const supabaseServiceUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseService = createClient(supabaseServiceUrl, supabaseServiceKey);

    let pageCountTotal = 0;
    const results = [];

    // Process each URL
    for (const url of urls) {
      try {
        console.log('[sync-sites-from-sheet] Processing URL:', url);

        // Apply heuristics based on domain
        const { topic, priority, sourceType } = applyHeuristics(url);

        // Call ingest-page function internally with admin authorization
        const { data, error } = await supabaseService.functions.invoke('ingest-page', {
          body: {
            url,
            topic,
            priority,
            sourceType
          },
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`
          }
        });

        if (error) {
          console.error('[sync-sites-from-sheet] Error ingesting', url, ':', error);
          results.push({ url, status: 'error', error: error.message });
        } else {
          console.log('[sync-sites-from-sheet] Successfully ingested:', url, '- PDFs found:', data.pdfCount);
          pageCountTotal += 1; // Count the main page
          results.push({ url, status: 'ok', pdfCount: data.pdfCount, sourceId: data.sourceId });
        }
      } catch (error) {
        console.error('[sync-sites-from-sheet] Error processing', url, ':', error);
        results.push({ url, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    console.log('[sync-sites-from-sheet] Sync complete. Total sites:', urls.length, 'Total pages:', pageCountTotal);

    return new Response(
      JSON.stringify({
        status: 'ok',
        siteCount: urls.length,
        pageCountTotal,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[sync-sites-from-sheet] Error:', error);
    
    // Return generic error to client, log details server-side
    const status = (error instanceof Error && error.name === 'AbortError') ? 504 : 500;
    return new Response(
      JSON.stringify({
        error: 'Failed to sync sites from sheet',
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
 * Parse URLs from CSV text (column A)
 * Ignore empty lines and lines starting with "#"
 */
function parseUrlsFromCsv(csvText: string): string[] {
  const lines = csvText.split(/\r?\n/);
  const urls: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Skip comments (lines starting with #)
    if (line.startsWith('#')) continue;

    // Skip header row if it's the first line and contains "url"
    if (i === 0 && line.toLowerCase() === 'url') continue;

    // Extract first column (URL)
    const url = line.split(',')[0].trim().replace(/^"|"$/g, '');

    // Validate URL format
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      urls.push(url);
    }
  }

  return urls;
}

/**
 * Apply heuristics based on domain to determine topic, priority, and sourceType
 */
function applyHeuristics(url: string): { topic: string; priority: number; sourceType: string } {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // 1000gw.de domain
    if (domain.includes('1000gw.de')) {
      return {
        topic: '1000GW_Hintergrund',
        priority: 1,
        sourceType: 'Studie_Hoch'
      };
    }

    // vnb-transparenz.de domain
    if (domain.includes('vnb-transparenz.de')) {
      return {
        topic: 'VNB_Transparenz_Plattform',
        priority: 1,
        sourceType: 'Plattform_VNB'
      };
    }

    // Default for other domains
    return {
      topic: 'Allgemein',
      priority: 2,
      sourceType: 'Sonstiges'
    };
  } catch (error) {
    console.warn('[applyHeuristics] Invalid URL:', url);
    return {
      topic: 'Allgemein',
      priority: 2,
      sourceType: 'Sonstiges'
    };
  }
}
