/**
 * Generates a Word-compatible (.doc) HTML document from surveySchema.ts
 * Uses QUESTION_REGISTRY displayIds and surveyDefinition as SSOT.
 * Includes CTO review annotations for content/logic/UX issues.
 * 
 * Usage: npx tsx scripts/generate-word-doc.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Types ---

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

interface RegistryEntry { displayId: string; dbColumn: string; }

interface ReviewAnnotation {
  type: 'verständnis' | 'logik' | 'ux' | 'inhalt' | 'db' | 'cto';
  text: string;
}

// --- Review Annotations ---
// These are embedded directly into the Word doc for review

const REVIEW_ANNOTATIONS: Record<string, ReviewAnnotation[]> = {
  // === Verständnisprobleme für Laien ===
  "actorTypes": [{
    type: 'verständnis',
    text: 'Begriffe wie "GGV", "Mieterstrom", "Energy Sharing" werden ohne Erklärung verwendet. Für Einsteiger wäre ein kurzer Einleitungstext mit Definitionen hilfreich.'
  }],
  "projectTypes": [{
    type: 'verständnis',
    text: '🔍 REVIEW: "GGV (Gemeinschaftliche Gebäudeversorgung)" – Ist der volle Name ausreichend erklärend? Ein Tooltip oder Link zu einer Erklärungsseite könnte helfen.'
  }, {
    type: 'logik',
    text: '🔍 REVIEW: "Entweder GGV oder Mieterstrom" – Diese Option hat dieselbe Logik wie "GGV". Ist das beabsichtigt? Sollte sie wirklich BEIDE Pfade (GGV + MS) öffnen?'
  }],
  "ggvProjectType": [{
    type: 'verständnis',
    text: '🔍 REVIEW: Label "Projektumfang" ist sehr generisch. Besser: "Wie viele GGV-Projekte planen/betreiben Sie?"'
  }],
  "planningStatus": [{
    type: 'cto',
    text: '✅ ENTSCHIEDEN: Multi-Select behalten. Schema auf multi-select geändert, da mehrere Status gleichzeitig zutreffen können.'
  }, {
    type: 'verständnis',
    text: '🔍 REVIEW: Die Optionen mischen Planungs- und Betriebsstatus. "Die PV-Anlage läuft bereits mit GGV/Mieterstrom" steuert die Betriebsfragen – das ist für Nutzer nicht offensichtlich.'
  }],
  "ggvOrMieterstromDecision": [{
    type: 'cto',
    text: '✅ ENTSCHIEDEN: Frage wird IMMER angezeigt (auch wenn nur ein Modell gewählt). Dient als Kontrollfrage.'
  }],
  "vnbContact": [{
    type: 'cto',
    text: '✅ ENTSCHIEDEN: Multi-Select behalten. Schema auf multi-select geändert, da mehrere Kontaktwege gleichzeitig möglich.'
  }],
  "esStatus": [{
    type: 'cto',
    text: '✅ ENTSCHIEDEN: Multi-Select behalten. Schema auf multi-select geändert.'
  }],
  "vnbSupportMesskonzept": [{
    type: 'verständnis',
    text: '🔍 REVIEW: "Messkonzept" ist ein Fachbegriff. Erklärung hinzufügen: "Ein Messkonzept beschreibt, wie der Strom in einem Gebäude gemessen und verteilt wird."'
  }],
  "vnbMsbOffer": [{
    type: 'verständnis',
    text: '🔍 REVIEW: "gMSB" und "wMSB" sind Fachbegriffe. Vorschlag: Bei erster Verwendung ausschreiben: "grundzuständiger Messstellenbetreiber (gMSB)" und "wettbewerblicher Messstellenbetreiber (wMSB)".'
  }],
  "vnbDataProvision": [{
    type: 'verständnis',
    text: '🔍 REVIEW: "Marktkommunikation" und "ESA-Marktrolle" sind hochspezialisierte Begriffe. Für Nutzer mit mittlerem Wissensstand unverständlich. Erklärung oder helpText hinzufügen.'
  }],
  "vnbEsaCost": [{
    type: 'verständnis',
    text: '🔍 REVIEW: "ESA-Marktrolle" – Was ist das? Erklärung fehlt komplett. Selbst Fachleute könnten hier unsicher sein.'
  }],
  "vnbWandlermessung": [{
    type: 'verständnis',
    text: '🔍 REVIEW: "Wandlermessung" wird mit "> 5.000 EUR" erklärt, aber was eine Wandlermessung technisch ist, fehlt. Vorschlag: "Ein großer Zähler am Hausanschlusspunkt, der alle Stromflüsse im Gebäude misst."'
  }],
  "vnbAdditionalCosts": [{
    type: 'verständnis',
    text: '🔍 REVIEW: "Einbau auf Kundenwunsch" – Ist das ein Fachbegriff aus dem Messstellenbetriebsgesetz? Falls ja, kurze Erklärung hinzufügen.'
  }],
  "vnbFullService": [{
    type: 'verständnis',
    text: '🔍 REVIEW: "Full-Service-Angebot" – Der Kontext (Stromlieferung durch Stadtwerk) ist in der Option erklärt, aber das Label allein ist unklar. Besser: "Bietet der VNB den Messstellenbetrieb nur zusammen mit Stromlieferung an?"'
  }],
  "mieterstromSummenzaehler": [{
    type: 'verständnis',
    text: '🔍 REVIEW: "Virtueller Summenzähler" vs. "Physikalischer Summenzähler" – Kernunterschied fehlt. Erklärung: "Virtuell = rechnerische Aufsummierung über Smart Meter, ohne zusätzlichen großen Zähler. Physikalisch = ein extra Zähler am Hausanschluss (>5.000 EUR)."'
  }],
  "mieterstromVirtuellAllowed": [{
    type: 'logik',
    text: '⚠️ LOGIK: Wird laut Schema nur bei summenzaehler="virtuell" gezeigt, aber im Code (StepMieterstromPlanning) wird es IMMER angezeigt unabhängig von summenzaehler. Visibility-Logic im Code fehlt.'
  }],
  "mieterstromModelChoice": [{
    type: 'verständnis',
    text: '🔍 REVIEW: Die Option zum "virtuellen Summenzähler" enthält den Hinweis "(physikalischer Summenzähler für >5.000 EUR)" – das ist wichtig, aber leicht zu übersehen in einem langen Optionstext.'
  }],
  "operationAllocationProvider": [{
    type: 'verständnis',
    text: '🔍 REVIEW: "Aufteilung der PV-Stromerzeugung auf die Teilnehmenden (Verrechnung)" – Was bedeutet "Verrechnung" hier? Ist das die rechnerische Aufteilung oder die finanzielle Abrechnung?'
  }],
  "operationDataFormat": [{
    type: 'ux',
    text: '🔍 REVIEW: Die Optionen sind sehr lang (volle Sätze). Nutzer mit mittlerem Wissen könnten die Unterschiede nicht verstehen. Vorschlag: Kürzere Optionen + helpText.'
  }],
  "esVnbResponse": [{
    type: 'cto',
    text: '✅ ENTSCHIEDEN: Datum "01.06.2026" bleibt wie es ist – bewusste inhaltliche Entscheidung.'
  }],
  "esNetzentgelteDiscussion": [{
    type: 'verständnis',
    text: '🔍 REVIEW: "Netzentgelte" – Die meisten Laien wissen nicht, was das ist. Erklärung: "Netzentgelte sind die Gebühren, die für die Nutzung des Stromnetzes an den Netzbetreiber gezahlt werden."'
  }],
  "serviceProviderName": [{
    type: 'ux',
    text: '🔍 REVIEW: Dienstleister-Sektion erscheint in "Betrieb: GGV", ist aber im Schema unter einer eigenen Section. Nutzer in der Planungsphase könnten schon Dienstleister-Erfahrungen haben. Soll das auch für Planer sichtbar sein?'
  }],
  "vnbRejectionResponse": [{
    type: 'cto',
    text: '📋 ZU PRÜFEN: Verschiebung von Betrieb nach Planung wird im Word-Dokument geprüft. Aktuelle Platzierung bleibt vorerst.'
  }],
  "helpfulInfoSources": [{
    type: 'cto',
    text: '✅ ENTSCHIEDEN: Drei separate InfoSources-Fragen (GGV, Mieterstrom, Energy Sharing) bleiben getrennt.'
  }],
  "mieterstromSurveyImprovements": [{
    type: 'cto',
    text: '✅ ENTSCHIEDEN & UMGESETZT: Duplikat entfernt. Nur noch eine Verbesserungsfrage im Abschluss (surveyImprovements).'
  }],
  "challenges": [{
    type: 'ux',
    text: '🔍 REVIEW: Die Option "Nein, alles läuft gut" ist als exklusiv markiert – gut! Aber es fehlt ein Hinweis für den Nutzer, dass bei Auswahl dieser Option die anderen abgewählt werden.'
  }],
  "implementationApproach": [{
    type: 'verständnis',
    text: '🔍 REVIEW: "Über die Installation der PV-Anlage hinaus" – Diese Beschreibung ist wichtig, geht aber leicht unter. Prominenter platzieren.'
  }],
  "npsScore": [{
    type: 'cto',
    text: '✅ ENTSCHIEDEN: NPS bewertet das Modell (GGV/Mieterstrom/Energy Sharing), nicht die Umfrage oder den VNB.'
  }],
  "documentUpload": [{
    type: 'logik',
    text: '⚠️ BUG: Im Schema als "documentUpload" definiert, aber StepFinal referenziert "uploadedDocuments" via getLabelForQuestion("uploadedDocuments") – das wird keinen Label finden. Sollte "documentUpload" sein.'
  }],
};

// --- Schema Parser ---

function parseSurveySchema(): { schema: SurveySchema; registry: Record<string, RegistryEntry> } {
  const schemaPath = path.resolve(__dirname, '../src/data/surveySchema.ts');
  const content = fs.readFileSync(schemaPath, 'utf-8');

  const versionMatch = content.match(/version:\s*["']([^"']+)["']/);
  const lastUpdatedMatch = content.match(/lastUpdated:\s*["']([^"']+)["']/);
  const titleMatch = content.match(/title:\s*["']Umfrage[^"']*["']/);
  const descriptionMatch = content.match(/description:\s*["']Diese Umfrage[^"']*["']/);

  const registry: Record<string, RegistryEntry> = {};
  const registryBlock = content.match(/QUESTION_REGISTRY[^{]*\{([\s\S]*?)\n\};/);
  if (registryBlock) {
    const entryRegex = /"(\w+)":\s*\{\s*displayId:\s*"([^"]+)",\s*dbColumn:\s*"([^"]+)"\s*\}/g;
    let m;
    while ((m = entryRegex.exec(registryBlock[1])) !== null) {
      registry[m[1]] = { displayId: m[2], dbColumn: m[3] };
    }
  }

  const sectionNames: string[] = [];
  const sectionNameRegex = /const\s+(SECTION_\w+):\s*SurveySection/g;
  let match;
  while ((match = sectionNameRegex.exec(content)) !== null) {
    sectionNames.push(match[1]);
  }

  const sections: SurveySection[] = [];
  for (const sectionName of sectionNames) {
    const sectionRegex = new RegExp(
      `const\\s+${sectionName}:\\s*SurveySection\\s*=\\s*\\{([\\s\\S]*?)^\\};`, 'gm'
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

  const question: SurveyQuestion = { id, type: typeMatch ? typeMatch[1] : 'text', label: labelMatch[1] };

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
  if (optionsMatch) question.options = parseOptions(optionsMatch[1]);

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
    const option: SurveyOption = { value: matches[i].value, label: labelMatch[1] };
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

// --- HTML Generation ---

function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    'single-select': 'Einfachauswahl', 'multi-select': 'Mehrfachauswahl',
    'text': 'Textfeld', 'textarea': 'Textfeld (mehrzeilig)',
    'number': 'Zahleneingabe', 'email': 'E-Mail',
    'rating': 'Bewertungsskala', 'file': 'Datei-Upload',
    'vnb-select': 'VNB-Auswahl (Suchfeld)', 'project-focus': 'Projektfokus-Auswahl',
  };
  return map[type] || type;
}

function annotationColor(type: ReviewAnnotation['type']): string {
  switch (type) {
    case 'verständnis': return '#7c3aed'; // purple
    case 'logik': return '#dc2626'; // red
    case 'ux': return '#2563eb'; // blue
    case 'inhalt': return '#d97706'; // amber
    case 'db': return '#059669'; // green
    case 'cto': return '#be185d'; // pink
    default: return '#666';
  }
}

function annotationIcon(type: ReviewAnnotation['type']): string {
  switch (type) {
    case 'verständnis': return '👤';
    case 'logik': return '⚙️';
    case 'ux': return '🖥️';
    case 'inhalt': return '📝';
    case 'db': return '🗄️';
    case 'cto': return '🔧';
    default: return '💡';
  }
}

function renderAnnotations(questionId: string): string {
  const annotations = REVIEW_ANNOTATIONS[questionId];
  if (!annotations || annotations.length === 0) return '';

  return annotations.map(a => `
    <p style="font-size: 9pt; margin-top: 4pt; padding: 4pt 8pt; background: ${annotationColor(a.type)}15; border-left: 3pt solid ${annotationColor(a.type)}; color: ${annotationColor(a.type)};">
      ${annotationIcon(a.type)} <strong>[${a.type.toUpperCase()}]</strong> ${esc(a.text)}
    </p>
  `).join('');
}

function generateWordDoc(schema: SurveySchema, registry: Record<string, RegistryEntry>): string {
  const buildDate = new Date().toISOString().split('T')[0];
  const totalQuestions = schema.sections.reduce((acc, s) => acc + s.questions.length, 0);
  const totalAnnotations = Object.values(REVIEW_ANNOTATIONS).reduce((acc, arr) => acc + arr.length, 0);

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

      if (question.description) body += `<p style="font-size: 9pt; color: #666; margin: 2pt 0;">${esc(question.description)}</p>`;
      if (question.helpText) body += `<p style="font-size: 9pt; color: #666; margin: 2pt 0;">ℹ️ ${esc(question.helpText)}</p>`;
      if (question.placeholder) body += `<p style="font-size: 9pt; color: #999; font-style: italic; margin: 2pt 0;">Platzhalter: "${esc(question.placeholder)}"</p>`;

      if (question.options && question.options.length > 0) {
        body += `<table style="width: 100%; border-collapse: collapse; margin-top: 6pt; font-size: 10pt;">
          <tr style="background: #e5e7eb;">
            <th style="text-align: left; padding: 3pt 6pt; border: 1pt solid #ccc; width: 25%;">Wert</th>
            <th style="text-align: left; padding: 3pt 6pt; border: 1pt solid #ccc;">Label</th>
            <th style="text-align: left; padding: 3pt 6pt; border: 1pt solid #ccc; width: 20%;">Extras</th>
          </tr>`;
        for (const opt of question.options) {
          const extras: string[] = [];
          if (opt.hasTextField) extras.push(`+ Textfeld${opt.textFieldLabel ? ` ("${esc(opt.textFieldLabel)}")` : ''}`);
          if (opt.exclusive) extras.push('exklusiv');
          body += `<tr>
            <td style="padding: 3pt 6pt; border: 1pt solid #ccc; font-family: monospace; font-size: 9pt; color: #374151;">${esc(opt.value)}</td>
            <td style="padding: 3pt 6pt; border: 1pt solid #ccc;">${esc(opt.label)}</td>
            <td style="padding: 3pt 6pt; border: 1pt solid #ccc; font-size: 9pt; color: #f59e0b;">${extras.join(', ')}</td>
          </tr>`;
        }
        body += '</table>';
      }

      if (question.type === 'rating' && question.min !== undefined && question.max !== undefined) {
        body += `<p style="font-size: 9pt; margin-top: 6pt; padding: 4pt 8pt; background: #f0f9ff; border-radius: 4pt;">
          <strong>Skala:</strong> ${question.min} – ${question.max}<br>
          ${question.minLabel ? `${question.min}: ${esc(question.minLabel)}<br>` : ''}
          ${question.maxLabel ? `${question.max}: ${esc(question.maxLabel)}` : ''}
        </p>`;
      }

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

      // Review annotations
      body += renderAnnotations(question.id);

      body += '</div>';
    }
    body += '</div>';
  }

  // Registry appendix
  let registryTable = `
  <div style="page-break-before: always; margin-top: 24pt;">
    <h2 style="color: #1a365d; border-bottom: 2pt solid #22c55e; padding-bottom: 6pt; font-size: 16pt;">
      Anhang A: Fragen-Registry (Display-ID → DB-Spalte)
    </h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 9pt;">
      <tr style="background: #1a365d; color: white;">
        <th style="text-align: left; padding: 4pt 6pt; border: 1pt solid #ccc;">Display-ID</th>
        <th style="text-align: left; padding: 4pt 6pt; border: 1pt solid #ccc;">Interner Key</th>
        <th style="text-align: left; padding: 4pt 6pt; border: 1pt solid #ccc;">DB-Spalte</th>
      </tr>`;
  for (const [key, entry] of Object.entries(registry)) {
    registryTable += `<tr>
        <td style="padding: 3pt 6pt; border: 1pt solid #ccc; font-family: monospace; color: #2563eb;">${esc(entry.displayId)}</td>
        <td style="padding: 3pt 6pt; border: 1pt solid #ccc; font-family: monospace;">${esc(key)}</td>
        <td style="padding: 3pt 6pt; border: 1pt solid #ccc; font-family: monospace; color: #059669;">${esc(entry.dbColumn)}</td>
      </tr>`;
  }
  registryTable += '</table></div>';

  // CTO Review Summary appendix
  const reviewSummary = `
  <div style="page-break-before: always; margin-top: 24pt;">
    <h2 style="color: #be185d; border-bottom: 2pt solid #be185d; padding-bottom: 6pt; font-size: 16pt;">
      Anhang B: CTO Review – Zusammenfassung der Findings
    </h2>
    
    <h3 style="color: #059669; font-size: 13pt; margin-top: 16pt;">✅ Entschieden & Umgesetzt</h3>
    <ol style="font-size: 10pt; line-height: 1.8;">
      <li><strong>planningStatus</strong>: Multi-Select behalten (Schema korrigiert)</li>
      <li><strong>vnbContact</strong>: Multi-Select behalten (Schema korrigiert)</li>
      <li><strong>esStatus</strong>: Multi-Select behalten (Schema korrigiert)</li>
      <li><strong>mieterstromSurveyImprovements</strong>: Duplikat entfernt – nur noch surveyImprovements im Abschluss</li>
      <li><strong>ggvOrMieterstromDecision</strong>: Wird immer angezeigt (Kontrollfrage)</li>
      <li><strong>Datum "01.06.2026"</strong>: Bleibt wie es ist</li>
      <li><strong>InfoSources</strong>: Bleiben getrennt (GGV, MS, ES)</li>
      <li><strong>NPS</strong>: Bewertet das Modell (GGV/Mieterstrom/Energy Sharing)</li>
      <li><strong>Technische Erklärungen</strong>: Tooltips für Fachbegriffe geplant (Wandlermessung, Summenzähler, gMSB/wMSB, ESA, Netzentgelte)</li>
    </ol>

    <h3 style="color: #d97706; font-size: 13pt; margin-top: 16pt;">📋 Noch zu prüfen</h3>
    <ol style="font-size: 10pt; line-height: 1.8;">
      <li><strong>vnbRejectionResponse</strong>: Verschiebung von Betrieb nach Planung – wird im Word-Dokument geprüft</li>
    </ol>

    <h3 style="color: #dc2626; font-size: 13pt; margin-top: 16pt;">🐛 Offene Bugs</h3>
    <ol style="font-size: 10pt; line-height: 1.8;">
      <li><strong>documentUpload</strong> (6-DocumentUpload): StepFinal referenziert "uploadedDocuments" statt "documentUpload" für getLabelForQuestion. → <em>Korrekte ID verwenden</em></li>
      <li><strong>mieterstromVirtuellAllowed</strong> (4-MS-VirtuellAllowed): Schema sagt "nur wenn summenzaehler='virtuell'", Code zeigt es immer. → <em>Visibility im Code hinzufügen</em></li>
    </ol>

    <h3 style="color: #7c3aed; font-size: 13pt; margin-top: 16pt;">👤 Verständlichkeit für Laien (Technische Erklärungen geplant)</h3>
    <ol style="font-size: 10pt; line-height: 1.8;">
      <li><strong>GGV/Mieterstrom/Energy Sharing:</strong> Einleitungs-Glossar fehlt komplett</li>
      <li><strong>gMSB / wMSB:</strong> Abkürzungen nie erklärt – helpText bei erster Verwendung</li>
      <li><strong>Wandlermessung:</strong> Technischer Begriff – Laien-Erklärung fehlt</li>
      <li><strong>Summenzähler (virtuell/physikalisch):</strong> Kernunterschied nicht erklärt</li>
      <li><strong>ESA-Marktrolle:</strong> Völlig ungeklärt</li>
      <li><strong>Marktkommunikation:</strong> Fachbegriff ohne Erklärung</li>
      <li><strong>Netzentgelte:</strong> Nicht erklärt</li>
      <li><strong>"Einbau auf Kundenwunsch":</strong> Regulatorischer Fachbegriff</li>
    </ol>

    <h3 style="color: #059669; font-size: 13pt; margin-top: 16pt;">🗄️ Datenbank-Review</h3>
    <ol style="font-size: 10pt; line-height: 1.8;">
      <li><strong>Grundsätzlich gut:</strong> Alle Felder haben sinnvolle Spalten, RLS-Policies sind korrekt</li>
      <li><strong>Verwaiste Spalten:</strong> vnb_ggv_possible, vnb_ggv_possible_reasons, vnb_full_service_condition, vnb_data_provision_method, vnb_no_msb_future_timeline, vnb_rejection_future_timeline, operation_data_method, operation_data_method_other, operation_direct_data_cost, operation_esa_role_cost, operation_allocation_who_details, vnb_direct_data_cost, vnb_esa_role_cost – prüfen ob Legacy oder vergessen</li>
      <li><strong>Shared uploadedDocuments state:</strong> Alle File-Uploads teilen denselben Array – Trennung prüfen</li>
    </ol>

    <h3 style="color: #2563eb; font-size: 13pt; margin-top: 16pt;">🖥️ UX-Verbesserungen</h3>
    <ol style="font-size: 10pt; line-height: 1.8;">
      <li><strong>Exklusive Optionen:</strong> Bei "Nein, alles läuft gut" fehlt visueller Hinweis</li>
      <li><strong>Lange Optionentexte:</strong> Besonders bei Daten-Fragen – Optionen sind ganze Sätze</li>
      <li><strong>Fortschrittsanzeige:</strong> "Planung: Modellspezifisch" kann je nach Auswahl sehr unterschiedlich lang sein</li>
    </ol>
  </div>`;

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta name="ProgId" content="Word.Document">
  <meta name="Generator" content="VNB Transparenz generate-word-doc.ts v3 + CTO Review">
  <title>${esc(schema.title)} – Dokumentation + Review v${esc(schema.version)}</title>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; }
    h1 { font-size: 20pt; color: #1a365d; margin-bottom: 6pt; }
    h2 { font-size: 16pt; }
    h3 { font-size: 13pt; }
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
  <p style="font-size: 10pt;"><strong>Statistik:</strong> ${schema.sections.length} Abschnitte, ${totalQuestions} Fragen, ${Object.keys(registry).length} Registry-Einträge, <span style="color: #be185d; font-weight: bold;">${totalAnnotations} Review-Anmerkungen</span></p>
  
  <div style="background: #fdf2f8; padding: 10pt 14pt; border-left: 4pt solid #be185d; margin: 12pt 0; font-size: 10pt;">
    <strong style="color: #be185d;">🔍 CTO Review enthalten</strong><br>
    Dieses Dokument enthält Review-Anmerkungen direkt bei den jeweiligen Fragen, markiert mit farbigen Kästen:<br>
    <span style="color: #7c3aed;">👤 VERSTÄNDNIS</span> – Schwer verständlich für Laien |
    <span style="color: #dc2626;">⚙️ LOGIK</span> – Bug oder Logikfehler |
    <span style="color: #2563eb;">🖥️ UX</span> – Bedienungsproblem |
    <span style="color: #d97706;">📝 INHALT</span> – Inhaltlicher Verbesserungsvorschlag<br><br>
    Eine Gesamtübersicht aller Findings finden Sie in <strong>Anhang B</strong>.
  </div>

  <div style="background: #eff6ff; padding: 8pt 12pt; border-left: 4pt solid #2563eb; margin: 12pt 0; font-size: 10pt;">
    <strong>Korrektur-Workflow:</strong> Wenn Sie Änderungen anmerken möchten, beginnen Sie die Anmerkung mit "<strong>Korrektur</strong>" und referenzieren Sie die Display-ID (z.B. <code>4-GGV-MsbOffer</code>).
  </div>

  <hr style="border: 1pt solid #22c55e; margin: 12pt 0;">
  
  <h2 style="font-size: 14pt; color: #1a365d;">Inhaltsverzeichnis</h2>
  <ol style="font-size: 10pt;">
    ${schema.sections.map(s => `<li>${esc(s.title)} (${s.questions.length} Fragen)</li>`).join('\n    ')}
    <li style="color: #be185d; font-weight: bold;">Anhang A: Fragen-Registry</li>
    <li style="color: #be185d; font-weight: bold;">Anhang B: CTO Review – Zusammenfassung</li>
  </ol>
  
  <hr style="border: 1pt solid #e5e7eb; margin: 12pt 0;">
  
  ${body}
  
  ${registryTable}
  
  ${reviewSummary}
  
  <hr style="border: 1pt solid #e5e7eb; margin: 24pt 0 12pt;">
  <p style="text-align: center; color: #999; font-size: 9pt;">
    Generiert aus src/data/surveySchema.ts (SSOT v${esc(schema.version)}) | ${totalQuestions} Fragen | ${totalAnnotations} Review-Anmerkungen | ${buildDate}
  </p>
</body>
</html>`;
}

// --- Consistency Check ---

function checkConsistency(schema: SurveySchema, registry: Record<string, RegistryEntry>): string[] {
  const warnings: string[] = [];
  for (const section of schema.sections) {
    for (const q of section.questions) {
      if (!registry[q.id]) {
        warnings.push(`⚠️  Question "${q.id}" (${section.title}) has NO registry entry`);
      }
    }
  }
  return warnings;
}

// --- Main ---

async function main() {
  console.log('📄 Generating Word document with CTO Review from surveySchema.ts (SSOT v3)...\n');

  const { schema, registry } = parseSurveySchema();
  const totalQuestions = schema.sections.reduce((acc, s) => acc + s.questions.length, 0);
  const totalAnnotations = Object.values(REVIEW_ANNOTATIONS).reduce((acc, arr) => acc + arr.length, 0);
  console.log(`   Found ${schema.sections.length} sections with ${totalQuestions} questions`);
  console.log(`   Registry: ${Object.keys(registry).length} entries`);
  console.log(`   Review annotations: ${totalAnnotations}\n`);

  const warnings = checkConsistency(schema, registry);
  if (warnings.length > 0) {
    console.log('   ⚠️  Consistency warnings:');
    for (const w of warnings) console.log(`      ${w}`);
    console.log('');
  } else {
    console.log('   ✅ Registry-Schema consistency check passed\n');
  }

  const doc = generateWordDoc(schema, registry);
  const outputPath = path.resolve(__dirname, '../public/data/umfrage-dokumentation.doc');
  fs.writeFileSync(outputPath, doc, 'utf-8');
  console.log(`   ✅ Written: ${outputPath} (${(doc.length / 1024).toFixed(1)} KB)\n`);

  console.log('🎉 Word document with CTO Review generated successfully!');
}

main().catch((err) => { console.error('❌ Generation failed:', err); process.exit(1); });
