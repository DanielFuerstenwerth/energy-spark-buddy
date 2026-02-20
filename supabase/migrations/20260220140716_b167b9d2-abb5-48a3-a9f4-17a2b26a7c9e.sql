
-- Atomic draft sync: DELETE old drafts + INSERT new ones in a single transaction
-- This eliminates the race condition where an export could run between DELETE and INSERT
CREATE OR REPLACE FUNCTION public.upsert_survey_drafts(
  p_draft_token uuid,
  p_rows jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Step 1: Delete existing draft rows for this token
  DELETE FROM public.survey_responses
  WHERE draft_token = p_draft_token
    AND status = 'draft';

  -- Step 2: Insert new draft rows from the JSON array
  INSERT INTO public.survey_responses
  SELECT r.*
  FROM jsonb_populate_recordset(null::public.survey_responses, p_rows) AS r;
END;
$$;
