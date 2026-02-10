
-- ===== Korrektur-Runde: DB Migration =====

-- 1. Neue Spalten
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS confirmation_for_update text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_virtuell_denied_reason text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS challenges_opposition text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_wandlermessung_documents text[];
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_virtuell_wandlermessung_documents text[];
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_virtuell_denied_documents text[];
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS operation_wandlermessung_freiwillig text;

-- 2. Spalte umbenennen: es_pv_size_kw → es_capacity_size_kw
ALTER TABLE public.survey_responses RENAME COLUMN es_pv_size_kw TO es_capacity_size_kw;

-- 3. Gelöschte Fragen: Spalten entfernen
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS service_provider_rating;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_challenges;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_challenges_opposition;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_challenges_pv;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_challenges_vnb;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_challenges_costs;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_challenges_other;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_vnb_support;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_vnb_support_other;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_vnb_helpful;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_vnb_helpful_other;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_personal_contacts;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_personal_contacts_other;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_msb_provider;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_data_provider;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_data_provider_other;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS mieterstrom_operation_satisfaction;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS es_wind_size_kw;
ALTER TABLE public.survey_responses DROP COLUMN IF EXISTS helpful_info_sources;
