import { supabase } from "@/integrations/supabase/client";

export interface SyncSitesResponse {
  status: 'ok' | 'error';
  siteCount?: number;
  pageCountTotal?: number;
  results?: Array<{
    url: string;
    status: 'ok' | 'error';
    pdfCount?: number;
    sourceId?: string;
    error?: string;
  }>;
  message?: string;
  error?: string;
}

/**
 * Calls the sync-sites-from-sheet edge function to update sources from Google Sheet
 * @returns Response with status and metadata
 */
export async function callSyncSitesFromSheet(): Promise<SyncSitesResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('sync-sites-from-sheet', {
      body: {}
    });

    if (error) {
      console.error('[callSyncSitesFromSheet] Error:', error);
      return {
        status: 'error',
        error: error.message
      };
    }

    return data;
  } catch (error) {
    console.error('[callSyncSitesFromSheet] Unexpected error:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
