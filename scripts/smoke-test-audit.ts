#!/usr/bin/env tsx
/**
 * Smoke test for static audit HTML
 * Verifies the build output contains the static audit file with real content
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const DIST_PATH = resolve(process.cwd(), 'dist/umfrage/audit/index.html');
const PUBLIC_PATH = resolve(process.cwd(), 'public/umfrage/audit/index.html');

// Check which path exists (dist for post-build, public for pre-build)
const auditPath = existsSync(DIST_PATH) ? DIST_PATH : PUBLIC_PATH;

console.log(`🔍 Checking audit file at: ${auditPath}`);

if (!existsSync(auditPath)) {
  console.error('❌ FAIL: Audit HTML file not found!');
  console.error(`   Expected at: ${DIST_PATH} or ${PUBLIC_PATH}`);
  process.exit(1);
}

const content = readFileSync(auditPath, 'utf-8');

// Check for required content markers
const requiredMarkers = [
  { pattern: /Total questions:\s*\d+/, name: 'Question count footer' },
  { pattern: /A1\./, name: 'First question (A1)' },
  { pattern: /<section[^>]*class="section"/, name: 'Section structure' },
  { pattern: /<article[^>]*class="question"/, name: 'Question structure' },
  { pattern: /Umfrage.*Audit/, name: 'Audit title' },
];

let failures = 0;

for (const { pattern, name } of requiredMarkers) {
  if (pattern.test(content)) {
    console.log(`✅ PASS: Found "${name}"`);
  } else {
    console.error(`❌ FAIL: Missing "${name}" (pattern: ${pattern})`);
    failures++;
  }
}

// Extract and display question count
const questionMatch = content.match(/Total questions:\s*(\d+)/);
if (questionMatch) {
  const count = parseInt(questionMatch[1], 10);
  console.log(`📊 Question count: ${count}`);
  if (count < 90) {
    console.error(`❌ FAIL: Expected at least 90 questions, found ${count}`);
    failures++;
  }
}

// Check file size (should be substantial, not a stub)
const sizeKB = Math.round(content.length / 1024);
console.log(`📦 File size: ${sizeKB} KB`);
if (sizeKB < 50) {
  console.error(`❌ FAIL: File too small (${sizeKB} KB), expected at least 50 KB`);
  failures++;
}

if (failures > 0) {
  console.error(`\n❌ Smoke test failed with ${failures} error(s)`);
  process.exit(1);
} else {
  console.log('\n✅ All smoke tests passed!');
  process.exit(0);
}
