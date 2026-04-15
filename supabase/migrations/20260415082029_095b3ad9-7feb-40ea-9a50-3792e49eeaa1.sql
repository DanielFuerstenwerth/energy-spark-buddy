-- Remove the overly permissive draft policies that expose all drafts to anonymous users
-- Draft sync uses the upsert_survey_drafts RPC (SECURITY DEFINER) so these are not needed

DROP POLICY IF EXISTS "Anyone can read their own drafts by token" ON public.survey_responses;
DROP POLICY IF EXISTS "Anyone can update their own drafts" ON public.survey_responses;
DROP POLICY IF EXISTS "Anyone can delete their own drafts" ON public.survey_responses;