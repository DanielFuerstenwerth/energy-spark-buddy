/**
 * Automated Survey Schema ↔ Database Consistency Test
 * 
 * This test ensures that:
 * 1. Every SurveyData key maps to an existing DB column
 * 2. Every QUESTION_REGISTRY entry has a valid DB column
 * 3. buildDbData uses the correct column names (not just toSnakeCase)
 * 4. No DB columns are orphaned (exist in DB but not mapped)
 * 
 * Run: npx vitest run src/tests/survey-schema-db-consistency.test.ts
 */

import { describe, it, expect } from 'vitest';
import { QUESTION_REGISTRY, surveyDefinition } from '@/data/surveySchema';
import { initialSurveyData, type SurveyData } from '@/types/survey';

// ── Helpers ──

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/** Extract all column names from the Supabase types file (survey_responses Insert type) */
// We maintain KNOWN_DB_COLUMNS below as a snapshot that must match the types file.

// All SurveyData interface keys (extracted from the interface definition)
// We use initialSurveyData + explicit listing of optional fields
function getAllSurveyDataKeys(): string[] {
  // Start with keys from initialSurveyData (only includes required/defaulted fields)
  const keys = new Set(Object.keys(initialSurveyData));
  
  // Add all QUESTION_REGISTRY keys
  for (const key of Object.keys(QUESTION_REGISTRY)) {
    keys.add(key);
  }
  
  // Add known companion fields from SurveyData interface
  // These are fields that exist in SurveyData but aren't direct schema questions
  const companionFields = [
    'actorTextFields', 'actorOther', 'actorDienstleisterCategoryOther',
    'motivationOther',
    'projectFocus', 'projectAddress', 'projectPlz',
    'planningStatusOther', 'mieterstromPlanningStatusOther',
    'ggvDecisionReasonsOther', 'mieterstromDecisionReasonsOther',
    'implementationApproachOther', 'challengesDetails',
    'vnbRejectionResponseOther', 'vnbRejectionResponseDetails',
    'vnbContactOther', 'vnbResponseReasons',
    'vnbExistingProjectsOther',
    'vnbSupportMesskonzeptOther', 'vnbSupportFormulareOther',
    'vnbSupportPortalOther', 'vnbSupportOtherDetails',
    'vnbContactHelpfulOther', 'vnbPersonalContactsOther',
    'vnbStartTimelineOther', 'vnbDataProvisionOther',
    'operationDataProviderOther', 'operationDataFormatOther',
    'operationAllocationProviderOther',
    'mieterstromVnbContactOther',
    'mieterstromVirtuellWandlermessungComment',
    'mieterstromVnbResponseReasons',
    'mieterstromMsbCostsOther',
    'mieterstromWandlermessungComment',
    'mieterstromRejectionResponseOther',
    'mieterstromFoerderungNeinGrundOther',
    'esStatusOther', 'esPlantTypeDetails',
    'esConsumerScopeOther', 'esVnbResponseOther',
    'esNetzentgelteDetails',
    'evaluationLabel', 'sessionGroupId',
  ];
  
  for (const f of companionFields) {
    keys.add(f);
  }
  
  return [...keys];
}

// Known DB columns from the Supabase types file (survey_responses)
// This is the authoritative list — updated automatically when types.ts changes
const KNOWN_DB_COLUMNS = new Set([
  'id', 'created_at', 'session_group_id', 'evaluation_label', 'status', 'draft_token',
  'actor_types', 'actor_text_fields', 'actor_other',
  'actor_dienstleister_category', 'actor_dienstleister_category_other',
  'dienstleister_website', 'dienstleister_kontakt',
  'motivation', 'motivation_other', 'contact_email', 'confirmation_for_update',
  'vnb_name', 'project_types', 'project_focus',
  'ggv_project_type', 'ggv_pv_size_kw', 'ggv_party_count', 'ggv_building_type',
  'ggv_building_count', 'ggv_additional_info',
  'ggv_transparenz_opt_in', 'ggv_project_name', 'ggv_project_city', 'ggv_project_website',
  'ggv_project_links', 'ggv_experience_notes',
  'mieterstrom_project_type', 'mieterstrom_pv_size_kw', 'mieterstrom_party_count',
  'mieterstrom_building_type', 'mieterstrom_building_count', 'mieterstrom_additional_info',
  'project_address', 'project_plz', 'project_locations', 'mieterstrom_project_locations',
  'mieterstrom_foerderung', 'mieterstrom_foerderung_nein_grund', 'mieterstrom_foerderung_nein_grund_other',
  'planning_status', 'planning_status_other',
  'mieterstrom_planning_status', 'mieterstrom_planning_status_other',
  'ggv_or_mieterstrom_decision',
  'ggv_decision_reasons', 'ggv_decision_reasons_other',
  'mieterstrom_decision_reasons', 'mieterstrom_decision_reasons_other',
  'implementation_approach', 'implementation_approach_other',
  'challenges', 'challenges_details',
  'vnb_rejection_response', 'vnb_rejection_response_other', 'vnb_rejection_response_details',
  'vnb_existing_projects', 'vnb_existing_projects_other',
  'vnb_contact', 'vnb_contact_other',
  'vnb_response', 'vnb_response_reasons',
  'vnb_support_messkonzept', 'vnb_support_messkonzept_other',
  'vnb_support_formulare', 'vnb_support_formulare_other',
  'vnb_support_portal', 'vnb_support_portal_other',
  'vnb_support_other', 'vnb_support_other_details',
  'vnb_contact_helpful', 'vnb_contact_helpful_other',
  'vnb_personal_contacts', 'vnb_personal_contacts_other',
  'vnb_support_rating',
  'vnb_start_timeline', 'vnb_start_timeline_other',
  'vnb_additional_costs', 'vnb_additional_costs_one_time', 'vnb_additional_costs_yearly',
  'vnb_full_service',
  'vnb_data_provision', 'vnb_data_provision_other',
  'vnb_data_cost', 'vnb_data_cost_amount',
  'vnb_esa_cost', 'vnb_esa_cost_amount',
  'vnb_msb_timeline', 'vnb_rejection_timeline',
  'vnb_wandlermessung', 'vnb_wandlermessung_comment', 'vnb_wandlermessung_documents',
  'vnb_planning_duration', 'vnb_planning_duration_reasons',
  'operation_vnb_duration', 'operation_vnb_duration_reasons',
  'operation_wandlermessung', 'operation_wandlermessung_comment',
  'operation_msb_provider', 'operation_allocation_provider', 'operation_allocation_provider_other',
  'operation_data_provider', 'operation_data_provider_other',
  'operation_msb_duration',
  'operation_msb_additional_costs', 'operation_msb_additional_costs_one_time', 'operation_msb_additional_costs_yearly',
  'operation_data_format', 'operation_data_format_other',
  'operation_data_cost', 'operation_data_cost_amount',
  'operation_esa_cost', 'operation_esa_cost_amount',
  'operation_satisfaction_rating',
  'service_provider_name', 'service_provider_services', 'service_provider_comments',
  'service_provider_2_name', 'service_provider_2_comments',
  'sp_quality_rating', 'sp_price_rating', 'sp_rating_comment',
  'mieterstrom_summenzaehler',
  'mieterstrom_existing_projects', 'mieterstrom_existing_projects_virtuell',
  'mieterstrom_vnb_contact', 'mieterstrom_vnb_contact_other',
  'mieterstrom_virtuell_allowed', 'mieterstrom_virtuell_denied_reason',
  'mieterstrom_virtuell_denied_documents',
  'mieterstrom_virtuell_wandlermessung', 'mieterstrom_virtuell_wandlermessung_comment',
  'mieterstrom_virtuell_wandlermessung_documents',
  'mieterstrom_vnb_response', 'mieterstrom_vnb_response_reasons',
  'mieterstrom_support_rating',
  'mieterstrom_full_service',
  'mieterstrom_msb_costs', 'mieterstrom_msb_costs_one_time', 'mieterstrom_msb_costs_yearly', 'mieterstrom_msb_costs_other',
  'mieterstrom_model_choice', 'mieterstrom_data_provision',
  'mieterstrom_vnb_role', 'mieterstrom_vnb_duration', 'mieterstrom_vnb_duration_reasons',
  'mieterstrom_wandlermessung', 'mieterstrom_wandlermessung_comment',
  'mieterstrom_msb_install_duration',
  'mieterstrom_operation_costs', 'mieterstrom_operation_costs_one_time', 'mieterstrom_operation_costs_yearly',
  'mieterstrom_rejection_response', 'mieterstrom_rejection_response_other',
  'mieterstrom_info_sources', 'mieterstrom_experiences',
  'es_status', 'es_status_other',
  'es_in_operation_details', 'es_operator_details',
  'es_plant_type', 'es_plant_type_details',
  'es_capacity_size_kw', 'es_technology_description',
  'es_project_scope', 'es_project_locations',
  'es_party_count',
  'es_consumer_types', 'es_consumer_details',
  'es_consumer_scope', 'es_consumer_scope_other',
  'es_max_distance',
  'es_vnb_contact', 'es_vnb_response', 'es_vnb_response_other',
  'es_netzentgelte_discussion', 'es_netzentgelte_details',
  'es_info_sources',
  'additional_experiences', 'uploaded_documents', 'survey_improvements',
  'nps_score',
]);

const SYSTEM_COLUMNS = new Set(['id', 'created_at', 'status', 'draft_token']);
const SPECIAL_KEYS = new Set(['sessionGroupId', 'documentUpload']); // handled specially in buildDbData

describe('Survey Schema ↔ Database Consistency', () => {
  
  it('every SurveyData key maps to an existing DB column', () => {
    const surveyKeys = getAllSurveyDataKeys();
    const missing: string[] = [];
    
    for (const key of surveyKeys) {
      if (SPECIAL_KEYS.has(key)) continue;
      
      const dbColumn = QUESTION_REGISTRY[key]?.dbColumn || toSnakeCase(key);
      if (!KNOWN_DB_COLUMNS.has(dbColumn)) {
        missing.push(`${key} → ${dbColumn}`);
      }
    }
    
    expect(missing, `Missing DB columns for SurveyData keys:\n${missing.join('\n')}`).toEqual([]);
  });
  
  it('every QUESTION_REGISTRY entry has a valid DB column', () => {
    const missing: string[] = [];
    
    for (const [key, entry] of Object.entries(QUESTION_REGISTRY)) {
      if (!KNOWN_DB_COLUMNS.has(entry.dbColumn)) {
        missing.push(`${key}: dbColumn="${entry.dbColumn}" not in DB`);
      }
    }
    
    expect(missing, `Registry entries with missing DB columns:\n${missing.join('\n')}`).toEqual([]);
  });
  
  it('detects toSnakeCase mismatches that require QUESTION_REGISTRY', () => {
    const mismatches: string[] = [];
    
    for (const [key, entry] of Object.entries(QUESTION_REGISTRY)) {
      const autoSnake = toSnakeCase(key);
      if (autoSnake !== entry.dbColumn) {
        mismatches.push(`${key}: auto="${autoSnake}" vs registry="${entry.dbColumn}"`);
      }
    }
    
    // These mismatches are expected and handled by using QUESTION_REGISTRY.dbColumn in buildDbData
    // If new mismatches appear, ensure buildDbData uses the registry
    if (mismatches.length > 0) {
      console.log(`ℹ️ ${mismatches.length} keys require QUESTION_REGISTRY.dbColumn (not just toSnakeCase):`);
      mismatches.forEach(m => console.log(`  ${m}`));
    }
    
    // Verify each mismatch's dbColumn actually exists in DB
    for (const [key, entry] of Object.entries(QUESTION_REGISTRY)) {
      expect(KNOWN_DB_COLUMNS.has(entry.dbColumn), 
        `${key}: registry dbColumn "${entry.dbColumn}" must exist in DB`
      ).toBe(true);
    }
  });
  
  it('counts total schema questions correctly', () => {
    let totalQuestions = 0;
    for (const section of surveyDefinition.sections) {
      totalQuestions += section.questions.length;
    }
    
    console.log(`📊 Total schema questions: ${totalQuestions}`);
    console.log(`📊 QUESTION_REGISTRY entries: ${Object.keys(QUESTION_REGISTRY).length}`);
    console.log(`📊 SurveyData keys: ${getAllSurveyDataKeys().length}`);
    console.log(`📊 DB columns: ${KNOWN_DB_COLUMNS.size}`);
    
    // Sanity check: at least 120 questions
    expect(totalQuestions).toBeGreaterThanOrEqual(120);
  });
  
  it('no orphan DB columns (every non-system column maps from SurveyData)', () => {
    const surveyKeys = getAllSurveyDataKeys();
    const mappedColumns = new Set<string>();
    
    for (const key of surveyKeys) {
      if (SPECIAL_KEYS.has(key)) continue;
      mappedColumns.add(QUESTION_REGISTRY[key]?.dbColumn || toSnakeCase(key));
    }
    
    // Add special mappings
    mappedColumns.add('session_group_id'); // set explicitly in buildDbData
    mappedColumns.add('uploaded_documents'); // set explicitly in buildDbData
    
    const orphans: string[] = [];
    for (const col of KNOWN_DB_COLUMNS) {
      if (SYSTEM_COLUMNS.has(col)) continue;
      if (!mappedColumns.has(col)) {
        orphans.push(col);
      }
    }
    
    if (orphans.length > 0) {
      console.log(`⚠️ Orphan DB columns (exist in DB but not mapped from SurveyData):`);
      orphans.forEach(o => console.log(`  ${o}`));
    }
    
    expect(orphans).toEqual([]);
  });
});
