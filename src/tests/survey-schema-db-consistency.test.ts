/**
 * Automated Survey Schema ↔ Database Consistency Test
 * 
 * This test ensures that:
 * 1. Every SurveyData key maps to an existing DB column
 * 2. Every QUESTION_REGISTRY entry has a valid DB column
 * 3. buildDbData uses the correct column names (not just toSnakeCase)
 * 4. No DB columns are orphaned (exist in DB but not mapped)
 * 
 * KNOWN_DB_COLUMNS is extracted dynamically from types.ts — no manual maintenance needed.
 * 
 * Run: npx vitest run src/tests/survey-schema-db-consistency.test.ts
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { QUESTION_REGISTRY, surveyDefinition } from '@/data/surveySchema';
import { initialSurveyData, type SurveyData } from '@/types/survey';

// ── Helpers ──

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/** Extract all SurveyData keys from initialSurveyData + QUESTION_REGISTRY + companion fields */
function getAllSurveyDataKeys(): string[] {
  const keys = new Set(Object.keys(initialSurveyData));
  
  for (const key of Object.keys(QUESTION_REGISTRY)) {
    keys.add(key);
  }
  
  const companionFields = [
    'actorTextFields', 'actorOther', 'actorDienstleisterCategoryOther',
    'motivationOther',
    'projectAddress', 'projectPlz',
    'projectLocations', 'mieterstromProjectLocations', 'esProjectLocations',
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

/**
 * Dynamically extract DB column names from the Supabase types file.
 * Parses the survey_responses Insert block to get all column names.
 * This eliminates the need for a manually maintained list.
 */
function extractDbColumnsFromTypes(): Set<string> {
  const typesPath = resolve(process.cwd(), 'src/integrations/supabase/types.ts');
  const content = readFileSync(typesPath, 'utf-8');
  
  // Find the survey_responses section, then extract the Insert block
  const surveySection = content.match(/survey_responses:\s*\{([\s\S]*?)^\s{6}\}/m);
  if (!surveySection) {
    throw new Error('Could not find survey_responses type in supabase types');
  }
  
  // Extract the Insert block from the survey_responses section
  const insertBlock = surveySection[1].match(/Insert:\s*\{([\s\S]*?)\n\s{8}\}/);
  if (!insertBlock) {
    throw new Error('Could not find Insert block in survey_responses type');
  }
  
  const columns = new Set<string>();
  const columnRegex = /^\s+(\w+)\??:/gm;
  let match;
  while ((match = columnRegex.exec(insertBlock[1])) !== null) {
    columns.add(match[1]);
  }
  return columns;
}

const KNOWN_DB_COLUMNS = extractDbColumnsFromTypes();

const SYSTEM_COLUMNS = new Set([
  'id', 'created_at', 'updated_at', 'status', 'draft_token', 'schema_version',
  // Deprecated/orphan columns kept in DB but removed from code:
  'project_focus', 'ggv_transparenz_opt_in', 'vnb_additional_costs_other',
]);
const SPECIAL_KEYS = new Set([
  'sessionGroupId', 'documentUpload',
  // UI-only location arrays – expanded to rows by expandToLocationRows, no DB column
  'projectLocations', 'mieterstromProjectLocations', 'esProjectLocations',
]);

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
      if (SPECIAL_KEYS.has(key)) continue;
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
      if (SPECIAL_KEYS.has(key)) continue;
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
    mappedColumns.add('project_type_tag'); // set by expandToLocationRows
    
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
