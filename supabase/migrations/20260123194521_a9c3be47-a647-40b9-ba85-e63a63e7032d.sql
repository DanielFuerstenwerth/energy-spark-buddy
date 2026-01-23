-- Create survey_responses table
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Section A: Actor classification
  actor_types TEXT[] DEFAULT '{}'::text[],
  actor_other TEXT,
  motivation TEXT[] DEFAULT '{}'::text[],
  motivation_other TEXT,
  project_types TEXT[] DEFAULT '{}'::text[],
  contact_email TEXT,
  vnb_name TEXT,
  project_focus TEXT,
  
  -- GGV specific
  ggv_project_type TEXT,
  ggv_pv_size_kw NUMERIC,
  ggv_party_count INTEGER,
  ggv_building_type TEXT,
  ggv_building_count INTEGER,
  ggv_additional_info TEXT,
  ggv_in_operation BOOLEAN,
  
  -- Planning status
  planning_status TEXT[] DEFAULT '{}'::text[],
  planning_status_other TEXT,
  ggv_or_mieterstrom_decision TEXT,
  ggv_decision_reasons TEXT[] DEFAULT '{}'::text[],
  ggv_decision_reasons_other TEXT,
  mieterstrom_decision_reasons TEXT[] DEFAULT '{}'::text[],
  mieterstrom_decision_reasons_other TEXT,
  implementation_approach TEXT[] DEFAULT '{}'::text[],
  
  -- Challenges
  challenges TEXT[] DEFAULT '{}'::text[],
  challenges_details JSONB DEFAULT '{}'::jsonb,
  
  -- VNB focus
  vnb_existing_projects TEXT,
  vnb_existing_projects_other TEXT,
  vnb_contact TEXT[] DEFAULT '{}'::text[],
  vnb_contact_other TEXT,
  vnb_response TEXT[] DEFAULT '{}'::text[],
  vnb_response_reasons TEXT,
  vnb_start_timeline TEXT,
  vnb_start_timeline_other TEXT,
  vnb_additional_costs TEXT,
  vnb_additional_costs_one_time NUMERIC,
  vnb_additional_costs_yearly NUMERIC,
  vnb_full_service TEXT,
  vnb_data_provision TEXT,
  vnb_data_format TEXT,
  vnb_data_cost TEXT,
  vnb_data_cost_amount NUMERIC,
  vnb_esa_cost TEXT,
  vnb_esa_cost_amount NUMERIC,
  vnb_msb_timeline TEXT,
  vnb_rejection_timeline TEXT,
  vnb_wandlermessung TEXT,
  vnb_wandlermessung_comment TEXT,
  vnb_support_messkonzept TEXT,
  vnb_support_formulare TEXT,
  vnb_support_portal BOOLEAN,
  vnb_support_other TEXT,
  vnb_info_available TEXT,
  vnb_info_available_other TEXT,
  vnb_contact_helpful TEXT,
  vnb_contact_helpful_other TEXT,
  vnb_personal_contacts TEXT,
  vnb_personal_contacts_other TEXT,
  vnb_support_rating INTEGER,
  
  -- Operation
  operation_start_date TEXT,
  operation_vnb_duration TEXT,
  operation_wandlermessung TEXT,
  operation_wandlermessung_comment TEXT,
  operation_msb_provider TEXT,
  operation_allocation_provider TEXT,
  operation_data_provider TEXT,
  operation_data_provider_other TEXT,
  operation_msb_duration TEXT,
  operation_msb_additional_costs TEXT,
  operation_msb_additional_costs_one_time NUMERIC,
  operation_msb_additional_costs_yearly NUMERIC,
  operation_allocation_who TEXT,
  operation_allocation_who_other TEXT,
  operation_data_format TEXT,
  operation_data_format_other TEXT,
  operation_data_cost TEXT,
  operation_data_cost_amount NUMERIC,
  operation_esa_cost TEXT,
  operation_esa_cost_amount NUMERIC,
  operation_satisfaction_rating INTEGER,
  
  -- Service provider
  service_provider_name TEXT,
  service_provider_rating INTEGER,
  service_provider_comments TEXT,
  
  -- Mieterstrom
  mieterstrom_project_type TEXT,
  mieterstrom_pv_size_kw NUMERIC,
  mieterstrom_party_count INTEGER,
  mieterstrom_building_type TEXT,
  mieterstrom_building_count INTEGER,
  mieterstrom_additional_info TEXT,
  mieterstrom_in_operation BOOLEAN,
  mieterstrom_summenzaehler TEXT,
  
  -- Energy Sharing
  es_status TEXT[] DEFAULT '{}'::text[],
  es_status_other TEXT,
  es_in_operation_details TEXT,
  es_operator_details TEXT,
  es_plant_type TEXT[] DEFAULT '{}'::text[],
  es_pv_size_kw NUMERIC,
  es_wind_size_kw NUMERIC,
  es_party_count INTEGER,
  es_consumer_types TEXT[] DEFAULT '{}'::text[],
  es_consumer_details TEXT,
  es_vnb_contact BOOLEAN,
  es_vnb_response TEXT,
  es_vnb_response_other TEXT,
  es_info_sources TEXT,
  
  -- Final
  helpful_info_sources TEXT,
  additional_experiences TEXT,
  survey_improvements TEXT,
  uploaded_documents TEXT[] DEFAULT '{}'::text[],
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10)
);

-- Enable RLS
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can submit survey responses"
ON public.survey_responses FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all survey responses"
ON public.survey_responses FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update survey responses"
ON public.survey_responses FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete survey responses"
ON public.survey_responses FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for survey documents
INSERT INTO storage.buckets (id, name, public) VALUES ('survey-documents', 'survey-documents', false);

CREATE POLICY "Anyone can upload survey documents"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'survey-documents');

CREATE POLICY "Anyone can view survey documents"
ON storage.objects FOR SELECT USING (bucket_id = 'survey-documents');

CREATE POLICY "Admins can delete survey documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'survey-documents' AND public.has_role(auth.uid(), 'admin'));