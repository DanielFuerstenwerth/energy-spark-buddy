import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, CheckCircle2, AlertTriangle, Bug } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  surveyDefinition,
  QUESTION_REGISTRY,
  cleanLabel,
  type SurveyQuestion,
  type SurveyOption,
} from "@/data/surveySchema";

// === Review Annotations ===

type AnnotationType = "verständnis" | "logik" | "ux" | "inhalt" | "db" | "cto";

interface ReviewAnnotation {
  type: AnnotationType;
  text: string;
}

const REVIEW_ANNOTATIONS: Record<string, ReviewAnnotation[]> = {
  actorTypes: [{ type: "verständnis", text: 'Begriffe wie "GGV", "Mieterstrom", "Energy Sharing" werden ohne Erklärung verwendet. Für Einsteiger wäre ein kurzer Einleitungstext mit Definitionen hilfreich.' }],
  projectTypes: [
    { type: "verständnis", text: '🔍 REVIEW: "GGV (Gemeinschaftliche Gebäudeversorgung)" – Ist der volle Name ausreichend erklärend?' },
    { type: "logik", text: '🔍 REVIEW: "Entweder GGV oder Mieterstrom" – Diese Option hat dieselbe Logik wie "GGV". Soll sie BEIDE Pfade öffnen?' },
  ],
  ggvProjectType: [{ type: "verständnis", text: '🔍 REVIEW: Label "Projektumfang" ist sehr generisch. Besser: "Wie viele GGV-Projekte planen/betreiben Sie?"' }],
  planningStatus: [
    { type: "cto", text: "✅ ENTSCHIEDEN: Multi-Select behalten. Schema auf multi-select geändert." },
    { type: "verständnis", text: '🔍 REVIEW: Die Optionen mischen Planungs- und Betriebsstatus. "Die PV-Anlage läuft bereits mit GGV/Mieterstrom" steuert die Betriebsfragen.' },
  ],
  ggvOrMieterstromDecision: [{ type: "cto", text: "✅ ENTSCHIEDEN: Frage wird IMMER angezeigt (Kontrollfrage)." }],
  vnbContact: [{ type: "cto", text: "✅ ENTSCHIEDEN: Multi-Select behalten." }],
  esStatus: [{ type: "cto", text: "✅ ENTSCHIEDEN: Multi-Select behalten." }],
  vnbSupportMesskonzept: [{ type: "verständnis", text: '🔍 REVIEW: "Messkonzept" ist ein Fachbegriff. Erklärung hinzufügen.' }],
  vnbMsbOffer: [{ type: "verständnis", text: '🔍 REVIEW: "gMSB" und "wMSB" sind Fachbegriffe. Bei erster Verwendung ausschreiben.' }],
  vnbDataProvision: [{ type: "verständnis", text: '🔍 REVIEW: "Marktkommunikation" und "ESA-Marktrolle" sind hochspezialisierte Begriffe.' }],
  vnbEsaCost: [{ type: "verständnis", text: '🔍 REVIEW: "ESA-Marktrolle" – Erklärung fehlt komplett.' }],
  vnbWandlermessung: [{ type: "verständnis", text: '🔍 REVIEW: "Wandlermessung" – technische Erklärung fehlt.' }],
  vnbAdditionalCosts: [{ type: "verständnis", text: '🔍 REVIEW: "Einbau auf Kundenwunsch" – Fachbegriff aus dem MsbG?' }],
  vnbFullService: [{ type: "verständnis", text: '🔍 REVIEW: "Full-Service-Angebot" – Label allein ist unklar.' }],
  mieterstromSummenzaehler: [{ type: "verständnis", text: '🔍 REVIEW: "Virtueller Summenzähler" vs. "Physikalischer Summenzähler" – Kernunterschied fehlt.' }],
  mieterstromVirtuellAllowed: [{ type: "logik", text: "⚠️ LOGIK: Wird laut Schema nur bei summenzaehler='virtuell' gezeigt, aber im Code immer angezeigt." }],
  mieterstromModelChoice: [{ type: "verständnis", text: '🔍 REVIEW: Hinweis "(physikalischer Summenzähler für >5.000 EUR)" leicht zu übersehen.' }],
  operationAllocationProvider: [{ type: "verständnis", text: '🔍 REVIEW: "Verrechnung" – Was bedeutet das hier genau?' }],
  operationDataFormat: [{ type: "ux", text: "🔍 REVIEW: Optionen sind sehr lang. Kürzere Optionen + helpText." }],
  esVnbResponse: [{ type: "cto", text: '✅ ENTSCHIEDEN: Datum "01.06.2026" bleibt.' }],
  esNetzentgelteDiscussion: [{ type: "verständnis", text: '🔍 REVIEW: "Netzentgelte" – Erklärung für Laien fehlt.' }],
  serviceProviderName: [{ type: "ux", text: "🔍 REVIEW: Dienstleister-Sektion – auch für Planer sichtbar?" }],
  vnbRejectionResponse: [{ type: "cto", text: "📋 ZU PRÜFEN: Verschiebung von Betrieb nach Planung wird geprüft." }],
  helpfulInfoSources: [{ type: "cto", text: "✅ ENTSCHIEDEN: Drei separate InfoSources-Fragen bleiben getrennt." }],
  mieterstromSurveyImprovements: [{ type: "cto", text: "✅ ENTSCHIEDEN & UMGESETZT: Duplikat entfernt." }],
  challenges: [{ type: "ux", text: '🔍 REVIEW: "Nein, alles läuft gut" ist exklusiv – visueller Hinweis fehlt.' }],
  implementationApproach: [{ type: "verständnis", text: '🔍 REVIEW: "Über die Installation der PV-Anlage hinaus" – prominenter platzieren.' }],
  npsScore: [{ type: "cto", text: "✅ ENTSCHIEDEN: NPS bewertet das Modell." }],
  documentUpload: [{ type: "logik", text: '⚠️ BUG: StepFinal referenziert "uploadedDocuments" statt "documentUpload".' }],
};

// === Helpers ===

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    "single-select": "Einfachauswahl", "multi-select": "Mehrfachauswahl",
    text: "Textfeld", textarea: "Textfeld (mehrzeilig)",
    number: "Zahleneingabe", email: "E-Mail",
    rating: "Bewertungsskala", file: "Datei-Upload",
    "vnb-select": "VNB-Auswahl (Suchfeld)", "project-focus": "Projektfokus-Auswahl",
  };
  return map[type] || type;
}

function annotationColor(type: AnnotationType): string {
  const colors: Record<AnnotationType, string> = {
    verständnis: "#7c3aed", logik: "#dc2626", ux: "#2563eb",
    inhalt: "#d97706", db: "#059669", cto: "#be185d",
  };
  return colors[type] || "#666";
}

function annotationIcon(type: AnnotationType): string {
  const icons: Record<AnnotationType, string> = {
    verständnis: "👤", logik: "⚙️", ux: "🖥️",
    inhalt: "📝", db: "🗄️", cto: "🔧",
  };
  return icons[type] || "💡";
}

function renderAnnotationsHtml(questionId: string): string {
  const annotations = REVIEW_ANNOTATIONS[questionId];
  if (!annotations?.length) return "";
  return annotations.map(a => `
    <p style="font-size:9pt;margin-top:4pt;padding:4pt 8pt;background:${annotationColor(a.type)}15;border-left:3pt solid ${annotationColor(a.type)};color:${annotationColor(a.type)};">
      ${annotationIcon(a.type)} <strong>[${a.type.toUpperCase()}]</strong> ${esc(a.text)}
    </p>
  `).join("");
}

function renderOptionsHtml(options: SurveyOption[]): string {
  let html = `<table style="width:100%;border-collapse:collapse;margin-top:6pt;font-size:10pt;">
    <tr style="background:#e5e7eb;">
      <th style="text-align:left;padding:3pt 6pt;border:1pt solid #ccc;width:25%;">Wert</th>
      <th style="text-align:left;padding:3pt 6pt;border:1pt solid #ccc;">Label</th>
      <th style="text-align:left;padding:3pt 6pt;border:1pt solid #ccc;width:20%;">Extras</th>
    </tr>`;
  for (const opt of options) {
    const extras: string[] = [];
    if (opt.hasTextField) extras.push(`+ Textfeld${opt.textFieldLabel ? ` ("${esc(opt.textFieldLabel)}")` : ""}`);
    if (opt.exclusive) extras.push("exklusiv");
    html += `<tr>
      <td style="padding:3pt 6pt;border:1pt solid #ccc;font-family:monospace;font-size:9pt;color:#374151;">${esc(opt.value)}</td>
      <td style="padding:3pt 6pt;border:1pt solid #ccc;">${esc(opt.label)}</td>
      <td style="padding:3pt 6pt;border:1pt solid #ccc;font-size:9pt;color:#f59e0b;">${extras.join(", ")}</td>
    </tr>`;
  }
  html += "</table>";
  return html;
}

function renderQuestionHtml(q: SurveyQuestion): string {
  const regEntry = QUESTION_REGISTRY[q.id];
  const displayId = regEntry?.displayId || q.id;
  const dbColumn = regEntry?.dbColumn || "—";
  const uiNumber = regEntry?.uiNumber || "";

  let html = `
  <div style="margin:12pt 0;padding:10pt;background:#f9fafb;border:1pt solid #e5e7eb;border-radius:4pt;">
    <p style="margin:0 0 4pt;">
      <span style="color:#2563eb;font-size:9pt;font-weight:bold;font-family:monospace;background:#eff6ff;padding:1pt 4pt;border-radius:2pt;">${esc(displayId)}</span>
      ${uiNumber ? `<span style="color:#999;font-size:8pt;margin-left:6pt;">${esc(uiNumber)}</span>` : ""}
    </p>
    <p style="margin:2pt 0 4pt;"><strong style="font-size:11pt;">${esc(cleanLabel(q.label))}</strong></p>
    <p style="margin:0 0 4pt;font-size:9pt;color:#666;">
      Typ: ${typeLabel(q.type)}
      | DB: <code style="font-family:monospace;background:#f3f4f6;padding:1pt 3pt;font-size:8pt;">${esc(dbColumn)}</code>
      ${q.required ? ' | <span style="color:#dc2626;font-weight:bold;">Pflichtfeld</span>' : ""}
      ${q.optional ? ' | <span style="color:#2563eb;">Optional</span>' : ""}
    </p>`;

  if (q.description) html += `<p style="font-size:9pt;color:#666;margin:2pt 0;">${esc(cleanLabel(q.description))}</p>`;
  if (q.helpText) html += `<div style="font-size:9pt;margin:6pt 0;padding:6pt 10pt;background:#eff6ff;border-left:3pt solid #3b82f6;border-radius:2pt;color:#1e40af;">ℹ️ <strong>Hinweis:</strong> ${esc(cleanLabel(q.helpText))}</div>`;
  if (q.placeholder) html += `<p style="font-size:9pt;color:#999;font-style:italic;margin:2pt 0;">Platzhalter: "${esc(q.placeholder)}"</p>`;

  if (q.options?.length) html += renderOptionsHtml(q.options);

  if (q.type === "rating" && q.min !== undefined && q.max !== undefined) {
    html += `<p style="font-size:9pt;margin-top:6pt;padding:4pt 8pt;background:#f0f9ff;border-radius:4pt;">
      <strong>Skala:</strong> ${q.min} – ${q.max}<br>
      ${q.minLabel ? `${q.min}: ${esc(q.minLabel)}<br>` : ""}
      ${q.maxLabel ? `${q.max}: ${esc(q.maxLabel)}` : ""}
    </p>`;
  }

  if (q.visibilityRule) html += `<p style="font-size:9pt;margin-top:4pt;padding:3pt 6pt;background:#fef3c7;border-left:3pt solid #f59e0b;color:#92400e;">⚡ Sichtbarkeit: strukturierte Regel</p>`;
  if (q.skipLogic) html += `<p style="font-size:9pt;margin-top:4pt;padding:3pt 6pt;background:#fef3c7;border-left:3pt solid #f59e0b;color:#92400e;">➡️ Sprunglogik: ${esc(q.skipLogic)}</p>`;
  if (q.conditionalRequired) html += `<p style="font-size:9pt;margin-top:4pt;padding:3pt 6pt;background:#fee2e2;border-left:3pt solid #dc2626;color:#991b1b;">🔒 Bedingt Pflicht: ${esc(q.conditionalRequired)}</p>`;

  html += renderAnnotationsHtml(q.id);
  html += "</div>";
  return html;
}

function generateWordDocHtml(): string {
  const schema = surveyDefinition;
  const now = new Date();
  const buildDate = now.toISOString().split("T")[0];
  const buildTimestamp = now.toLocaleString("de-DE", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Berlin" });
  const totalQuestions = schema.sections.reduce((acc, s) => acc + s.questions.length, 0);
  const totalAnnotations = Object.values(REVIEW_ANNOTATIONS).reduce((acc, arr) => acc + arr.length, 0);

  let body = "";

  for (const section of schema.sections) {
    body += `
    <div style="page-break-before:auto;margin-top:24pt;">
      <h2 style="color:#1a365d;border-bottom:2pt solid #22c55e;padding-bottom:6pt;font-size:16pt;">${esc(cleanLabel(section.title))}</h2>`;
    if (section.description) body += `<p style="color:#666;font-style:italic;margin-bottom:6pt;">${esc(cleanLabel(section.description))}</p>`;
    if (section.visibilityRule) body += `<p style="background:#fef3c7;padding:4pt 8pt;border-left:3pt solid #f59e0b;font-size:9pt;color:#92400e;">⚡ Sichtbarkeit: strukturierte Regel</p>`;

    for (const question of section.questions) {
      body += renderQuestionHtml(question);
    }
    body += "</div>";
  }

  // Registry appendix
  let registryTable = `
  <div style="page-break-before:always;margin-top:24pt;">
    <h2 style="color:#1a365d;border-bottom:2pt solid #22c55e;padding-bottom:6pt;font-size:16pt;">Anhang A: Fragen-Registry (Display-ID → DB-Spalte)</h2>
    <table style="width:100%;border-collapse:collapse;font-size:9pt;">
      <tr style="background:#1a365d;color:white;">
        <th style="text-align:left;padding:4pt 6pt;border:1pt solid #ccc;">Display-ID</th>
        <th style="text-align:left;padding:4pt 6pt;border:1pt solid #ccc;">Nr.</th>
        <th style="text-align:left;padding:4pt 6pt;border:1pt solid #ccc;">Interner Key</th>
        <th style="text-align:left;padding:4pt 6pt;border:1pt solid #ccc;">DB-Spalte</th>
      </tr>`;
  for (const [key, entry] of Object.entries(QUESTION_REGISTRY)) {
    registryTable += `<tr>
      <td style="padding:3pt 6pt;border:1pt solid #ccc;font-family:monospace;color:#2563eb;">${esc(entry.displayId)}</td>
      <td style="padding:3pt 6pt;border:1pt solid #ccc;font-family:monospace;color:#999;">${esc(entry.uiNumber || "—")}</td>
      <td style="padding:3pt 6pt;border:1pt solid #ccc;font-family:monospace;">${esc(key)}</td>
      <td style="padding:3pt 6pt;border:1pt solid #ccc;font-family:monospace;color:#059669;">${esc(entry.dbColumn)}</td>
    </tr>`;
  }
  registryTable += "</table></div>";

  // CTO Review Summary
  const reviewSummary = `
  <div style="page-break-before:always;margin-top:24pt;">
    <h2 style="color:#be185d;border-bottom:2pt solid #be185d;padding-bottom:6pt;font-size:16pt;">Anhang B: CTO Review – Zusammenfassung</h2>
    <h3 style="color:#059669;font-size:13pt;margin-top:16pt;">✅ Entschieden & Umgesetzt</h3>
    <ol style="font-size:10pt;line-height:1.8;">
      <li><strong>planningStatus</strong>: Multi-Select behalten</li>
      <li><strong>vnbContact</strong>: Multi-Select behalten</li>
      <li><strong>esStatus</strong>: Multi-Select behalten</li>
      <li><strong>mieterstromSurveyImprovements</strong>: Duplikat entfernt</li>
      <li><strong>ggvOrMieterstromDecision</strong>: Wird immer angezeigt</li>
      <li><strong>Datum "01.06.2026"</strong>: Bleibt</li>
      <li><strong>InfoSources</strong>: Bleiben getrennt</li>
      <li><strong>NPS</strong>: Bewertet das Modell</li>
    </ol>
    <h3 style="color:#d97706;font-size:13pt;margin-top:16pt;">📋 Noch zu prüfen</h3>
    <ol style="font-size:10pt;line-height:1.8;">
      <li><strong>vnbRejectionResponse</strong>: Verschiebung von Betrieb nach Planung</li>
    </ol>
    <h3 style="color:#dc2626;font-size:13pt;margin-top:16pt;">🐛 Offene Bugs</h3>
    <ol style="font-size:10pt;line-height:1.8;">
      <li><strong>documentUpload</strong>: StepFinal referenziert falschen Key</li>
      <li><strong>mieterstromVirtuellAllowed</strong>: Visibility im Code fehlt</li>
    </ol>
  </div>`;

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta name="ProgId" content="Word.Document">
  <meta name="Generator" content="VNB Transparenz Survey Documentation Generator">
  <title>${esc(schema.title)} – Dokumentation v${esc(schema.version)}</title>
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
  <p style="color:#666;font-size:10pt;">Version: ${esc(schema.version)} | Stand: ${esc(schema.lastUpdated)} | Generiert: ${buildTimestamp}</p>
  <p style="color:#666;font-size:10pt;">${esc(schema.description)}</p>
  <p style="font-size:10pt;"><strong>Statistik:</strong> ${schema.sections.length} Abschnitte, ${totalQuestions} Fragen, ${Object.keys(QUESTION_REGISTRY).length} Registry-Einträge, <span style="color:#be185d;font-weight:bold;">${totalAnnotations} Review-Anmerkungen</span></p>
  
  <div style="background:#fdf2f8;padding:10pt 14pt;border-left:4pt solid #be185d;margin:12pt 0;font-size:10pt;">
    <strong style="color:#be185d;">🔍 CTO Review enthalten</strong><br>
    Farbige Kästen markieren Review-Anmerkungen:<br>
    <span style="color:#7c3aed;">👤 VERSTÄNDNIS</span> |
    <span style="color:#dc2626;">⚙️ LOGIK</span> |
    <span style="color:#2563eb;">🖥️ UX</span> |
    <span style="color:#d97706;">📝 INHALT</span><br>
    Gesamtübersicht in <strong>Anhang B</strong>.
  </div>

  <div style="background:#eff6ff;padding:8pt 12pt;border-left:4pt solid #2563eb;margin:12pt 0;font-size:10pt;">
    <strong>Korrektur-Workflow:</strong> Anmerkungen mit "<strong>Korrektur</strong>" + Display-ID (z.B. <code>4-GGV-MsbOffer</code>).
  </div>

  <hr style="border:1pt solid #22c55e;margin:12pt 0;">
  
  <h2 style="font-size:14pt;color:#1a365d;">Inhaltsverzeichnis</h2>
  <ol style="font-size:10pt;">
    ${schema.sections.map(s => `<li>${esc(cleanLabel(s.title))} (${s.questions.length} Fragen)</li>`).join("\n    ")}
    <li style="color:#be185d;font-weight:bold;">Anhang A: Fragen-Registry</li>
    <li style="color:#be185d;font-weight:bold;">Anhang B: CTO Review – Zusammenfassung</li>
  </ol>
  
  <hr style="border:1pt solid #e5e7eb;margin:12pt 0;">
  
  ${body}
  ${registryTable}
  ${reviewSummary}
  
  <hr style="border:1pt solid #e5e7eb;margin:24pt 0 12pt;">
  <p style="text-align:center;color:#999;font-size:9pt;">
    Generiert aus surveySchema.ts (SSOT v${esc(schema.version)}) | ${totalQuestions} Fragen | ${totalAnnotations} Review-Anmerkungen | ${buildTimestamp}
  </p>
</body>
</html>`;
}

// === React Page ===

export default function SurveyDocumentation() {
  const [downloading, setDownloading] = useState(false);

  const totalQuestions = surveyDefinition.sections.reduce((acc, s) => acc + s.questions.length, 0);
  const totalAnnotations = Object.values(REVIEW_ANNOTATIONS).reduce((acc, arr) => acc + arr.length, 0);

  const handleDownload = () => {
    setDownloading(true);
    try {
      const html = generateWordDocHtml();
      const blob = new Blob([html], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Fragebogen-Dokumentation-v${surveyDefinition.version}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Fragebogen – Dokumentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Vollständige Dokumentation aller Sektionen mit Fragen, Antwortoptionen,
                Display-IDs, DB-Spalten und Sichtbarkeitslogik. Wird direkt aus dem
                Schema generiert – immer aktuell.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{surveyDefinition.sections.length}</div>
                  <div className="text-xs text-muted-foreground">Abschnitte</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{totalQuestions}</div>
                  <div className="text-xs text-muted-foreground">Fragen</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{Object.keys(QUESTION_REGISTRY).length}</div>
                  <div className="text-xs text-muted-foreground">Registry-Einträge</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-pink-600">{totalAnnotations}</div>
                  <div className="text-xs text-muted-foreground">Review-Anmerkungen</div>
                </div>
              </div>

              <Button onClick={handleDownload} disabled={downloading} size="lg" className="w-full">
                <Download className="w-5 h-5 mr-2" />
                {downloading ? "Wird generiert..." : "Download als Word (.doc)"}
              </Button>

              <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                <p className="font-medium">So öffnest du die Datei:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Klicke auf "Download als Word (.doc)"</li>
                  <li>Öffne die Datei mit Word</li>
                  <li>Optional: "Datei" → "Speichern unter" → Format ".docx"</li>
                </ol>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg text-sm">
                <p className="font-medium mb-2">Korrektur-Workflow:</p>
                <p className="text-muted-foreground">
                  Beginne Anmerkungen mit "<strong>Korrektur</strong>" und referenziere die
                  Display-ID (z.B. <code className="bg-muted px-1 rounded">4-GGV-MsbOffer</code>).
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  CTO Review – Zusammenfassung
                </h3>
                <div className="grid gap-2 text-xs">
                  <div className="flex items-start gap-2 p-2 rounded bg-green-50 dark:bg-green-950/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                    <span>8 Entscheidungen umgesetzt (Multi-Select, Duplikat entfernt, NPS, etc.)</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded bg-amber-50 dark:bg-amber-950/20">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <span>1 Punkt zu prüfen (vnbRejectionResponse)</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded bg-red-50 dark:bg-red-950/20">
                    <Bug className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                    <span>2 offene Bugs (documentUpload, mieterstromVirtuellAllowed)</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Version {surveyDefinition.version} | Stand: {surveyDefinition.lastUpdated}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
