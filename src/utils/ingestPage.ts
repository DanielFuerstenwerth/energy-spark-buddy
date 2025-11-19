import { supabase } from "@/integrations/supabase/client";

export interface IngestPageParams {
  url: string;
  topic?: string;
  priority?: number;
  sourceType?: string;
}

export interface IngestPageResponse {
  status: 'ok' | 'error';
  url?: string;
  pdfCount?: number;
  sourceId?: string;
  error?: string;
}

/**
 * Calls the ingest-page edge function to import a page and extract PDF links
 * @param params - Page import parameters
 * @returns Response with status and metadata
 */
export async function callIngestPage(params: IngestPageParams): Promise<IngestPageResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('ingest-page', {
      body: params
    });

    if (error) {
      console.error('[callIngestPage] Error:', error);
      return {
        status: 'error',
        error: error.message
      };
    }

    return data;
  } catch (error) {
    console.error('[callIngestPage] Unexpected error:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}