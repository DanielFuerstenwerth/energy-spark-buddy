-- Neue Felder für den erweiterten Fragebogen
-- Basierend auf dem Fragebogen_GGV_v0_2.docx

-- Abschnitt A: Allgemeine Einordnung (bereits vorhanden, erweitern)
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS actor_text_fields jsonb DEFAULT '{}'::jsonb;

-- Abschnitt B: Allgemeine Fragen GGV & Mieterstrom
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS implementation_approach_other text;

-- Neue Felder für Herausforderungen (B6)
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS challenges_pv_installation text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS challenges_vnb_blocking text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS challenges_costs_high text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS challenges_other text;

-- Abschnitt C: Detaillierte Fragen zur Planung mit VNB (GGV)
-- C1-C7 existieren teilweise, neue hinzufügen
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_ggv_possible text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_ggv_possible_reasons text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_msb_offer text;

-- C8.1 Wenn VNB MSB-Angebot macht
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_msb_start_timeline text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_msb_start_timeline_other text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_msb_additional_costs text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_msb_additional_costs_one_time numeric;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_msb_additional_costs_yearly numeric;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_full_service_condition text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_data_provision_method text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_data_provision_other text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_direct_data_cost text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_direct_data_cost_amount numeric;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_esa_role_cost text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_esa_role_cost_amount numeric;

-- C8.2 Wenn VNB kein MSB-Angebot macht
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_no_msb_future_timeline text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_rejection_future_timeline text;

-- C9-C10 Wandlermessung und Diskussionsdauer (Planung)
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_planning_duration text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_planning_duration_reasons text;

-- Abschnitt D: GGV bereits in Betrieb
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS operation_vnb_duration_reasons text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS operation_allocation_who_details text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS operation_data_method text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS operation_data_method_other text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS operation_direct_data_cost text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS operation_direct_data_cost_amount numeric;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS operation_esa_role_cost text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS operation_esa_role_cost_amount numeric;

-- D8: Feedback zum Dienstleister (erweiterbar)
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS service_provider_2_name text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS service_provider_2_rating integer;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS service_provider_2_comments text;

-- D9: Reaktion auf VNB-Verweigerung
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_rejection_response text[];
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS vnb_rejection_response_other text;

-- Mieterstrom-spezifische Felder (M1-M11)
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_existing_projects text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_existing_projects_virtuell text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_vnb_contact text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_vnb_contact_other text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_virtuell_allowed text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_virtuell_wandlermessung text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_virtuell_wandlermessung_comment text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_vnb_response text[];
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_vnb_response_reasons text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_vnb_support text[];
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_vnb_support_other text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_vnb_helpful text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_vnb_helpful_other text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_personal_contacts text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_personal_contacts_other text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_support_rating integer;

-- Mieterstrom Planung (MP1)
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_full_service text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_msb_costs text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_msb_costs_one_time numeric;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_msb_costs_yearly numeric;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_msb_costs_other text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_model_choice text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_data_provision text;

-- Mieterstrom in Betrieb (MB1-MB7)
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_vnb_role text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_vnb_duration text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_vnb_duration_reasons text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_wandlermessung text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_wandlermessung_comment text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_msb_provider text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_data_provider text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_data_provider_other text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_msb_install_duration text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_operation_costs text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_operation_costs_one_time numeric;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_operation_costs_yearly numeric;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_operation_satisfaction integer;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_rejection_response text[];
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_rejection_response_other text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_info_sources text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_experiences text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_survey_improvements text;

-- Mieterstrom Challenges (M2)
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_challenges text[];
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_challenges_opposition text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_challenges_pv text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_challenges_vnb text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_challenges_costs text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS mieterstrom_challenges_other text;

-- Energy Sharing erweiterte Felder (E1-E8)
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS es_plant_type_details text[];
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS es_project_scope text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS es_total_pv_size_kw numeric;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS es_total_wind_size_kw numeric;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS es_consumer_scope text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS es_consumer_scope_other text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS es_max_distance text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS es_vnb_response_details text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS es_netzentgelte_discussion text;
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS es_netzentgelte_details text;