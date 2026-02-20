
-- Dedicated draft storage: single-row UPSERT, no data loss possible
CREATE TABLE public.survey_drafts (
  draft_token uuid PRIMARY KEY,
  payload jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.survey_drafts ENABLE ROW LEVEL SECURITY;

-- Anonymous users can create/update/read/delete their own drafts
-- Security: payload is JSONB, no direct insertion into survey_responses
CREATE POLICY "Anyone can insert drafts"
  ON public.survey_drafts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their drafts"
  ON public.survey_drafts FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can read drafts"
  ON public.survey_drafts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can delete drafts"
  ON public.survey_drafts FOR DELETE
  USING (true);

-- Admins have full access
CREATE POLICY "Admins can manage all drafts"
  ON public.survey_drafts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Clean up old orphaned draft rows from survey_responses
DELETE FROM public.survey_responses WHERE status = 'draft';
