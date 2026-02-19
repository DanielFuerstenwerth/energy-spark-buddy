// Zentrales Schema für die Umfrage - Single Source of Truth (SSOT)
// Letzte Aktualisierung: 2026-02-15 (Visibility Rules Refactoring)

import type { SurveyData } from '@/types/survey';
import {
  VisibilityRule, evaluateRule,
  PT_GGV, PT_MS, PT_MS_OR_BOTH, PT_GGV_OR_MS, PT_ES,
  eq, eqAny, inc, filled, and, or, not,
  GGV_IN_OPERATION, MS_IN_OPERATION, ES_IN_OPERATION, AT_LEAST_ONE_IN_PLANNING,
} from '@/lib/visibilityRules';

export interface SurveyOption {
  value: string;
  label: string;
  hasTextField?: boolean;
  textFieldLabel?: string;
  textFieldPlaceholder?: string;
  textFieldHint?: string;
  exclusive?: boolean; // If true, selecting this option deselects all others
  hint?: string; // Small hint text shown below the option label
  tooltip?: string; // Click-toggle inline hint shown via info icon next to the option label
  inlineHint?: string; // Hint text shown below the option when selected
}

export interface SurveyQuestion {
  id: string;
  dbColumn?: string;
  type: 'single-select' | 'multi-select' | 'text' | 'text-list' | 'textarea' | 'number' | 'email' | 'rating' | 'file' | 'vnb-select' | 'project-focus';
  label: string;
  description?: string;
  helpText?: string;
  /** Click-toggle inline hint shown via info icon next to the label */
  tooltip?: string;
  options?: SurveyOption[];
  required?: boolean;
  optional?: boolean;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  placeholder?: string;
  /** Structured visibility rule - evaluated by evaluateRule() engine */
  visibilityRule?: VisibilityRule;
  skipLogic?: string;
  conditionalRequired?: string;
  multiline?: boolean;
  /** When true, this question is rendered directly below the previous one without extra spacing or label wrapper */
  groupWithPrevious?: boolean;
}

export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  /** Structured visibility rule - evaluated by evaluateRule() engine */
  visibilityRule?: VisibilityRule;
}

export interface SurveySchema {
  version: string;
  lastUpdated: string;
  title: string;
  description: string;
  sections: SurveySection[];
}

// Helper function to clean Lxx: artifacts and legacy prefixes from labels
// Handles: A1., B5., C8.1c, MP1d., MB5.1, MD1., C.8, D.1, E3. etc.
export function cleanLabel(text: string): string {
  return text
    .replace(/\n?L\d+:\s*/g, '')
    // Pattern B: letter + dot + digits (C.8, D.1, D.1.2)
    .replace(/^\s*[A-Z]{1,2}\.\d+(?:\.\d+)*\s+/, '')
    // Pattern A: 1-4 uppercase letters + digits + optional sub-numbers + optional letter + dot (MP1d., MB5.1, C8.1c, A1., E3.)
    .replace(/^\s*[A-Z]{1,4}\d+(?:\.\d+)*[a-z]?\.?\s+/, '')
    .trim();
}

// === SECTION 1: Über Sie ===

const SECTION_ABOUT_YOU: SurveySection = {
  id: "about",
  title: "1. Über Sie",
  description: "Einordnung & Motivation",
  questions: [
    {
      id: "actorTypes",
      type: "multi-select",
      label: "A1. In welche Akteursgruppe fallen Sie?",
      options: [
        { value: "buergerenergie", label: "Bürgerenergiegenossenschaft", hasTextField: true, textFieldLabel: "Name der Genossenschaft (optional)", textFieldPlaceholder: "z.B. Bürgerenergie Musterdorf eG" },
        { value: "weg", label: "Wohnungseigentümergemeinschaft" },
        { value: "vermieter_privat", label: "Vermieter/in - Privatperson" },
        { value: "vermieter_prof_klein", label: "Vermieter/in - Professionell (<100 Einheiten)" },
        { value: "vermieter_wohnungsunternehmen", label: "Vermieter/in - Wohnungsunternehmen (>100 Einheiten)" },
        { value: "kommune", label: "Kommune / kommunales Unternehmen" },
        { value: "kmu", label: "Kleine und Mittelständische Unternehmen (KMU)" },
        { value: "dienstleister", label: "Dienstleister für GGV/Mieterstrom/Energy Sharing", inlineHint: "Bitte tragen Sie Details zu Ihrer Dienstleistung unten ein." },
        { value: "installateur", label: "Installateur von PV-Anlagen" },
        { value: "msb", label: "Wettbewerblicher Messstellenbetreiber" },
        { value: "stadtwerk", label: "Stadtwerk/EVU" },
        { value: "andere", label: "Andere", hasTextField: true, textFieldLabel: "Bitte beschreiben", textFieldPlaceholder: "z.B. Forschungsinstitut, Verband, Energieagentur..." },
      ],
      optional: true,
    },
    {
      id: "actorDienstleisterCategory",
      type: "multi-select",
      label: "A1.1 In welche Kategorie von Dienstleister ordnen Sie sich ein?",
      helpText: "Wählen Sie alle zutreffenden Kategorien aus.",
      optional: true,
      visibilityRule: inc('actorTypes', 'dienstleister'),
      options: [
        { value: "data_provision", label: "Datenbereitstellung (ESA-Zugang zu gMSB-Werten)" },
        { value: "invoicing_prep", label: "Datenbereitstellung und Vorbereitung der Abrechnung (durchzuführen durch den Betreiber)" },
        { value: "full_settlement", label: "Vollständige Abrechnung mit Teilnehmenden (im Auftrag des Betreibers oder auf eigenes Risiko)" },
        { value: "metering_full", label: "Messstellenbetrieb inkl. Datenbereitstellung" },
        { value: "metering_invoicing_prep", label: "Messstellenbetrieb inkl. Datenbereitstellung und Vorbereitung der Abrechnung (durchzuführen durch den Betreiber)" },
        { value: "metering_full_settlement", label: "Messstellenbetrieb und vollständige Abrechnung mit Teilnehmenden (im Auftrag des Betreibers oder auf eigenes Risiko)" },
        { value: "beratung", label: "Beratung für Immobilieneigentümer zur Umsetzung von GGV/Mieterstrom" },
        { value: "software", label: "Software / IT-Plattform für Dienstleister, MSB und/oder VNB" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Contracting, Energiemanagement..." },
      ],
    },
    {
      id: "dienstleisterWebsite",
      type: "text-list",
      label: "Für Dienstleister: Webadresse und Kontaktdaten",
      placeholder: "Webadresse...",
      optional: true,
      visibilityRule: inc('actorTypes', 'dienstleister'),
    },
    {
      id: "dienstleisterKontakt",
      type: "text-list",
      label: "",
      placeholder: "Email (Bitte nur professionelle Kontaktdaten für Veröffentlichung auf www.ggv-transparenz.de angeben.)",
      optional: true,
      groupWithPrevious: true,
      visibilityRule: inc('actorTypes', 'dienstleister'),
    },
    {
      id: "motivation",
      type: "multi-select",
      label: "A2. Wie würden Sie Ihre Motivation einordnen?",
      options: [
        { value: "pv_nutzung", label: "Wir werden auf jeden Fall eine PV-Anlage bauen (oder haben diese schon gebaut) und möchten den Strom vor Ort nutzen" },
        { value: "energiewende", label: "Wir möchten gerne Energiewende vor Ort umsetzen - sobald die Nutzung geklärt ist, kommt die PV-Anlage" },
        { value: "geschaeft", label: "Der Bau und Betrieb von PV-Anlagen ist ein wesentliches Anliegen von unserem Unternehmen/Verein" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Klimaschutz, Autarkie, Nachbarschaftsprojekt..." },
      ],
      optional: true,
    },
    {
      id: "contactEmail",
      type: "email",
      label: "Falls wir Sie bei Rückfragen kontaktieren dürfen, lassen Sie gerne eine E-Mail da",
      placeholder: "ihre@email.de",
      optional: true,
    },
    // Korrektur: Neue Frage
    {
      id: "confirmationForUpdate",
      type: "single-select",
      label: "Falls Sie eine Info über die Ergebnisse der Umfrage per E-Mail erhalten möchten, lassen Sie uns das wissen:",
      options: [
        { value: "ja", label: "Ja, ich möchte eine Info erhalten" },
        { value: "nein", label: "Nein, ich schaue selber online nach Updates" },
      ],
      optional: true,
    },
  ],
};

// === SECTION 2: Projekt ===
const SECTION_PROJECT_DETAILS: SurveySection = {
  id: "project",
  title: "2. Projekt",
  description: "Verteilnetzbetreiber, Projektart und Dimensionen",
  questions: [
    {
      id: "vnbName",
      type: "vnb-select",
      label: "Welcher Verteilnetzbetreiber ist für Ihr Projekt zuständig?",
      description: "Suchen oder geben Sie den Namen Ihres Verteilnetzbetreibers ein",
      tooltip: 'Wenn Sie den Namen Ihres Verteilnetzbetreibers nicht kennen, können Sie diesen über die Website www.vnb-digital.de identifizieren. Um Projekte im Netzgebiet von weiteren Verteilnetzbetreibern einzutragen, wählen Sie oben bitte „+Weitere Verteilnetzbetreiber-Bewertung" aus.',
      optional: false,
    },
    {
      id: "projectTypes",
      type: "multi-select",
      label: "Welche Art von Projekt möchten Sie gerne umsetzen / haben Sie umgesetzt?",
      helpText: "Die Auswahl hier entscheidet darüber, welche Fragen im Weiteren angezeigt werden.",
      options: [
        { value: "ggv", label: "GGV (Gemeinschaftliche Gebäudeversorgung)", tooltip: "Bei der GGV kann jede(r) Teilnehmer(in) den bestehenden Stromversorgungsvertrag beibehalten. Die Betreiberin verkauft hierbei ausschliesslich PV-Strom, der vor Ort erzeugt wurde. Dieser wird ausschliesslich \"virtuell\" über Smart Meter dem jeweiligen Zählpunkt zugeordnet." },
        { value: "mieterstrom", label: "Mieterstrom", tooltip: "Bei Mieterstrom findet grundsätzlich eine Vollversorgung statt, d.h. jede(r)  Teilnehmer(in) beendet den bisherigen Stromversorgungsvertrag. Die Betreiberin verkauft sowohl PV-Strom, der vor Ort erzeugt wurde, als auch Reststrom aus dem Stromnetz an die Teilnehmenden. Dies kann sowohl ein gefördertes Mieterstrommodell (§19 Absatz 1 Nr. 3 EEG ) als auch ein Modell ohne Förderung sein." },
        { value: "ggv_oder_mieterstrom", label: "Entweder GGV oder Mieterstrom (nur für Projekte im Planungsstadium)" },
        { value: "energysharing", label: "Energy Sharing (in Zukunft möglich)" },
      ],
      required: true,
    },
    // planningStatus kommt direkt nach projectTypes (Legacy-Reihenfolge)
    {
      id: "planningStatus",
      type: "single-select",
      label: "B1. Wo stehen Sie aktuell mit dem Projekt?",
      helpText: "Die Auswahl hier entscheidet darüber, welche Fragen im Weiteren angezeigt werden.",
      options: [
        { value: "info_sammeln", label: "Wir haben grundsätzliches Interesse, sammeln derzeit Informationen" },
        { value: "planung_stockt_ggv", label: "Wir sind fortgeschritten in der Planung, aber es stockt mit der Umsetzung GGV/Mieterstrom" },
        { value: "planung_stockt_pv", label: "Wir sind fortgeschritten in der Planung, aber es stockt mit der Installation der PV-Anlage" },
        { value: "planung_fast_fertig", label: "Wir sind fast fertig mit der Planung" },
        { value: "pv_laeuft_ggv_planung", label: "Die PV-Anlage läuft schon, aber die GGV/Mieterstrom ist noch in Planung" },
        { value: "pv_laeuft_ggv_laeuft", label: "Die PV-Anlage läuft bereits mit GGV/Mieterstrom" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Projekt pausiert, Standortwechsel..." },
      ],
      required: true,
      visibilityRule: PT_GGV_OR_MS(),
    },
    {
      id: "mieterstromPlanningStatus",
      type: "single-select",
      label: "B1b. Wo stehen Sie aktuell mit dem Mieterstrom-Projekt?",
      helpText: "Die Auswahl hier entscheidet darüber, welche Fragen im Weiteren angezeigt werden.",
      options: [
        { value: "info_sammeln", label: "Wir haben grundsätzliches Interesse, sammeln derzeit Informationen" },
        { value: "planung_stockt_ggv", label: "Wir sind fortgeschritten in der Planung, aber es stockt mit der Umsetzung des Mieterstroms" },
        { value: "planung_stockt_pv", label: "Wir sind fortgeschritten in der Planung, aber es stockt mit der Installation der PV-Anlage" },
        { value: "planung_fast_fertig", label: "Wir sind fast fertig mit der Planung" },
        { value: "pv_laeuft_ggv_planung", label: "Die PV-Anlage läuft schon, aber Mieterstrom ist noch in Planung" },
        { value: "pv_laeuft_ggv_laeuft", label: "Die PV-Anlage läuft bereits mit Mieterstrom" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Projekt pausiert, Standortwechsel..." },
      ],
      required: true,
      visibilityRule: and(PT_MS(), PT_GGV()),
    },
    // Projektumfang (2.4) kommt nach planningStatus (Legacy-Reihenfolge)
    {
      id: "ggvProjectType",
      type: "single-select",
      label: "Wie viele GGV-Projekte planen/betreiben Sie?",
      optional: true,
      options: [
        { value: "single", label: "Ein einzelnes Projekt" },
        { value: "multiple", label: "Mehrere Projekte (im Fall von verschiedenen Verteilnetzbetreibern bitte einen zusätzlichen Verteilnetzbetreiber auswählen)" },
      ],
      visibilityRule: PT_GGV(),
    },
    {
      id: "ggvPvSizeKw",
      type: "number",
      label: "Größe der PV-Anlage in kW - GGV",
      placeholder: "z.B. 30",
      optional: true,
      visibilityRule: PT_GGV(),
    },
    {
      id: "ggvPartyCount",
      type: "number",
      label: "Anzahl der Parteien, die Strom abnehmen - GGV",
      placeholder: "z.B. 12",
      optional: true,
      visibilityRule: PT_GGV(),
    },
    {
      id: "ggvBuildingType",
      type: "single-select",
      label: "Art des Gebäudes - GGV",
      optional: true,
      options: [
        { value: "wohngebaeude", label: "Wohngebäude" },
        { value: "gewerbe", label: "Gewerbegebäude" },
        { value: "gemischt", label: "Gemischt" },
      ],
      visibilityRule: PT_GGV(),
    },
    {
      id: "ggvBuildingCount",
      type: "number",
      label: "Gesamtzahl der Projekte - GGV",
      placeholder: "z.B. 5",
      optional: true,
      visibilityRule: and(PT_GGV(), eq('ggvProjectType', 'multiple')),
    },
    {
      id: "ggvAdditionalInfo",
      type: "textarea",
      label: "Zusätzliche Informationen - GGV",
      placeholder: "z.B. Besonderheiten des Gebäudes, geplanter Zeitrahmen, beteiligte Akteure...",
      optional: true,
      visibilityRule: PT_GGV(),
    },
    {
      id: "mieterstromProjectType",
      type: "single-select",
      label: "Wie viele Mieterstrom-Projekte planen/betreiben Sie? (optional)",
      options: [
        { value: "single", label: "Ein einzelnes Projekt" },
        { value: "multiple", label: "Mehrere Projekte (im Fall von verschiedenen Verteilnetzbetreibern bitte einen zusätzlichen Verteilnetzbetreiber auswählen)" },
      ],
      visibilityRule: PT_MS(),
    },
    {
      id: "mieterstromPvSizeKw",
      type: "number",
      label: "Größe der PV-Anlage(n) in kW - Mieterstrom",
      placeholder: "z.B. 50",
      optional: true,
      visibilityRule: PT_MS(),
    },
    {
      id: "mieterstromPartyCount",
      type: "number",
      label: "Anzahl der Parteien, die Strom abnehmen - Mieterstrom",
      placeholder: "z.B. 24",
      optional: true,
      visibilityRule: PT_MS(),
    },
    {
      id: "mieterstromBuildingType",
      type: "single-select",
      label: "Art des Gebäudes - Mieterstrom",
      optional: true,
      options: [
        { value: "wohngebaeude", label: "Wohngebäude" },
        { value: "gewerbe", label: "Gewerbegebäude" },
        { value: "gemischt", label: "Gemischt" },
      ],
      visibilityRule: PT_MS(),
    },
    {
      id: "mieterstromBuildingCount",
      type: "number",
      label: "Gesamtzahl der Projekte - Mieterstrom",
      placeholder: "z.B. 5",
      optional: true,
      visibilityRule: and(PT_MS(), eq('mieterstromProjectType', 'multiple')),
    },
    {
      id: "mieterstromAdditionalInfo",
      type: "textarea",
      label: "Zusätzliche Informationen - Mieterstrom",
      placeholder: "z.B. Besonderheiten des Gebäudes, geplanter Zeitrahmen, beteiligte Akteure...",
      optional: true,
      visibilityRule: PT_MS(),
    },
    {
      id: "mieterstromFoerderung",
      type: "single-select",
      label: "Erhalten Sie eine Förderung für das Mieterstromprojekt oder beabsichtigen Sie diese zu beantragen?",
      options: [
        { value: "ja", label: "Ja" },
        { value: "nein", label: "Nein" },
        { value: "weiss_nicht", label: "Das wissen wir nicht" },
      ],
      optional: true,
      visibilityRule: PT_MS(),
    },
    {
      id: "mieterstromFoerderungNeinGrund",
      type: "single-select",
      label: "Warum keine Förderung?",
      options: [
        { value: "beantragt_nicht_geklappt", label: "Wir würden gerne, aber das war/ist nicht so einfach", hasTextField: true, textFieldLabel: "Begründung", textFieldPlaceholder: "Bitte beschreiben Sie die Gründe..." },
        { value: "bewusst_dagegen", label: "Wir haben uns bewusst dagegen entschieden", hasTextField: true, textFieldLabel: "Begründung", textFieldPlaceholder: "Bitte beschreiben Sie die Gründe..." },
      ],
      optional: true,
      visibilityRule: and(PT_MS(), eq('mieterstromFoerderung', 'nein')),
    },
    {
      id: "projectLocations",
      type: "text",
      label: "Standort(e) des GGV-Projekts",
      description: "Optional – nur wenn Veröffentlichung der Adresse erwünscht ist. PLZ, Adresse und bei mehreren Projekten kW pro Standort.",
      optional: true,
      visibilityRule: PT_GGV(),
    },
    {
      id: "mieterstromProjectLocations",
      type: "text",
      label: "Standort(e) des Mieterstrom-Projekts",
      description: "(optional)",
      optional: true,
      visibilityRule: PT_MS(),
    },
  ],
};

// === SECTION 3: Planung Allgemeines - Planungsstatus ===
// NOTE: planningStatus and mieterstromPlanningStatus are now in SECTION_PROJECT_DETAILS (Step 2)
const SECTION_PLANNING: SurveySection = {
  id: "planning",
  title: "3. Planung: Allgemeines – Planungsstand",
  description: "Aktueller Status Ihres Projekts",
  visibilityRule: PT_GGV_OR_MS(),
  questions: [
    {
      id: "ggvOrMieterstromDecision",
      type: "single-select",
      label: "B2. Sind Sie bereits festgelegt auf GGV oder Mieterstrom?",
      options: [
        { value: "sicher_ggv", label: "Wir sind sicher: es wird/ist GGV" },
        { value: "unsicher", label: "Wir sind unsicher: es fehlen noch Informationen für eine finale Entscheidung" },
        { value: "sicher_mieterstrom", label: "Wir sind sicher: es wird/ist Mieterstrom" },
      ],
      visibilityRule: AT_LEAST_ONE_IN_PLANNING(),
    },
    {
      id: "ggvDecisionReasons",
      type: "multi-select",
      label: "B3. Falls Sie derzeit eher zur GGV tendieren oder sich dafür entschlossen haben - warum?",
      options: [
        { value: "buerokratie_mieterstrom", label: "Wegen der bürokratischen Herausforderungen bei Mieterstrom" },
        { value: "reststrom_pflicht", label: "Wegen der Pflicht zum Einkauf von Reststrom bei Mieterstrom" },
        { value: "ladesaeulen_waermepumpen", label: "Weil die Einbindung von Ladesäulen/Wärmepumpen einfacher ist" },
        { value: "vnb_empfehlung", label: "Weil unser Verteilnetzbetreiber das empfiehlt" },
        { value: "finanziell_attraktiver", label: "Weil das finanziell attraktiver ist" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. rechtliche Beratung empfiehlt GGV, Erfahrungen Dritter..." },
      ],
      visibilityRule: PT_GGV(),
    },
    {
      id: "mieterstromDecisionReasons",
      type: "multi-select",
      label: "B4. Falls Sie derzeit eher zu Mieterstrom tendieren oder sich dafür entschlossen haben - warum?",
      options: [
        { value: "einfacher_umsetzung", label: "Weil das in der Umsetzung einfacher zu sein scheint" },
        { value: "kein_dienstleister_ggv", label: "Weil wir für die GGV nicht den richtigen Dienstleister finden" },
        { value: "vnb_empfehlung", label: "Weil unser Verteilnetzbetreiber das empfiehlt" },
        { value: "vnb_kann_ggv_nicht", label: "Weil der Verteilnetzbetreiber die GGV nicht umsetzen kann" },
        { value: "finanziell_attraktiver", label: "Weil das finanziell attraktiver ist" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. bestehende Verträge, Erfahrungswerte von Nachbarn..." },
      ],
      visibilityRule: PT_MS_OR_BOTH(),
    },
    {
      id: "implementationApproach",
      type: "multi-select",
      label: "B5. Wollen/wollten Sie das Projekt weitgehend alleine umsetzen, oder planen/planten Sie die Zusammenarbeit mit einem Dienstleister?",
      helpText: "Ein Installateur der PV-Anlage ist hierbei nicht als Dienstleister zu verstehen. Gemeint sind lediglich solche Dienstleister, welche die Umsetzung von GGV/Mieterstrom ermöglichen.",
      options: [
        { value: "alleine", label: "Wir möchten möglichst viel alleine machen - inkl. der Abrechnung mit den Teilnehmenden" },
        { value: "dienstleister_ok", label: "Dienstleister sind OK, solange das preislich attraktiv ist" },
        { value: "dienstleister_alles", label: "Ideal wäre es, wenn sich ein Dienstleister um alles kümmert" },
      ],
    },
  ],
};

// === SECTION 3: Planung Allgemeines - Herausforderungen ===
const SECTION_CHALLENGES: SurveySection = {
  id: "challenges",
  title: "3. Planung: Allgemeines – Herausforderungen",
  description: "Erlebte Schwierigkeiten bei der Umsetzung",
  visibilityRule: PT_GGV_OR_MS(),
  questions: [
    {
      id: "challenges",
      type: "multi-select",
      label: "Gab oder gibt es wesentliche Herausforderungen?",
      options: [
        { value: "keine", label: "Nein, alles läuft gut", exclusive: true },
        { value: "opposition", label: "Manche Parteien im Haus sind gegen das Projekt oder wollen nicht teilnehmen", hasTextField: true, textFieldLabel: "Details", textFieldPlaceholder: "z.B. Bedenken wegen Kosten, Lärm, Optik..." },
        { value: "pv_installation", label: "Technische Probleme mit der Installation der PV-Anlage", hasTextField: true, textFieldLabel: "Was war das Problem?", textFieldPlaceholder: "z.B. Statik, Denkmalschutz, Netzanschluss..." },
        { value: "vnb_blockiert", label: "Der Verteilnetzbetreiber lässt die Umsetzung von GGV / Mieterstrom nicht zu", hasTextField: true, textFieldLabel: "Gründe des Verteilnetzbetreibers", textFieldPlaceholder: "z.B. fehlende IT-Systeme, unklare Zuständigkeiten..." },
        { value: "kosten_zu_hoch", label: "Die Kosten für die Umsetzung der GGV / Mieterstrom sind zu hoch", hasTextField: true, textFieldLabel: "Details zu den Kosten", textFieldPlaceholder: "z.B. Wandlermessung, MSB-Kosten, Abrechnungskosten..." },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldLabel: "Andere Herausforderungen", textFieldPlaceholder: "z.B. rechtliche Unsicherheiten, fehlende Fördermittel..." },
      ],
      optional: true, // Korrektur: optional
    },
    // Korrektur: #71 hierher verschoben (war in Betrieb-Sektion)
    {
      id: "vnbRejectionResponse",
      type: "multi-select",
      label: "Falls Ihr Verteilnetzbetreiber die Umsetzung von GGV oder Mieterstrom nicht oder nur unzureichend unterstützt, wie haben Sie bislang reagiert?", // Korrektur: Label
      options: [
        { value: "kein_grund", label: "Wir haben keinen Grund zur Beschwerde", exclusive: true },
        { value: "unsicher_aufgaben", label: "Wir wissen gar nicht so richtig, was der Verteilnetzbetreiber (und gMSB) eigentlich machen müsste", hasTextField: true, textFieldPlaceholder: "z.B. welche Informationen Ihnen fehlen..." },
        { value: "bnetza", label: "Wir haben uns / unser Dienstleister hat sich bereits an die BNetzA gewendet", hasTextField: true, textFieldPlaceholder: "z.B. BNetzA kontaktiert im Jan. 2025, Antwort ausstehend..." },
        { value: "rechtliche_schritte", label: "Wir erwägen rechtliche Schritte gegen den Verteilnetzbetreiber einzuleiten" },
        { value: "keine_schritte", label: "Wir sind / unser Dienstleister ist bei dem Anschluss anderer Projekte auf den Verteilnetzbetreiber angewiesen, wir sehen daher von rechtlichen Schritten gegenüber dem Verteilnetzbetreiber oder einer Anfrage bei der BNetzA ab" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Wechsel zu anderem Verteilnetzbetreiber, politische Kontakte..." },
      ],
      optional: true,
    },
  ],
};

// === SECTION 4: Planung Modellspezifisch - GGV ===
const SECTION_VNB_PLANNING_GGV: SurveySection = {
  id: "vnb-planning",
  title: "4. Planung: Modellspezifisch – GGV",
  description: "Details zur GGV-Planung mit dem Verteilnetzbetreiber",
  visibilityRule: PT_GGV(),
  questions: [
    {
      id: "vnbExistingProjects",
      type: "single-select",
      label: "C1. Gibt es im Netzgebiet Ihres Verteilnetzbetreibers schon GGV-Projekte?",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "nein", label: "Nein, es gibt sicher noch keine" },
        { value: "ja_mindestens_eins", label: "Ja, es gibt mindestens eins" },
        { value: "ja_viele", label: "Ja, es gibt schon eine ganze Reihe" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Pilotprojekt in Nachbargemeinde..." },
      ],
    },
    {
      id: "vnbContact",
      type: "multi-select",
      label: "C2. Waren Sie schon im Kontakt mit Ihrem Verteilnetzbetreiber?",
      options: [
        { value: "ja_direkt", label: "Ja, wir hatten direkten Kontakt mit dem Verteilnetzbetreiber" },
        { value: "ja_installateur", label: "Ja, über den Installateur/Dienstleister" },
        { value: "nein", label: "Nein, wir hatten noch kein Kontakt" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. über Energieagentur, Verband..." },
      ],
      optional: true,
    },
    {
      id: "vnbResponse",
      type: "single-select",
      label: "C3. Wie ist der aktuelle Stand bezüglich der GGV-Umsetzung mit Ihrem Verteilnetzbetreiber?",
      options: [
        { value: "moeglich_gmssb", label: "Die GGV ist umsetzbar – der Verteilnetzbetreiber/gMSB bietet auch an, den Messstellenbetrieb als gMSB zu übernehmen" },
        { value: "moeglich_wmsb", label: "Die GGV ist umsetzbar – dafür brauchen wir aber zwingend einen wettbewerblichen Messstellenbetreiber (wMSB), da der Verteilnetzbetreiber dies als gMSB nicht umsetzen kann" },
        { value: "nicht_moeglich", label: "Unser Verteilnetzbetreiber sagt, dass eine Umsetzung derzeit nicht möglich ist - auch nicht mit einem wMSB", hasTextField: true, textFieldLabel: "Gründe des Verteilnetzbetreibers", textFieldPlaceholder: "z.B. IT-Systeme nicht bereit, Summenzähler nicht unterstützt..." },
        { value: "keine_antwort", label: "Unser Verteilnetzbetreiber hat auf unsere Anfrage bisher nicht geantwortet", hasTextField: true, textFieldLabel: "Details zur Anfrage", textFieldPlaceholder: "z.B. seit wann, wie und an wen die Anfrage gestellt wurde..." },
        { value: "weiss_nicht", label: "Das wissen wir noch nicht" },
      ],
    },
    {
      id: "vnbMsbTimeline",
      type: "single-select",
      label: "Falls Ihr Verteilnetzbetreiber nicht anbietet, den Messstellenbetrieb selber zu übernehmen: Hat er in Aussicht gestellt, ab wann der grundzuständige Messstellenbetreiber die Verrechnung durchführen kann?",
      options: [
        { value: "ja_12_monate", label: "Ja, innerhalb der nächsten 12 Monate" },
        { value: "ja_spaeter", label: "Ja, in über 12 Monaten" },
        { value: "nicht_gefragt", label: "Nein, das haben wir nicht gefragt" },
        { value: "keine_aussage", label: "Nein, dazu gab es keine Aussage" },
      ],
      visibilityRule: inc('vnbResponse', 'moeglich_wmsb'),
    },
    {
      id: "vnbRejectionTimeline",
      type: "single-select",
      label: "Falls Ihr Verteilnetzbetreiber die Umsetzung bislang vollständig ablehnt: Gibt es schon eine Aussage, ab wann die GGV möglich sein wird?",
      options: [
        { value: "ja_12_monate", label: "Ja, innerhalb der nächsten 12 Monate" },
        { value: "ja_spaeter", label: "Ja, in über 12 Monaten" },
        { value: "nicht_gefragt", label: "Nein, das haben wir nicht gefragt" },
        { value: "keine_aussage", label: "Nein, dazu gab es keine Aussage" },
      ],
      visibilityRule: inc('vnbResponse', 'nicht_moeglich'),
    },
  ],
};

// === SECTION 4: GGV - VNB Online-Unterstützung & Kontakt ===
const SECTION_VNB_SUPPORT: SurveySection = {
  id: "vnb-support",
  title: "Online-Unterstützung des Verteilnetzbetreibers für die GGV",
  description: "Stellt Ihr Verteilnetzbetreiber konkrete Unterstützung für die massentaugliche Umsetzung der GGV online bereit?",
  visibilityRule: PT_GGV(),
  questions: [
    {
      id: "vnbSupportMesskonzept",
      type: "single-select",
      label: "Informationen zum Messkonzept für die GGV",
      optional: true,
      options: [
        { value: "ja", label: "Ja", hasTextField: true, textFieldPlaceholder: "Falls bekannt bitte Weblink zu Messkonzept angeben..." },
        { value: "nein", label: "Nein" },
        { value: "weiss_nicht", label: "Das wissen wir nicht" },
      ],
    },
    {
      id: "vnbSupportFormulare",
      type: "single-select",
      label: "Formulare für die Übermittlung der Teilnehmenden & Aufteilungsschlüssel",
      optional: true,
      options: [
        { value: "ja", label: "Ja", hasTextField: true, textFieldPlaceholder: "Falls bekannt bitte Weblink zu Formularen o.ä. einfügen..." },
        { value: "nein", label: "Nein" },
        { value: "weiss_nicht", label: "Das wissen wir nicht" },
      ],
    },
    {
      id: "vnbSupportPortal",
      type: "single-select",
      label: "Online-Portal für die Übermittlung der Teilnehmenden & Aufteilungsschlüssel",
      optional: true,
      options: [
        { value: "ja", label: "Ja", hasTextField: true, textFieldPlaceholder: "Falls vorhanden bitte Weblink zu öffentlich verfügbaren Informationen hinzufügen" },
        { value: "nein", label: "Nein" },
        { value: "weiss_nicht", label: "Das wissen wir nicht" },
      ],
    },
    {
      id: "vnbSupportOther",
      type: "text",
      label: "Weiteres",
      placeholder: "z.B. persönliche Beratung, Webinare, Infomaterial...",
      optional: true,
    },
    {
      id: "vnbContactHelpful",
      type: "single-select",
      label: "C5. Bietet Ihr Verteilnetzbetreiber eine Kontaktmöglichkeit zur GGV und ist das hilfreich?",
      options: [
        { value: "ja_hilfreich", label: "Ja, es gibt eine Kontaktmöglichkeit (Mailadresse/Telefonnummer) und da wurde uns geholfen" },
        { value: "ja_nicht_hilfreich", label: "Ja, es gibt eine Kontaktmöglichkeit. Die Informationen waren aber wenig hilfreich" },
        { value: "nein", label: "Nein, es gibt keine Kontaktmöglichkeit" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Webseite mit FAQ, aber veraltet..." },
      ],
    },
    {
      id: "vnbPersonalContacts",
      type: "single-select",
      label: "C6. Haben Sie persönliche Kontakte bei Ihrem Verteilnetzbetreiber?",
      options: [
        { value: "ja_bestanden", label: "Ja, es bestanden schon persönliche Kontakte zum Verteilnetzbetreiber" },
        { value: "ja_entstanden", label: "Ja, persönliche Kontakte sind bei der Umsetzung der GGV entstanden" },
        { value: "nein", label: "Nein, es bestehen keine persönlichen Kontakte" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Kontakt über lokale Politik, Veranstaltung..." },
      ],
    },
    {
      id: "vnbSupportRating",
      type: "rating",
      label: "C7. Wie sehr fühlen Sie sich von Ihrem Verteilnetzbetreiber in der Planung der GGV unterstützt?",
      min: 1,
      max: 10,
      minLabel: "bremst aktiv",
      maxLabel: "unterstützt aktiv",
    },
  ],
};

// === SECTION 4: Planung Modellspezifisch - GGV MSB Details ===
const SECTION_VNB_MSB_DETAILS: SurveySection = {
  id: "vnb-msb",
  title: "4. Planung: Modellspezifisch – GGV - MSB Details",
  description: "Wenn der Verteilnetzbetreiber anbietet, den Messstellenbetrieb in der GGV zu übernehmen:", // Korrektur: Neue Überschrift
  visibilityRule: inc('vnbResponse', 'moeglich_gmssb'),
  questions: [
    {
      id: "vnbStartTimeline",
      type: "single-select",
      label: "Ab wann kann der Verteilnetzbetreiber den Messbetrieb (über gMSB) starten?",
      options: [
        { value: "sofort", label: "Sofort, wir sind in der Planung und das sieht gut aus" },
        { value: "zeitnah", label: "Zeitnah, wir warten auf den Start" },
        { value: "12_monate", label: "In den nächsten 12 Monaten" },
        { value: "spaeter", label: "In mehr als 12 Monaten" },
        { value: "weiss_nicht", label: "Das wissen wir nicht" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. abhängig von IT-Umstellung des Verteilnetzbetreibers..." },
      ],
      // Section-Gate (vnbResponse='moeglich_gmssb') macht individuelle Rule überflüssig
    },
    {
      id: "vnbAdditionalCosts",
      type: "single-select",
      label: "Stellt Ihr Verteilnetzbetreiber Ihnen zusätzliche Kosten für Smart Meter aufgrund des 'Einbaus auf Kundenwunsch' in Rechnung?",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "nein", label: "Nein, unser Verteilnetzbetreiber/gMSB verlangt hier keine Zusatzkosten", hasTextField: true, textFieldPlaceholder: "Begründung oder sonstige Informationen falls bekannt..." },
        { value: "ja", label: "Ja, unser Verteilnetzbetreiber/gMSB verlangt dafür Zusatzkosten" },
      ],
      // Section-Gate (vnbResponse='moeglich_gmssb') macht individuelle Rule überflüssig
    },
    {
      id: "vnbAdditionalCostsOneTime",
      type: "number",
      label: "Zusatzkosten 'Einbau auf Kundenwunsch': Einmalbetrag (EUR)",
      placeholder: "z.B. 500",
      optional: true,
      visibilityRule: eq('vnbAdditionalCosts', 'ja'),
      conditionalRequired: "vnbAdditionalCosts='ja' - mindestens Einmalbetrag oder Jährlicher Betrag erforderlich",
    },
    {
      id: "vnbAdditionalCostsYearly",
      type: "number",
      label: "Zusatzkosten 'Einbau auf Kundenwunsch': Jährlicher Betrag (EUR)",
      placeholder: "z.B. 100",
      optional: true,
      visibilityRule: eq('vnbAdditionalCosts', 'ja'),
      conditionalRequired: "vnbAdditionalCosts='ja' - mindestens Einmalbetrag oder Jährlicher Betrag erforderlich",
    },
    {
      id: "vnbFullService",
      type: "single-select",
      label: "C8.1c Einschränkende Bedingung Full-Service-Angebot",
      options: [
        { value: "nur_full_service", label: "Unser Stadtwerk/Verteilnetzbetreiber bietet den Messstellenbetrieb in der GGV nur in Kombination mit einem Full-Service-Angebot an - also inkl. der Stromlieferung durch das Stadtwerk" },
        { value: "auch_ohne", label: "Unser Stadtwerk/Verteilnetzbetreiber bietet die Zusammenarbeit an der GGV auch an, ohne selber den Strom zu verkaufen" },
        { value: "weiss_nicht", label: "Das wissen wir nicht" },
      ],
    },
    {
      id: "vnbDataProvision",
      type: "multi-select",
      label: "C8.1d Wie beabsichtigt Ihr Verteilnetzbetreiber, Ihnen die für die Abrechnung benötigten Daten bereitzustellen?",
      options: [
        { value: "mail_excel", label: "Der Verteilnetzbetreiber/gMSB stellt uns die Daten per Mail als Excel zur Verfügung" },
        { value: "portal_verrechnete_werte", label: "Der Verteilnetzbetreiber/gMSB stellt uns die Daten über ein Online-Portal zur Verfügung, in dem wir die verrechneten Werte runterladen können" },
        { value: "dienstleister_marktkommunikation", label: "Für das Abrufen der Daten brauchen wir einen eigenen Dienstleister, der die Daten über die Marktkommunikation vom Verteilnetzbetreiber/gMSB abruft (Energie-Service-Anbieter / ESA-Dienstleister)", tooltip: "Ein ESA-Dienstleister betreibt eine spezielle Software, die es ihm ermöglicht, Daten vom gMSB abzurufen. Gemäß aktueller gesetzlicher Vorgaben ist der gMSB nicht verpflichtet, die Daten direkt und ohne Zusatzkosten an die Betreiber von GGV-Modellen zu liefern." },
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. API-Schnittstelle geplant..." },
      ],
    },
    {
      id: "vnbDataCost",
      type: "single-select",
      label: "C8.1e Falls Ihr Verteilnetzbetreiber/gMSB die Daten direkt an Sie übermittelt, was wird es kosten?",
      options: [
        { value: "kostenlos", label: "Kostenlos" },
        { value: "weniger_3_eur", label: "Weniger als 3 EUR/Messstelle/Jahr" },
        { value: "mehr_3_eur", label: "Mehr als 3 EUR/Messstelle/Jahr" },
        { value: "keine_auskunft", label: "Dazu gibt es noch keine Auskunft" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Staffelpreise je nach Anzahl Messstellen..." },
      ],
      // Section-Gate (vnbResponse='moeglich_gmssb') macht individuelle Rule überflüssig
    },
    {
      id: "vnbDataCostAmount",
      type: "number",
      label: "Betrag in EUR/Messstelle/Jahr",
      placeholder: "z.B. 5",
      optional: true,
      visibilityRule: eq('vnbDataCost', 'mehr_3_eur'),
    },
    {
      id: "vnbEsaCost",
      type: "single-select",
      label: "C8.1f Falls die Daten von einem Dienstleister über die 'ESA-Marktrolle' abgeholt werden müssen: Verlangt der Verteilnetzbetreiber/gMSB dafür Geld?",
      tooltip: "Für die Bereitstellung der Daten an einen ESA-Dienstleister darf der gMSB dem ESA-Dienstleister derzeit bis zu 30 EUR/Messstelle pro Jahr in Rechnung stellen (§ 35 Absatz 1 Nr. 2 MSBG). Viele gMSB verzichten auf die Erhebung dieser Gebühr.",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "kostenlos", label: "Nein, das ist kostenlos." },
        { value: "weniger_3_eur", label: "Dafür verlangt er weniger (oder gleich) 3 EUR/Messstelle/Jahr" },
        { value: "mehr_3_eur", label: "Dafür verlangt er mehr als 3 EUR/Messstelle/Jahr" },
      ],
      // Section-Gate (vnbResponse='moeglich_gmssb') macht individuelle Rule überflüssig
    },
    {
      id: "vnbEsaCostAmount",
      type: "number",
      label: "Betrag in EUR/Messstelle/Jahr",
      placeholder: "z.B. 5",
      optional: true,
      visibilityRule: eq('vnbEsaCost', 'mehr_3_eur'),
    },
  ],
};

// === SECTION 4: GGV-Messkonzept (sichtbar bei gMSB ODER wMSB) ===
const SECTION_GGV_MESSKONZEPT: SurveySection = {
  id: "ggv-messkonzept",
  title: "GGV-Messkonzept",
  description: "Fragen zum Messkonzept und zur Planungsdauer",
  visibilityRule: { field: 'vnbResponse', op: 'includesAny', values: ['moeglich_gmssb', 'moeglich_wmsb'] },
  questions: [
    {
      id: "vnbWandlermessung",
      type: "single-select",
      label: "C9. Frage zum Detail der technischen Anforderungen des Messkonzeptes: Verlangt Ihr Verteilnetzbetreiber einen neuen, zusätzlichen Zähler direkt hinter dem Netzanschluss des Gebäudes?",
      description: "Erfordert die Installation einer 'Wandlermessung' für > 5.000 EUR",
      options: [
        { value: "ja", label: "Ja" },
        { value: "nein", label: "Nein" },
        { value: "wissen_nicht", label: "Das wissen wir nicht" },
      ],
    },
    {
      id: "vnbWandlermessungComment",
      type: "textarea",
      label: "Ergänzende Informationen zur Wandlermessung: welche Ansprüche stellt Ihr Verteilnetzbetreiber hierzu und womit werden die begründet?",
      placeholder: "z.B. Ansprüche des Verteilnetzbetreibers, Begründung, geschätzte Kosten...",
      optional: true,
      visibilityRule: eqAny('vnbWandlermessung', ['ja', 'wissen_nicht']),
    },
    {
      id: "vnbWandlermessungDocuments",
      type: "file",
      label: "Dokumente zur Wandlermessung hochladen",
      description: "z.B. Messkonzept, Korrespondenz mit dem Verteilnetzbetreiber",
      optional: true,
      visibilityRule: eqAny('vnbWandlermessung', ['ja', 'wissen_nicht']),
    },
    {
      id: "vnbPlanningDuration",
      type: "single-select",
      label: "C10. Wie lange sind Sie bereits in Diskussionen zur Umsetzung der GGV mit Ihrem Verteilnetzbetreiber?",
      options: [
        { value: "unter_2_monate", label: "Unter 2 Monaten" },
        { value: "2_bis_12_monate", label: "Zwischen 2 und 12 Monaten" },
        { value: "ueber_12_monate", label: "Über 12 Monate" },
      ],
    },
    {
      id: "vnbPlanningDurationReasons",
      type: "textarea",
      label: "Woran scheitert die Umsetzung bislang?",
      placeholder: "z.B. fehlende IT-Systeme, unklare Zuständigkeiten, lange Wartezeiten...",
      optional: true,
    },
  ],
};

// === SECTION 5: Betrieb Modellspezifisch - GGV ===
const SECTION_GGV_OPERATION: SurveySection = {
  id: "ggv-operation",
  title: "5. Betrieb: Modellspezifisch – GGV",
  description: "Erfahrungen im laufenden GGV-Betrieb",
  visibilityRule: GGV_IN_OPERATION(),
  questions: [
    {
      id: "operationVnbDuration",
      type: "single-select",
      label: "D0. Wie lange hat die Abstimmung mit dem Verteilnetzbetreiber zur GGV gedauert, von der ersten Kontaktaufnahme bis zur Klärung aller Fragen bzw. Start der Belieferung?",
      options: [
        { value: "unter_2_monate", label: "Unter 2 Monaten" },
        { value: "2_bis_12_monate", label: "Zwischen 2 und 12 Monaten" },
        { value: "ueber_12_monate", label: "Über 12 Monate" },
      ],
    },
    {
      id: "operationVnbDurationReasons",
      type: "textarea",
      label: "Falls es lange dauerte: Was war das größte Problem?", // Korrektur: Label
      placeholder: "z.B. langwierige Abstimmung, fehlende Prozesse beim Verteilnetzbetreiber...",
      optional: true,
    },
    {
      id: "operationWandlermessung",
      type: "single-select",
      label: "D1. Hat Ihr Verteilnetzbetreiber einen neuen zusätzlichen Zähler direkt hinter dem Netzanschluss des Gebäudes verlangt (Wandlermessung > 5.000 EUR)?",
      options: [
        { value: "ja", label: "Ja" },
        { value: "nein", label: "Nein" },
        { value: "nein_freiwillig", label: "Nein, aber wir haben den freiwillig eingebaut", hasTextField: true, textFieldLabel: "Erläuterung", textFieldPlaceholder: "z.B. für bessere Datenqualität, Zukunftssicherheit..." }, // Korrektur: Neue Option
        { value: "wissen_nicht", label: "Das wissen wir nicht" },
      ],
    },
    {
      id: "operationWandlermessungComment",
      type: "textarea",
      label: "Ergänzende Informationen zur Wandlermessung",
      placeholder: "z.B. Kosten, Begründung des Verteilnetzbetreibers, technische Details...",
      optional: true,
      visibilityRule: eq('operationWandlermessung', 'ja'),
    },
    // Korrektur: Sammelüberfrage vor #52-54
    {
      id: "operationMsbProvider",
      type: "single-select",
      label: "D2.1 Messstellenbetrieb: Wer baut die Smart Meter ein und betreibt sie?",
      description: "Wer ist in dem Projekt der Messstellenbetreiber, wer führt die Aufteilung der PV-Stromerzeugung durch und von wem erhalten Sie die für die Abrechnung mit den Teilnehmenden erforderlichen Daten?",
      options: [
        { value: "gmsb", label: "Unser lokaler gMSB (meist das gleiche Unternehmen wie der Verteilnetzbetreiber)" },
        { value: "wmsb", label: "Ein wMSB" },
        { value: "weiss_nicht", label: "Das wissen wir nicht" },
      ],
    },
    {
      id: "operationAllocationProvider",
      type: "single-select",
      label: "D2.2 Aufteilung der PV-Stromerzeugung auf die Teilnehmenden: Wer verrechnet die Messwerte und ordnet die Erzeugung je 15-Minuten-Intervall auf die Teilnehmenden zu?", // Korrektur: Label
      options: [
        { value: "gmsb", label: "Unser lokaler gMSB (meist das gleiche Unternehmen wie der Verteilnetzbetreiber)" }, // Korrektur: Label
        { value: "wmsb", label: "Ein wMSB" },
        { value: "sonstiges", label: "Ein Dienstleister / Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Name des Dienstleisters..." }, // Korrektur: Label
        { value: "weiss_nicht", label: "Das wissen wir nicht" },
      ],
    },
    {
      id: "operationDataProvider",
      type: "single-select",
      label: "D2.3 Übermittlung der errechneten Strommengen je Teilnehmer: Wer stellt Ihnen die errechneten Werte (zugeordneten Erzeugungsmengen) zur Verfügung, damit Sie eine Abrechnung machen können?", // Korrektur: Label
      options: [
        { value: "gmsb", label: "Unser lokaler gMSB (meist das gleiche Unternehmen wie der Verteilnetzbetreiber)" },
        { value: "wmsb", label: "Ein wMSB" },
        { value: "dienstleister", label: "ESA-Dienstleister / Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Name des ESA-Dienstleisters..." }, // Korrektur: Neue Option
        { value: "abrechnung_dienstleister", label: "Wir benötigen keine detaillierten Werte - die Abrechnung wird direkt von einem Dienstleister durchgeführt." }, // Korrektur: Neue Option
        { value: "weiss_nicht", label: "Das wissen wir nicht" },
      ],
    },
    {
      id: "operationMsbDuration",
      type: "single-select",
      label: "D3.1 Wie lange hat es gedauert von Bestellung bis zum Einbau der Smart Meter durch den Verteilnetzbetreiber/gMSB?", // Korrektur: Label
      options: [
        { value: "wissen_nicht", label: "Weiß ich nicht" },
        { value: "schnell", label: "Das ging problemlos und schnell" },
        { value: "4_monate", label: "Ca. 4 Monate (gesetzlich vorgegebene Frist)" },
        { value: "laenger", label: "Deutlich länger als 4 Monate" },
      ],
      visibilityRule: eq('operationMsbProvider', 'gmsb'),
    },
    {
      id: "operationMsbAdditionalCosts",
      type: "single-select",
      label: "D3.2 Stellt der Verteilnetzbetreiber/gMSB zusätzliche Kosten für den 'Einbau auf Kundenwunsch' in Rechnung?",
      options: [
        { value: "nein", label: "Nein, unser Verteilnetzbetreiber/gMSB verlangt hier keine Zusatzkosten" },
        { value: "ja", label: "Ja, unser Verteilnetzbetreiber/gMSB verlangt dafür Zusatzkosten" },
        { value: "wissen_nicht", label: "Wissen wir nicht" },
      ],
      visibilityRule: eq('operationMsbProvider', 'gmsb'),
    },
    {
      id: "operationMsbAdditionalCostsOneTime",
      type: "number",
      label: "Einmalbetrag (EUR)",
      placeholder: "z.B. 500",
      optional: true,
      visibilityRule: eq('operationMsbAdditionalCosts', 'ja'),
      conditionalRequired: "operationMsbAdditionalCosts='ja' - mindestens Einmalbetrag oder Jährlicher Betrag erforderlich",
    },
    {
      id: "operationMsbAdditionalCostsYearly",
      type: "number",
      label: "Jährlicher Betrag (EUR)",
      placeholder: "z.B. 100",
      optional: true,
      visibilityRule: eq('operationMsbAdditionalCosts', 'ja'),
      conditionalRequired: "operationMsbAdditionalCosts='ja' - mindestens Einmalbetrag oder Jährlicher Betrag erforderlich",
    },
    // Korrektur: operationAllocationWho GELÖSCHT (identisch mit #54)
    {
      id: "operationDataFormat",
      type: "single-select",
      label: "D5.1 Wie erhalten Sie die errechneten Daten von Ihrem Verteilnetzbetreiber/gMSB?", // Korrektur: Label
      options: [
        { value: "mail_excel", label: "Der Verteilnetzbetreiber/gMSB stellt uns die Daten per Mail als Excel zur Verfügung" },
        { value: "portal_verrechnete_werte", label: "Der Verteilnetzbetreiber/gMSB stellt uns die Daten über ein Online-Portal zur Verfügung, in dem wir die verrechneten Werte runterladen können" },
        { value: "portal_alle_messwerte", label: "Der Verteilnetzbetreiber/gMSB stellt uns die Daten über ein Online-Portal zur Verfügung, in dem wir auf alle Messwerte der Teilnehmer zugreifen können, um diese selber zu verrechnen" },
        { value: "dienstleister_marktkommunikation", label: "Für das Abrufen der Daten brauchen wir einen eigenen Dienstleister, der die Daten über die Marktkommunikation vom Verteilnetzbetreiber/gMSB abruft" },
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. API-Schnittstelle, manuelle Übermittlung..." },
      ],
      visibilityRule: eq('operationMsbProvider', 'gmsb'), // Fix Issue 1: Nur sichtbar wenn gMSB gewählt
    },
    {
      id: "operationDataCost",
      type: "single-select",
      label: "Wie viel kostet die direkte Bereitstellung der verrechneten Werte durch Ihren Verteilnetzbetreiber/gMSB?",
      description: "Dabei sind die jährlichen Kosten für die Bereitstellung der Smart Meter nicht zu berücksichtigen.",
      options: [
        { value: "kostenlos", label: "Kostenlos" },
        { value: "weniger_3_eur", label: "Dauerhaft weniger (oder gleich) 3 EUR/Messstelle pro Jahr" },
        { value: "mehr_3_eur", label: "Dauerhaft mehr als 3 EUR/Messstelle pro Jahr" },
        { value: "aktuell_kostenlos", label: "Aktuell kostenlos, das wird sich aber ändern" },
        { value: "weiss_nicht", label: "Das wissen wir nicht" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Staffelpreise, Einmalkosten..." },
      ],
      visibilityRule: eq('operationDataProvider', 'gmsb'),
    },
    {
      id: "operationDataCostAmount",
      type: "number",
      label: "Betrag in EUR/Messstelle/Jahr",
      placeholder: "z.B. 5",
      optional: true,
      visibilityRule: eq('operationDataCost', 'mehr_3_eur'),
    },
    {
      id: "operationEsaCost",
      type: "single-select",
      label: "D6. Falls Ihr Dienstleister die Werte vom Verteilnetzbetreiber/gMSB für Sie abruft (ESA-Marktrolle), verlangt der Verteilnetzbetreiber/gMSB dafür Geld?",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "kostenlos", label: "Nein, das macht er umsonst" },
        { value: "weniger_3_eur", label: "Ja, dafür verlangt er weniger (oder gleich) 3 EUR/Messstelle/Jahr" },
        { value: "mehr_3_eur", label: "Ja, dafür verlangt er mehr als 3 EUR/Messstelle/Jahr" },
      ],
      visibilityRule: eq('operationMsbProvider', 'gmsb'), // Fix Issue 2: gMSB-Pfad korrekt an operationMsbProvider binden
    },
    {
      id: "operationEsaCostAmount",
      type: "number",
      label: "Betrag in EUR/Messstelle/Jahr",
      placeholder: "z.B. 5",
      optional: true,
      visibilityRule: eq('operationEsaCost', 'mehr_3_eur'),
    },
    {
      id: "operationSatisfactionRating",
      type: "rating",
      label: "D7. Wie zufrieden sind Sie mit Ihrem Verteilnetzbetreiber bei der Umsetzung des Projektes?",
      min: 1,
      max: 10,
      minLabel: "Unser Verteilnetzbetreiber will das eigentlich lieber verhindern",
      maxLabel: "Unser Verteilnetzbetreiber möchte das wirklich mit uns umsetzen",
    },
  ],
};

// === SECTION 5: Betrieb Modellspezifisch - GGV Dienstleister ===
const SECTION_SERVICE_PROVIDER: SurveySection = {
  id: "service-provider",
  title: "5. Betrieb: Modellspezifisch – Dienstleister (GGV)",
  description: "Feedback zu Dienstleistern & Reaktionen",
  visibilityRule: or(GGV_IN_OPERATION(), MS_IN_OPERATION()),
  questions: [
    {
      id: "serviceProviderName",
      type: "text",
      label: "D8. Mit welchem Dienstleister arbeiten Sie zusammen?",
      placeholder: "Name des Dienstleisters",
      optional: true,
    },
    {
      id: "serviceProviderServices",
      type: "multi-select",
      label: "Welche Leistungen erbringt Ihr Dienstleister?",
      helpText: "Wählen Sie alle zutreffenden Leistungen aus.",
      optional: true,
      visibilityRule: filled('serviceProviderName'),
      options: [
        // Gruppe 1: Ohne eigenen Messstellenbetrieb (nutzt gMSB)
        { value: "data_provision", label: "Datenbereitstellung (ESA-Zugang zu gMSB-Werten)" },
        { value: "invoicing_prep", label: "Datenbereitstellung und Vorbereitung der Abrechnung (durchzuführen durch den Betreiber)" },
        { value: "full_settlement", label: "Vollständige Abrechnung mit Teilnehmenden (im Auftrag des Betreibers oder auf eigenes Risiko)" },
        // Gruppe 2: Mit eigenem Messstellenbetrieb (wMSB)
        { value: "metering_full", label: "Messstellenbetrieb inkl. Datenbereitstellung" },
        { value: "metering_invoicing_prep", label: "Messstellenbetrieb inkl. Datenbereitstellung und Vorbereitung der Abrechnung (durchzuführen durch den Betreiber)" },
        { value: "metering_full_settlement", label: "Messstellenbetrieb und vollständige Abrechnung mit Teilnehmenden (im Auftrag des Betreibers oder auf eigenes Risiko)" },
        { value: "beratung", label: "Beratung für Immobilieneigentümer zur Umsetzung von GGV/Mieterstrom" },
        { value: "software", label: "Software / IT-Plattform für Dienstleister, MSB und/oder VNB" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. weitere Leistungen..." },
      ],
    },
    {
      id: "serviceProviderComments",
      type: "textarea",
      label: "Erfahrungsbericht zum Dienstleister (max. 2000 Zeichen)",
      placeholder: "z.B. Beratungsqualität, Reaktionszeiten, Transparenz der Abrechnung, was lief gut, was könnte besser sein?",
      optional: true,
      max: 2000,
      visibilityRule: filled('serviceProviderName'),
    },
    {
      id: "serviceProvider2Name",
      type: "text",
      label: "Dienstleister 2 (optional)",
      placeholder: "Name des zweiten Dienstleisters",
      optional: true,
      visibilityRule: filled('serviceProviderName'),
    },
    {
      id: "serviceProvider2Services",
      type: "multi-select",
      label: "Welche Leistungen erbringt Ihr zweiter Dienstleister?",
      helpText: "Wählen Sie alle zutreffenden Leistungen aus.",
      optional: true,
      visibilityRule: filled('serviceProvider2Name'),
      options: [
        { value: "data_provision", label: "Datenbereitstellung (ESA-Zugang zu gMSB-Werten)" },
        { value: "invoicing_prep", label: "Datenbereitstellung und Vorbereitung der Abrechnung (durchzuführen durch den Betreiber)" },
        { value: "full_settlement", label: "Vollständige Abrechnung mit Teilnehmenden (im Auftrag des Betreibers oder auf eigenes Risiko)" },
        { value: "metering_full", label: "Messstellenbetrieb inkl. Datenbereitstellung" },
        { value: "metering_invoicing_prep", label: "Messstellenbetrieb inkl. Datenbereitstellung und Vorbereitung der Abrechnung (durchzuführen durch den Betreiber)" },
        { value: "metering_full_settlement", label: "Messstellenbetrieb und vollständige Abrechnung mit Teilnehmenden (im Auftrag des Betreibers oder auf eigenes Risiko)" },
        { value: "beratung", label: "Beratung für Immobilieneigentümer zur Umsetzung von GGV/Mieterstrom" },
        { value: "software", label: "Software / IT-Plattform für Dienstleister, MSB und/oder VNB" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. weitere Leistungen..." },
      ],
    },
    {
      id: "serviceProvider2Comments",
      type: "textarea",
      label: "Kommentare zu Dienstleister 2",
      placeholder: "Was lief gut? Was könnte besser sein?",
      optional: true,
      visibilityRule: filled('serviceProvider2Name'),
    },
  ],
};

// === SECTION 4: Planung Modellspezifisch - Mieterstrom ===
const SECTION_MIETERSTROM_PLANNING: SurveySection = {
  id: "mieterstrom-planning",
  title: "4. Planung: Modellspezifisch – Mieterstrom",
  description: "Details zu Mieterstrom-Projekten",
  visibilityRule: PT_MS(),
  questions: [
    {
      id: "mieterstromSummenzaehler",
      type: "single-select",
      label: "M1. Möchten Sie Mieterstrom mit virtuellem oder mit physikalischem Summenzähler umsetzen?",
      options: [
        { value: "virtuell", label: "Mit virtuellem Summenzähler" },
        { value: "physikalisch", label: "Mit physikalischem Summenzähler" },
        { value: "kein_unterschied", label: "Wir kennen den Unterschied nicht" },
        { value: "keine_praeferenz", label: "Wir haben keine Präferenz" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Kombination beider Modelle..." },
      ],
    },
    // Korrektur: mieterstromChallenges (#73) GELÖSCHT
    {
      id: "mieterstromExistingProjects",
      type: "single-select",
      label: "M3. Gibt es im Netzgebiet Ihres Verteilnetzbetreibers schon Mieterstrom-Projekte?",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "nein", label: "Nein, es gibt sicher noch keine" },
        { value: "ja_mindestens_eins", label: "Ja, es gibt mindestens eins" },
        { value: "ja_viele", label: "Ja, es gibt schon eine ganze Reihe" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Pilotprojekt in Nachbarschaft..." },
      ],
    },
    {
      id: "mieterstromExistingProjectsVirtuell",
      type: "single-select",
      label: "M4. Gibt es im Netzgebiet Ihres Verteilnetzbetreibers schon Mieterstrom-Projekte mit virtuellem Summenzähler?",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "nein", label: "Nein, es gibt sicher noch keine" },
        { value: "ja_mindestens_eins", label: "Ja, es gibt mindestens eins" },
        { value: "ja_viele", label: "Ja, es gibt schon eine ganze Reihe" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Pilotprojekt mit wMSB bekannt..." },
      ],
    },
    {
      id: "mieterstromVnbContact",
      type: "multi-select", // Korrektur: gleiche Optionen wie #26 (vnbContact)
      label: "M5. Waren Sie schon im Kontakt mit Ihrem Verteilnetzbetreiber?",
      options: [
        { value: "ja_direkt", label: "Ja, wir hatten direkten Kontakt mit dem Verteilnetzbetreiber" },
        { value: "ja_installateur", label: "Ja, über den Installateur/Dienstleister" },
        { value: "nein", label: "Nein, noch kein Kontakt" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. über Energieagentur, Verband..." },
      ],
      optional: true,
    },
    {
      id: "mieterstromVirtuellAllowed",
      type: "single-select",
      label: "Lässt Ihr Verteilnetzbetreiber die Umsetzung des sogenannten 'virtuellen Summenzählers' durch einen wettbewerblichen MSB zu?", // Korrektur: Label
      options: [
        { value: "ja", label: "Ja" },
        { value: "nein", label: "Nein" },
        { value: "wissen_nicht", label: "Wissen wir nicht" }, // Korrektur: Neue Option
      ],
      // Korrektur: Sichtbarkeit immer (war: nur bei summenzaehler='virtuell')
    },
    // Korrektur: Neue Frage 4-MS-Virtuell-DeniedReason
    {
      id: "mieterstromVirtuellDeniedReason",
      type: "textarea",
      label: "Warum lässt Ihr Verteilnetzbetreiber den virtuellen Summenzähler nicht zu?",
      placeholder: "z.B. technische Einschränkungen, fehlende IT-Systeme beim Verteilnetzbetreiber...",
      optional: true,
      visibilityRule: eq('mieterstromVirtuellAllowed', 'nein'),
    },
    {
      id: "mieterstromVirtuellDeniedDocuments",
      type: "file",
      label: "Dokumente zum virtuellen Summenzähler hochladen",
      description: "z.B. Korrespondenz mit dem Verteilnetzbetreiber, Ablehnungsschreiben",
      optional: true,
      visibilityRule: eq('mieterstromVirtuellAllowed', 'nein'),
    },
    {
      id: "mieterstromVirtuellWandlermessung",
      type: "single-select",
      label: "M7. Wenn Ihr Verteilnetzbetreiber/gMSB die Umsetzung des 'virtuellen Summenzählers' zulässt, verlangt er dennoch den Einbau eines Zählers direkt am Hausanschlusspunkt (Wandlermessung, Kosten >5.000 EUR)?",
      options: [
        { value: "nein", label: "Nein" },
        { value: "ja", label: "Ja", hasTextField: true, textFieldPlaceholder: "z.B. Verteilnetzbetreiber verlangt Wandlermessung trotz virtuellem Modell..." },
        { value: "weiss_nicht", label: "Das wissen wir nicht" },
      ],
      visibilityRule: eq('mieterstromVirtuellAllowed', 'ja'),
    },
    // Korrektur: Upload bei ja
    {
      id: "mieterstromVirtuellWandlermessungDocuments",
      type: "file",
      label: "Dokumente zur Wandlermessung hochladen",
      description: "z.B. Messkonzept, Korrespondenz",
      optional: true,
      visibilityRule: eq('mieterstromVirtuellWandlermessung', 'ja'),
    },
    {
      id: "mieterstromVnbResponse",
      type: "multi-select",
      label: "M8. Welche Aussage zur Rückmeldung vom Verteilnetzbetreiber trifft zu?",
      options: [
        { value: "moeglich_gmsb", label: "Wir können Mieterstrom umsetzen, der Verteilnetzbetreiber/gMSB bietet an, dies als Messstellenbetreiber zu unterstützen" }, // Korrektur: Label
        { value: "moeglich_wmsb", label: "Wir können Mieterstrom umsetzen, müssen aber einen wettbewerblichen Messstellenbetreiber beauftragen" },
        { value: "keine_antwort", label: "Unser Verteilnetzbetreiber hat die Anfrage bisher nicht beantwortet" },
        { value: "nicht_moeglich", label: "Unser Verteilnetzbetreiber sagt, dass eine Umsetzung in seinem Netzgebiet bislang nicht möglich ist", hasTextField: true, textFieldPlaceholder: "z.B. IT-Systeme nicht bereit, keine Erfahrung..." }, // Korrektur: Label + Textfeld
      ],
      optional: true,
    },
    // Korrektur: mieterstromVnbSupport (#80) GELÖSCHT
    // Korrektur: mieterstromVnbHelpful (#81) GELÖSCHT
    // Korrektur: mieterstromPersonalContacts (#82) GELÖSCHT
    {
      id: "mieterstromSupportRating",
      type: "rating",
      label: "Wie sehr fühlen Sie sich von Ihrem Verteilnetzbetreiber in der Planung von Mieterstrom unterstützt?",
      min: 1,
      max: 10,
      minLabel: "bremst aktiv",
      maxLabel: "unterstützt aktiv",
    },
  ],
};

// === SECTION 4: Planung Modellspezifisch - Mieterstrom VNB Angebot ===
const SECTION_MIETERSTROM_VNB_OFFER: SurveySection = {
  id: "mieterstrom-vnb-offer",
  title: "4. Planung: Modellspezifisch – Mieterstrom - Verteilnetzbetreiber Angebot",
  description: "Details zum MSB-Angebot des Verteilnetzbetreibers für Mieterstrom",
  visibilityRule: inc('mieterstromVnbResponse', 'moeglich_gmsb'),
  questions: [
    {
      id: "mieterstromFullService",
      type: "single-select",
      label: "Bietet der Verteilnetzbetreiber/gMSB den Messstellenbetrieb im Mieterstrom grundsätzlich immer an, oder nur in Kombination mit einem Full-Service-Angebot?", // Korrektur: Label
      options: [
        { value: "nur_full_service", label: "Unser Stadtwerk/Verteilnetzbetreiber bietet den Messstellenbetrieb nur in Kombination mit einem Full-Service-Angebot an - also inkl. der Stromlieferung durch das Stadtwerk." },
        { value: "auch_ohne", label: "Unser Stadtwerk/Verteilnetzbetreiber bietet dies auch an, ohne selber Strom zu liefern." }, // Korrektur: Label
        { value: "weiss_nicht", label: "Das wissen wir nicht" },
      ],
    },
    {
      id: "mieterstromMsbCosts",
      type: "single-select",
      label: "MP1b. Stellt Ihr Verteilnetzbetreiber/gMSB zusätzliche Kosten für einen 'Einbau auf Kundenwunsch' in Rechnung?",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "nein", label: "Nein, unser Verteilnetzbetreiber/gMSB verlangt hier keine Zusatzkosten" },
        { value: "ja", label: "Ja, unser Verteilnetzbetreiber/gMSB verlangt dafür Zusatzkosten" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Pauschalangebot, Staffelpreise..." },
      ],
    },
    {
      id: "mieterstromMsbCostsOneTime",
      type: "number",
      label: "Einmalbetrag (EUR)",
      placeholder: "z.B. 500",
      optional: true,
      visibilityRule: eq('mieterstromMsbCosts', 'ja'),
      conditionalRequired: "mieterstromMsbCosts='ja' - mindestens Einmalbetrag oder Jährlicher Betrag erforderlich",
    },
    {
      id: "mieterstromMsbCostsYearly",
      type: "number",
      label: "Jährlicher Betrag (EUR)",
      placeholder: "z.B. 100",
      optional: true,
      visibilityRule: eq('mieterstromMsbCosts', 'ja'),
      conditionalRequired: "mieterstromMsbCosts='ja' - mindestens Einmalbetrag oder Jährlicher Betrag erforderlich",
    },
    {
      id: "mieterstromModelChoice",
      type: "single-select",
      label: "Welche Umsetzungsmodelle bietet Ihr Verteilnetzbetreiber/gMSB als Messstellenbetreiber an?", // Korrektur: Label
      options: [
        { value: "virtuell", label: "Einen 'virtuellen Summenzähler' mit Smart Metern - die Installation einer Wandlermessung am Hausanschluss ('physikalischer Summenzähler' für >5.000 EUR) bleibt uns damit erspart" },
        { value: "physikalisch", label: "Nur das sogenannte 'physikalische Summenzählermodell' (erfordert einen 'physikalischen Summenzähler' für >5.000 EUR)" }, // Korrektur: Label
        { value: "beide", label: "Beide Modelle" }, // Korrektur: Neue Option
        { value: "weiss_nicht", label: "Das wissen wir nicht" },
      ],
    },
    {
      id: "mieterstromDataProvision",
      type: "single-select",
      label: "MP1d. Wie stellt der Verteilnetzbetreiber/gMSB Ihnen die Daten zur Verfügung wenn er den Messstellenbetrieb durchführt?", // Korrektur: Label
      options: [
        { value: "direkt_guenstig", label: "Der Verteilnetzbetreiber/gMSB stellt uns die Daten direkt zur Verfügung (Excel-Listen, Online-Portal o.ä.) – kostenlos oder für weniger (oder gleich) 3 EUR/Messstelle/Jahr" }, // Korrektur: Label
        { value: "direkt_teuer", label: "Der Verteilnetzbetreiber/gMSB stellt uns die Daten direkt zur Verfügung (Excel-Listen, Online-Portal o.ä.) - verlangt dafür mehr als 3 EUR/Messstelle/Jahr" },
        { value: "marktkommunikation", label: "Der Verteilnetzbetreiber/gMSB stellt die Daten lediglich über die Marktkommunikation zur Verfügung, wir brauchen einen Dienstleister für das Abrufen der Daten" },
        { value: "weiss_nicht", label: "Das wissen wir nicht" },
      ],
    },
  ],
};

// === SECTION 5: Betrieb Modellspezifisch - Mieterstrom ===
const SECTION_MIETERSTROM_OPERATION: SurveySection = {
  id: "mieterstrom-operation",
  title: "5. Betrieb: Modellspezifisch – Mieterstrom",
  description: "Erfahrungen im laufenden Mieterstrom-Betrieb",
  visibilityRule: MS_IN_OPERATION(),
  questions: [
    {
      id: "mieterstromVnbRole",
      type: "single-select",
      label: "MB1. Welche Rolle übernimmt der Verteilnetzbetreiber in Ihrem Mieterstrom-Projekt?",
      options: [
        { value: "keine", label: "Gar keine, wir machen das mit einem wettbewerblichen Messstellenbetreiber" },
        { value: "msb_dienstleister", label: "Der Verteilnetzbetreiber/gMSB ist Messstellenbetreiber, ein Dienstleister stellt uns die Daten für die Abrechnung zur Verfügung" },
        { value: "msb_direkt", label: "Der Verteilnetzbetreiber/gMSB ist Messstellenbetreiber und stellt uns die Daten für die Abrechnung direkt zur Verfügung" },
        { value: "full_service", label: "Das Stadtwerk (oder ein mit dem Verteilnetzbetreiber verbundenes Unternehmen) übernimmt das ganze Projekt, inkl. der gesamten Stromlieferung und Abrechnung mit den Teilnehmenden" },
        { value: "weiss_nicht", label: "Das wissen wir nicht" },
      ],
    },
    {
      id: "mieterstromVnbDuration",
      type: "single-select",
      label: "MB2. Wie lange hat die Abstimmung mit dem Verteilnetzbetreiber zum Mieterstrom gedauert?",
      options: [
        { value: "unter_2_monate", label: "Unter 2 Monaten" },
        { value: "2_bis_12_monate", label: "Zwischen 2 und 12 Monaten" },
        { value: "ueber_12_monate", label: "Über 12 Monate" },
      ],
    },
    {
      id: "mieterstromVnbDurationReasons",
      type: "textarea",
      label: "Falls es lange dauerte: Was war das große Problem?",
      placeholder: "z.B. langwierige Abstimmung, fehlende Prozesse beim Verteilnetzbetreiber...",
      optional: true,
    },
    {
      id: "mieterstromWandlermessung",
      type: "single-select",
      label: "MB3. Hat Ihr Verteilnetzbetreiber einen neuen zusätzlichen Zähler direkt hinter dem Netzanschluss des Gebäudes verlangt (Wandlermessung >5.000 EUR)?",
      options: [
        { value: "nein", label: "Nein" },
        { value: "ja", label: "Ja", hasTextField: true, textFieldPlaceholder: "z.B. Kosten, Begründung des Verteilnetzbetreibers..." },
        { value: "wissen_nicht", label: "Das wissen wir nicht" },
      ],
    },
    // Korrektur: mieterstromMsbProvider (#93) GELÖSCHT
    // Korrektur: mieterstromDataProvider (#94) GELÖSCHT
    {
      id: "mieterstromMsbInstallDuration",
      type: "single-select",
      label: "MB5.1 Wie lange hat es gedauert von Bestellung bis zum Einbau der Smart Meter?",
      options: [
        { value: "wissen_nicht", label: "Weiß ich nicht" },
        { value: "schnell", label: "Das ging problemlos und schnell" },
        { value: "4_monate", label: "Die 4 Monate gesetzliche Frist wurden gerade so eingehalten" },
        { value: "laenger", label: "Die Frist von 4 Monaten wurde deutlich überschritten" },
      ],
    },
    {
      id: "mieterstromOperationCosts",
      type: "single-select",
      label: "MB5.2 Stellt der Verteilnetzbetreiber/gMSB Ihnen für den Betrieb der Smart Meter zusätzliche Kosten in Rechnung?",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "nein", label: "Nein, unser Verteilnetzbetreiber/gMSB verlangt hier keine Zusatzkosten" },
        { value: "ja", label: "Ja, unser Verteilnetzbetreiber/gMSB verlangt dafür Zusatzkosten" },
      ],
    },
    {
      id: "mieterstromOperationCostsOneTime",
      type: "number",
      label: "Einmalbetrag (EUR)",
      placeholder: "z.B. 500",
      optional: true,
      visibilityRule: eq('mieterstromOperationCosts', 'ja'),
      conditionalRequired: "mieterstromOperationCosts='ja' - mindestens Einmalbetrag oder Jährlicher Betrag erforderlich",
    },
    {
      id: "mieterstromOperationCostsYearly",
      type: "number",
      label: "Jährlicher Betrag (EUR)",
      placeholder: "z.B. 100",
      optional: true,
      visibilityRule: eq('mieterstromOperationCosts', 'ja'),
      conditionalRequired: "mieterstromOperationCosts='ja' - mindestens Einmalbetrag oder Jährlicher Betrag erforderlich",
    },
    // Korrektur: mieterstromOperationSatisfaction (#97) GELÖSCHT
    {
      id: "mieterstromRejectionResponse",
      type: "multi-select",
      label: "MD1. Falls Ihr Verteilnetzbetreiber die Umsetzung von Mieterstrom nicht oder nur unzureichend anbietet/durchführt, wie haben Sie bislang reagiert?",
      options: [
        { value: "bnetza", label: "Wir haben uns bereits an die BNetzA gewendet" },
        { value: "rechtliche_schritte", label: "Wir erwägen, rechtliche Schritte einzuleiten" },
        { value: "keine_schritte", label: "Wir sind bei dem Anschluss anderer Projekte auf den Verteilnetzbetreiber angewiesen und sehen von rechtlichen Schritten gegenüber dem Verteilnetzbetreiber ab" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Wechsel des Dienstleisters, alternative Lösungen..." },
      ],
      optional: true,
    },
    {
      id: "mieterstromInfoSources",
      type: "textarea",
      label: "MD2. Welche Informationsquellen fanden Sie besonders hilfreich bei der Suche nach Informationen zu Mieterstrom?",
      placeholder: "z.B. Webseiten, Beratungsstellen, Netzwerke...",
      optional: true,
    },
    {
      id: "mieterstromExperiences",
      type: "textarea",
      label: "MD3. Welche Erfahrungen möchten Sie noch teilen?",
      placeholder: "z.B. Tipps für andere Projektinitiatoren, Lessons Learned...",
      optional: true,
    },
  ],
};

// === SECTION 4: Planung Modellspezifisch - Energy Sharing ===
const SECTION_ENERGY_SHARING: SurveySection = {
  id: "energy-sharing",
  title: "4. Planung: Modellspezifisch – Energy Sharing",
  description: "Details zu Energy Sharing",
  visibilityRule: PT_ES(),
  questions: [
    {
      id: "esStatus",
      type: "single-select",
      label: "E1. Wo stehen Sie aktuell mit dem Projekt?",
      options: [
        { value: "in_betrieb_vollversorgung", label: "Unser Energy-Sharing Projekt ist schon in Betrieb - Vollversorgungsmodell" },
        { value: "in_betrieb_42c", label: "Unser Energy-Sharing Projekt ist schon in Betrieb - nach §42c EnWG" },
        { value: "planung_bereit", label: "Wir sind in der Planung und wollen loslegen sobald es geht" },
        { value: "info_sammeln", label: "Wir haben grundsätzliches Interesse, sammeln derzeit Infos" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Genehmigungsverfahren läuft, Pilotprojekt..." },
      ],
      optional: true,
    },
    {
      id: "esInOperationDetails",
      type: "textarea",
      label: "E2a. Welche Erzeugungsanlagen sind eingebunden und wer wird beliefert?",
      placeholder: "z.B. 30 kWp PV-Dachanlage, 20 Haushalte, seit März 2025...",
      optional: true,
      visibilityRule: ES_IN_OPERATION(),
    },
    {
      id: "esOperatorDetails",
      type: "textarea",
      label: "E2b. Wer betreibt die Anlagen, wie erfolgt die Zuteilung der Strommengen, wer übernimmt die Abrechnung?",
      placeholder: "z.B. Genossenschaft betreibt, Zuteilung über wMSB, Abrechnung durch Dienstleister...",
      optional: true,
      visibilityRule: ES_IN_OPERATION(),
    },
    {
      id: "esPlantType",
      type: "multi-select",
      label: "E3. Welche Art von Anlage möchten Sie für das Energy Sharing Projekt nutzen (oder nutzen sie bereits)?", // Korrektur: Label
      
      options: [
        { value: "wind", label: "Windenergieanlage" },
        { value: "buergerwind", label: "Bürgerwindanlage" },
        { value: "pv_freiflaeche", label: "PV-Freiflächenanlage" },
        { value: "buergersolar", label: "Bürgersolaranlage" },
        { value: "pv_efh", label: "PV-Dachanlage auf Einfamilienhaus" },
        { value: "pv_mfh", label: "PV-Dachanlage auf Mehrfamilienhaus" },
        { value: "pv_nichtwohn", label: "PV-Dachanlage auf einem Nicht-Wohngebäude" },
      ],
      // Korrektur: Sichtbarkeit immer (war: nur bei Planung)
    },
    {
      id: "esProjectScope",
      type: "single-select",
      label: "Planen Sie eine einzelne Anlage zu nutzen oder mehrere Anlagen einzubinden (oder tun Sie dies bereits)?", // Korrektur: Label
      options: [
        { value: "single", label: "Eine einzelne Anlage" }, // Korrektur: Label
        { value: "multiple", label: "Mehrere Anlagen" }, // Korrektur: Label
      ],
      // Korrektur: Sichtbarkeit immer
    },
    {
      id: "esProjectLocations",
      type: "text",
      label: "Standort(e) des Energy-Sharing-Projekts",
      description: "PLZ und/oder Adresse der beteiligten Anlagen und Verbraucher. Bei mehreren Standorten bitte alle angeben.",
      placeholder: "z.B. 10115 Berlin, Musterstraße 1",
      optional: true,
    },
    {
      id: "esCapacitySizeKw", // Korrektur: ID umbenannt von esPvSizeKw
      type: "number",
      label: "Welche Größe hat die / haben die betroffene(n) EE-Anlage(n) in kW? (1000 kW = 1 MW)", // Korrektur: Label
      placeholder: "z.B. 100",
      optional: true,
      // Korrektur: Sichtbarkeit immer (war: nur bei single)
    },
    {
      id: "esTechnologyDescription",
      type: "textarea",
      label: "Welche Erzeugungstechnologie(n) sind beteiligt?",
      placeholder: "z.B. PV-Dachanlage, Windkraftanlage, Biogas...",
      optional: true,
    },
    // Korrektur: esWindSizeKw (#105) GELÖSCHT
    {
      id: "esPartyCount",
      type: "number",
      label: "Wie viele Parteien sollen beliefert werden (oder werden schon beliefert)?", // Korrektur: Label
      placeholder: "z.B. 50",
      optional: true,
      // Korrektur: Sichtbarkeit immer
    },
    {
      id: "esConsumerTypes",
      type: "multi-select",
      label: "E5. Welche Stromverbraucher sollen eingebunden werden (oder sind schon eingebunden)?",
      options: [
        { value: "privat", label: "Private Haushalte" },
        { value: "kommune", label: "Kommune" },
        { value: "kommunal_unternehmen", label: "Kommunale Unternehmen" },
        { value: "kmu", label: "KMU" },
        { value: "vereine", label: "Vereine" },
      ],
    },
    {
      id: "esConsumerDetails",
      type: "textarea",
      label: "E4b. Wie viele Stromverbraucher welchen Typs sollen eingebunden werden?",
      placeholder: "z.B. 30 Haushalte, 5 KMU...",
      optional: true,
    },
    {
      id: "esConsumerScope",
      type: "single-select",
      label: "E6. An wen soll der Strom geliefert werden (oder wird der Strom geliefert)?",
      options: [
        { value: "alle", label: "An jeden, der Interesse hat" }, // Korrektur: Label
        { value: "primaer_bestimmte", label: "Primär an bestimmte Abnehmer, aber gerne auch an weitere" }, // Korrektur: Label
        { value: "nur_bestimmte", label: "Nur an bestimmte Abnehmer", hasTextField: true, textFieldPlaceholder: "z.B. nur Mitglieder der Genossenschaft..." },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. regionale Beschränkung, bestimmte Verbrauchsgruppen..." },
      ],
    },
    {
      id: "esMaxDistance",
      type: "text",
      label: "Wie groß ist der maximale geografische Abstand zwischen Anlagen und Verbrauchern (geplant oder realisiert)?", // Korrektur: Label
      description: "Eine ungefähre Schätzung reicht",
      placeholder: "z.B. 5 km",
      optional: true,
    },
    {
      id: "esVnbContact",
      type: "single-select",
      label: "E6. Waren Sie bereits in Kontakt mit Ihrem Verteilnetzbetreiber zu dem Thema Energy Sharing?",
      options: [
        { value: "ja", label: "Ja" },
        { value: "nein", label: "Nein" },
      ],
    },
    {
      id: "esVnbResponse",
      type: "single-select",
      label: "E7. Was war die Rückmeldung des Verteilnetzbetreibers?",
      options: [
        { value: "bereit_06_2026", label: "Der Verteilnetzbetreiber bereitet sich schon darauf vor - ab dem 01.06.2026 können wir starten!" },
        { value: "bereit_12_monate", label: "Der Verteilnetzbetreiber bereitet sich schon darauf vor - in den nächsten 12 Monaten soll die Umsetzung möglich sein" },
        { value: "moeglich_keine_zeit", label: "Der Verteilnetzbetreiber hat angekündigt, dass das möglich sein wird - aber noch keine genaue Zeit genannt" },
        { value: "vertroestet", label: "Der Verteilnetzbetreiber hat uns auf später vertröstet" },
        { value: "weiss_nicht", label: "Der Verteilnetzbetreiber weiß nicht, was Energy Sharing ist" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldPlaceholder: "z.B. Verteilnetzbetreiber verweist auf ausstehende Gesetzgebung..." },
      ],
      visibilityRule: eq('esVnbContact', 'ja'),
    },
    {
      id: "esNetzentgelteDiscussion",
      type: "single-select",
      label: "E8. Haben Sie mit Ihrem Verteilnetzbetreiber bereits über die Abrechnung der Netzentgelte gesprochen?",
      options: [
        { value: "ja_vorschlag", label: "Ja - und der Verteilnetzbetreiber hatte schon einen Vorschlag wie das geht", hasTextField: true, textFieldPlaceholder: "z.B. reduzierte Netzentgelte für Nahbereich vorgeschlagen..." },
        { value: "ja_unklar", label: "Ja - aber der Verteilnetzbetreiber weiß auch nicht wie das gehen soll", hasTextField: true, textFieldPlaceholder: "z.B. keine klare Regelung bekannt, warten auf Vorgaben..." },
        { value: "nein", label: "Nein" },
      ],
      visibilityRule: eq('esVnbContact', 'ja'),
    },
    {
      id: "esInfoSources",
      type: "textarea",
      label: "Welche Informationsquellen fanden Sie besonders hilfreich bei der Suche nach Informationen zu Energy Sharing?",
      placeholder: "z.B. Webseiten, Verbände, Beratungsstellen...",
      optional: true,
    },
  ],
};

// SECTION_GGV_TRANSPARENZ removed – fields now inline in ProjectLocationRows

// === SECTION 6: Abschluss ===
const SECTION_FINAL: SurveySection = {
  id: "final",
  title: "6. Abschluss",
  description: "Letzte Informationen",
  questions: [
    // Korrektur: helpfulInfoSources (#114) GELÖSCHT
    {
      id: "additionalExperiences",
      type: "textarea",
      label: "Welche Erfahrungen möchten Sie noch teilen?",
      placeholder: "z.B. Tipps für andere, besondere Erlebnisse, Lessons Learned...",
      optional: true,
    },
    {
      id: "documentUpload",
      type: "file",
      label: "Möglichkeit zum Hochladen von Dokumenten",
      description: "z.B. Korrespondenz mit dem Verteilnetzbetreiber, Messkonzepte, Rechnungen (max. 5 Dateien)",
      optional: true,
    },
    {
      id: "surveyImprovements",
      type: "textarea",
      label: "Haben Sie Verbesserungsvorschläge für diese Umfrage?",
      placeholder: "z.B. fehlende Fragen, unklare Formulierungen, technische Probleme...",
      optional: true,
    },
    {
      id: "npsScore",
      type: "rating",
      label: "Wie wahrscheinlich ist es, dass Sie anderen die Umsetzung von GGV/Mieterstrom empfehlen würden?",
      min: 0,
      max: 10,
      minLabel: "Sehr unwahrscheinlich",
      maxLabel: "Sehr wahrscheinlich",
      optional: true,
      visibilityRule: PT_GGV_OR_MS(),
    },
  ],
};

// === HAUPTSCHEMA ===
export const surveyDefinition: SurveySchema = {
  version: "3.3.0",
  lastUpdated: "2026-02-18",
  title: "Umfrage zu GGV, Mieterstrom & Energy Sharing",
  description: "Diese Umfrage erfasst Erfahrungen mit der Umsetzung von Gemeinschaftlicher Gebäudeversorgung (GGV), Mieterstrom und Energy Sharing in Deutschland.",
  sections: [
    SECTION_ABOUT_YOU,
    SECTION_PROJECT_DETAILS,
    SECTION_PLANNING,
    SECTION_CHALLENGES,
    SECTION_VNB_PLANNING_GGV,
    SECTION_VNB_MSB_DETAILS,
    SECTION_GGV_MESSKONZEPT,
    SECTION_VNB_SUPPORT,
    SECTION_GGV_OPERATION,
    SECTION_SERVICE_PROVIDER,
    // SECTION_GGV_TRANSPARENZ removed
    SECTION_MIETERSTROM_PLANNING,
    SECTION_MIETERSTROM_VNB_OFFER,
    SECTION_MIETERSTROM_OPERATION,
    SECTION_ENERGY_SHARING,
    SECTION_FINAL,
  ],
};

// Helper to get question options by ID from any section
export function getQuestionById(questionId: string): SurveyQuestion | undefined {
  for (const section of surveyDefinition.sections) {
    const q = section.questions.find(q => q.id === questionId);
    if (q) return q;
  }
  return undefined;
}

export function getOptionsForQuestion(questionId: string): SurveyOption[] {
  return getQuestionById(questionId)?.options || [];
}

export function getLabelForQuestion(questionId: string): string {
  const label = getQuestionById(questionId)?.label || '';
  return cleanLabel(label);
}

// Convert camelCase to snake_case
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Compute the set of question IDs that are currently visible,
 * taking into account both section-level and question-level visibility rules.
 */
export function getVisibleQuestionIds(data: SurveyData): Set<string> {
  const visible = new Set<string>();
  for (const section of surveyDefinition.sections) {
    // Section-level gate
    if (section.visibilityRule && !evaluateRule(section.visibilityRule, data)) continue;
    for (const q of section.questions) {
      if (q.visibilityRule && !evaluateRule(q.visibilityRule, data)) continue;
      visible.add(q.id);
      // Always allow common companion patterns for any visible question
      visible.add(`${q.id}Other`);           // e.g. planningStatusOther
      visible.add(`${q.id}Details`);          // e.g. challengesDetails
      visible.add(`${q.id}Reasons`);          // e.g. vnbResponseReasons
      visible.add(`${q.id}Comment`);          // e.g. wandlermessungComment
    }
  }
  return visible;
}

// Build database-ready object from SurveyData
// Only includes fields whose questions are currently visible (defensive filtering).
// Note: projectLocations JSONB is excluded – use expandToLocationRows() to flatten.
export function buildDbData(
  data: SurveyData,
  sessionGroupId: string,
  uploadedDocuments: string[]
): Record<string, unknown> {
  const DB_TEXT_LIMIT = 10000;
  const dbData: Record<string, unknown> = {};

  // Fields that are always saved regardless of visibility
  const META_FIELDS = new Set([
    'evaluationLabel', 'projectTypes', 'projectFocus',
    'actorTextFields', // Special companion for actorTypes with irregular name
  ]);

  // Fields handled by expandToLocationRows – skip JSONB storage
  const LOCATION_JSONB_FIELDS = new Set(['projectLocations']);

  const visibleIds = getVisibleQuestionIds(data);

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === '') continue;
    if (LOCATION_JSONB_FIELDS.has(key)) continue;

    // Always include meta fields; for others, check visibility
    if (!META_FIELDS.has(key) && !visibleIds.has(key)) continue;

    // Use QUESTION_REGISTRY dbColumn when available, fall back to toSnakeCase
    const snakeKey = QUESTION_REGISTRY[key]?.dbColumn || toSnakeCase(key);
    
    // Boolean conversion for fields stored as boolean in DB but string in UI
    const BOOLEAN_DB_FIELDS: Record<string, Record<string, boolean>> = {
      'esVnbContact': { 'ja': true, 'nein': false },
    };
    if (BOOLEAN_DB_FIELDS[key] && typeof value === 'string') {
      dbData[snakeKey] = BOOLEAN_DB_FIELDS[key][value] ?? value;
    } else if (key === 'ggvProjectLinks' && typeof value === 'string') {
      // Split comma-separated links into array for text[] DB column
      dbData[snakeKey] = value.split(',').map(s => s.trim()).filter(Boolean).slice(0, 2);
    } else {
      dbData[snakeKey] = typeof value === 'string' && value.length > DB_TEXT_LIMIT
        ? value.slice(0, DB_TEXT_LIMIT)
        : value;
    }
  }

  dbData.session_group_id = sessionGroupId;
  if (uploadedDocuments.length > 0) {
    dbData.uploaded_documents = uploadedDocuments;
  }

  return dbData;
}

/**
 * Expand a single DB row into N rows – one per GGV project location.
 * If no locations or only one, returns 1 row with flat location fields.
 * Each row shares the same session_group_id; all feedback data is duplicated.
 * 
 * Flat columns used per location:
 *  - project_plz, project_address (from location.plz, location.address)
 *  - ggv_project_name (from location.projectName)
 *  - ggv_project_links (from location.weblinks)
 *  - ggv_pv_size_kw (from location.pvSizeKw, only for multi-site)
 */
export function expandToLocationRows(
  baseRow: Record<string, unknown>,
  locations: Array<{ plz?: string; address?: string; pvSizeKw?: number; projectName?: string; weblinks?: string[] }> | undefined,
): Record<string, unknown>[] {
  const locs = locations?.filter(l => l.plz || l.address) ?? [];

  if (locs.length === 0) {
    return [baseRow];
  }

  return locs.map((loc) => {
    const row = { ...baseRow };
    if (loc.plz) row.project_plz = loc.plz;
    if (loc.address) row.project_address = loc.address;
    if (loc.projectName) row.ggv_project_name = loc.projectName;
    if (loc.weblinks && loc.weblinks.some(l => l.trim())) {
      row.ggv_project_links = loc.weblinks.filter(l => l.trim()).slice(0, 5);
    }
    // For multi-site, use per-location kW (overrides global ggv_pv_size_kw)
    if (locs.length > 1 && loc.pvSizeKw) {
      row.ggv_pv_size_kw = loc.pvSizeKw;
    }
    return row;
  });
}

// === QUESTION REGISTRY: Display-IDs (Abschnitt-Modell-Name) + DB-Spalten + UI-Nummern ===
export const QUESTION_REGISTRY: Record<string, { displayId: string; dbColumn: string; uiNumber?: string }> = {
  // Section 1: Über Sie
  "actorTypes": { displayId: "1-ActorTypes", dbColumn: "actor_types", uiNumber: "1.1" },
  "actorDienstleisterCategory": { displayId: "1-ActorDienstleisterCategory", dbColumn: "actor_dienstleister_category", uiNumber: "1.1a" },
  "dienstleisterWebsite": { displayId: "1-DienstleisterWebsite", dbColumn: "dienstleister_website", uiNumber: "1.1b" },
  "dienstleisterKontakt": { displayId: "1-DienstleisterKontakt", dbColumn: "dienstleister_kontakt", uiNumber: "1.1b" },
  "motivation": { displayId: "1-Motivation", dbColumn: "motivation", uiNumber: "1.2" },
  "contactEmail": { displayId: "1-ContactEmail", dbColumn: "contact_email", uiNumber: "1.3" },
  "confirmationForUpdate": { displayId: "1-ConfirmationForUpdate", dbColumn: "confirmation_for_update", uiNumber: "1.4" },
  // Section 2: Projekt
  "vnbName": { displayId: "2-VnbName", dbColumn: "vnb_name", uiNumber: "2.1" },
  "projectTypes": { displayId: "2-ProjectTypes", dbColumn: "project_types", uiNumber: "2.2" },
  "planningStatus": { displayId: "3-PlanningStatus", dbColumn: "planning_status", uiNumber: "2.3" },
  "ggvProjectType": { displayId: "2-GGV-ProjectType", dbColumn: "ggv_project_type", uiNumber: "2.4" },
  "ggvPvSizeKw": { displayId: "2-GGV-PvSizeKw", dbColumn: "ggv_pv_size_kw", uiNumber: "2.6" },
  "ggvPartyCount": { displayId: "2-GGV-PartyCount", dbColumn: "ggv_party_count", uiNumber: "2.7" },
  "ggvBuildingType": { displayId: "2-GGV-BuildingType", dbColumn: "ggv_building_type", uiNumber: "2.8" },
  "ggvBuildingCount": { displayId: "2-GGV-BuildingCount", dbColumn: "ggv_building_count", uiNumber: "2.5" },
  "ggvAdditionalInfo": { displayId: "2-GGV-AdditionalInfo", dbColumn: "ggv_additional_info", uiNumber: "2.9" },
  "mieterstromProjectType": { displayId: "2-MS-ProjectType", dbColumn: "mieterstrom_project_type", uiNumber: "2.4b" },
  "mieterstromPvSizeKw": { displayId: "2-MS-PvSizeKw", dbColumn: "mieterstrom_pv_size_kw", uiNumber: "2.10" },
  "mieterstromPartyCount": { displayId: "2-MS-PartyCount", dbColumn: "mieterstrom_party_count", uiNumber: "2.11" },
  "mieterstromBuildingType": { displayId: "2-MS-BuildingType", dbColumn: "mieterstrom_building_type", uiNumber: "2.12" },
  "mieterstromBuildingCount": { displayId: "2-MS-BuildingCount", dbColumn: "mieterstrom_building_count", uiNumber: "2.5b" },
  "mieterstromAdditionalInfo": { displayId: "2-MS-AdditionalInfo", dbColumn: "mieterstrom_additional_info", uiNumber: "2.13" },
  "projectLocations": { displayId: "2-GGV-ProjectLocations", dbColumn: "project_locations", uiNumber: "2.14" },
  "mieterstromFoerderung": { displayId: "2-MS-Foerderung", dbColumn: "mieterstrom_foerderung", uiNumber: "2.15" },
  "mieterstromFoerderungNeinGrund": { displayId: "2-MS-FoerderungNeinGrund", dbColumn: "mieterstrom_foerderung_nein_grund", uiNumber: "2.16" },
  "mieterstromProjectLocations": { displayId: "2-MS-ProjectLocations", dbColumn: "mieterstrom_project_locations", uiNumber: "2.14b" },
  // Section 3: Planung Allgemein
  "ggvOrMieterstromDecision": { displayId: "3-GgvOrMsDecision", dbColumn: "ggv_or_mieterstrom_decision", uiNumber: "3.1" },
  "ggvDecisionReasons": { displayId: "3-GGV-DecisionReasons", dbColumn: "ggv_decision_reasons", uiNumber: "3.2" },
  "mieterstromDecisionReasons": { displayId: "3-MS-DecisionReasons", dbColumn: "mieterstrom_decision_reasons", uiNumber: "3.3" },
  "implementationApproach": { displayId: "3-ImplApproach", dbColumn: "implementation_approach", uiNumber: "3.4" },
  "challenges": { displayId: "3-Challenges", dbColumn: "challenges", uiNumber: "3.5" },
  "vnbRejectionResponse": { displayId: "3-RejectionResponse", dbColumn: "vnb_rejection_response", uiNumber: "3.6" },
  "mieterstromPlanningStatus": { displayId: "2-MS-PlanningStatus", dbColumn: "mieterstrom_planning_status", uiNumber: "2.3b" },
  // Section 4-GGV: Planung GGV
  "vnbExistingProjects": { displayId: "4-GGV-ExistingProjects", dbColumn: "vnb_existing_projects", uiNumber: "4.1" },
  "vnbContact": { displayId: "4-GGV-VnbContact", dbColumn: "vnb_contact", uiNumber: "4.2" },
  "vnbResponse": { displayId: "4-GGV-VnbResponse", dbColumn: "vnb_response", uiNumber: "4.3" },
  "vnbSupportMesskonzept": { displayId: "4-GGV-SupportMesskonzept", dbColumn: "vnb_support_messkonzept", uiNumber: "4.22" },
  "vnbSupportFormulare": { displayId: "4-GGV-SupportFormulare", dbColumn: "vnb_support_formulare", uiNumber: "4.23" },
  "vnbSupportPortal": { displayId: "4-GGV-SupportPortal", dbColumn: "vnb_support_portal", uiNumber: "4.24" },
  "vnbSupportOther": { displayId: "4-GGV-SupportOther", dbColumn: "vnb_support_other", uiNumber: "4.25" },
  "vnbContactHelpful": { displayId: "4-GGV-ContactHelpful", dbColumn: "vnb_contact_helpful", uiNumber: "4.26" },
  "vnbPersonalContacts": { displayId: "4-GGV-PersonalContacts", dbColumn: "vnb_personal_contacts", uiNumber: "4.27" },
  "vnbSupportRating": { displayId: "4-GGV-SupportRating", dbColumn: "vnb_support_rating", uiNumber: "4.28" },
  "vnbMsbTimeline": { displayId: "4-GGV-MsbTimeline", dbColumn: "vnb_msb_timeline", uiNumber: "4.3a" },
  "vnbRejectionTimeline": { displayId: "4-GGV-RejectionTimeline", dbColumn: "vnb_rejection_timeline", uiNumber: "4.3b" },
  "vnbStartTimeline": { displayId: "4-GGV-StartTimeline", dbColumn: "vnb_start_timeline", uiNumber: "4.5" },
  "vnbAdditionalCosts": { displayId: "4-GGV-AdditionalCosts", dbColumn: "vnb_additional_costs", uiNumber: "4.6" },
  "vnbAdditionalCostsOneTime": { displayId: "4-GGV-CostsOneTime", dbColumn: "vnb_additional_costs_one_time", uiNumber: "4.7" },
  "vnbAdditionalCostsYearly": { displayId: "4-GGV-CostsYearly", dbColumn: "vnb_additional_costs_yearly", uiNumber: "4.8" },
  "vnbFullService": { displayId: "4-GGV-FullService", dbColumn: "vnb_full_service", uiNumber: "4.9" },
  "vnbDataProvision": { displayId: "4-GGV-DataProvision", dbColumn: "vnb_data_provision", uiNumber: "4.10" },
  "vnbDataCost": { displayId: "4-GGV-DataCost", dbColumn: "vnb_data_cost", uiNumber: "4.11" },
  "vnbDataCostAmount": { displayId: "4-GGV-DataCostAmount", dbColumn: "vnb_data_cost_amount", uiNumber: "4.12" },
  "vnbEsaCost": { displayId: "4-GGV-EsaCost", dbColumn: "vnb_esa_cost", uiNumber: "4.13" },
  "vnbEsaCostAmount": { displayId: "4-GGV-EsaCostAmount", dbColumn: "vnb_esa_cost_amount", uiNumber: "4.14" },
  
  "vnbWandlermessung": { displayId: "4-GGV-Wandlermessung", dbColumn: "vnb_wandlermessung", uiNumber: "4.17" },
  "vnbWandlermessungComment": { displayId: "4-GGV-WandlermessungComment", dbColumn: "vnb_wandlermessung_comment", uiNumber: "4.18" },
  "vnbWandlermessungDocuments": { displayId: "4-GGV-WandlermessungDocuments", dbColumn: "vnb_wandlermessung_documents", uiNumber: "4.19" },
  "vnbPlanningDuration": { displayId: "4-GGV-PlanningDuration", dbColumn: "vnb_planning_duration", uiNumber: "4.20" },
  "vnbPlanningDurationReasons": { displayId: "4-GGV-PlanningDurationReasons", dbColumn: "vnb_planning_duration_reasons", uiNumber: "4.21" },
  // Section 5-GGV: Betrieb GGV
  "operationVnbDuration": { displayId: "5-GGV-VnbDuration", dbColumn: "operation_vnb_duration", uiNumber: "5.1" },
  "operationVnbDurationReasons": { displayId: "5-GGV-VnbDurationReasons", dbColumn: "operation_vnb_duration_reasons", uiNumber: "5.2" },
  "operationWandlermessung": { displayId: "5-GGV-Wandlermessung", dbColumn: "operation_wandlermessung", uiNumber: "5.3" },
  "operationWandlermessungComment": { displayId: "5-GGV-WandlermessungComment", dbColumn: "operation_wandlermessung_comment", uiNumber: "5.4" },
  "operationMsbProvider": { displayId: "5-GGV-MsbProvider", dbColumn: "operation_msb_provider", uiNumber: "5.5" },
  "operationAllocationProvider": { displayId: "5-GGV-AllocationProvider", dbColumn: "operation_allocation_provider", uiNumber: "5.6" },
  "operationDataProvider": { displayId: "5-GGV-DataProvider", dbColumn: "operation_data_provider", uiNumber: "5.7" },
  "operationMsbDuration": { displayId: "5-GGV-MsbDuration", dbColumn: "operation_msb_duration", uiNumber: "5.8" },
  "operationMsbAdditionalCosts": { displayId: "5-GGV-MsbAdditionalCosts", dbColumn: "operation_msb_additional_costs", uiNumber: "5.9" },
  "operationMsbAdditionalCostsOneTime": { displayId: "5-GGV-MsbCostsOneTime", dbColumn: "operation_msb_additional_costs_one_time", uiNumber: "5.10" },
  "operationMsbAdditionalCostsYearly": { displayId: "5-GGV-MsbCostsYearly", dbColumn: "operation_msb_additional_costs_yearly", uiNumber: "5.11" },
  // operationAllocationWho GELÖSCHT
  "operationDataFormat": { displayId: "5-GGV-DataFormat", dbColumn: "operation_data_format", uiNumber: "5.12" },
  "operationDataCost": { displayId: "5-GGV-DataCost", dbColumn: "operation_data_cost", uiNumber: "5.13" },
  "operationDataCostAmount": { displayId: "5-GGV-DataCostAmount", dbColumn: "operation_data_cost_amount", uiNumber: "5.14" },
  "operationEsaCost": { displayId: "5-GGV-EsaCost", dbColumn: "operation_esa_cost", uiNumber: "5.15" },
  "operationEsaCostAmount": { displayId: "5-GGV-EsaCostAmount", dbColumn: "operation_esa_cost_amount", uiNumber: "5.16" },
  "operationSatisfactionRating": { displayId: "5-GGV-SatisfactionRating", dbColumn: "operation_satisfaction_rating", uiNumber: "5.17" },
  // Section 5-GGV: Dienstleister
  "serviceProviderName": { displayId: "5-GGV-SP-Name", dbColumn: "service_provider_name", uiNumber: "5.18" },
  "serviceProviderServices": { displayId: "5-GGV-SP-Services", dbColumn: "service_provider_services", uiNumber: "5.18a" },
  // serviceProviderRating GELÖSCHT
  "serviceProviderComments": { displayId: "5-GGV-SP-Comments", dbColumn: "service_provider_comments", uiNumber: "5.19" },
  "serviceProvider2Name": { displayId: "5-GGV-SP2-Name", dbColumn: "service_provider_2_name", uiNumber: "5.20" },
  "serviceProvider2Services": { displayId: "5-GGV-SP2-Services", dbColumn: "service_provider_2_services", uiNumber: "5.20a" },
  "serviceProvider2Comments": { displayId: "5-GGV-SP2-Comments", dbColumn: "service_provider_2_comments", uiNumber: "5.21" },
  // Section 4-MS: Planung Mieterstrom
  "mieterstromSummenzaehler": { displayId: "4-MS-Summenzaehler", dbColumn: "mieterstrom_summenzaehler", uiNumber: "6.1" },
  // mieterstromChallenges GELÖSCHT
  "mieterstromExistingProjects": { displayId: "4-MS-ExistingProjects", dbColumn: "mieterstrom_existing_projects", uiNumber: "6.2" },
  "mieterstromExistingProjectsVirtuell": { displayId: "4-MS-ExistingProjectsVirtuell", dbColumn: "mieterstrom_existing_projects_virtuell", uiNumber: "6.3" },
  "mieterstromVnbContact": { displayId: "4-MS-VnbContact", dbColumn: "mieterstrom_vnb_contact", uiNumber: "6.4" },
  "mieterstromVirtuellAllowed": { displayId: "4-MS-VirtuellAllowed", dbColumn: "mieterstrom_virtuell_allowed", uiNumber: "6.5" },
  "mieterstromVirtuellDeniedReason": { displayId: "4-MS-VirtuellDeniedReason", dbColumn: "mieterstrom_virtuell_denied_reason", uiNumber: "6.6" },
  "mieterstromVirtuellDeniedDocuments": { displayId: "4-MS-VirtuellDeniedDocuments", dbColumn: "mieterstrom_virtuell_denied_documents", uiNumber: "6.7" },
  "mieterstromVirtuellWandlermessung": { displayId: "4-MS-VirtuellWandlermessung", dbColumn: "mieterstrom_virtuell_wandlermessung", uiNumber: "6.8" },
  "mieterstromVirtuellWandlermessungDocuments": { displayId: "4-MS-VirtuellWandlermessungDocuments", dbColumn: "mieterstrom_virtuell_wandlermessung_documents", uiNumber: "6.9" },
  "mieterstromVnbResponse": { displayId: "4-MS-VnbResponse", dbColumn: "mieterstrom_vnb_response", uiNumber: "6.10" },
  // mieterstromVnbSupport GELÖSCHT
  // mieterstromVnbHelpful GELÖSCHT
  // mieterstromPersonalContacts GELÖSCHT
  "mieterstromSupportRating": { displayId: "4-MS-SupportRating", dbColumn: "mieterstrom_support_rating", uiNumber: "6.13" },
  // Section 4-MS: VNB Angebot
  "mieterstromFullService": { displayId: "4-MS-FullService", dbColumn: "mieterstrom_full_service", uiNumber: "6.14" },
  "mieterstromMsbCosts": { displayId: "4-MS-MsbCosts", dbColumn: "mieterstrom_msb_costs", uiNumber: "6.15" },
  "mieterstromMsbCostsOneTime": { displayId: "4-MS-MsbCostsOneTime", dbColumn: "mieterstrom_msb_costs_one_time", uiNumber: "6.16" },
  "mieterstromMsbCostsYearly": { displayId: "4-MS-MsbCostsYearly", dbColumn: "mieterstrom_msb_costs_yearly", uiNumber: "6.17" },
  "mieterstromModelChoice": { displayId: "4-MS-ModelChoice", dbColumn: "mieterstrom_model_choice", uiNumber: "6.18" },
  "mieterstromDataProvision": { displayId: "4-MS-DataProvision", dbColumn: "mieterstrom_data_provision", uiNumber: "6.19" },
  // Section 5-MS: Betrieb Mieterstrom
  "mieterstromVnbRole": { displayId: "5-MS-VnbRole", dbColumn: "mieterstrom_vnb_role", uiNumber: "6.20" },
  "mieterstromVnbDuration": { displayId: "5-MS-VnbDuration", dbColumn: "mieterstrom_vnb_duration", uiNumber: "6.21" },
  "mieterstromVnbDurationReasons": { displayId: "5-MS-VnbDurationReasons", dbColumn: "mieterstrom_vnb_duration_reasons", uiNumber: "6.22" },
  "mieterstromWandlermessung": { displayId: "5-MS-Wandlermessung", dbColumn: "mieterstrom_wandlermessung", uiNumber: "6.23" },
  // mieterstromMsbProvider GELÖSCHT
  // mieterstromDataProvider GELÖSCHT
  "mieterstromMsbInstallDuration": { displayId: "5-MS-MsbInstallDuration", dbColumn: "mieterstrom_msb_install_duration", uiNumber: "6.24" },
  "mieterstromOperationCosts": { displayId: "5-MS-OperationCosts", dbColumn: "mieterstrom_operation_costs", uiNumber: "6.25" },
  "mieterstromOperationCostsOneTime": { displayId: "5-MS-OperationCostsOneTime", dbColumn: "mieterstrom_operation_costs_one_time", uiNumber: "6.26" },
  "mieterstromOperationCostsYearly": { displayId: "5-MS-OperationCostsYearly", dbColumn: "mieterstrom_operation_costs_yearly", uiNumber: "6.27" },
  // mieterstromOperationSatisfaction GELÖSCHT
  "mieterstromRejectionResponse": { displayId: "5-MS-RejectionResponse", dbColumn: "mieterstrom_rejection_response", uiNumber: "6.28" },
  "mieterstromInfoSources": { displayId: "5-MS-InfoSources", dbColumn: "mieterstrom_info_sources", uiNumber: "6.29" },
  "mieterstromExperiences": { displayId: "5-MS-Experiences", dbColumn: "mieterstrom_experiences", uiNumber: "6.30" },
  // Section 4-ES: Energy Sharing
  "esStatus": { displayId: "4-ES-Status", dbColumn: "es_status", uiNumber: "7.1" },
  "esPlantType": { displayId: "4-ES-PlantType", dbColumn: "es_plant_type", uiNumber: "7.4" },
  "esProjectScope": { displayId: "4-ES-ProjectScope", dbColumn: "es_project_scope", uiNumber: "7.5" },
  "esCapacitySizeKw": { displayId: "4-ES-CapacitySizeKw", dbColumn: "es_capacity_size_kw", uiNumber: "7.6" },
  // esWindSizeKw GELÖSCHT
  "esPartyCount": { displayId: "4-ES-PartyCount", dbColumn: "es_party_count", uiNumber: "7.7" },
  "esConsumerTypes": { displayId: "4-ES-ConsumerTypes", dbColumn: "es_consumer_types", uiNumber: "7.8" },
  "esConsumerScope": { displayId: "4-ES-ConsumerScope", dbColumn: "es_consumer_scope", uiNumber: "7.10" },
  "esMaxDistance": { displayId: "4-ES-MaxDistance", dbColumn: "es_max_distance", uiNumber: "7.11" },
  "esVnbContact": { displayId: "4-ES-VnbContact", dbColumn: "es_vnb_contact", uiNumber: "7.12" },
  "esVnbResponse": { displayId: "4-ES-VnbResponse", dbColumn: "es_vnb_response", uiNumber: "7.13" },
  "esNetzentgelteDiscussion": { displayId: "4-ES-Netzentgelte", dbColumn: "es_netzentgelte_discussion", uiNumber: "7.14" },
  "esInfoSources": { displayId: "4-ES-InfoSources", dbColumn: "es_info_sources", uiNumber: "7.15" },
  "esTechnologyDescription": { displayId: "4-ES-TechnologyDescription", dbColumn: "es_technology_description", uiNumber: "7.6b" },
  "esProjectLocations": { displayId: "4-ES-ProjectLocations", dbColumn: "es_project_locations", uiNumber: "7.5b" },
  "esInOperationDetails": { displayId: "4-ES-InOperationDetails", dbColumn: "es_in_operation_details", uiNumber: "7.2" },
  "esOperatorDetails": { displayId: "4-ES-OperatorDetails", dbColumn: "es_operator_details", uiNumber: "7.3" },
  "esConsumerDetails": { displayId: "4-ES-ConsumerDetails", dbColumn: "es_consumer_details", uiNumber: "7.9" },
  // GGV-Transparenz Integration
  "ggvTransparenzOptIn": { displayId: "GGV-T-OptIn", dbColumn: "ggv_transparenz_opt_in", uiNumber: "G.1" },
  "ggvProjectName": { displayId: "GGV-T-Name", dbColumn: "ggv_project_name", uiNumber: "G.1a" },
  "ggvProjectCity": { displayId: "GGV-T-City", dbColumn: "ggv_project_city", uiNumber: "G.2" },
  "ggvProjectWebsite": { displayId: "GGV-T-Website", dbColumn: "ggv_project_website", uiNumber: "G.3" },
  "ggvProjectLinks": { displayId: "GGV-T-Links", dbColumn: "ggv_project_links", uiNumber: "G.3a" },
  "ggvExperienceNotes": { displayId: "GGV-T-ExperienceNotes", dbColumn: "ggv_experience_notes", uiNumber: "G.4" },
  "spQualityRating": { displayId: "SP-QualityRating", dbColumn: "sp_quality_rating", uiNumber: "G.5" },
  "spPriceRating": { displayId: "SP-PriceRating", dbColumn: "sp_price_rating", uiNumber: "G.6" },
  "spRatingComment": { displayId: "SP-RatingComment", dbColumn: "sp_rating_comment", uiNumber: "G.7" },
  // Section 6: Abschluss
  // helpfulInfoSources GELÖSCHT
  "additionalExperiences": { displayId: "6-Experiences", dbColumn: "additional_experiences", uiNumber: "8.1" },
  "documentUpload": { displayId: "6-DocumentUpload", dbColumn: "uploaded_documents", uiNumber: "8.2" },
  "surveyImprovements": { displayId: "6-SurveyImprovements", dbColumn: "survey_improvements", uiNumber: "8.3" },
  "npsScore": { displayId: "6-NpsScore", dbColumn: "nps_score", uiNumber: "8.4" },
};

// Helper: Get display ID for a question
export function getDisplayId(questionId: string): string {
  return QUESTION_REGISTRY[questionId]?.displayId || questionId;
}

// Helper: Get human-readable label for a question (uiNumber + short label)
export function getHumanLabel(questionId: string): string {
  const reg = QUESTION_REGISTRY[questionId];
  const uiNumber = reg?.uiNumber;
  // Find the question label from the schema
  for (const section of surveyDefinition.sections) {
    for (const q of section.questions) {
      if (q.id === questionId) {
        const shortLabel = q.label.length > 80 ? q.label.slice(0, 77) + '…' : q.label;
        return uiNumber ? `Frage ${uiNumber}: ${shortLabel}` : shortLabel;
      }
    }
  }
  // Fallback for companion fields: try to find parent question
  // e.g. "mieterstromProjectLocations" → look for related question
  if (uiNumber) return `Frage ${uiNumber}`;
  
  // Last resort: make camelCase more readable
  const readable = questionId
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
  return readable;
}

// Helper: Get DB column for a question
export function getDbColumn(questionId: string): string {
  return QUESTION_REGISTRY[questionId]?.dbColumn || toSnakeCase(questionId);
}

// Export für JSON-Generierung
export function getSurveySchemaAsJson() {
  return {
    version: surveyDefinition.version,
    lastUpdated: surveyDefinition.lastUpdated,
    title: surveyDefinition.title,
    description: surveyDefinition.description,
    sections: surveyDefinition.sections.map(section => ({
      id: section.id,
      title: cleanLabel(section.title),
      description: section.description ? cleanLabel(section.description) : undefined,
      visibilityRule: section.visibilityRule ?? null,
      questions: section.questions.map(q => ({
        id: q.id,
        type: q.type,
        text: cleanLabel(q.label),
        helpText: q.description ? cleanLabel(q.description) : q.helpText ? cleanLabel(q.helpText) : undefined,
        options: q.options?.map(o => ({
          value: o.value,
          label: cleanLabel(o.label),
          hasTextField: o.hasTextField,
          textFieldLabel: o.textFieldLabel ? cleanLabel(o.textFieldLabel) : undefined,
          exclusive: o.exclusive,
        })),
        scaleLabels: q.type === 'rating' ? { min: q.minLabel, max: q.maxLabel } : undefined,
        required: q.required,
        optional: q.optional,
        visibilityRule: q.visibilityRule ?? null,
        skipLogic: q.skipLogic,
        conditionalRequired: q.conditionalRequired,
      })),
    })),
  };
}
