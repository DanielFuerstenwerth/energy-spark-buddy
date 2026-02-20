
-- Fix: Use a smarter INSERT that respects column defaults for missing fields
-- Instead of jsonb_populate_recordset (which NULLs missing columns),
-- extract only the keys present in the JSON and let Postgres fill defaults
CREATE OR REPLACE FUNCTION public.upsert_survey_drafts(
  p_draft_token uuid,
  p_rows jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  row_data jsonb;
BEGIN
  -- Step 1: Delete existing draft rows for this token
  DELETE FROM public.survey_responses
  WHERE draft_token = p_draft_token
    AND status = 'draft';

  -- Step 2: Insert each row individually, letting Postgres handle defaults
  FOR row_data IN SELECT * FROM jsonb_array_elements(p_rows)
  LOOP
    -- Ensure draft_token and status are always set correctly
    row_data := row_data || jsonb_build_object(
      'draft_token', p_draft_token,
      'status', 'draft'
    );
    -- Remove id if null/missing so Postgres generates it
    IF row_data->>'id' IS NULL THEN
      row_data := row_data - 'id';
    END IF;
    -- Remove created_at/updated_at so defaults apply
    IF row_data->>'created_at' IS NULL THEN
      row_data := row_data - 'created_at';
    END IF;
    IF row_data->>'updated_at' IS NULL THEN
      row_data := row_data - 'updated_at';
    END IF;

    INSERT INTO public.survey_responses
    SELECT * FROM jsonb_populate_record(null::public.survey_responses, row_data);
  END LOOP;
END;
$$;
