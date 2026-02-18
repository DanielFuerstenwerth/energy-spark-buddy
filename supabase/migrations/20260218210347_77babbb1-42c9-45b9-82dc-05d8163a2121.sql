
-- ============================================================
-- CLEAN REBUILD: survey_responses
-- Derived 1:1 from src/types/survey.ts SurveyData interface
-- ============================================================

-- 1. Drop old table (only test data, confirmed by user)
DROP TABLE IF EXISTS public.survey_responses;

-- 2. Create new table with exact columns from SurveyData interface
CREATE TABLE public.survey_responses (
  -- Meta fields
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  session_group_id uuid DEFAULT gen_random_uuid(),
  evaluation_label text,

  -- Section 1: Über Sie
  actor_types text[] DEFAULT '{}',
  actor_text_fields jsonb DEFAULT '{}',
  actor_other text,
  motivation text[] DEFAULT '{}',
  motivation_other text,
  contact_email text,
  confirmation_for_update text,

  -- Section 2: Projekt
  vnb_name text,
  project_types text[] DEFAULT '{}',
  project_focus text,
  ggv_project_type text,
  ggv_pv_size_kw numeric,
  ggv_party_count integer,
  ggv_building_type text,
  ggv_building_count integer,
  ggv_additional_info text,
  mieterstrom_project_type text,
  mieterstrom_pv_size_kw numeric,
  mieterstrom_party_count integer,
  mieterstrom_building_type text,
  mieterstrom_building_count integer,
  mieterstrom_additional_info text,
  project_address text,
  project_plz text,
  project_locations jsonb DEFAULT '[]',
  mieterstrom_project_locations jsonb,
  mieterstrom_foerderung text,
  mieterstrom_foerderung_nein_grund text,
  mieterstrom_foerderung_nein_grund_other text,

  -- Section 3: Planung Allgemein
  planning_status text[] DEFAULT '{}',
  planning_status_other text,
  mieterstrom_planning_status text[] DEFAULT '{}',
  mieterstrom_planning_status_other text,
  ggv_or_mieterstrom_decision text,
  ggv_decision_reasons text[] DEFAULT '{}',
  ggv_decision_reasons_other text,
  mieterstrom_decision_reasons text[] DEFAULT '{}',
  mieterstrom_decision_reasons_other text,
  implementation_approach text[] DEFAULT '{}',
  implementation_approach_other text,
  challenges text[] DEFAULT '{}',
  challenges_details jsonb DEFAULT '{}',
  vnb_rejection_response text[],
  vnb_rejection_response_other text,
  vnb_rejection_response_details jsonb,

  -- Section 4-GGV: Planung GGV
  vnb_existing_projects text,
  vnb_existing_projects_other text,
  vnb_contact text[] DEFAULT '{}',
  vnb_contact_other text,
  vnb_response text[] DEFAULT '{}',
  vnb_response_reasons text,
  vnb_support_messkonzept text,
  vnb_support_messkonzept_other text,
  vnb_support_formulare text,
  vnb_support_formulare_other text,
  vnb_support_portal text,
  vnb_support_portal_other text,
  vnb_support_other text,
  vnb_support_other_details text,
  vnb_contact_helpful text,
  vnb_contact_helpful_other text,
  vnb_personal_contacts text,
  vnb_personal_contacts_other text,
  vnb_support_rating integer,
  vnb_start_timeline text,
  vnb_start_timeline_other text,
  vnb_additional_costs text,
  vnb_additional_costs_one_time numeric,
  vnb_additional_costs_yearly numeric,
  vnb_full_service text,
  vnb_data_provision text[] DEFAULT '{}',
  vnb_data_provision_other text,
  vnb_data_cost text,
  vnb_data_cost_amount numeric,
  vnb_esa_cost text,
  vnb_esa_cost_amount numeric,
  vnb_msb_timeline text,
  vnb_rejection_timeline text,
  vnb_wandlermessung text,
  vnb_wandlermessung_comment text,
  vnb_wandlermessung_documents text[],
  vnb_planning_duration text,
  vnb_planning_duration_reasons text,

  -- Section 5-GGV: Betrieb GGV
  operation_vnb_duration text,
  operation_vnb_duration_reasons text,
  operation_wandlermessung text,
  operation_wandlermessung_comment text,
  operation_msb_provider text,
  operation_allocation_provider text,
  operation_data_provider text,
  operation_data_provider_other text,
  operation_msb_duration text,
  operation_msb_additional_costs text,
  operation_msb_additional_costs_one_time numeric,
  operation_msb_additional_costs_yearly numeric,
  operation_data_format text,
  operation_data_format_other text,
  operation_data_cost text,
  operation_data_cost_amount numeric,
  operation_esa_cost text,
  operation_esa_cost_amount numeric,
  operation_satisfaction_rating integer,
  service_provider_name text,
  service_provider_comments text,
  service_provider_2_name text,
  service_provider_2_comments text,

  -- Section 4-MS: Planung Mieterstrom
  mieterstrom_summenzaehler text,
  mieterstrom_existing_projects text,
  mieterstrom_existing_projects_virtuell text,
  mieterstrom_vnb_contact text[],
  mieterstrom_vnb_contact_other text,
  mieterstrom_virtuell_allowed text,
  mieterstrom_virtuell_denied_reason text,
  mieterstrom_virtuell_denied_documents text[],
  mieterstrom_virtuell_wandlermessung text,
  mieterstrom_virtuell_wandlermessung_comment text,
  mieterstrom_virtuell_wandlermessung_documents text[],
  mieterstrom_vnb_response text[],
  mieterstrom_vnb_response_reasons text,
  mieterstrom_support_rating integer,
  mieterstrom_full_service text,
  mieterstrom_msb_costs text,
  mieterstrom_msb_costs_one_time numeric,
  mieterstrom_msb_costs_yearly numeric,
  mieterstrom_msb_costs_other text,
  mieterstrom_model_choice text,
  mieterstrom_data_provision text,

  -- Section 5-MS: Betrieb Mieterstrom
  mieterstrom_vnb_role text,
  mieterstrom_vnb_duration text,
  mieterstrom_vnb_duration_reasons text,
  mieterstrom_wandlermessung text,
  mieterstrom_wandlermessung_comment text,
  mieterstrom_msb_install_duration text,
  mieterstrom_operation_costs text,
  mieterstrom_operation_costs_one_time numeric,
  mieterstrom_operation_costs_yearly numeric,
  mieterstrom_rejection_response text[],
  mieterstrom_rejection_response_other text,
  mieterstrom_info_sources text,
  mieterstrom_experiences text,

  -- Section 4-ES: Energy Sharing
  es_status text[] DEFAULT '{}',
  es_status_other text,
  es_in_operation_details text,
  es_operator_details text,
  es_plant_type text[] DEFAULT '{}',
  es_plant_type_details text[],
  es_capacity_size_kw numeric,
  es_technology_description text,
  es_project_scope text,
  es_project_locations jsonb DEFAULT '[]',
  es_party_count integer,
  es_consumer_types text[] DEFAULT '{}',
  es_consumer_details text,
  es_consumer_scope text,
  es_consumer_scope_other text,
  es_max_distance text,
  es_vnb_contact boolean,
  es_vnb_response text,
  es_vnb_response_other text,
  es_netzentgelte_discussion text,
  es_netzentgelte_details text,
  es_info_sources text,

  -- Section 6: Abschluss
  additional_experiences text,
  uploaded_documents text[] DEFAULT '{}',
  survey_improvements text,
  nps_score integer
);

-- 3. Enable RLS
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (same as before)
CREATE POLICY "Admins can view all survey responses"
  ON public.survey_responses FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update survey responses"
  ON public.survey_responses FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete survey responses"
  ON public.survey_responses FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit survey responses"
  ON public.survey_responses FOR INSERT
  WITH CHECK (true);

-- 5. Performance indices
CREATE INDEX idx_survey_responses_session_group ON public.survey_responses (session_group_id);
CREATE INDEX idx_survey_responses_vnb_name ON public.survey_responses (vnb_name);
CREATE INDEX idx_survey_responses_created_at ON public.survey_responses (created_at);
