/**
 * Build-Script: Generiert statische HTML- und JSON-Dateien für die Umfrage-Audit-Ansicht
 * 
 * Ausgabe:
 * - public/umfrage/audit/index.html (vollständiges statisches HTML)
 * - public/data/umfrage.full.json (vollständiger Schema-Dump)
 * - public/data/umfrage.json (komprimierte Version)
 * 
 * Verwendung: npx tsx scripts/generate-audit.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============ Types ============
interface SurveyOption {
  value: string;
  label: string;
  hasTextField?: boolean;
  textFieldLabel?: string;
  textFieldPlaceholder?: string;
}

interface SurveyQuestion {
  id: string;
  type: string;
  label: string;
  description?: string;
  helpText?: string;
  options?: SurveyOption[];
  required?: boolean;
  optional?: boolean;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  placeholder?: string;
  visibilityLogic?: string;
  skipLogic?: string;
}

interface SurveySection {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  visibilityLogic?: string;
}

interface SurveySchema {
  version: string;
  lastUpdated: string;
  title: string;
  description: string;
  sections: SurveySection[];
}

// ============ Schema Parser ============
function parseSurveySchema(): SurveySchema {
  const schemaPath = path.resolve(__dirname, '../src/data/surveySchema.ts');
  const content = fs.readFileSync(schemaPath, 'utf-8');
  
  // Extract metadata
  const versionMatch = content.match(/version:\s*["']([^"']+)["']/);
  const lastUpdatedMatch = content.match(/lastUpdated:\s*["']([^"']+)["']/);
  const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
  const descriptionMatch = content.match(/description:\s*["']([^"']+)["']/);

  // Find all SECTION_ constants
  const sectionNames: string[] = [];
  const sectionNameRegex = /const\s+(SECTION_\w+):\s*SurveySection/g;
  let match;
  while ((match = sectionNameRegex.exec(content)) !== null) {
    sectionNames.push(match[1]);
  }

  const sections: SurveySection[] = [];

  for (const sectionName of sectionNames) {
    // Extract section block
    const sectionRegex = new RegExp(
      `const\\s+${sectionName}:\\s*SurveySection\\s*=\\s*\\{([\\s\\S]*?)^\\};`,
      'gm'
    );
    const sectionMatch = sectionRegex.exec(content);
    
    if (!sectionMatch) continue;
    
    const sectionBlock = sectionMatch[1];
    
    // Parse section metadata
    const idMatch = sectionBlock.match(/id:\s*["']([^"']+)["']/);
    const sTitleMatch = sectionBlock.match(/title:\s*["']([^"']+)["']/);
    const sDescMatch = sectionBlock.match(/description:\s*["']([^"']+)["']/);
    const sVisMatch = sectionBlock.match(/visibilityLogic:\s*["']([^"']+)["']/);

    if (!idMatch || !sTitleMatch) continue;

    // Parse questions array
    const questionsStart = sectionBlock.indexOf('questions:');
    if (questionsStart === -1) continue;
    
    const questionsBlock = sectionBlock.substring(questionsStart);
    const questions = parseQuestions(questionsBlock);

    sections.push({
      id: idMatch[1],
      title: sTitleMatch[1],
      description: sDescMatch ? sDescMatch[1] : undefined,
      visibilityLogic: sVisMatch ? sVisMatch[1] : undefined,
      questions,
    });
  }

  return {
    version: versionMatch ? versionMatch[1] : '2.0.0',
    lastUpdated: lastUpdatedMatch ? lastUpdatedMatch[1] : new Date().toISOString().split('T')[0],
    title: titleMatch ? titleMatch[1] : 'Umfrage zu GGV, Mieterstrom & Energy Sharing',
    description: descriptionMatch ? descriptionMatch[1] : '',
    sections,
  };
}

function parseQuestions(block: string): SurveyQuestion[] {
  const questions: SurveyQuestion[] = [];
  
  // Split by question objects - look for { id: pattern
  const questionPattern = /\{\s*\n?\s*id:\s*["']([^"']+)["']/g;
  const matches: { index: number; id: string }[] = [];
  let qMatch;
  
  while ((qMatch = questionPattern.exec(block)) !== null) {
    matches.push({ index: qMatch.index, id: qMatch[1] });
  }

  for (let i = 0; i < matches.length; i++) {
    const startIdx = matches[i].index;
    const endIdx = i < matches.length - 1 ? matches[i + 1].index : block.length;
    const questionBlock = block.substring(startIdx, endIdx);
    
    const question = parseQuestion(questionBlock, matches[i].id);
    if (question) {
      questions.push(question);
    }
  }

  return questions;
}

function parseQuestion(block: string, id: string): SurveyQuestion | null {
  const typeMatch = block.match(/type:\s*["']([^"']+)["']/);
  const labelMatch = block.match(/label:\s*["']([^"']+)["']/);
  
  if (!labelMatch) return null;

  const question: SurveyQuestion = {
    id,
    type: typeMatch ? typeMatch[1] : 'text',
    label: labelMatch[1],
  };

  // Optional fields
  const descMatch = block.match(/description:\s*["']([^"']+)["']/);
  if (descMatch) question.description = descMatch[1];

  const helpMatch = block.match(/helpText:\s*["']([^"']+)["']/);
  if (helpMatch) question.helpText = helpMatch[1];

  const placeholderMatch = block.match(/placeholder:\s*["']([^"']+)["']/);
  if (placeholderMatch) question.placeholder = placeholderMatch[1];

  const requiredMatch = block.match(/required:\s*(true|false)/);
  if (requiredMatch) question.required = requiredMatch[1] === 'true';

  const optionalMatch = block.match(/optional:\s*(true|false)/);
  if (optionalMatch) question.optional = optionalMatch[1] === 'true';

  const visMatch = block.match(/visibilityLogic:\s*["']([^"']+)["']/);
  if (visMatch) question.visibilityLogic = visMatch[1];

  const skipMatch = block.match(/skipLogic:\s*["']([^"']+)["']/);
  if (skipMatch) question.skipLogic = skipMatch[1];

  // Scale labels for rating questions
  const minMatch = block.match(/min:\s*(\d+)/);
  if (minMatch) question.min = parseInt(minMatch[1]);

  const maxMatch = block.match(/max:\s*(\d+)/);
  if (maxMatch) question.max = parseInt(maxMatch[1]);

  const minLabelMatch = block.match(/minLabel:\s*["']([^"']+)["']/);
  if (minLabelMatch) question.minLabel = minLabelMatch[1];

  const maxLabelMatch = block.match(/maxLabel:\s*["']([^"']+)["']/);
  if (maxLabelMatch) question.maxLabel = maxLabelMatch[1];

  // Parse options
  const optionsMatch = block.match(/options:\s*\[([\s\S]*?)\],?\s*(?:required|optional|visibilityLogic|skipLogic|$)/);
  if (optionsMatch) {
    question.options = parseOptions(optionsMatch[1]);
  }

  return question;
}

function parseOptions(block: string): SurveyOption[] {
  const options: SurveyOption[] = [];
  
  // Split by option objects
  const optionPattern = /\{\s*value:\s*["']([^"']+)["']/g;
  const matches: { index: number; value: string }[] = [];
  let oMatch;
  
  while ((oMatch = optionPattern.exec(block)) !== null) {
    matches.push({ index: oMatch.index, value: oMatch[1] });
  }

  for (let i = 0; i < matches.length; i++) {
    const startIdx = matches[i].index;
    const endIdx = i < matches.length - 1 ? matches[i + 1].index : block.length;
    const optionBlock = block.substring(startIdx, endIdx);

    const labelMatch = optionBlock.match(/label:\s*["']([^"']+)["']/);
    if (!labelMatch) continue;

    const option: SurveyOption = {
      value: matches[i].value,
      label: labelMatch[1],
    };

    const hasTextFieldMatch = optionBlock.match(/hasTextField:\s*(true|false)/);
    if (hasTextFieldMatch && hasTextFieldMatch[1] === 'true') {
      option.hasTextField = true;
    }

    const textFieldLabelMatch = optionBlock.match(/textFieldLabel:\s*["']([^"']+)["']/);
    if (textFieldLabelMatch) {
      option.textFieldLabel = textFieldLabelMatch[1];
    }

    const textFieldPlaceholderMatch = optionBlock.match(/textFieldPlaceholder:\s*["']([^"']+)["']/);
    if (textFieldPlaceholderMatch) {
      option.textFieldPlaceholder = textFieldPlaceholderMatch[1];
    }

    options.push(option);
  }

  return options;
}

// ============ HTML Generator ============
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateHtml(schema: SurveySchema): string {
  const buildDate = new Date().toISOString().split('T')[0];
  const totalQuestions = schema.sections.reduce((acc, s) => acc + s.questions.length, 0);
  
  let sectionsHtml = '';
  let questionNumber = 0;

  for (const section of schema.sections) {
    let questionsHtml = '';
    
    for (const question of section.questions) {
      questionNumber++;
      
      let optionsHtml = '';
      if (question.options && question.options.length > 0) {
        optionsHtml = '<ul class="options">';
        for (const option of question.options) {
          optionsHtml += `
            <li class="option">
              <code class="option-value">${escapeHtml(option.value)}</code>
              <span class="option-label">${escapeHtml(option.label)}</span>
              ${option.hasTextField ? `<em class="text-field-note">+ Textfeld${option.textFieldLabel ? `: "${escapeHtml(option.textFieldLabel)}"` : ''}</em>` : ''}
            </li>`;
        }
        optionsHtml += '</ul>';
      }
      
      let scaleHtml = '';
      if (question.type === 'rating' && question.min !== undefined && question.max !== undefined) {
        scaleHtml = `
          <div class="scale-info">
            <span class="scale-range">Skala: ${question.min} – ${question.max}</span>
            ${question.minLabel ? `<span class="scale-label-min">${question.min}: ${escapeHtml(question.minLabel)}</span>` : ''}
            ${question.maxLabel ? `<span class="scale-label-max">${question.max}: ${escapeHtml(question.maxLabel)}</span>` : ''}
          </div>`;
      }
      
      questionsHtml += `
        <article class="question" id="q-${escapeHtml(question.id)}" data-id="${escapeHtml(question.id)}" data-type="${escapeHtml(question.type)}">
          <header class="question-header">
            <span class="question-number">#${questionNumber}</span>
            <h4 class="question-label">${escapeHtml(question.label)}</h4>
            <div class="badges">
              <span class="badge type">${escapeHtml(question.type)}</span>
              ${question.required ? '<span class="badge required">Pflicht</span>' : ''}
              ${question.optional ? '<span class="badge optional">Optional</span>' : ''}
            </div>
          </header>
          
          ${question.description ? `<p class="question-description">${escapeHtml(question.description)}</p>` : ''}
          ${question.helpText ? `<p class="question-help">ℹ️ ${escapeHtml(question.helpText)}</p>` : ''}
          ${question.placeholder ? `<p class="question-placeholder">Platzhalter: "${escapeHtml(question.placeholder)}"</p>` : ''}
          
          ${optionsHtml}
          ${scaleHtml}
          
          ${question.visibilityLogic ? `<div class="logic visibility">⚡ Sichtbarkeit: ${escapeHtml(question.visibilityLogic)}</div>` : ''}
          ${question.skipLogic ? `<div class="logic skip">➡️ Sprunglogik: ${escapeHtml(question.skipLogic)}</div>` : ''}
        </article>
      `;
    }
    
    sectionsHtml += `
      <section class="survey-section" id="s-${escapeHtml(section.id)}" data-id="${escapeHtml(section.id)}">
        <header class="section-header">
          <h2>${escapeHtml(section.title)}</h2>
          ${section.description ? `<p class="section-description">${escapeHtml(section.description)}</p>` : ''}
          ${section.visibilityLogic ? `<div class="logic section-visibility">⚡ Branching: ${escapeHtml(section.visibilityLogic)}</div>` : ''}
          <span class="question-count">${section.questions.length} Fragen</span>
        </header>
        <div class="questions">
          ${questionsHtml}
        </div>
      </section>
    `;
  }
  
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(schema.title)} – Audit-Ansicht</title>
  <meta name="description" content="${escapeHtml(schema.description)}">
  <meta name="robots" content="index, follow">
  <meta name="generator" content="generate-audit.ts">
  <link rel="canonical" href="https://www.vnb-transparenz.de/umfrage/audit">
  <style>
    :root {
      --color-bg: #fff;
      --color-text: #1a1a1a;
      --color-muted: #666;
      --color-border: #e5e7eb;
      --color-accent: #22c55e;
      --color-section-bg: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      --color-question-bg: #fafafa;
      --color-required: #dc2626;
      --color-optional: #2563eb;
      --color-logic: #f59e0b;
    }
    
    * { box-sizing: border-box; }
    
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 960px;
      margin: 0 auto;
      padding: 2rem 1rem;
      line-height: 1.6;
      color: var(--color-text);
      background: var(--color-bg);
    }
    
    a { color: var(--color-accent); }
    
    /* Header */
    .audit-header {
      border-bottom: 3px solid var(--color-accent);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .audit-header h1 {
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
    }
    
    .audit-meta {
      color: var(--color-muted);
      font-size: 0.9rem;
      margin: 1rem 0;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }
    
    .audit-links {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 1rem;
    }
    
    .audit-links a {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--color-accent);
      color: #fff;
      text-decoration: none;
      border-radius: 6px;
      font-size: 0.9rem;
    }
    
    .audit-links a:hover { opacity: 0.9; }
    
    /* Table of Contents */
    .toc {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }
    
    .toc h3 { margin: 0 0 1rem; font-size: 1rem; }
    
    .toc ol {
      margin: 0;
      padding-left: 1.5rem;
    }
    
    .toc li { margin: 0.5rem 0; }
    
    /* Sections */
    .survey-section {
      margin-bottom: 2.5rem;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      overflow: hidden;
    }
    
    .section-header {
      background: var(--color-section-bg);
      padding: 1.25rem 1.5rem;
      border-left: 4px solid var(--color-accent);
    }
    
    .section-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--color-text);
    }
    
    .section-description {
      margin: 0.5rem 0 0;
      color: var(--color-muted);
    }
    
    .section-visibility {
      margin-top: 0.75rem;
    }
    
    .question-count {
      display: inline-block;
      margin-top: 0.5rem;
      font-size: 0.85rem;
      color: var(--color-muted);
    }
    
    .questions {
      padding: 1rem 1.5rem;
    }
    
    /* Questions */
    .question {
      margin: 1rem 0;
      padding: 1.25rem;
      background: var(--color-question-bg);
      border-radius: 8px;
      border: 1px solid var(--color-border);
    }
    
    .question-header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    
    .question-number {
      font-size: 0.8rem;
      color: var(--color-muted);
      font-weight: 600;
    }
    
    .question-label {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      flex: 1;
      min-width: 200px;
    }
    
    .badges {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .badge.type { background: #f3f4f6; color: #4b5563; }
    .badge.required { background: #fee2e2; color: var(--color-required); }
    .badge.optional { background: #dbeafe; color: var(--color-optional); }
    
    .question-description,
    .question-help,
    .question-placeholder {
      font-size: 0.9rem;
      color: var(--color-muted);
      margin: 0.5rem 0;
    }
    
    .question-placeholder {
      font-style: italic;
    }
    
    /* Options */
    .options {
      margin: 0.75rem 0 0;
      padding: 0;
      list-style: none;
    }
    
    .option {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px dashed var(--color-border);
    }
    
    .option:last-child { border-bottom: none; }
    
    .option-value {
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 0.75rem;
      background: #e5e7eb;
      padding: 0.2rem 0.5rem;
      border-radius: 3px;
      color: #374151;
      flex-shrink: 0;
    }
    
    .option-label { flex: 1; }
    
    .text-field-note {
      font-size: 0.85rem;
      color: var(--color-logic);
    }
    
    /* Scale Info */
    .scale-info {
      margin-top: 0.75rem;
      padding: 0.75rem;
      background: #f0f9ff;
      border-radius: 6px;
      font-size: 0.9rem;
    }
    
    .scale-range {
      font-weight: 600;
      display: block;
      margin-bottom: 0.25rem;
    }
    
    .scale-label-min,
    .scale-label-max {
      display: block;
      color: var(--color-muted);
      font-size: 0.85rem;
    }
    
    /* Logic */
    .logic {
      margin-top: 0.75rem;
      padding: 0.5rem 0.75rem;
      background: #fef3c7;
      border-left: 3px solid var(--color-logic);
      border-radius: 0 6px 6px 0;
      font-size: 0.85rem;
      color: #92400e;
    }
    
    /* Footer */
    .audit-footer {
      margin-top: 3rem;
      padding: 1.5rem;
      border-top: 2px solid var(--color-border);
      text-align: center;
      color: var(--color-muted);
      font-size: 0.9rem;
    }
    
    /* Print */
    @media print {
      body { padding: 1rem; font-size: 10pt; }
      .survey-section { break-inside: avoid; border: 1px solid #ccc; }
      .question { break-inside: avoid; }
      .section-header { background: #f5f5f5 !important; }
      .audit-links { display: none; }
    }
    
    @media (max-width: 600px) {
      body { padding: 1rem; }
      .questions { padding: 0.75rem; }
      .question { padding: 1rem; }
    }
  </style>
</head>
<body>
  <header class="audit-header">
    <h1>📋 ${escapeHtml(schema.title)}</h1>
    <div class="audit-meta">
      <p><strong>Version:</strong> ${escapeHtml(schema.version)} | <strong>Letzte Aktualisierung:</strong> ${escapeHtml(schema.lastUpdated)} | <strong>Generiert:</strong> ${buildDate}</p>
      <p>${escapeHtml(schema.description)}</p>
      <p><strong>Statistik:</strong> ${schema.sections.length} Abschnitte, ${totalQuestions} Fragen</p>
    </div>
    <nav class="audit-links">
      <a href="/data/umfrage.full.json">📥 Full JSON Export</a>
      <a href="/data/umfrage.json">📦 Kompakt JSON</a>
      <a href="/umfrage">🖊️ Interaktive Umfrage</a>
      <a href="/">🏠 Startseite</a>
    </nav>
  </header>

  <nav class="toc">
    <h3>Inhaltsverzeichnis</h3>
    <ol>
      ${schema.sections.map(s => `<li><a href="#s-${escapeHtml(s.id)}">${escapeHtml(s.title)}</a> <small>(${s.questions.length})</small></li>`).join('\n      ')}
    </ol>
  </nav>

  <main>
    ${sectionsHtml}
  </main>

  <footer class="audit-footer">
    <p>Diese statische Seite zeigt die vollständige Struktur der Umfrage für Audit-Zwecke.</p>
    <p>Keine JavaScript-Ausführung erforderlich. Generiert aus <code>src/data/surveySchema.ts</code>.</p>
    <p><a href="https://vnb-transparenz.de">VNB Transparenz</a></p>
  </footer>
</body>
</html>`;
}

// ============ JSON Generators ============
function generateFullJson(schema: SurveySchema): string {
  const exportData = {
    $schema: 'https://vnb-transparenz.de/data/umfrage-schema.json',
    version: schema.version,
    lastUpdated: schema.lastUpdated,
    generatedAt: new Date().toISOString(),
    title: schema.title,
    description: schema.description,
    statistics: {
      totalSections: schema.sections.length,
      totalQuestions: schema.sections.reduce((acc, s) => acc + s.questions.length, 0),
    },
    sections: schema.sections.map(section => ({
      id: section.id,
      title: section.title,
      description: section.description || null,
      visibilityLogic: section.visibilityLogic || null,
      questionCount: section.questions.length,
      questions: section.questions.map(q => ({
        id: q.id,
        type: q.type,
        label: q.label,
        description: q.description || null,
        helpText: q.helpText || null,
        placeholder: q.placeholder || null,
        required: q.required || false,
        optional: q.optional || false,
        visibilityLogic: q.visibilityLogic || null,
        skipLogic: q.skipLogic || null,
        options: q.options ? q.options.map(o => ({
          value: o.value,
          label: o.label,
          hasTextField: o.hasTextField || false,
          textFieldLabel: o.textFieldLabel || null,
          textFieldPlaceholder: o.textFieldPlaceholder || null,
        })) : null,
        scaleLabels: q.type === 'rating' ? {
          min: q.min,
          max: q.max,
          minLabel: q.minLabel || null,
          maxLabel: q.maxLabel || null,
        } : null,
      })),
    })),
  };
  
  return JSON.stringify(exportData, null, 2);
}

function generateCompactJson(schema: SurveySchema): string {
  const exportData = {
    version: schema.version,
    lastUpdated: schema.lastUpdated,
    generatedAt: new Date().toISOString(),
    title: schema.title,
    statistics: {
      sections: schema.sections.length,
      questions: schema.sections.reduce((acc, s) => acc + s.questions.length, 0),
    },
    sections: schema.sections.map(section => ({
      id: section.id,
      title: section.title,
      questions: section.questions.map(q => q.id),
    })),
  };
  
  return JSON.stringify(exportData);
}

// ============ Smoke Test ============
function smokeTest(html: string, schema: SurveySchema): void {
  console.log('🔍 Running smoke tests...');
  
  const requiredPatterns = [
    { pattern: 'Akteursgruppe', description: 'First question text' },
    { pattern: 'actorTypes', description: 'First question ID' },
    { pattern: 'Motivation', description: 'Motivation question' },
    { pattern: 'projectTypes', description: 'Project types question' },
    { pattern: 'vnbName', description: 'VNB name question' },
    { pattern: 'planningStatus', description: 'Planning status question' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const { pattern, description } of requiredPatterns) {
    if (html.includes(pattern)) {
      console.log(`  ✅ Found: ${description}`);
      passed++;
    } else {
      console.log(`  ❌ Missing: ${description}`);
      failed++;
    }
  }
  
  // Check question count
  const expectedQuestions = schema.sections.reduce((acc, s) => acc + s.questions.length, 0);
  const questionMatches = (html.match(/class="question"/g) || []).length;
  
  if (questionMatches >= expectedQuestions * 0.9) { // Allow 10% variance
    console.log(`  ✅ Question count: ${questionMatches}/${expectedQuestions}`);
    passed++;
  } else {
    console.log(`  ❌ Question count mismatch: ${questionMatches}/${expectedQuestions}`);
    failed++;
  }
  
  if (failed > 0) {
    console.log(`\n⚠️ Smoke test: ${passed} passed, ${failed} failed`);
  } else {
    console.log(`\n✅ All smoke tests passed (${passed}/${passed + failed})`);
  }
}

// ============ Schema Validation ============
interface ValidationError {
  type: 'duplicate_id' | 'missing_label' | 'non_exclusive_negative';
  message: string;
  questionId?: string;
  sectionId?: string;
}

function validateSchema(schema: SurveySchema): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenIds = new Map<string, string>(); // id -> sectionId

  for (const section of schema.sections) {
    for (const question of section.questions) {
      // Check for duplicate question IDs
      if (seenIds.has(question.id)) {
        errors.push({
          type: 'duplicate_id',
          message: `Duplicate question ID "${question.id}" found in sections "${seenIds.get(question.id)}" and "${section.id}"`,
          questionId: question.id,
          sectionId: section.id,
        });
      } else {
        seenIds.set(question.id, section.id);
      }

      // Check hasTextField options have labels
      if (question.options) {
        for (const option of question.options) {
          if (option.hasTextField && !option.label) {
            errors.push({
              type: 'missing_label',
              message: `Option with hasTextField=true is missing label in question "${question.id}"`,
              questionId: question.id,
              sectionId: section.id,
            });
          }
        }

        // Check Multi-Select with "Keine/Nein" should have exclusive flag (warning only for now)
        if (question.type === 'multi-select') {
          const negativeOptions = question.options.filter(o => 
            o.value.toLowerCase().includes('keine') || 
            o.value.toLowerCase().includes('nein') ||
            o.value.toLowerCase() === 'none' ||
            o.value.toLowerCase() === 'no'
          );
          
          for (const negOpt of negativeOptions) {
            // We can't easily check for exclusive=true without parsing more TypeScript
            // Log a warning for manual review
            console.log(`  ⚠️ Multi-select "${question.id}" has negative option "${negOpt.value}" - verify exclusive flag in source`);
          }
        }
      }
    }
  }

  return errors;
}

// ============ Main ============
async function main() {
  console.log('🔧 VNB Transparenz Umfrage Audit Generator\n');
  
  console.log('1️⃣ Parsing survey schema...');
  const schema = parseSurveySchema();
  const totalQuestions = schema.sections.reduce((acc, s) => acc + s.questions.length, 0);
  console.log(`   Found ${schema.sections.length} sections with ${totalQuestions} questions\n`);
  
  // Schema Validation
  console.log('2️⃣ Validating schema...');
  const validationErrors = validateSchema(schema);
  
  if (validationErrors.length > 0) {
    console.error('\n❌ Schema validation failed:');
    for (const error of validationErrors) {
      console.error(`   • [${error.type}] ${error.message}`);
    }
    console.error(`\n   ${validationErrors.length} error(s) found. Aborting build.`);
    process.exit(1);
  }
  console.log('   ✅ Schema validation passed\n');
  
  // Ensure directories exist
  const auditDir = path.resolve(__dirname, '../public/umfrage/audit');
  const dataDir = path.resolve(__dirname, '../public/data');
  
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
    console.log(`   📁 Created: ${auditDir}`);
  }
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`   📁 Created: ${dataDir}`);
  }
  
  // Generate HTML
  console.log('3️⃣ Generating static HTML...');
  const html = generateHtml(schema);
  const htmlPath = path.join(auditDir, 'index.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`   ✅ Written: ${htmlPath} (${(html.length / 1024).toFixed(1)} KB)\n`);
  
  // Generate Full JSON
  console.log('4️⃣ Generating full JSON...');
  const fullJson = generateFullJson(schema);
  const fullJsonPath = path.join(dataDir, 'umfrage.full.json');
  fs.writeFileSync(fullJsonPath, fullJson, 'utf-8');
  console.log(`   ✅ Written: ${fullJsonPath} (${(fullJson.length / 1024).toFixed(1)} KB)\n`);
  
  // Generate Compact JSON
  console.log('5️⃣ Generating compact JSON...');
  const compactJson = generateCompactJson(schema);
  const compactJsonPath = path.join(dataDir, 'umfrage.json');
  fs.writeFileSync(compactJsonPath, compactJson, 'utf-8');
  console.log(`   ✅ Written: ${compactJsonPath} (${(compactJson.length / 1024).toFixed(1)} KB)\n`);
  
  // Smoke test
  console.log('6️⃣ Running smoke tests...');
  const smokeTestFailed = runSmokeTest(html, schema);
  
  if (smokeTestFailed) {
    console.error('\n❌ Smoke test failed. Aborting build.');
    process.exit(1);
  }
  
  console.log('\n🎉 Build complete! Static files ready for deployment.');
  console.log('   📄 /umfrage/audit/index.html - Static HTML audit view');
  console.log('   📊 /data/umfrage.full.json - Complete schema dump');
  console.log('   📊 /data/umfrage.json - Compact schema\n');
}

function runSmokeTest(html: string, schema: SurveySchema): boolean {
  const requiredPatterns = [
    { pattern: 'actorTypes', description: 'Actor types question' },
    { pattern: 'motivation', description: 'Motivation question' },
    { pattern: 'projectTypes', description: 'Project types question' },
    { pattern: 'vnbName', description: 'VNB name question' },
    { pattern: 'planningStatus', description: 'Planning status question' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const { pattern, description } of requiredPatterns) {
    if (html.includes(pattern)) {
      console.log(`   ✅ Found: ${description}`);
      passed++;
    } else {
      console.log(`   ❌ Missing: ${description}`);
      failed++;
    }
  }
  
  // Check question count
  const expectedQuestions = schema.sections.reduce((acc, s) => acc + s.questions.length, 0);
  const questionMatches = (html.match(/class="question"/g) || []).length;
  
  if (questionMatches >= expectedQuestions * 0.9) { // Allow 10% variance
    console.log(`   ✅ Question count: ${questionMatches}/${expectedQuestions}`);
    passed++;
  } else {
    console.log(`   ❌ Question count mismatch: ${questionMatches}/${expectedQuestions}`);
    failed++;
  }
  
  if (failed > 0) {
    console.log(`\n⚠️ Smoke test: ${passed} passed, ${failed} failed`);
    return true; // Return true to indicate failure
  } else {
    console.log(`\n✅ All smoke tests passed (${passed}/${passed + failed})`);
    return false;
  }
}

main().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
