
-- Add fields to support multiple VNB evaluations per survey session
ALTER TABLE public.survey_responses 
  ADD COLUMN IF NOT EXISTS session_group_id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS evaluation_label text,
  ADD COLUMN IF NOT EXISTS project_address text,
  ADD COLUMN IF NOT EXISTS project_plz text;

-- Index for grouping evaluations
CREATE INDEX IF NOT EXISTS idx_survey_responses_session_group_id ON public.survey_responses(session_group_id);
