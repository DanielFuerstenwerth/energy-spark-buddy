
-- Add missing companion text field column for vnbAdditionalCosts hasTextField option
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS vnb_additional_costs_other text;
