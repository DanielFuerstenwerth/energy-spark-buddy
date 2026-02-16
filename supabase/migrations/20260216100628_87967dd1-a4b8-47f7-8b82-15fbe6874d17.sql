-- Maßnahme 3: DB-Indizes für Performance bei >1000 Einträgen
CREATE INDEX IF NOT EXISTS idx_survey_responses_session_group_id ON public.survey_responses (session_group_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_vnb_name ON public.survey_responses (vnb_name);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON public.survey_responses (created_at DESC);