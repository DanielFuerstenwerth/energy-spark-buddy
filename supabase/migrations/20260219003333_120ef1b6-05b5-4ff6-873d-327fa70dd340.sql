
-- Add service provider services column
ALTER TABLE public.survey_responses 
  ADD COLUMN IF NOT EXISTS service_provider_services text[] DEFAULT '{}'::text[];
