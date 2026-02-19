export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      chat_rate_limits: {
        Row: {
          client_ip: string
          created_at: string
          id: string
        }
        Insert: {
          client_ip: string
          created_at?: string
          id?: string
        }
        Update: {
          client_ip?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      classification_examples: {
        Row: {
          categories: string | null
          comment: string | null
          created_at: string | null
          id: string
          user_question: string
          vnb: string | null
        }
        Insert: {
          categories?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          user_question: string
          vnb?: string | null
        }
        Update: {
          categories?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          user_question?: string
          vnb?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_email: string | null
          author_name: string | null
          created_at: string
          id: string
          kriterium: string | null
          route: string
          status: string
          text: string
          updated_at: string
          views: number | null
          vnb_name: string | null
        }
        Insert: {
          author_email?: string | null
          author_name?: string | null
          created_at?: string
          id?: string
          kriterium?: string | null
          route: string
          status?: string
          text: string
          updated_at?: string
          views?: number | null
          vnb_name?: string | null
        }
        Update: {
          author_email?: string | null
          author_name?: string | null
          created_at?: string
          id?: string
          kriterium?: string | null
          route?: string
          status?: string
          text?: string
          updated_at?: string
          views?: number | null
          vnb_name?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          session_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string
        }
        Relationships: []
      }
      data_inputs: {
        Row: {
          category: string
          category_other: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          description: string
          id: string
          status: string
          uploaded_files: string[] | null
        }
        Insert: {
          category: string
          category_other?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          description: string
          id?: string
          status?: string
          uploaded_files?: string[] | null
        }
        Update: {
          category?: string
          category_other?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          description?: string
          id?: string
          status?: string
          uploaded_files?: string[] | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          detected_categories: string | null
          detected_vnb: string | null
          feedback: string | null
          id: string
          legal_refs: string | null
          role: string
          text: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          detected_categories?: string | null
          detected_vnb?: string | null
          feedback?: string | null
          id?: string
          legal_refs?: string | null
          role: string
          text: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          detected_categories?: string | null
          detected_vnb?: string | null
          feedback?: string | null
          id?: string
          legal_refs?: string | null
          role?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          created_at: string
          id: string
          pdf_urls: Json | null
          priority: number | null
          source_type: string | null
          topic: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          pdf_urls?: Json | null
          priority?: number | null
          source_type?: string | null
          topic?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          pdf_urls?: Json | null
          priority?: number | null
          source_type?: string | null
          topic?: string | null
          url?: string
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          actor_other: string | null
          actor_text_fields: Json | null
          actor_types: string[] | null
          additional_experiences: string | null
          challenges: string[] | null
          challenges_details: Json | null
          confirmation_for_update: string | null
          contact_email: string | null
          created_at: string
          draft_token: string | null
          es_capacity_size_kw: number | null
          es_consumer_details: string | null
          es_consumer_scope: string | null
          es_consumer_scope_other: string | null
          es_consumer_types: string[] | null
          es_in_operation_details: string | null
          es_info_sources: string | null
          es_max_distance: string | null
          es_netzentgelte_details: string | null
          es_netzentgelte_discussion: string | null
          es_operator_details: string | null
          es_party_count: number | null
          es_plant_type: string[] | null
          es_plant_type_details: string[] | null
          es_project_locations: Json | null
          es_project_scope: string | null
          es_status: string[] | null
          es_status_other: string | null
          es_technology_description: string | null
          es_vnb_contact: boolean | null
          es_vnb_response: string | null
          es_vnb_response_other: string | null
          evaluation_label: string | null
          ggv_additional_info: string | null
          ggv_building_count: number | null
          ggv_building_type: string | null
          ggv_decision_reasons: string[] | null
          ggv_decision_reasons_other: string | null
          ggv_experience_notes: string | null
          ggv_or_mieterstrom_decision: string | null
          ggv_party_count: number | null
          ggv_project_city: string | null
          ggv_project_type: string | null
          ggv_project_website: string | null
          ggv_pv_size_kw: number | null
          ggv_transparenz_opt_in: string | null
          id: string
          implementation_approach: string[] | null
          implementation_approach_other: string | null
          mieterstrom_additional_info: string | null
          mieterstrom_building_count: number | null
          mieterstrom_building_type: string | null
          mieterstrom_data_provision: string | null
          mieterstrom_decision_reasons: string[] | null
          mieterstrom_decision_reasons_other: string | null
          mieterstrom_existing_projects: string | null
          mieterstrom_existing_projects_virtuell: string | null
          mieterstrom_experiences: string | null
          mieterstrom_foerderung: string | null
          mieterstrom_foerderung_nein_grund: string | null
          mieterstrom_foerderung_nein_grund_other: string | null
          mieterstrom_full_service: string | null
          mieterstrom_info_sources: string | null
          mieterstrom_model_choice: string | null
          mieterstrom_msb_costs: string | null
          mieterstrom_msb_costs_one_time: number | null
          mieterstrom_msb_costs_other: string | null
          mieterstrom_msb_costs_yearly: number | null
          mieterstrom_msb_install_duration: string | null
          mieterstrom_operation_costs: string | null
          mieterstrom_operation_costs_one_time: number | null
          mieterstrom_operation_costs_yearly: number | null
          mieterstrom_party_count: number | null
          mieterstrom_planning_status: string[] | null
          mieterstrom_planning_status_other: string | null
          mieterstrom_project_locations: Json | null
          mieterstrom_project_type: string | null
          mieterstrom_pv_size_kw: number | null
          mieterstrom_rejection_response: string[] | null
          mieterstrom_rejection_response_other: string | null
          mieterstrom_summenzaehler: string | null
          mieterstrom_support_rating: number | null
          mieterstrom_virtuell_allowed: string | null
          mieterstrom_virtuell_denied_documents: string[] | null
          mieterstrom_virtuell_denied_reason: string | null
          mieterstrom_virtuell_wandlermessung: string | null
          mieterstrom_virtuell_wandlermessung_comment: string | null
          mieterstrom_virtuell_wandlermessung_documents: string[] | null
          mieterstrom_vnb_contact: string[] | null
          mieterstrom_vnb_contact_other: string | null
          mieterstrom_vnb_duration: string | null
          mieterstrom_vnb_duration_reasons: string | null
          mieterstrom_vnb_response: string[] | null
          mieterstrom_vnb_response_reasons: string | null
          mieterstrom_vnb_role: string | null
          mieterstrom_wandlermessung: string | null
          mieterstrom_wandlermessung_comment: string | null
          motivation: string[] | null
          motivation_other: string | null
          nps_score: number | null
          operation_allocation_provider: string | null
          operation_allocation_provider_other: string | null
          operation_data_cost: string | null
          operation_data_cost_amount: number | null
          operation_data_format: string | null
          operation_data_format_other: string | null
          operation_data_provider: string | null
          operation_data_provider_other: string | null
          operation_esa_cost: string | null
          operation_esa_cost_amount: number | null
          operation_msb_additional_costs: string | null
          operation_msb_additional_costs_one_time: number | null
          operation_msb_additional_costs_yearly: number | null
          operation_msb_duration: string | null
          operation_msb_provider: string | null
          operation_satisfaction_rating: number | null
          operation_vnb_duration: string | null
          operation_vnb_duration_reasons: string | null
          operation_wandlermessung: string | null
          operation_wandlermessung_comment: string | null
          planning_status: string[] | null
          planning_status_other: string | null
          project_address: string | null
          project_focus: string | null
          project_locations: Json | null
          project_plz: string | null
          project_types: string[] | null
          service_provider_2_comments: string | null
          service_provider_2_name: string | null
          service_provider_comments: string | null
          service_provider_name: string | null
          session_group_id: string | null
          sp_price_rating: number | null
          sp_quality_rating: number | null
          sp_rating_comment: string | null
          status: string
          survey_improvements: string | null
          uploaded_documents: string[] | null
          vnb_additional_costs: string | null
          vnb_additional_costs_one_time: number | null
          vnb_additional_costs_yearly: number | null
          vnb_contact: string[] | null
          vnb_contact_helpful: string | null
          vnb_contact_helpful_other: string | null
          vnb_contact_other: string | null
          vnb_data_cost: string | null
          vnb_data_cost_amount: number | null
          vnb_data_provision: string[] | null
          vnb_data_provision_other: string | null
          vnb_esa_cost: string | null
          vnb_esa_cost_amount: number | null
          vnb_existing_projects: string | null
          vnb_existing_projects_other: string | null
          vnb_full_service: string | null
          vnb_msb_timeline: string | null
          vnb_name: string | null
          vnb_personal_contacts: string | null
          vnb_personal_contacts_other: string | null
          vnb_planning_duration: string | null
          vnb_planning_duration_reasons: string | null
          vnb_rejection_response: string[] | null
          vnb_rejection_response_details: Json | null
          vnb_rejection_response_other: string | null
          vnb_rejection_timeline: string | null
          vnb_response: string[] | null
          vnb_response_reasons: string | null
          vnb_start_timeline: string | null
          vnb_start_timeline_other: string | null
          vnb_support_formulare: string | null
          vnb_support_formulare_other: string | null
          vnb_support_messkonzept: string | null
          vnb_support_messkonzept_other: string | null
          vnb_support_other: string | null
          vnb_support_other_details: string | null
          vnb_support_portal: string | null
          vnb_support_portal_other: string | null
          vnb_support_rating: number | null
          vnb_wandlermessung: string | null
          vnb_wandlermessung_comment: string | null
          vnb_wandlermessung_documents: string[] | null
        }
        Insert: {
          actor_other?: string | null
          actor_text_fields?: Json | null
          actor_types?: string[] | null
          additional_experiences?: string | null
          challenges?: string[] | null
          challenges_details?: Json | null
          confirmation_for_update?: string | null
          contact_email?: string | null
          created_at?: string
          draft_token?: string | null
          es_capacity_size_kw?: number | null
          es_consumer_details?: string | null
          es_consumer_scope?: string | null
          es_consumer_scope_other?: string | null
          es_consumer_types?: string[] | null
          es_in_operation_details?: string | null
          es_info_sources?: string | null
          es_max_distance?: string | null
          es_netzentgelte_details?: string | null
          es_netzentgelte_discussion?: string | null
          es_operator_details?: string | null
          es_party_count?: number | null
          es_plant_type?: string[] | null
          es_plant_type_details?: string[] | null
          es_project_locations?: Json | null
          es_project_scope?: string | null
          es_status?: string[] | null
          es_status_other?: string | null
          es_technology_description?: string | null
          es_vnb_contact?: boolean | null
          es_vnb_response?: string | null
          es_vnb_response_other?: string | null
          evaluation_label?: string | null
          ggv_additional_info?: string | null
          ggv_building_count?: number | null
          ggv_building_type?: string | null
          ggv_decision_reasons?: string[] | null
          ggv_decision_reasons_other?: string | null
          ggv_experience_notes?: string | null
          ggv_or_mieterstrom_decision?: string | null
          ggv_party_count?: number | null
          ggv_project_city?: string | null
          ggv_project_type?: string | null
          ggv_project_website?: string | null
          ggv_pv_size_kw?: number | null
          ggv_transparenz_opt_in?: string | null
          id?: string
          implementation_approach?: string[] | null
          implementation_approach_other?: string | null
          mieterstrom_additional_info?: string | null
          mieterstrom_building_count?: number | null
          mieterstrom_building_type?: string | null
          mieterstrom_data_provision?: string | null
          mieterstrom_decision_reasons?: string[] | null
          mieterstrom_decision_reasons_other?: string | null
          mieterstrom_existing_projects?: string | null
          mieterstrom_existing_projects_virtuell?: string | null
          mieterstrom_experiences?: string | null
          mieterstrom_foerderung?: string | null
          mieterstrom_foerderung_nein_grund?: string | null
          mieterstrom_foerderung_nein_grund_other?: string | null
          mieterstrom_full_service?: string | null
          mieterstrom_info_sources?: string | null
          mieterstrom_model_choice?: string | null
          mieterstrom_msb_costs?: string | null
          mieterstrom_msb_costs_one_time?: number | null
          mieterstrom_msb_costs_other?: string | null
          mieterstrom_msb_costs_yearly?: number | null
          mieterstrom_msb_install_duration?: string | null
          mieterstrom_operation_costs?: string | null
          mieterstrom_operation_costs_one_time?: number | null
          mieterstrom_operation_costs_yearly?: number | null
          mieterstrom_party_count?: number | null
          mieterstrom_planning_status?: string[] | null
          mieterstrom_planning_status_other?: string | null
          mieterstrom_project_locations?: Json | null
          mieterstrom_project_type?: string | null
          mieterstrom_pv_size_kw?: number | null
          mieterstrom_rejection_response?: string[] | null
          mieterstrom_rejection_response_other?: string | null
          mieterstrom_summenzaehler?: string | null
          mieterstrom_support_rating?: number | null
          mieterstrom_virtuell_allowed?: string | null
          mieterstrom_virtuell_denied_documents?: string[] | null
          mieterstrom_virtuell_denied_reason?: string | null
          mieterstrom_virtuell_wandlermessung?: string | null
          mieterstrom_virtuell_wandlermessung_comment?: string | null
          mieterstrom_virtuell_wandlermessung_documents?: string[] | null
          mieterstrom_vnb_contact?: string[] | null
          mieterstrom_vnb_contact_other?: string | null
          mieterstrom_vnb_duration?: string | null
          mieterstrom_vnb_duration_reasons?: string | null
          mieterstrom_vnb_response?: string[] | null
          mieterstrom_vnb_response_reasons?: string | null
          mieterstrom_vnb_role?: string | null
          mieterstrom_wandlermessung?: string | null
          mieterstrom_wandlermessung_comment?: string | null
          motivation?: string[] | null
          motivation_other?: string | null
          nps_score?: number | null
          operation_allocation_provider?: string | null
          operation_allocation_provider_other?: string | null
          operation_data_cost?: string | null
          operation_data_cost_amount?: number | null
          operation_data_format?: string | null
          operation_data_format_other?: string | null
          operation_data_provider?: string | null
          operation_data_provider_other?: string | null
          operation_esa_cost?: string | null
          operation_esa_cost_amount?: number | null
          operation_msb_additional_costs?: string | null
          operation_msb_additional_costs_one_time?: number | null
          operation_msb_additional_costs_yearly?: number | null
          operation_msb_duration?: string | null
          operation_msb_provider?: string | null
          operation_satisfaction_rating?: number | null
          operation_vnb_duration?: string | null
          operation_vnb_duration_reasons?: string | null
          operation_wandlermessung?: string | null
          operation_wandlermessung_comment?: string | null
          planning_status?: string[] | null
          planning_status_other?: string | null
          project_address?: string | null
          project_focus?: string | null
          project_locations?: Json | null
          project_plz?: string | null
          project_types?: string[] | null
          service_provider_2_comments?: string | null
          service_provider_2_name?: string | null
          service_provider_comments?: string | null
          service_provider_name?: string | null
          session_group_id?: string | null
          sp_price_rating?: number | null
          sp_quality_rating?: number | null
          sp_rating_comment?: string | null
          status?: string
          survey_improvements?: string | null
          uploaded_documents?: string[] | null
          vnb_additional_costs?: string | null
          vnb_additional_costs_one_time?: number | null
          vnb_additional_costs_yearly?: number | null
          vnb_contact?: string[] | null
          vnb_contact_helpful?: string | null
          vnb_contact_helpful_other?: string | null
          vnb_contact_other?: string | null
          vnb_data_cost?: string | null
          vnb_data_cost_amount?: number | null
          vnb_data_provision?: string[] | null
          vnb_data_provision_other?: string | null
          vnb_esa_cost?: string | null
          vnb_esa_cost_amount?: number | null
          vnb_existing_projects?: string | null
          vnb_existing_projects_other?: string | null
          vnb_full_service?: string | null
          vnb_msb_timeline?: string | null
          vnb_name?: string | null
          vnb_personal_contacts?: string | null
          vnb_personal_contacts_other?: string | null
          vnb_planning_duration?: string | null
          vnb_planning_duration_reasons?: string | null
          vnb_rejection_response?: string[] | null
          vnb_rejection_response_details?: Json | null
          vnb_rejection_response_other?: string | null
          vnb_rejection_timeline?: string | null
          vnb_response?: string[] | null
          vnb_response_reasons?: string | null
          vnb_start_timeline?: string | null
          vnb_start_timeline_other?: string | null
          vnb_support_formulare?: string | null
          vnb_support_formulare_other?: string | null
          vnb_support_messkonzept?: string | null
          vnb_support_messkonzept_other?: string | null
          vnb_support_other?: string | null
          vnb_support_other_details?: string | null
          vnb_support_portal?: string | null
          vnb_support_portal_other?: string | null
          vnb_support_rating?: number | null
          vnb_wandlermessung?: string | null
          vnb_wandlermessung_comment?: string | null
          vnb_wandlermessung_documents?: string[] | null
        }
        Update: {
          actor_other?: string | null
          actor_text_fields?: Json | null
          actor_types?: string[] | null
          additional_experiences?: string | null
          challenges?: string[] | null
          challenges_details?: Json | null
          confirmation_for_update?: string | null
          contact_email?: string | null
          created_at?: string
          draft_token?: string | null
          es_capacity_size_kw?: number | null
          es_consumer_details?: string | null
          es_consumer_scope?: string | null
          es_consumer_scope_other?: string | null
          es_consumer_types?: string[] | null
          es_in_operation_details?: string | null
          es_info_sources?: string | null
          es_max_distance?: string | null
          es_netzentgelte_details?: string | null
          es_netzentgelte_discussion?: string | null
          es_operator_details?: string | null
          es_party_count?: number | null
          es_plant_type?: string[] | null
          es_plant_type_details?: string[] | null
          es_project_locations?: Json | null
          es_project_scope?: string | null
          es_status?: string[] | null
          es_status_other?: string | null
          es_technology_description?: string | null
          es_vnb_contact?: boolean | null
          es_vnb_response?: string | null
          es_vnb_response_other?: string | null
          evaluation_label?: string | null
          ggv_additional_info?: string | null
          ggv_building_count?: number | null
          ggv_building_type?: string | null
          ggv_decision_reasons?: string[] | null
          ggv_decision_reasons_other?: string | null
          ggv_experience_notes?: string | null
          ggv_or_mieterstrom_decision?: string | null
          ggv_party_count?: number | null
          ggv_project_city?: string | null
          ggv_project_type?: string | null
          ggv_project_website?: string | null
          ggv_pv_size_kw?: number | null
          ggv_transparenz_opt_in?: string | null
          id?: string
          implementation_approach?: string[] | null
          implementation_approach_other?: string | null
          mieterstrom_additional_info?: string | null
          mieterstrom_building_count?: number | null
          mieterstrom_building_type?: string | null
          mieterstrom_data_provision?: string | null
          mieterstrom_decision_reasons?: string[] | null
          mieterstrom_decision_reasons_other?: string | null
          mieterstrom_existing_projects?: string | null
          mieterstrom_existing_projects_virtuell?: string | null
          mieterstrom_experiences?: string | null
          mieterstrom_foerderung?: string | null
          mieterstrom_foerderung_nein_grund?: string | null
          mieterstrom_foerderung_nein_grund_other?: string | null
          mieterstrom_full_service?: string | null
          mieterstrom_info_sources?: string | null
          mieterstrom_model_choice?: string | null
          mieterstrom_msb_costs?: string | null
          mieterstrom_msb_costs_one_time?: number | null
          mieterstrom_msb_costs_other?: string | null
          mieterstrom_msb_costs_yearly?: number | null
          mieterstrom_msb_install_duration?: string | null
          mieterstrom_operation_costs?: string | null
          mieterstrom_operation_costs_one_time?: number | null
          mieterstrom_operation_costs_yearly?: number | null
          mieterstrom_party_count?: number | null
          mieterstrom_planning_status?: string[] | null
          mieterstrom_planning_status_other?: string | null
          mieterstrom_project_locations?: Json | null
          mieterstrom_project_type?: string | null
          mieterstrom_pv_size_kw?: number | null
          mieterstrom_rejection_response?: string[] | null
          mieterstrom_rejection_response_other?: string | null
          mieterstrom_summenzaehler?: string | null
          mieterstrom_support_rating?: number | null
          mieterstrom_virtuell_allowed?: string | null
          mieterstrom_virtuell_denied_documents?: string[] | null
          mieterstrom_virtuell_denied_reason?: string | null
          mieterstrom_virtuell_wandlermessung?: string | null
          mieterstrom_virtuell_wandlermessung_comment?: string | null
          mieterstrom_virtuell_wandlermessung_documents?: string[] | null
          mieterstrom_vnb_contact?: string[] | null
          mieterstrom_vnb_contact_other?: string | null
          mieterstrom_vnb_duration?: string | null
          mieterstrom_vnb_duration_reasons?: string | null
          mieterstrom_vnb_response?: string[] | null
          mieterstrom_vnb_response_reasons?: string | null
          mieterstrom_vnb_role?: string | null
          mieterstrom_wandlermessung?: string | null
          mieterstrom_wandlermessung_comment?: string | null
          motivation?: string[] | null
          motivation_other?: string | null
          nps_score?: number | null
          operation_allocation_provider?: string | null
          operation_allocation_provider_other?: string | null
          operation_data_cost?: string | null
          operation_data_cost_amount?: number | null
          operation_data_format?: string | null
          operation_data_format_other?: string | null
          operation_data_provider?: string | null
          operation_data_provider_other?: string | null
          operation_esa_cost?: string | null
          operation_esa_cost_amount?: number | null
          operation_msb_additional_costs?: string | null
          operation_msb_additional_costs_one_time?: number | null
          operation_msb_additional_costs_yearly?: number | null
          operation_msb_duration?: string | null
          operation_msb_provider?: string | null
          operation_satisfaction_rating?: number | null
          operation_vnb_duration?: string | null
          operation_vnb_duration_reasons?: string | null
          operation_wandlermessung?: string | null
          operation_wandlermessung_comment?: string | null
          planning_status?: string[] | null
          planning_status_other?: string | null
          project_address?: string | null
          project_focus?: string | null
          project_locations?: Json | null
          project_plz?: string | null
          project_types?: string[] | null
          service_provider_2_comments?: string | null
          service_provider_2_name?: string | null
          service_provider_comments?: string | null
          service_provider_name?: string | null
          session_group_id?: string | null
          sp_price_rating?: number | null
          sp_quality_rating?: number | null
          sp_rating_comment?: string | null
          status?: string
          survey_improvements?: string | null
          uploaded_documents?: string[] | null
          vnb_additional_costs?: string | null
          vnb_additional_costs_one_time?: number | null
          vnb_additional_costs_yearly?: number | null
          vnb_contact?: string[] | null
          vnb_contact_helpful?: string | null
          vnb_contact_helpful_other?: string | null
          vnb_contact_other?: string | null
          vnb_data_cost?: string | null
          vnb_data_cost_amount?: number | null
          vnb_data_provision?: string[] | null
          vnb_data_provision_other?: string | null
          vnb_esa_cost?: string | null
          vnb_esa_cost_amount?: number | null
          vnb_existing_projects?: string | null
          vnb_existing_projects_other?: string | null
          vnb_full_service?: string | null
          vnb_msb_timeline?: string | null
          vnb_name?: string | null
          vnb_personal_contacts?: string | null
          vnb_personal_contacts_other?: string | null
          vnb_planning_duration?: string | null
          vnb_planning_duration_reasons?: string | null
          vnb_rejection_response?: string[] | null
          vnb_rejection_response_details?: Json | null
          vnb_rejection_response_other?: string | null
          vnb_rejection_timeline?: string | null
          vnb_response?: string[] | null
          vnb_response_reasons?: string | null
          vnb_start_timeline?: string | null
          vnb_start_timeline_other?: string | null
          vnb_support_formulare?: string | null
          vnb_support_formulare_other?: string | null
          vnb_support_messkonzept?: string | null
          vnb_support_messkonzept_other?: string | null
          vnb_support_other?: string | null
          vnb_support_other_details?: string | null
          vnb_support_portal?: string | null
          vnb_support_portal_other?: string | null
          vnb_support_rating?: number | null
          vnb_wandlermessung?: string | null
          vnb_wandlermessung_comment?: string | null
          vnb_wandlermessung_documents?: string[] | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      comments_public: {
        Row: {
          author_name: string | null
          created_at: string | null
          id: string | null
          kriterium: string | null
          route: string | null
          status: string | null
          text: string | null
          updated_at: string | null
          views: number | null
          vnb_name: string | null
        }
        Insert: {
          author_name?: string | null
          created_at?: string | null
          id?: string | null
          kriterium?: string | null
          route?: string | null
          status?: string | null
          text?: string | null
          updated_at?: string | null
          views?: number | null
          vnb_name?: string | null
        }
        Update: {
          author_name?: string | null
          created_at?: string | null
          id?: string | null
          kriterium?: string | null
          route?: string | null
          status?: string | null
          text?: string | null
          updated_at?: string | null
          views?: number | null
          vnb_name?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
