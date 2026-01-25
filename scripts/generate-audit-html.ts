/**
 * Build-Script: Generiert statische HTML-Datei für die Umfrage-Audit-Ansicht
 * Wird beim Build ausgeführt und schreibt nach public/umfrage/audit/index.html
 * 
 * Verwendung: npx tsx scripts/generate-audit-html.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Survey Schema Types (duplicate to avoid module issues)
interface SurveyOption {
  value: string;
  label: string;
  hasTextField?: boolean;
  textFieldLabel?: string;
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

// Import the schema - we'll read it from the compiled TypeScript
const schemaPath = path.resolve(__dirname, '../src/data/surveySchema.ts');

// Helper function to escape HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Read and parse the schema file
function parseSurveySchema(): SurveySchema {
  const content = fs.readFileSync(schemaPath, 'utf-8');
  
  // Extract the surveySchema export using regex
  // This is a simple parser for the specific schema structure
  const versionMatch = content.match(/version:\s*["']([^"']+)["']/);
  const lastUpdatedMatch = content.match(/lastUpdated:\s*["']([^"']+)["']/);
  const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
  const descriptionMatch = content.match(/description:\s*["']([^"']+)["']/);
  
  // Parse sections from const declarations
  const sectionRegex = /const\s+(SECTION_\w+):\s*SurveySection\s*=\s*({[\s\S]*?^});/gm;
  const sections: SurveySection[] = [];
  
  let sectionMatch;
  while ((sectionMatch = sectionRegex.exec(content)) !== null) {
    try {
      // This is a simplified extraction - in production you'd use a proper parser
      const sectionContent = sectionMatch[2];
      
      const idMatch = sectionContent.match(/id:\s*["']([^"']+)["']/);
      const sTitleMatch = sectionContent.match(/title:\s*["']([^"']+)["']/);
      const sDescMatch = sectionContent.match(/description:\s*["']([^"']+)["']/);
      const sVisMatch = sectionContent.match(/visibilityLogic:\s*["']([^"']+)["']/);
      
      if (idMatch && sTitleMatch) {
        // Extract questions array
        const questionsStart = sectionContent.indexOf('questions:');
        const questions: SurveyQuestion[] = [];
        
        // Parse questions using regex
        const questionBlockRegex = /{\s*id:\s*["']([^"']+)["'][^}]*type:\s*["']([^"']+)["'][^}]*label:\s*["']([^"']+)["']/g;
        
        let qMatch;
        let tempContent = sectionContent.substring(questionsStart);
        
        // More robust question parsing
        const questionBlocks = tempContent.split(/},\s*{/).filter(b => b.includes('id:') && b.includes('label:'));
        
        for (const block of questionBlocks) {
          const qIdMatch = block.match(/id:\s*["']([^"']+)["']/);
          const qTypeMatch = block.match(/type:\s*["']([^"']+)["']/);
          const qLabelMatch = block.match(/label:\s*["']([^"']+)["']/);
          const qDescMatch = block.match(/description:\s*["']([^"']+)["']/);
          const qHelpMatch = block.match(/helpText:\s*["']([^"']+)["']/);
          const qReqMatch = block.match(/required:\s*(true|false)/);
          const qOptMatch = block.match(/optional:\s*(true|false)/);
          const qVisMatch = block.match(/visibilityLogic:\s*["']([^"']+)["']/);
          const qSkipMatch = block.match(/skipLogic:\s*["']([^"']+)["']/);
          const qMinMatch = block.match(/min:\s*(\d+)/);
          const qMaxMatch = block.match(/max:\s*(\d+)/);
          const qMinLabelMatch = block.match(/minLabel:\s*["']([^"']+)["']/);
          const qMaxLabelMatch = block.match(/maxLabel:\s*["']([^"']+)["']/);
          
          if (qIdMatch && qLabelMatch) {
            const question: SurveyQuestion = {
              id: qIdMatch[1],
              type: qTypeMatch ? qTypeMatch[1] : 'text',
              label: qLabelMatch[1],
              description: qDescMatch ? qDescMatch[1] : undefined,
              helpText: qHelpMatch ? qHelpMatch[1] : undefined,
              required: qReqMatch ? qReqMatch[1] === 'true' : undefined,
              optional: qOptMatch ? qOptMatch[1] === 'true' : undefined,
              visibilityLogic: qVisMatch ? qVisMatch[1] : undefined,
              skipLogic: qSkipMatch ? qSkipMatch[1] : undefined,
              min: qMinMatch ? parseInt(qMinMatch[1]) : undefined,
              max: qMaxMatch ? parseInt(qMaxMatch[1]) : undefined,
              minLabel: qMinLabelMatch ? qMinLabelMatch[1] : undefined,
              maxLabel: qMaxLabelMatch ? qMaxLabelMatch[1] : undefined,
            };
            
            // Parse options
            const optionsMatch = block.match(/options:\s*\[([\s\S]*?)\]/);
            if (optionsMatch) {
              const optionsContent = optionsMatch[1];
              const optionBlocks = optionsContent.split(/},\s*{/);
              const options: SurveyOption[] = [];
              
              for (const optBlock of optionBlocks) {
                const oValueMatch = optBlock.match(/value:\s*["']([^"']+)["']/);
                const oLabelMatch = optBlock.match(/label:\s*["']([^"']+)["']/);
                const oHasTextMatch = optBlock.match(/hasTextField:\s*(true|false)/);
                const oTextLabelMatch = optBlock.match(/textFieldLabel:\s*["']([^"']+)["']/);
                
                if (oValueMatch && oLabelMatch) {
                  options.push({
                    value: oValueMatch[1],
                    label: oLabelMatch[1],
                    hasTextField: oHasTextMatch ? oHasTextMatch[1] === 'true' : undefined,
                    textFieldLabel: oTextLabelMatch ? oTextLabelMatch[1] : undefined,
                  });
                }
              }
              
              if (options.length > 0) {
                question.options = options;
              }
            }
            
            questions.push(question);
          }
        }
        
        sections.push({
          id: idMatch[1],
          title: sTitleMatch[1],
          description: sDescMatch ? sDescMatch[1] : undefined,
          visibilityLogic: sVisMatch ? sVisMatch[1] : undefined,
          questions,
        });
      }
    } catch (e) {
      console.error('Error parsing section:', e);
    }
  }
  
  return {
    version: versionMatch ? versionMatch[1] : '1.0.0',
    lastUpdated: lastUpdatedMatch ? lastUpdatedMatch[1] : new Date().toISOString().split('T')[0],
    title: titleMatch ? titleMatch[1] : 'VNB Transparenz Umfrage',
    description: descriptionMatch ? descriptionMatch[1] : '',
    sections,
  };
}

function generateHtml(schema: SurveySchema): string {
  const buildDate = new Date().toISOString().split('T')[0];
  
  let sectionsHtml = '';
  for (const section of schema.sections) {
    let questionsHtml = '';
    
    for (const question of section.questions) {
      let optionsHtml = '';
      if (question.options && question.options.length > 0) {
        optionsHtml = '<ul class="options">';
        for (const option of question.options) {
          optionsHtml += `<li class="option">
            <strong>${escapeHtml(option.label)}</strong>
            <span class="option-value">[${escapeHtml(option.value)}]</span>
            ${option.hasTextField ? `<em> + Textfeld${option.textFieldLabel ? `: "${escapeHtml(option.textFieldLabel)}"` : ''}</em>` : ''}
          </li>`;
        }
        optionsHtml += '</ul>';
      }
      
      let scaleHtml = '';
      if (question.type === 'rating' && question.min !== undefined && question.max !== undefined) {
        scaleHtml = `<div class="scale-labels">Skala: ${question.min}${question.minLabel ? ` (${escapeHtml(question.minLabel)})` : ''} bis ${question.max}${question.maxLabel ? ` (${escapeHtml(question.maxLabel)})` : ''}</div>`;
      }
      
      questionsHtml += `
        <article class="question" data-id="${escapeHtml(question.id)}">
          <h4 class="question-label">
            ${escapeHtml(question.label)}
            <span class="badge type-badge">${escapeHtml(question.type)}</span>
            ${question.required ? '<span class="badge required">Pflicht</span>' : ''}
            ${question.optional ? '<span class="badge optional">Optional</span>' : ''}
          </h4>
          ${question.description ? `<p class="question-meta">${escapeHtml(question.description)}</p>` : ''}
          ${question.helpText ? `<p class="question-meta">ℹ️ ${escapeHtml(question.helpText)}</p>` : ''}
          ${optionsHtml}
          ${scaleHtml}
          ${question.visibilityLogic ? `<div class="visibility">⚡ Sichtbarkeit: ${escapeHtml(question.visibilityLogic)}</div>` : ''}
          ${question.skipLogic ? `<div class="visibility">➡️ Sprunglogik: ${escapeHtml(question.skipLogic)}</div>` : ''}
        </article>
      `;
    }
    
    sectionsHtml += `
      <section class="section" data-id="${escapeHtml(section.id)}">
        <h2>${escapeHtml(section.title)}</h2>
        ${section.description ? `<p class="section-description">${escapeHtml(section.description)}</p>` : ''}
        ${section.visibilityLogic ? `<div class="visibility">⚡ Branching: ${escapeHtml(section.visibilityLogic)}</div>` : ''}
        ${questionsHtml}
      </section>
    `;
  }
  
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(schema.title)} - Audit-Ansicht</title>
  <meta name="description" content="${escapeHtml(schema.description)}">
  <meta name="robots" content="index, follow">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fff;
    }
    h1 {
      color: #1a1a1a;
      border-bottom: 3px solid #22c55e;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
    h2 {
      color: #333;
      margin-top: 0;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      padding: 0.75rem 1rem;
      border-radius: 6px;
      border-left: 4px solid #22c55e;
    }
    h4 { margin: 0 0 0.5rem 0; color: #374151; }
    .meta {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }
    .meta a { color: #22c55e; }
    .section {
      margin-bottom: 2rem;
      border: 1px solid #e5e7eb;
      padding: 1.5rem;
      border-radius: 12px;
      background: #fff;
    }
    .section-description { color: #666; margin: 0.5rem 0 1rem 0; }
    .question {
      margin: 1rem 0;
      padding: 1rem;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .question-label { font-weight: 600; margin-bottom: 0.5rem; display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
    .question-meta { font-size: 0.9rem; color: #666; margin: 0.5rem 0; }
    .options { margin: 0.75rem 0 0 0; padding-left: 1.5rem; list-style: none; }
    .option { padding: 0.35rem 0; border-bottom: 1px dashed #e5e7eb; }
    .option:last-child { border-bottom: none; }
    .option-value { color: #9ca3af; font-size: 0.8rem; font-family: monospace; margin-left: 0.5rem; }
    .badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .required { background: #fee2e2; color: #dc2626; }
    .optional { background: #dbeafe; color: #2563eb; }
    .type-badge { background: #f3f4f6; color: #4b5563; }
    .visibility {
      background: #fef3c7;
      color: #92400e;
      font-size: 0.85rem;
      margin-top: 0.75rem;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      border-left: 3px solid #f59e0b;
    }
    .scale-labels {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: #f0f9ff;
      border-radius: 4px;
    }
    footer {
      margin-top: 3rem;
      padding: 1.5rem;
      border-top: 2px solid #e5e7eb;
      color: #666;
      font-size: 0.9rem;
      text-align: center;
    }
    @media print {
      body { padding: 1rem; font-size: 11pt; }
      .section { break-inside: avoid; border: 1px solid #ccc; }
      .question { break-inside: avoid; }
      h2 { background: #f5f5f5 !important; }
    }
    @media (max-width: 600px) {
      body { padding: 1rem; }
      .section { padding: 1rem; }
    }
  </style>
</head>
<body>
  <header>
    <h1>📋 ${escapeHtml(schema.title)}</h1>
    <div class="meta">
      <p><strong>Version:</strong> ${escapeHtml(schema.version)} | <strong>Letzte Aktualisierung:</strong> ${escapeHtml(schema.lastUpdated)}</p>
      <p>${escapeHtml(schema.description)}</p>
      <p>
        <a href="/data/umfrage.json">📥 JSON-Export herunterladen</a> |
        <a href="/umfrage">🖊️ Zur interaktiven Umfrage</a> |
        <a href="/">🏠 Startseite</a>
      </p>
    </div>
  </header>

  <main>
    ${sectionsHtml}
  </main>

  <footer>
    <p>Diese statische Seite zeigt die vollständige Struktur der Umfrage für Audit-Zwecke.</p>
    <p>Generiert am: ${buildDate} | Keine JavaScript-Ausführung erforderlich.</p>
    <p><a href="https://vnb-transparenz.de">VNB Transparenz</a></p>
  </footer>
</body>
</html>`;
}

function generateJson(schema: SurveySchema): string {
  const exportData = {
    version: schema.version,
    lastUpdated: schema.lastUpdated,
    generatedAt: new Date().toISOString(),
    title: schema.title,
    description: schema.description,
    totalSections: schema.sections.length,
    totalQuestions: schema.sections.reduce((acc, s) => acc + s.questions.length, 0),
    sections: schema.sections.map(section => ({
      id: section.id,
      title: section.title,
      description: section.description,
      visibilityLogic: section.visibilityLogic,
      questionCount: section.questions.length,
      questions: section.questions.map(q => ({
        id: q.id,
        type: q.type,
        text: q.label,
        helpText: q.description || q.helpText,
        options: q.options?.map(o => ({
          value: o.value,
          label: o.label,
          hasTextField: o.hasTextField,
          textFieldLabel: o.textFieldLabel,
        })),
        scaleLabels: q.type === 'rating' ? { 
          min: q.min,
          max: q.max,
          minLabel: q.minLabel, 
          maxLabel: q.maxLabel 
        } : undefined,
        required: q.required,
        optional: q.optional,
        visibilityLogic: q.visibilityLogic,
        skipLogic: q.skipLogic,
      })),
    })),
  };
  
  return JSON.stringify(exportData, null, 2);
}

// Main execution
async function main() {
  console.log('🔍 Parsing survey schema...');
  const schema = parseSurveySchema();
  
  console.log(`📊 Found ${schema.sections.length} sections with ${schema.sections.reduce((acc, s) => acc + s.questions.length, 0)} questions`);
  
  // Ensure directories exist
  const auditDir = path.resolve(__dirname, '../public/umfrage/audit');
  const dataDir = path.resolve(__dirname, '../public/data');
  
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
    console.log('📁 Created directory:', auditDir);
  }
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Created directory:', dataDir);
  }
  
  // Generate and write HTML
  console.log('📝 Generating static HTML...');
  const html = generateHtml(schema);
  const htmlPath = path.join(auditDir, 'index.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('✅ Written:', htmlPath);
  
  // Generate and write JSON
  console.log('📝 Generating JSON export...');
  const json = generateJson(schema);
  const jsonPath = path.join(dataDir, 'umfrage.json');
  fs.writeFileSync(jsonPath, json, 'utf-8');
  console.log('✅ Written:', jsonPath);
  
  console.log('🎉 Build complete!');
}

main().catch(console.error);
