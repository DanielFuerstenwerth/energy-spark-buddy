-- Drop the vnb_msb_offer column (consolidated into vnb_response)
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS vnb_msb_offer;