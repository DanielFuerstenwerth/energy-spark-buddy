#!/usr/bin/env npx tsx
/**
 * Automated Schema Consistency Check
 * 
 * Verifies that every field in SurveyData has a corresponding column
 * in the survey_responses DB table (via Supabase types).
 * 
 * Usage: npx tsx scripts/check-survey-db-columns.ts
 * 
 * This script:
 * 1. Extracts all keys from the SurveyData interface (via initialSurveyData + QUESTION_REGISTRY)
 * 2. Extracts all DB column names from the Supabase types file
 * 3. Converts SurveyData keys to snake_case (same logic as buildDbData)
 * 4. Reports any mismatches
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── 1. Extract DB columns from Supabase types ──
function extractDbColumns(): Set<string> {
  const typesPath = resolve(process.cwd(), 'src/integrations/supabase/types.ts');
  const content = readFileSync(typesPath, 'utf-8');
  
  // Find the survey_responses Insert block (most permissive - all columns listed)
  const insertMatch = content.match(/survey_responses:\s*\{[^}]*Insert:\s*\{([^}]+)\}/s);
  if (!insertMatch) {
    throw new Error('Could not find survey_responses Insert type in supabase types');
  }
  
  const columns = new Set<string>();
  const columnRegex = /(\w+)\??:/g;
  let match;
  while ((match = columnRegex.exec(insertMatch[1])) !== null) {
    columns.add(match[1]);
  }
  return columns;
}

// ── 2. Extract SurveyData keys ──
async function extractSurveyDataKeys(): Promise<Map<string, string>> {
  const schema = await import('../src/data/surveySchema');
  const surveyTypes = await import('../src/types/survey');
  
  const keyToSnake = new Map<string, string>();
  const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  
  // All keys from QUESTION_REGISTRY (with their explicit dbColumn)
  for (const [key, entry] of Object.entries(schema.QUESTION_REGISTRY)) {
    keyToSnake.set(key, entry.dbColumn);
  }
  
  // All keys from initialSurveyData (companion fields)
  for (const key of Object.keys(surveyTypes.initialSurveyData)) {
    if (!keyToSnake.has(key)) {
      keyToSnake.set(key, toSnakeCase(key));
    }
  }
  
  // All keys from SurveyData interface - we parse the type file
  const surveyTypesPath = resolve(process.cwd(), 'src/types/survey.ts');
  const content = readFileSync(surveyTypesPath, 'utf-8');
  const interfaceMatch = content.match(/export interface SurveyData \{([^]*?)\n\}/);
  if (interfaceMatch) {
    const fieldRegex = /^\s+(\w+)\??:/gm;
    let match;
    while ((match = fieldRegex.exec(interfaceMatch[1])) !== null) {
      const key = match[1];
      if (!keyToSnake.has(key)) {
        keyToSnake.set(key, schema.QUESTION_REGISTRY[key]?.dbColumn || toSnakeCase(key));
      }
    }
  }
  
  return keyToSnake;
}

// ── 3. Compare ──
async function main() {
  const dbColumns = extractDbColumns();
  const surveyKeys = await extractSurveyDataKeys();
  
  // System columns that exist in DB but not in SurveyData (expected)
  const SYSTEM_COLUMNS = new Set(['id', 'created_at', 'status', 'draft_token', 'uploaded_documents']);
  
  // SurveyData keys that don't map to a direct DB column (handled specially)
  const SPECIAL_KEYS = new Set(['sessionGroupId']); // set explicitly in buildDbData
  
  console.log(`\n📊 Survey Schema Consistency Check`);
  console.log(`   DB columns: ${dbColumns.size}`);
  console.log(`   SurveyData keys: ${surveyKeys.size}\n`);
  
  let errors = 0;
  
  // Check: every SurveyData key should have a DB column
  console.log('── SurveyData → DB (missing columns?) ──');
  for (const [camelKey, snakeKey] of surveyKeys) {
    if (SPECIAL_KEYS.has(camelKey)) continue;
    if (!dbColumns.has(snakeKey)) {
      console.log(`  ❌ ${camelKey} → ${snakeKey} — NOT IN DB`);
      errors++;
    }
  }
  if (errors === 0) {
    console.log('  ✅ All SurveyData keys have matching DB columns');
  }
  
  // Check: DB columns that have no SurveyData key (informational)
  const mappedSnakeKeys = new Set([...surveyKeys.values(), ...SYSTEM_COLUMNS, 'session_group_id']);
  console.log('\n── DB → SurveyData (orphan columns?) ──');
  let orphans = 0;
  for (const col of dbColumns) {
    if (SYSTEM_COLUMNS.has(col)) continue;
    if (!mappedSnakeKeys.has(col)) {
      console.log(`  ⚠️  ${col} — exists in DB but not mapped from SurveyData`);
      orphans++;
    }
  }
  if (orphans === 0) {
    console.log('  ✅ All DB columns are mapped');
  }
  
  // Check: toSnakeCase vs QUESTION_REGISTRY dbColumn mismatches
  const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  console.log('\n── toSnakeCase vs QUESTION_REGISTRY.dbColumn ──');
  let mismatches = 0;
  for (const [key, entry] of Object.entries(schema.QUESTION_REGISTRY)) {
    const autoSnake = toSnakeCase(key);
    if (autoSnake !== entry.dbColumn) {
      console.log(`  ⚠️  ${key}: toSnakeCase="${autoSnake}" vs dbColumn="${entry.dbColumn}"`);
      mismatches++;
    }
  }
  if (mismatches === 0) {
    console.log('  ✅ All registry entries match toSnakeCase');
  } else {
    console.log(`  ℹ️  ${mismatches} mismatches — these REQUIRE QUESTION_REGISTRY.dbColumn to be used in buildDbData`);
  }
  
  console.log(`\n${errors > 0 ? '❌' : '✅'} Result: ${errors} missing DB columns, ${orphans} orphan DB columns, ${mismatches} snake_case mismatches\n`);
  
  if (errors > 0) {
    // Generate migration SQL for missing columns
    console.log('── Suggested migration SQL ──');
    for (const [camelKey, snakeKey] of surveyKeys) {
      if (SPECIAL_KEYS.has(camelKey)) continue;
      if (!dbColumns.has(snakeKey)) {
        console.log(`ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS ${snakeKey} text;`);
      }
    }
    console.log('');
    process.exit(1);
  }
}

// Need to import schema at top level for the mismatch check
import * as schema from '../src/data/surveySchema';

main().catch(err => {
  console.error('❌ Check failed:', err);
  process.exit(1);
});
