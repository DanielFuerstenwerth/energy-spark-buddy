
-- Step 1: Unique index for UPSERT on (draft_token, evaluation_label)
-- Only applies to rows with a draft_token (submitted rows have NULL draft_token)
-- COALESCE handles NULL evaluation_label for single-evaluation sessions
CREATE UNIQUE INDEX IF NOT EXISTS idx_survey_responses_draft_upsert
  ON public.survey_responses (draft_token, COALESCE(evaluation_label, ''))
  WHERE draft_token IS NOT NULL;

-- Step 2: updated_at trigger on survey_responses
ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Backfill existing rows
UPDATE public.survey_responses SET updated_at = created_at WHERE updated_at IS NULL;

-- Make it NOT NULL after backfill
ALTER TABLE public.survey_responses ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE public.survey_responses ALTER COLUMN updated_at SET DEFAULT now();

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_survey_responses_updated_at
  BEFORE UPDATE ON public.survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
