#!/usr/bin/env npx tsx
/**
 * Generates public/data/umfrage-schema.json from the SSOT survey schema.
 * 
 * Usage: npx tsx scripts/generate-schema-json.ts
 * 
 * This is also run automatically at build time via a Vite plugin.
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

// We can't import the TS module directly with all its deps,
// so we inline the generation logic here, mirroring getSurveySchemaAsJson().
// The canonical source remains src/data/surveySchema.ts.

async function main() {
  // Dynamic import to handle TS paths
  const schemaModule = await import('../src/data/surveySchema');
  const json = schemaModule.getSurveySchemaAsJson();
  
  const outPath = resolve(process.cwd(), 'public/data/umfrage-schema.json');
  writeFileSync(outPath, JSON.stringify(json, null, 2), 'utf-8');
  console.log(`✅ Schema JSON written to ${outPath}`);
  console.log(`   ${json.sections.length} sections, ${json.sections.reduce((acc: number, s: any) => acc + s.questions.length, 0)} questions`);
}

main().catch(err => {
  console.error('❌ Failed to generate schema JSON:', err);
  process.exit(1);
});
