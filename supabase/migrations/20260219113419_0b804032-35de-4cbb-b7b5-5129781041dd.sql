-- Change dienstleister_website from text to text[] to support multiple entries
-- First, migrate existing data
ALTER TABLE public.survey_responses 
  ADD COLUMN dienstleister_website_arr text[] DEFAULT '{}'::text[];

UPDATE public.survey_responses 
  SET dienstleister_website_arr = ARRAY[dienstleister_website]
  WHERE dienstleister_website IS NOT NULL AND dienstleister_website != '';

ALTER TABLE public.survey_responses DROP COLUMN dienstleister_website;
ALTER TABLE public.survey_responses RENAME COLUMN dienstleister_website_arr TO dienstleister_website;

-- Same for dienstleister_kontakt
ALTER TABLE public.survey_responses 
  ADD COLUMN dienstleister_kontakt_arr text[] DEFAULT '{}'::text[];

UPDATE public.survey_responses 
  SET dienstleister_kontakt_arr = ARRAY[dienstleister_kontakt]
  WHERE dienstleister_kontakt IS NOT NULL AND dienstleister_kontakt != '';

ALTER TABLE public.survey_responses DROP COLUMN dienstleister_kontakt;
ALTER TABLE public.survey_responses RENAME COLUMN dienstleister_kontakt_arr TO dienstleister_kontakt;