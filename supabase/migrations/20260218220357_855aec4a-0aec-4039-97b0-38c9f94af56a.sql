-- Add status column to distinguish drafts from submitted responses
ALTER TABLE public.survey_responses 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';

-- Add draft_token so anonymous users can update their own drafts
ALTER TABLE public.survey_responses 
  ADD COLUMN IF NOT EXISTS draft_token uuid;

-- Index for fast draft lookups
CREATE INDEX IF NOT EXISTS idx_survey_responses_draft_token ON public.survey_responses(draft_token) WHERE draft_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_survey_responses_status ON public.survey_responses(status);

-- Allow anonymous users to UPDATE their own drafts (identified by draft_token)
CREATE POLICY "Anyone can update their own drafts"
  ON public.survey_responses
  FOR UPDATE
  USING (status = 'draft' AND draft_token IS NOT NULL)
  WITH CHECK (status IN ('draft', 'submitted'));

-- Allow anonymous users to SELECT their own drafts to check existence
CREATE POLICY "Anyone can read their own drafts by token"
  ON public.survey_responses
  FOR SELECT
  USING (draft_token IS NOT NULL AND status = 'draft');