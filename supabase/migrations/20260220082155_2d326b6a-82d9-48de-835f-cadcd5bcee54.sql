
-- Add missing TEXT columns for multi-select Details Record fields
-- These store serialized Record<string,string> from per-option text inputs
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS motivation_details TEXT;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS actor_dienstleister_category_details TEXT;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS ggv_decision_reasons_details TEXT;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_decision_reasons_details TEXT;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_contact_details TEXT;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_vnb_contact_details TEXT;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_vnb_response_details TEXT;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_rejection_response_details TEXT;
