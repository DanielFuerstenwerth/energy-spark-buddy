
-- Drop the survey_drafts table (data now saved directly in survey_responses)
DROP TABLE IF EXISTS public.survey_drafts;

-- Drop the expression index (not needed for DELETE+INSERT approach)
DROP INDEX IF EXISTS idx_survey_responses_draft_upsert;
