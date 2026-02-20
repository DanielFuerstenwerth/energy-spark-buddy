
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

  -- Step 2: Insert each row with explicit defaults for NOT NULL columns
  FOR row_data IN SELECT * FROM jsonb_array_elements(p_rows)
  LOOP
    -- Force correct draft metadata
    row_data := row_data || jsonb_build_object(
      'draft_token', p_draft_token,
      'status', 'draft',
      'id', COALESCE(row_data->>'id', gen_random_uuid()::text),
      'created_at', COALESCE(row_data->>'created_at', now()::text),
      'updated_at', now()::text
    );

    INSERT INTO public.survey_responses
    SELECT * FROM jsonb_populate_record(null::public.survey_responses, row_data);
  END LOOP;
END;
$$;
