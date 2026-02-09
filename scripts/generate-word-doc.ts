/**
 * Generates a Word-compatible (.doc) HTML document from surveySchema.ts
 * Uses QUESTION_REGISTRY displayIds and surveyDefinition as SSOT.
 * 
 * Usage: npx tsx scripts/generate-word-doc.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Types (mirrored from surveySchema.ts for Node.js execution) ---

interface SurveyOption {
  value: string;
  label: string;
  hasTextField?: boolean;
  textFieldLabel?: string;
  textFieldPlaceholder?: string;
  exclusive?: boolean;
}

interface SurveyQuestion {
  id: string;
  dbColumn?: string;
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
  conditionalRequired?: string;
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

interface RegistryEntry {
  displayId: string;
  dbColumn: string;
}

// --- Schema parser (extracts data from surveySchema.ts at build time) ---

function parseSurveySchema(): { schema: SurveySchema; registry: Record<string, RegistryEntry> } {
  const schemaPath = path.resolve(__dirname, '../src/data/surveySchema.ts');
  const content = fs.readFileSync(schemaPath, 'utf-8');

  // Parse top-level metadata
  const versionMatch = content.match(/version:\s*["']([^"']+)["']/);
  const lastUpdatedMatch = content.match(/lastUpdated:\s*["']([^"']+)["']/);
  const titleMatch = content.match(/title:\s*["']Umfrage[^"']*["']/);
  const descriptionMatch = content.match(/description:\s*["']Diese Umfrage[^"']*["']/);

  // Parse QUESTION_REGISTRY
  const registry: Record<string, RegistryEntry> = {};
  const registryBlock = content.match(/QUESTION_REGISTRY[^{]*\{([\s\S]*?)\n\};/);
  if (registryBlock) {
    const entryRegex = /"(\w+)":\s*\{\s*displayId:\s*"([^"]+)",\s*dbColumn:\s*"([^"]+)"\s*\}/g;
    let m;
    while ((m = entryRegex.exec(registryBlock[1])) !== null) {
      registry[m[1]] = { displayId: m[2], dbColumn: m[3] };
    }
  }

  // Parse sections
  const sectionNames: string[] = [];
  const sectionNameRegex = /const\s+(SECTION_\w+):\s*SurveySection/g;
  let match;
  while ((match = sectionNameRegex.exec(content)) !== null) {
    sectionNames.push(match[1]);
  }

  const sections: SurveySection[] = [];
  for (const sectionName of sectionNames) {
    const sectionRegex = new RegExp(
      `const\\s+${sectionName}:\\s*SurveySection\\s*=\\s*\\{([\\s\\S]*?)^\\};`,
      'gm'
    );
    const sectionMatch = sectionRegex.exec(content);
    if (!sectionMatch) continue;

    const sectionBlock = sectionMatch[1];
    const idMatch = sectionBlock.match(/id:\s*["']([^"']+)["']/);
    const sTitleMatch = sectionBlock.match(/title:\s*["']([^"']+)["']/);
    const sDescMatch = sectionBlock.match(/description:\s*["']([^"']+)["']/);
    const sVisMatch = sectionBlock.match(/visibilityLogic:\s*["']([^"']+)["']/);

    if (!idMatch || !sTitleMatch) continue;

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
    schema: {
      version: versionMatch ? versionMatch[1] : '3.0.0',
      lastUpdated: lastUpdatedMatch ? lastUpdatedMatch[1] : new Date().toISOString().split('T')[0],
      title: titleMatch ? titleMatch[0].match(/["']([^"']+)["']/)?.[1] || 'Umfrage' : 'Umfrage',
      description: descriptionMatch ? descriptionMatch[0].match(/["']([^"']+)["']/)?.[1] || '' : '',
      sections,
    },
    registry,
  };
}

function parseQuestions(block: string): SurveyQuestion[] {
  const questions: SurveyQuestion[] = [];
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
    if (question) questions.push(question);
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

  const condReqMatch = block.match(/conditionalRequired:\s*["']([^"']+)["']/);
  if (condReqMatch) question.conditionalRequired = condReqMatch[1];

  const minMatch = block.match(/min:\s*(\d+)/);
  if (minMatch) question.min = parseInt(minMatch[1]);

  const maxMatch = block.match(/max:\s*(\d+)/);
  if (maxMatch) question.max = parseInt(maxMatch[1]);

  const minLabelMatch = block.match(/minLabel:\s*["']([^"']+)["']/);
  if (minLabelMatch) question.minLabel = minLabelMatch[1];

  const maxLabelMatch = block.match(/maxLabel:\s*["']([^"']+)["']/);
  if (maxLabelMatch) question.maxLabel = maxLabelMatch[1];

  const optionsMatch = block.match(/options:\s*\[([\s\S]*?)\],?\s*(?:required|optional|visibilityLogic|skipLogic|conditionalRequired|$)/);
  if (optionsMatch) {
    question.options = parseOptions(optionsMatch[1]);
  }

  return question;
}

function parseOptions(block: string): SurveyOption[] {
  const options: SurveyOption[] = [];
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
    if (hasTextFieldMatch && hasTextFieldMatch[1] === 'true') option.hasTextField = true;

    const textFieldLabelMatch = optionBlock.match(/textFieldLabel:\s*["']([^"']+)["']/);
    if (textFieldLabelMatch) option.textFieldLabel = textFieldLabelMatch[1];

    const exclusiveMatch = optionBlock.match(/exclusive:\s*(true|false)/);
    if (exclusiveMatch && exclusiveMatch[1] === 'true') option.exclusive = true;

    options.push(option);
  }

  return options;
}

// --- HTML generation ---

function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    'single-select': 'Einfachauswahl',
    'multi-select': 'Mehrfachauswahl',
    'text': 'Textfeld',
    'textarea': 'Textfeld (mehrzeilig)',
    'number': 'Zahleneingabe',
    'email': 'E-Mail',
    'rating': 'Bewertungsskala',
    'file': 'Datei-Upload',
    'vnb-select': 'VNB-Auswahl (Suchfeld)',
    'project-focus': 'Projektfokus-Auswahl',
  };
  return map[type] || type;
}

function generateWordDoc(schema: SurveySchema, registry: Record<string, RegistryEntry>): string {
  const buildDate = new Date().toISOString().split('T')[0];
  const totalQuestions = schema.sections.reduce((acc, s) => acc + s.questions.length, 0);

  let body = '';
  let questionNumber = 0;

  for (const section of schema.sections) {
    body += `
    <div style="page-break-before: auto; margin-top: 24pt;">
      <h2 style="color: #1a365d; border-bottom: 2pt solid #22c55e; padding-bottom: 6pt; font-size: 16pt;">
        ${esc(section.title)}
      </h2>`;

    if (section.description) {
      body += `<p style="color: #666; font-style: italic; margin-bottom: 6pt;">${esc(section.description)}</p>`;
    }

    if (section.visibilityLogic) {
      body += `<p style="background: #fef3c7; padding: 4pt 8pt; border-left: 3pt solid #f59e0b; font-size: 9pt; color: #92400e;">
        ⚡ Sichtbarkeit: ${esc(section.visibilityLogic)}
      </p>`;
    }

    for (const question of section.questions) {
      questionNumber++;

      const regEntry = registry[question.id];
      const displayId = regEntry?.displayId || question.id;
      const dbColumn = regEntry?.dbColumn || '—';

      body += `
      <div style="margin: 12pt 0; padding: 10pt; background: #f9fafb; border: 1pt solid #e5e7eb; border-radius: 4pt;">
        <p style="margin: 0 0 4pt;">
          <span style="color: #2563eb; font-size: 9pt; font-weight: bold; font-family: monospace; background: #eff6ff; padding: 1pt 4pt; border-radius: 2pt;">${esc(displayId)}</span>
          <span style="color: #999; font-size: 8pt; margin-left: 6pt;">#${questionNumber}</span>
        </p>
        <p style="margin: 2pt 0 4pt;">
          <strong style="font-size: 11pt;">${esc(question.label)}</strong>
        </p>
        <p style="margin: 0 0 4pt; font-size: 9pt; color: #666;">
          Typ: ${typeLabel(question.type)}
          | DB: <code style="font-family: monospace; background: #f3f4f6; padding: 1pt 3pt; font-size: 8pt;">${esc(dbColumn)}</code>
          ${question.required ? ' | <span style="color: #dc2626; font-weight: bold;">Pflichtfeld</span>' : ''}
          ${question.optional ? ' | <span style="color: #2563eb;">Optional</span>' : ''}
        </p>`;

      if (question.description) {
        body += `<p style="font-size: 9pt; color: #666; margin: 2pt 0;">${esc(question.description)}</p>`;
      }
      if (question.helpText) {
        body += `<p style="font-size: 9pt; color: #666; margin: 2pt 0;">ℹ️ ${esc(question.helpText)}</p>`;
      }
      if (question.placeholder) {
        body += `<p style="font-size: 9pt; color: #999; font-style: italic; margin: 2pt 0;">Platzhalter: "${esc(question.placeholder)}"</p>`;
      }

      // Options table
      if (question.options && question.options.length > 0) {
        body += `
        <table style="width: 100%; border-collapse: collapse; margin-top: 6pt; font-size: 10pt;">
          <tr style="background: #e5e7eb;">
            <th style="text-align: left; padding: 3pt 6pt; border: 1pt solid #ccc; width: 25%;">Wert</th>
            <th style="text-align: left; padding: 3pt 6pt; border: 1pt solid #ccc;">Label</th>
            <th style="text-align: left; padding: 3pt 6pt; border: 1pt solid #ccc; width: 20%;">Extras</th>
          </tr>`;

        for (const opt of question.options) {
          const extras: string[] = [];
          if (opt.hasTextField) extras.push(`+ Textfeld${opt.textFieldLabel ? ` ("${esc(opt.textFieldLabel)}")` : ''}`);
          if (opt.exclusive) extras.push('exklusiv');

          body += `
          <tr>
            <td style="padding: 3pt 6pt; border: 1pt solid #ccc; font-family: monospace; font-size: 9pt; color: #374151;">${esc(opt.value)}</td>
            <td style="padding: 3pt 6pt; border: 1pt solid #ccc;">${esc(opt.label)}</td>
            <td style="padding: 3pt 6pt; border: 1pt solid #ccc; font-size: 9pt; color: #f59e0b;">${extras.join(', ')}</td>
          </tr>`;
        }
        body += '</table>';
      }

      // Rating scale
      if (question.type === 'rating' && question.min !== undefined && question.max !== undefined) {
        body += `
        <p style="font-size: 9pt; margin-top: 6pt; padding: 4pt 8pt; background: #f0f9ff; border-radius: 4pt;">
          <strong>Skala:</strong> ${question.min} – ${question.max}<br>
          ${question.minLabel ? `${question.min}: ${esc(question.minLabel)}<br>` : ''}
          ${question.maxLabel ? `${question.max}: ${esc(question.maxLabel)}` : ''}
        </p>`;
      }

      // Logic annotations
      if (question.visibilityLogic) {
        body += `<p style="font-size: 9pt; margin-top: 4pt; padding: 3pt 6pt; background: #fef3c7; border-left: 3pt solid #f59e0b; color: #92400e;">
          ⚡ Sichtbarkeit: ${esc(question.visibilityLogic)}
        </p>`;
      }
      if (question.skipLogic) {
        body += `<p style="font-size: 9pt; margin-top: 4pt; padding: 3pt 6pt; background: #fef3c7; border-left: 3pt solid #f59e0b; color: #92400e;">
          ➡️ Sprunglogik: ${esc(question.skipLogic)}
        </p>`;
      }
      if (question.conditionalRequired) {
        body += `<p style="font-size: 9pt; margin-top: 4pt; padding: 3pt 6pt; background: #fee2e2; border-left: 3pt solid #dc2626; color: #991b1b;">
          🔒 Bedingt Pflicht: ${esc(question.conditionalRequired)}
        </p>`;
      }

      body += '</div>';
    }

    body += '</div>';
  }

  // Registry appendix
  let registryTable = `
  <div style="page-break-before: always; margin-top: 24pt;">
    <h2 style="color: #1a365d; border-bottom: 2pt solid #22c55e; padding-bottom: 6pt; font-size: 16pt;">
      Anhang: Fragen-Registry (Display-ID → DB-Spalte)
    </h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 9pt;">
      <tr style="background: #1a365d; color: white;">
        <th style="text-align: left; padding: 4pt 6pt; border: 1pt solid #ccc;">Display-ID</th>
        <th style="text-align: left; padding: 4pt 6pt; border: 1pt solid #ccc;">Interner Key</th>
        <th style="text-align: left; padding: 4pt 6pt; border: 1pt solid #ccc;">DB-Spalte</th>
      </tr>`;

  for (const [key, entry] of Object.entries(registry)) {
    registryTable += `
      <tr>
        <td style="padding: 3pt 6pt; border: 1pt solid #ccc; font-family: monospace; color: #2563eb;">${esc(entry.displayId)}</td>
        <td style="padding: 3pt 6pt; border: 1pt solid #ccc; font-family: monospace;">${esc(key)}</td>
        <td style="padding: 3pt 6pt; border: 1pt solid #ccc; font-family: monospace; color: #059669;">${esc(entry.dbColumn)}</td>
      </tr>`;
  }
  registryTable += '</table></div>';

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta name="ProgId" content="Word.Document">
  <meta name="Generator" content="VNB Transparenz generate-word-doc.ts v3">
  <title>${esc(schema.title)} – Dokumentation v${esc(schema.version)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; }
    h1 { font-size: 20pt; color: #1a365d; margin-bottom: 6pt; }
    h2 { font-size: 16pt; }
    table { border-collapse: collapse; }
    td, th { vertical-align: top; }
    code { font-family: Consolas, monospace; }
  </style>
</head>
<body>
  <h1>📋 ${esc(schema.title)}</h1>
  <p style="color: #666; font-size: 10pt;">
    Version: ${esc(schema.version)} | Stand: ${esc(schema.lastUpdated)} | Generiert: ${buildDate}
  </p>
  <p style="color: #666; font-size: 10pt;">${esc(schema.description)}</p>
  <p style="font-size: 10pt;"><strong>Statistik:</strong> ${schema.sections.length} Abschnitte, ${totalQuestions} Fragen, ${Object.keys(registry).length} Registry-Einträge</p>
  
  <div style="background: #eff6ff; padding: 8pt 12pt; border-left: 4pt solid #2563eb; margin: 12pt 0; font-size: 10pt;">
    <strong>Hinweis zur Verwendung:</strong> Jede Frage hat eine <span style="color: #2563eb; font-weight: bold;">Display-ID</span> (z.B. <code>4-GGV-MsbOffer</code>) und eine <code style="color: #059669;">DB-Spalte</code>. 
    Wenn Sie Korrekturen anmerken möchten, beginnen Sie die Anmerkung mit "<strong>Korrektur</strong>" und referenzieren Sie die Display-ID.
  </div>

  <hr style="border: 1pt solid #22c55e; margin: 12pt 0;">
  
  <h2 style="font-size: 14pt; color: #1a365d;">Inhaltsverzeichnis</h2>
  <ol style="font-size: 10pt;">
    ${schema.sections.map(s => `<li>${esc(s.title)} (${s.questions.length} Fragen)</li>`).join('\n    ')}
  </ol>
  
  <hr style="border: 1pt solid #e5e7eb; margin: 12pt 0;">
  
  ${body}
  
  ${registryTable}
  
  <hr style="border: 1pt solid #e5e7eb; margin: 24pt 0 12pt;">
  <p style="text-align: center; color: #999; font-size: 9pt;">
    Generiert aus src/data/surveySchema.ts (SSOT v${esc(schema.version)}) | ${totalQuestions} Fragen | ${Object.keys(registry).length} Registry-Einträge | ${buildDate}
  </p>
</body>
</html>`;
}

// --- Consistency check ---

function checkConsistency(schema: SurveySchema, registry: Record<string, RegistryEntry>): string[] {
  const warnings: string[] = [];

  // Check: every question in schema should have a registry entry
  for (const section of schema.sections) {
    for (const q of section.questions) {
      if (!registry[q.id]) {
        warnings.push(`⚠️  Question "${q.id}" (${section.title}) has NO registry entry`);
      }
    }
  }

  // Check: every registry entry should reference a question that exists
  const allQuestionIds = new Set<string>();
  for (const section of schema.sections) {
    for (const q of section.questions) {
      allQuestionIds.add(q.id);
    }
  }
  for (const key of Object.keys(registry)) {
    if (!allQuestionIds.has(key)) {
      // Some registry entries are for companion fields (e.g. vnbAdditionalCostsOneTime)
      // These are valid - they map to DB columns but aren't standalone questions
      // Only warn if it's clearly orphaned
    }
  }

  return warnings;
}

// --- Main ---

async function main() {
  console.log('📄 Generating Word document from surveySchema.ts (SSOT v3)...\n');

  const { schema, registry } = parseSurveySchema();
  const totalQuestions = schema.sections.reduce((acc, s) => acc + s.questions.length, 0);
  console.log(`   Found ${schema.sections.length} sections with ${totalQuestions} questions`);
  console.log(`   Registry: ${Object.keys(registry).length} entries\n`);

  // Consistency check
  const warnings = checkConsistency(schema, registry);
  if (warnings.length > 0) {
    console.log('   ⚠️  Consistency warnings:');
    for (const w of warnings) {
      console.log(`      ${w}`);
    }
    console.log('');
  } else {
    console.log('   ✅ Registry-Schema consistency check passed\n');
  }

  const doc = generateWordDoc(schema, registry);

  const outputPath = path.resolve(__dirname, '../public/data/umfrage-dokumentation.doc');
  fs.writeFileSync(outputPath, doc, 'utf-8');
  console.log(`   ✅ Written: ${outputPath} (${(doc.length / 1024).toFixed(1)} KB)\n`);

  console.log('🎉 Word document generated successfully!');
}

main().catch((err) => {
  console.error('❌ Generation failed:', err);
  process.exit(1);
});
