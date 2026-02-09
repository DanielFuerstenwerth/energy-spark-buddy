// Zentrales Schema für die Umfrage - Single Source of Truth (SSOT)
// Letzte Aktualisierung: 2026-02-09

import type { SurveyData } from '@/types/survey';

export interface SurveyOption {
  value: string;
  label: string;
  hasTextField?: boolean;
  textFieldLabel?: string;
  textFieldPlaceholder?: string;
  exclusive?: boolean; // If true, selecting this option deselects all others
}

export interface SurveyQuestion {
  id: string;
  type: 'single-select' | 'multi-select' | 'text' | 'textarea' | 'number' | 'email' | 'rating' | 'file' | 'vnb-select' | 'project-focus';
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
  conditionalRequired?: string; // e.g., "vnbAdditionalCosts='ja'"
}

export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  visibilityLogic?: string;
}

export interface SurveySchema {
  version: string;
  lastUpdated: string;
  title: string;
  description: string;
  sections: SurveySection[];
}

// Helper function to clean Lxx: artifacts from labels
export function cleanLabel(text: string): string {
  return text.replace(/\n?L\d+:\s*/g, '').trim();
}

// === SECTION A: Über Sie ===

const SECTION_ABOUT_YOU: SurveySection = {
  id: "about",
  title: "A. Über Sie",
  description: "Einordnung & Motivation",
  questions: [
    {
      id: "actorTypes",
      type: "multi-select",
      label: "A1. In welche Akteursgruppe fallen Sie?",
      description: "Mehrfachauswahl möglich",
      options: [
        { value: "buergerenergie", label: "Bürgerenergiegenossenschaft", hasTextField: true, textFieldLabel: "Name der Genossenschaft (optional)" },
        { value: "weg", label: "Wohnungseigentümergemeinschaft" },
        { value: "vermieter_privat", label: "Vermieter/in - Privatperson" },
        { value: "vermieter_prof_klein", label: "Vermieter/in - Professionell (<100 Einheiten)" },
        { value: "vermieter_wohnungsunternehmen", label: "Vermieter/in - Wohnungsunternehmen (>100 Einheiten)" },
        { value: "kommune", label: "Kommune / kommunales Unternehmen" },
        { value: "kmu", label: "Kleine und Mittelständische Unternehmen (KMU)" },
        { value: "dienstleister", label: "Dienstleister für GGV/Mieterstrom/Energy Sharing", hasTextField: true, textFieldLabel: "Welche Dienstleistung?" },
        { value: "installateur", label: "Installateur von PV-Anlagen" },
        { value: "msb", label: "Wettbewerblicher Messstellenbetreiber" },
        { value: "stadtwerk", label: "Stadtwerk/EVU" },
        { value: "andere", label: "Andere", hasTextField: true, textFieldLabel: "Bitte beschreiben" },
      ],
      optional: true,
    },
    {
      id: "motivation",
      type: "multi-select",
      label: "A2. Wie würden Sie Ihre Motivation einordnen?",
      description: "Mehrfachauswahl möglich",
      options: [
        { value: "pv_nutzung", label: "Wir werden auf jeden Fall eine PV-Anlage bauen (oder haben diese schon gebaut) und möchten den Strom vor Ort nutzen" },
        { value: "energiewende", label: "Wir möchten gerne Energiewende vor Ort umsetzen - sobald die Nutzung geklärt ist, kommt die PV-Anlage" },
        { value: "geschaeft", label: "Der Bau und Betrieb von PV-Anlagen ist ein wesentliches Anliegen von unserem Unternehmen/Verein" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
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
  ],
};

// === SECTION: Projekt ===
const SECTION_PROJECT_DETAILS: SurveySection = {
  id: "project",
  title: "Projekt",
  description: "VNB, Projektart und Dimensionen",
  questions: [
    {
      id: "vnbName",
      type: "vnb-select",
      label: "Welcher Verteilnetzbetreiber ist für Ihr Projekt zuständig?",
      description: "Suchen oder geben Sie den Namen Ihres VNB ein",
      optional: true,
    },
    {
      id: "projectTypes",
      type: "multi-select",
      label: "Welche Art von Projekt möchten Sie gerne umsetzen / haben Sie umgesetzt?",
      description: "Mehrfachauswahl möglich",
      options: [
        { value: "ggv", label: "GGV (Gemeinschaftliche Gebäudeversorgung)" },
        { value: "mieterstrom", label: "Mieterstrom" },
        { value: "ggv_oder_mieterstrom", label: "Entweder GGV oder Mieterstrom" },
        { value: "energysharing", label: "Energy Sharing (in Zukunft möglich)" },
      ],
      required: true,
    },
    {
      id: "ggvProjectType",
      type: "single-select",
      label: "Projektumfang",
      options: [
        { value: "single", label: "Ein einzelnes Projekt" },
        { value: "multiple", label: "Mehrere Projekte" },
      ],
      visibilityLogic: "Nur wenn in #5 'GGV', 'Mieterstrom' oder 'GGV oder Mieterstrom' ausgewählt",
    },
    {
      id: "ggvPvSizeKw",
      type: "number",
      label: "Größe der PV-Anlage in kW",
      placeholder: "z.B. 30",
      optional: true,
      visibilityLogic: "Nur wenn in #5 'GGV' oder 'GGV oder Mieterstrom' ausgewählt",
    },
    {
      id: "ggvPartyCount",
      type: "number",
      label: "Anzahl der Parteien, die Strom abnehmen",
      placeholder: "z.B. 12",
      optional: true,
      visibilityLogic: "Nur wenn in #5 'GGV' oder 'GGV oder Mieterstrom' ausgewählt",
    },
    {
      id: "ggvBuildingType",
      type: "single-select",
      label: "Art des Gebäudes",
      options: [
        { value: "wohngebaeude", label: "Wohngebäude" },
        { value: "gewerbe", label: "Gewerbegebäude" },
        { value: "gemischt", label: "Gemischt" },
      ],
      visibilityLogic: "Nur wenn in #5 'GGV' oder 'GGV oder Mieterstrom' ausgewählt",
    },
    {
      id: "ggvBuildingCount",
      type: "number",
      label: "Gesamtzahl der Projekte",
      placeholder: "z.B. 5",
      optional: true,
      visibilityLogic: "Nur wenn in #5 'GGV' oder 'GGV oder Mieterstrom' ausgewählt und #6 = 'multiple'",
    },
    {
      id: "ggvAdditionalInfo",
      type: "textarea",
      label: "Zusätzliche Informationen (GGV)",
      placeholder: "Weitere Details zu Ihrem Projekt...",
      optional: true,
      visibilityLogic: "Nur wenn in #5 'GGV' oder 'GGV oder Mieterstrom' ausgewählt",
    },
    {
      id: "mieterstromPvSizeKw",
      type: "number",
      label: "Größe der PV-Anlage(n) in kW",
      placeholder: "z.B. 50",
      optional: true,
      visibilityLogic: "Nur wenn Mieterstrom ausgewählt",
    },
    {
      id: "mieterstromPartyCount",
      type: "number",
      label: "Anzahl der Parteien, die Strom abnehmen",
      placeholder: "z.B. 24",
      optional: true,
      visibilityLogic: "Nur wenn Mieterstrom ausgewählt",
    },
    {
      id: "mieterstromBuildingType",
      type: "single-select",
      label: "Art des Gebäudes (Mieterstrom)",
      options: [
        { value: "wohngebaeude", label: "Wohngebäude" },
        { value: "gewerbe", label: "Gewerbegebäude" },
        { value: "gemischt", label: "Gemischt" },
      ],
      visibilityLogic: "Nur wenn Mieterstrom ausgewählt",
    },
    {
      id: "mieterstromAdditionalInfo",
      type: "textarea",
      label: "Zusätzliche Informationen (Mieterstrom)",
      placeholder: "Weitere Details zu Ihrem Projekt...",
      optional: true,
      visibilityLogic: "Nur wenn Mieterstrom ausgewählt",
    },
    {
      id: "projectLocations",
      type: "text",
      label: "Standort(e) des Projekts",
      description: "Optional – nur wenn Veröffentlichung der Adresse erwünscht ist. PLZ, Adresse und bei mehreren Projekten kW pro Standort.",
      optional: true,
      visibilityLogic: "Immer am Ende der Projektdetails",
    },
  ],
};

// === SECTION B: Planung Allgemeines - Planungsstatus ===
const SECTION_PLANNING: SurveySection = {
  id: "planning",
  title: "Planung: Allgemeines – Planungsstand",
  description: "Aktueller Status Ihres Projekts",
  visibilityLogic: "Nur wenn in #5 'GGV', 'Mieterstrom' oder 'GGV oder Mieterstrom' ausgewählt (nicht nur Energy Sharing)",
  questions: [
    {
      id: "planningStatus",
      type: "single-select", // Changed from multi-select to single-select per P0.6
      label: "B1. Wo stehen Sie aktuell mit dem Projekt?",
      options: [
        { value: "info_sammeln", label: "Wir habe(n) grundsätzliches Interesse, sammeln derzeit Informationen" },
        { value: "planung_stockt_ggv", label: "Wir sind fortgeschritten in der Planung, aber es stockt mit der Umsetzung GGV/Mieterstrom" },
        { value: "planung_stockt_pv", label: "Wir sind fortgeschritten in der Planung, aber es stockt mit der Installation der PV-Anlage" },
        { value: "planung_fast_fertig", label: "Wir sind fast fertig mit der Planung" },
        { value: "pv_laeuft_ggv_planung", label: "Die PV-Anlage läuft schon, aber die GGV/Mieterstrom ist noch in Planung" },
        { value: "pv_laeuft_ggv_laeuft", label: "Die PV-Anlage läuft bereits mit GGV/Mieterstrom" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
      required: true,
    },
    {
      id: "ggvOrMieterstromDecision",
      type: "single-select",
      label: "B2. Sind Sie bereits festgelegt auf GGV oder Mieterstrom?",
      options: [
        { value: "sicher_ggv", label: "Wir sind sicher - es wird/ist GGV" },
        { value: "unsicher", label: "Wir sind unsicher - es fehlen noch Informationen für eine Entscheidung" },
        { value: "sicher_mieterstrom", label: "Wir sind sicher - es wird/ist Mieterstrom" },
      ],
      visibilityLogic: "Nur wenn in #5 'GGV', 'Mieterstrom' oder 'GGV oder Mieterstrom' ausgewählt",
    },
    {
      id: "ggvDecisionReasons",
      type: "multi-select",
      label: "B3. Falls Sie derzeit eher zur GGV tendieren oder sich dafür entschlossen haben - warum?",
      description: "Mehrfachauswahl möglich",
      options: [
        { value: "buerokratie_mieterstrom", label: "Wegen der bürokratischen Herausforderungen bei Mieterstrom" },
        { value: "reststrom_pflicht", label: "Wegen der Pflicht zum Einkauf von Reststrom bei Mieterstrom" },
        { value: "ladesaeulen_waermepumpen", label: "Weil die Einbindung von Ladesäulen/Wärmepumpen einfacher ist" },
        { value: "vnb_empfehlung", label: "Weil unser VNB das empfiehlt" },
        { value: "finanziell_attraktiver", label: "Weil das finanziell attraktiver ist" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
      visibilityLogic: "Nur wenn #18 = 'sicher_ggv' (Kontrollfrage, keine Logik-Auswirkung)",
    },
    {
      id: "mieterstromDecisionReasons",
      type: "multi-select",
      label: "B4. Falls Sie derzeit eher zu Mieterstrom tendieren oder sich dafür entschlossen haben - warum?",
      description: "Mehrfachauswahl möglich",
      options: [
        { value: "einfacher_umsetzung", label: "Weil das in der Umsetzung einfacher zu sein scheint" },
        { value: "kein_dienstleister_ggv", label: "Weil wir für die GGV nicht den richtigen Dienstleister finden" },
        { value: "vnb_empfehlung", label: "Weil unser VNB das empfiehlt" },
        { value: "vnb_kann_ggv_nicht", label: "Weil der VNB die GGV nicht umsetzen kann" },
        { value: "finanziell_attraktiver", label: "Weil das finanziell attraktiver ist" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
      visibilityLogic: "Nur wenn #18 = 'sicher_mieterstrom' (Kontrollfrage, keine Logik-Auswirkung)",
    },
    {
      id: "implementationApproach",
      type: "multi-select",
      label: "B5. Wollen/wollten Sie das Projekt weitgehend alleine umsetzen, oder planen/planten Sie die Zusammenarbeit mit einem Dienstleister?",
      description: "Über die Installation der PV-Anlage hinaus - Mehrfachauswahl möglich",
      options: [
        { value: "alleine", label: "Wir möchten möglichst viel alleine machen - inkl. der Abrechnung mit den Teilnehmenden" },
        { value: "dienstleister_ok", label: "Dienstleister sind OK, solange das preislich attraktiv ist" },
        { value: "dienstleister_alles", label: "Ideal wäre es, wenn sich ein Dienstleister um alles kümmert" },
      ],
    },
  ],
};

// === SECTION: Planung Allgemeines - Herausforderungen ===
const SECTION_CHALLENGES: SurveySection = {
  id: "challenges",
  title: "Planung: Allgemeines – Herausforderungen",
  description: "Erlebte Schwierigkeiten bei der Umsetzung",
  visibilityLogic: "Nur wenn in #5 'GGV', 'Mieterstrom' oder 'GGV oder Mieterstrom' ausgewählt",
  questions: [
    {
      id: "challenges",
      type: "multi-select",
      label: "Gab oder gibt es wesentliche Herausforderungen?",
      description: "Mehrfachauswahl möglich",
      options: [
        { value: "keine", label: "Nein, alles läuft gut", exclusive: true }, // P0.3: marked as exclusive
        { value: "pv_installation", label: "Technische Probleme mit der Installation der PV-Anlage", hasTextField: true, textFieldLabel: "Was war das Problem?" },
        { value: "vnb_blockiert", label: "Der VNB lässt die Umsetzung von GGV / Mieterstrom nicht zu", hasTextField: true, textFieldLabel: "Gründe des VNB" },
        { value: "kosten_zu_hoch", label: "Die Kosten für die Umsetzung der GGV / Mieterstrom sind zu hoch", hasTextField: true, textFieldLabel: "Details zu den Kosten" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldLabel: "Andere Herausforderungen" },
      ],
    },
  ],
};

// === SECTION C: Planung Modellspezifisch - GGV ===
const SECTION_VNB_PLANNING_GGV: SurveySection = {
  id: "vnb-planning",
  title: "Planung: Modellspezifisch – GGV (C)",
  description: "Details zur GGV-Planung mit dem Verteilnetzbetreiber",
  visibilityLogic: "Nur wenn in #5 'GGV' oder 'GGV oder Mieterstrom' ausgewählt",
  questions: [
    {
      id: "vnbExistingProjects",
      type: "single-select",
      label: "C1. Gibt es im Netzgebiet Ihres VNB schon GGV-Projekte?",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "nein", label: "Nein, es gibt sicher noch keine" },
        { value: "ja_mindestens_eins", label: "Ja, es gibt mindestens eins" },
        { value: "ja_viele", label: "Ja, es gibt schon eine ganze Reihe" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
    },
    {
      id: "vnbContact",
      type: "single-select", // Changed from multi-select to single-select per P0.6
      label: "C2. Waren Sie schon im Kontakt mit Ihrem VNB?",
      options: [
        { value: "ja_direkt", label: "Ja, wir hatten direkten Kontakt mit dem VNB" },
        { value: "ja_installateur", label: "Ja, über den Installateur/Dienstleister" },
        { value: "nein", label: "Nein, noch kein Kontakt" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
      optional: true,
    },
    {
      id: "vnbResponse",
      type: "multi-select",
      label: "C3. Welche Aussage zur Rückmeldung vom VNB zur GGV trifft zu?",
      description: "Mehrfachauswahl möglich",
      options: [
        { value: "moeglich_gmssb", label: "Umsetzung der GGV ist heute schon möglich, der VNB/gMSB kann dies auch als Messstellenbetreiber machen" },
        { value: "moeglich_wmsb", label: "Umsetzung der GGV ist heute schon möglich, wir müssen aber einen wettbewerblichen Messstellenbetreiber beauftragen" },
        { value: "keine_antwort", label: "Unser VNB hat die Anfrage bisher nicht beantwortet" },
        { value: "nicht_moeglich", label: "Unser VNB sagt, dass eine Umsetzung bislang nicht möglich ist", hasTextField: true, textFieldLabel: "Gründe des VNB" },
      ],
      optional: true,
    },
    {
      id: "vnbSupportMesskonzept",
      type: "text",
      label: "C4.1 Informationen zum Messkonzept (Weblink)",
      placeholder: "https://...",
      optional: true,
      helpText: "Stellt Ihr VNB konkrete Unterstützung für die massentaugliche Umsetzung der GGV online bereit?",
    },
    {
      id: "vnbSupportFormulare",
      type: "text",
      label: "C4.2 Formulare für die Übermittlung der Teilnehmenden & Aufteilungsschlüssel (Weblink)",
      placeholder: "https://...",
      optional: true,
    },
    {
      id: "vnbSupportPortal",
      type: "single-select",
      label: "C4.3 Online-Portal für die Übermittlung der Teilnehmenden & Aufteilungsschlüssel",
      options: [
        { value: "ja", label: "Ja, vorhanden" },
        { value: "nein", label: "Nein, nicht vorhanden" },
      ],
      optional: true,
    },
    {
      id: "vnbSupportOther",
      type: "text",
      label: "C4.4 Weiteres",
      placeholder: "Weitere Unterstützungsangebote...",
      optional: true,
    },
    {
      id: "vnbContactHelpful",
      type: "single-select",
      label: "C5. Bietet Ihr VNB eine Kontaktmöglichkeit zur GGV und ist das hilfreich?",
      options: [
        { value: "ja_hilfreich", label: "Ja, es gibt eine Kontaktmöglichkeit (Mailadresse/Telefonnummer) und da wurde uns geholfen" },
        { value: "ja_nicht_hilfreich", label: "Ja, aber es gab wenig hilfreiche Information" },
        { value: "nein", label: "Nein, es gibt keine Kontaktmöglichkeit" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
    },
    {
      id: "vnbPersonalContacts",
      type: "single-select",
      label: "C6. Haben Sie persönliche Kontakte bei Ihrem Verteilnetzbetreiber?",
      options: [
        { value: "ja_bestanden", label: "Ja, es bestanden schon persönliche Kontakte zum VNB" },
        { value: "ja_entstanden", label: "Ja, persönliche Kontakte sind bei der Umsetzung der GGV entstanden" },
        { value: "nein", label: "Nein, es bestehen keine persönlichen Kontakte" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
    },
    {
      id: "vnbSupportRating",
      type: "rating",
      label: "C7. Wie sehr fühlen Sie sich von Ihrem VNB in der Planung der GGV unterstützt?",
      min: 1,
      max: 10,
      minLabel: "bremst aktiv", // P1.7: neutralized rating labels
      maxLabel: "unterstützt aktiv",
    },
    {
      id: "vnbMsbOffer",
      type: "single-select",
      label: "C8. Bietet Ihr VNB an, den Messstellenbetrieb in der GGV zu übernehmen?",
      options: [
        { value: "ja", label: "Ja, der VNB/gMSB bietet an, den Messstellenbetrieb zu übernehmen" },
        { value: "nein_wmsb", label: "Nein - ich brauche dafür einen wettbewerblichen Messstellenbetreiber" },
        { value: "nein_gar_nicht", label: "Nein - und auch mit einem wettbewerblichen Messstellenbetreiber geht das nicht" },
      ],
      skipLogic: "Je nach Auswahl werden unterschiedliche Folgefragen angezeigt",
    },
  ],
};

// === SECTION: Planung Modellspezifisch - GGV MSB Details ===
const SECTION_VNB_MSB_DETAILS: SurveySection = {
  id: "vnb-msb",
  title: "Planung: Modellspezifisch – GGV MSB Details (C8)",
  description: "Details zum Messstellenbetreiber-Angebot",
  visibilityLogic: "Nur wenn #33 beantwortet",
  questions: [
    {
      id: "vnbStartTimeline",
      type: "single-select",
      label: "C8.1a Ab wann kann das starten? (wenn VNB MSB anbietet)",
      options: [
        { value: "sofort", label: "Sofort - wir sind in der Planung und das sieht gut aus" },
        { value: "zeitnah", label: "Zeitnah - wir warten auf den Start jederzeit" },
        { value: "12_monate", label: "In den nächsten 12 Monaten" },
        { value: "spaeter", label: "Später als in 12 Monaten" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
      visibilityLogic: "Nur wenn #33 = 'ja'",
    },
    {
      id: "vnbAdditionalCosts",
      type: "single-select",
      label: "C8.1b Stellt Ihr VNB/gMSB zusätzliche Kosten für einen 'Einbau auf Kundenwunsch' in Rechnung?",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "nein", label: "Nein, unser VNB/gMSB verlangt hier keine Zusatzkosten" },
        { value: "ja", label: "Ja, unser VNB/gMSB verlangt dafür Zusatzkosten" },
      ],
      visibilityLogic: "Nur wenn #33 = 'ja'",
    },
    {
      id: "vnbAdditionalCostsOneTime",
      type: "number",
      label: "Einmalbetrag (EUR)",
      placeholder: "z.B. 500",
      optional: true,
      visibilityLogic: "Nur wenn vnbAdditionalCosts = 'ja'",
      conditionalRequired: "vnbAdditionalCosts='ja' - mindestens Einmalbetrag oder Jährlicher Betrag erforderlich", // P0.5
    },
    {
      id: "vnbAdditionalCostsYearly",
      type: "number",
      label: "Jährlicher Betrag (EUR)",
      placeholder: "z.B. 100",
      optional: true,
      visibilityLogic: "Nur wenn vnbAdditionalCosts = 'ja'",
      conditionalRequired: "vnbAdditionalCosts='ja' - mindestens Einmalbetrag oder Jährlicher Betrag erforderlich", // P0.5
    },
    {
      id: "vnbFullService",
      type: "single-select",
      label: "C8.1c Einschränkende Bedingung Full-Service-Angebot",
      options: [
        { value: "nur_full_service", label: "Unser Stadtwerk/VNB bietet den Messstellenbetrieb in der GGV nur in Kombination mit einem Full-Service-Angebot an - also inkl. der Stromlieferung durch das Stadtwerk" },
        { value: "auch_ohne", label: "Unser Stadtwerk/VNB bietet die Zusammenarbeit an der GGV auch an, ohne selber den Strom zu verkaufen" },
      ],
      visibilityLogic: "Nur wenn vnbMsbOffer = 'ja'",
    },
    {
      id: "vnbDataProvision",
      type: "single-select",
      label: "C8.1d Wie beabsichtigt Ihr VNB, Ihnen die für die Abrechnung benötigten Daten bereitzustellen?",
      options: [
        { value: "mail_excel", label: "Der VNB/gMSB stellt uns die Daten per Mail als Excel zur Verfügung" },
        { value: "portal_verrechnete_werte", label: "Der VNB/gMSB stellt uns die Daten über ein Online-Portal zur Verfügung, in dem wir die verrechneten Werte runterladen können" },
        { value: "portal_alle_messwerte", label: "Der VNB/gMSB stellt uns die Daten über ein Online-Portal zur Verfügung, in dem wir auf alle Messwerte der Teilnehmer zugreifen können, um diese selber zu verrechnen" },
        { value: "dienstleister_marktkommunikation", label: "Für das Abrufen der Daten brauchen wir einen eigenen Dienstleister, der die Daten über die Marktkommunikation vom VNB/gMSB abruft" },
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
      visibilityLogic: "Nur wenn vnbMsbOffer = 'ja'",
    },
    {
      id: "vnbDataCost",
      type: "single-select",
      label: "C8.1e Falls Ihr VNB/gMSB die Daten direkt an Sie übermittelt, was wird es kosten?",
      options: [
        { value: "kostenlos", label: "Kostenlos" },
        { value: "weniger_3_eur", label: "Weniger als 3 EUR/Messstelle/Jahr" },
        { value: "mehr_3_eur", label: "Mehr als 3 EUR/Messstelle/Jahr" },
        { value: "keine_auskunft", label: "Dazu gibt es noch keine Auskunft" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
      visibilityLogic: "Nur wenn vnbMsbOffer = 'ja'",
    },
    {
      id: "vnbEsaCost",
      type: "single-select",
      label: "C8.1f Falls die Daten von einem Dienstleister über die 'ESA-Marktrolle' abgeholt werden müssen: Verlangt der VNB/gMSB dafür Geld?",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "kostenlos", label: "Das macht er umsonst" },
        { value: "weniger_3_eur", label: "Dafür verlangt er weniger (oder gleich) 3 EUR/Messstelle/Jahr" },
        { value: "mehr_3_eur", label: "Dafür verlangt er mehr als 3 EUR/Messstelle/Jahr" },
      ],
      visibilityLogic: "Nur wenn vnbMsbOffer = 'ja'",
    },
    {
      id: "vnbMsbTimeline",
      type: "single-select",
      label: "C8.2a Hat der VNB in Aussicht gestellt, ab wann der grundzuständige Messstellenbetreiber die Verrechnung durchführen kann?",
      options: [
        { value: "ja_12_monate", label: "Ja, innerhalb der nächsten 12 Monate" },
        { value: "ja_spaeter", label: "Ja, in über 12 Monaten" },
        { value: "nicht_gefragt", label: "Nein, das haben wir nicht gefragt" },
        { value: "keine_aussage", label: "Nein, dazu gab es keine Aussage" },
      ],
      visibilityLogic: "Nur wenn vnbMsbOffer = 'nein_wmsb'",
    },
    {
      id: "vnbRejectionTimeline",
      type: "single-select",
      label: "C8.2b Gibt es schon eine Aussage, ab wann eine Umsetzung möglich sein wird?",
      options: [
        { value: "ja_12_monate", label: "Ja, innerhalb der nächsten 12 Monate" },
        { value: "ja_spaeter", label: "Ja, in über 12 Monaten" },
        { value: "nicht_gefragt", label: "Nein, das haben wir nicht gefragt" },
        { value: "keine_aussage", label: "Nein, dazu gab es keine Aussage" },
      ],
      visibilityLogic: "Nur wenn vnbMsbOffer = 'nein_gar_nicht'",
    },
    {
      id: "vnbWandlermessung",
      type: "single-select",
      label: "C9. Verlangt Ihr VNB einen neuen zusätzlichen Zähler direkt hinter dem Netzanschluss des Gebäudes?",
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
      label: "Ergänzende Informationen zur Wandlermessung",
      placeholder: "Weitere Details...",
      optional: true,
      visibilityLogic: "Wenn vnbWandlermessung beantwortet",
    },
    {
      id: "vnbPlanningDuration",
      type: "single-select",
      label: "C10. Wie lange sind Sie bereits in Diskussionen zur Umsetzung der GGV mit Ihrem VNB?",
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
      placeholder: "Beschreiben Sie die Gründe...",
      optional: true,
    },
  ],
};

// === SECTION D: Betrieb Modellspezifisch - GGV ===
const SECTION_GGV_OPERATION: SurveySection = {
  id: "ggv-operation",
  title: "Betrieb: Modellspezifisch – GGV (D)",
  description: "Erfahrungen im laufenden GGV-Betrieb",
  visibilityLogic: "Nur wenn #17 = 'pv_laeuft_ggv_laeuft'",
  questions: [
    {
      id: "operationVnbDuration",
      type: "single-select",
      label: "D0. Wie lange hat die Abstimmung mit dem VNB zur GGV gedauert?",
      options: [
        { value: "unter_2_monate", label: "Unter 2 Monaten" },
        { value: "2_bis_12_monate", label: "Zwischen 2 und 12 Monaten" },
        { value: "ueber_12_monate", label: "Über 12 Monate" },
      ],
    },
    {
      id: "operationVnbDurationReasons",
      type: "textarea",
      label: "Falls es lange dauerte: Was war das große Problem?",
      placeholder: "Beschreiben Sie die Gründe...",
      optional: true,
    },
    {
      id: "operationWandlermessung",
      type: "single-select",
      label: "D1. Hat Ihr VNB einen neuen zusätzlichen Zähler direkt hinter dem Netzanschluss des Gebäudes verlangt (Wandlermessung > 5.000 EUR)?",
      options: [
        { value: "ja", label: "Ja" },
        { value: "nein", label: "Nein" },
        { value: "wissen_nicht", label: "Das wissen wir nicht" },
      ],
    },
    {
      id: "operationWandlermessungComment",
      type: "textarea",
      label: "Ergänzende Informationen zur Wandlermessung",
      placeholder: "Weitere Details...",
      optional: true,
      visibilityLogic: "Wenn operationWandlermessung beantwortet",
    },
    {
      id: "operationMsbProvider",
      type: "single-select",
      label: "D2.1 Messstellenbetrieb: Wer baut die Smart Meter ein und betreibt sie?",
      options: [
        { value: "gmsb", label: "Unser lokaler gMSB (meist das gleiche Unternehmen wie der VNB)" },
        { value: "wmsb", label: "Ein wMSB" },
      ],
    },
    {
      id: "operationAllocationProvider",
      type: "single-select",
      label: "D2.2 Aufteilung der PV-Stromerzeugung auf die Teilnehmenden (Verrechnung)",
      options: [
        { value: "gmsb", label: "Unser lokaler gMSB" },
        { value: "wmsb", label: "Ein wMSB" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
    },
    {
      id: "operationDataProvider",
      type: "single-select",
      label: "D2.3 Übermittlung der errechneten Strommengen je Teilnehmer",
      options: [
        { value: "gmsb", label: "Unser lokaler gMSB (meist das gleiche Unternehmen wie der VNB)" },
        { value: "wmsb", label: "Ein wMSB" },
      ],
    },
    {
      id: "operationMsbDuration",
      type: "single-select",
      label: "D3.1 Wie lange hat es gedauert von Bestellung bis zum Einbau der Smart Meter?",
      options: [
        { value: "wissen_nicht", label: "Weiß ich nicht" },
        { value: "schnell", label: "Das ging problemlos und schnell" },
        { value: "4_monate", label: "Ca. 4 Monate (gesetzlich vorgegebene Frist)" },
        { value: "laenger", label: "Deutlich länger als 4 Monate" },
      ],
      visibilityLogic: "Wenn operationMsbProvider = 'gmsb'",
    },
    {
      id: "operationMsbAdditionalCosts",
      type: "single-select",
      label: "D3.2 Stellt der VNB/gMSB zusätzliche Kosten für den 'Einbau auf Kundenwunsch' in Rechnung?",
      options: [
        { value: "nein", label: "Nein, unser VNB/gMSB verlangt hier keine Zusatzkosten" },
        { value: "ja", label: "Ja, unser VNB/gMSB verlangt dafür Zusatzkosten" },
        { value: "wissen_nicht", label: "Wissen wir nicht" },
      ],
      visibilityLogic: "Wenn operationMsbProvider = 'gmsb'",
    },
    {
      id: "operationMsbAdditionalCostsOneTime",
      type: "number",
      label: "Einmalbetrag (EUR)",
      placeholder: "z.B. 500",
      optional: true,
      visibilityLogic: "Wenn operationMsbAdditionalCosts = 'ja'",
      conditionalRequired: "operationMsbAdditionalCosts='ja' - mindestens Einmalbetrag oder Jährlicher Betrag erforderlich",
    },
    {
      id: "operationMsbAdditionalCostsYearly",
      type: "number",
      label: "Jährlicher Betrag (EUR)",
      placeholder: "z.B. 100",
      optional: true,
      visibilityLogic: "Wenn operationMsbAdditionalCosts = 'ja'",
      conditionalRequired: "operationMsbAdditionalCosts='ja' - mindestens Einmalbetrag oder Jährlicher Betrag erforderlich",
    },
    {
      id: "operationAllocationWho",
      type: "single-select",
      label: "D4. Falls jemand anderes als der VNB/gMSB die Aufteilung der Strommengen vornimmt, wer ist das?",
      options: [
        { value: "wissen_nicht", label: "Weiß ich nicht" },
        { value: "dienstleister", label: "Das macht ein Dienstleister, den ich bezahle" },
        { value: "selber", label: "Das mache ich selber, auf Basis der kompletten Verbrauchsdaten aller Teilnehmenden" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
      visibilityLogic: "Wenn operationAllocationProvider nicht 'gmsb'",
    },
    {
      id: "operationDataFormat",
      type: "single-select",
      label: "D5.1 Wie erhalten Sie die Daten?",
      options: [
        { value: "mail_excel", label: "Der VNB/gMSB stellt uns die Daten per Mail als Excel zur Verfügung" },
        { value: "portal_verrechnete_werte", label: "Der VNB/gMSB stellt uns die Daten über ein Online-Portal zur Verfügung, in dem wir die verrechneten Werte runterladen können" },
        { value: "portal_alle_messwerte", label: "Der VNB/gMSB stellt uns die Daten über ein Online-Portal zur Verfügung, in dem wir auf alle Messwerte der Teilnehmer zugreifen können" },
        { value: "dienstleister_marktkommunikation", label: "Für das Abrufen der Daten brauchen wir einen eigenen Dienstleister, der die Daten über die Marktkommunikation vom VNB/gMSB abruft" },
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
    },
    {
      id: "operationDataCost",
      type: "single-select",
      label: "D5.2 Wieviel kostet die Bereitstellung der verrechneten Werte?",
      description: "Dabei sind die Kosten für die Smart Meter nicht zu berücksichtigen",
      options: [
        { value: "kostenlos", label: "Kostenlos" },
        { value: "weniger_3_eur", label: "Dauerhaft weniger (oder gleich) 3 EUR/Messstelle pro Jahr" },
        { value: "mehr_3_eur", label: "Dauerhaft mehr als 3 EUR/Messstelle pro Jahr" },
        { value: "aktuell_kostenlos", label: "Aktuell kostenlos, das wird sich aber ändern" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
    },
    {
      id: "operationDataCostAmount",
      type: "number",
      label: "Betrag in EUR/Messstelle/Jahr",
      placeholder: "z.B. 5",
      optional: true,
      visibilityLogic: "Wenn operationDataCost = 'mehr_3_eur'",
    },
    {
      id: "operationEsaCost",
      type: "single-select",
      label: "D6. Falls Ihr Dienstleister die Werte vom VNB/gMSB für Sie abruft (ESA-Marktrolle), verlangt der VNB/gMSB dafür Geld?",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "kostenlos", label: "Nein, das macht er umsonst" },
        { value: "weniger_3_eur", label: "Ja, dafür verlangt er weniger (oder gleich) 3 EUR/Messstelle/Jahr" },
        { value: "mehr_3_eur", label: "Ja, dafür verlangt er mehr als 3 EUR/Messstelle/Jahr" },
      ],
    },
    {
      id: "operationEsaCostAmount",
      type: "number",
      label: "Betrag in EUR/Messstelle/Jahr",
      placeholder: "z.B. 5",
      optional: true,
      visibilityLogic: "Wenn operationEsaCost = 'mehr_3_eur'",
    },
    {
      id: "operationSatisfactionRating",
      type: "rating",
      label: "D7. Wie zufrieden sind Sie mit Ihrem VNB bei der Umsetzung des Projektes?",
      min: 1,
      max: 10,
      minLabel: "Unser VNB will das eigentlich lieber verhindern",
      maxLabel: "Unser VNB möchte das wirklich mit uns umsetzen",
    },
  ],
};

// === SECTION: Betrieb Modellspezifisch - GGV Dienstleister ===
const SECTION_SERVICE_PROVIDER: SurveySection = {
  id: "service-provider",
  title: "Betrieb: Modellspezifisch – Dienstleister (GGV)",
  description: "Feedback zu Dienstleistern & Reaktionen",
  visibilityLogic: "Nur wenn in #5 'GGV' oder 'GGV oder Mieterstrom' ausgewählt",
  questions: [
    {
      id: "serviceProviderName",
      type: "text",
      label: "D8. Mit welchem Dienstleister arbeiten Sie zusammen?",
      placeholder: "Name des Dienstleisters",
      optional: true,
    },
    {
      id: "serviceProviderRating",
      type: "rating",
      label: "Zufriedenheit mit Dienstleister 1",
      min: 1,
      max: 10,
      minLabel: "Sehr unzufrieden",
      maxLabel: "Sehr zufrieden",
      optional: true,
      visibilityLogic: "Wenn serviceProviderName ausgefüllt",
    },
    {
      id: "serviceProviderComments",
      type: "textarea",
      label: "Kommentare zu Dienstleister 1",
      placeholder: "Was lief gut? Was könnte besser sein?",
      optional: true,
      visibilityLogic: "Wenn serviceProviderName ausgefüllt",
    },
    {
      id: "serviceProvider2Name",
      type: "text",
      label: "Dienstleister 2 (optional)",
      placeholder: "Name des zweiten Dienstleisters",
      optional: true,
      visibilityLogic: "Wenn serviceProviderName ausgefüllt",
    },
    {
      id: "serviceProvider2Rating",
      type: "rating",
      label: "Zufriedenheit mit Dienstleister 2",
      min: 1,
      max: 10,
      minLabel: "Sehr unzufrieden",
      maxLabel: "Sehr zufrieden",
      optional: true,
      visibilityLogic: "Wenn serviceProvider2Name ausgefüllt",
    },
    {
      id: "vnbRejectionResponse",
      type: "multi-select",
      label: "D9. Falls Ihr VNB die GGV nicht oder nur unzureichend anbietet/umsetzt, wie haben Sie bislang reagiert?",
      options: [
        { value: "bnetza", label: "Wir haben uns bereits an die BNetzA gewendet" },
        { value: "rechtliche_schritte", label: "Wir überlegen rechtliche Schritte zu gehen" },
        { value: "keine_schritte", label: "Wir sind bei dem Anschluss anderer Projekte auf den VNB angewiesen und sehen von rechtlichen Schritten gegenüber dem VNB ab" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
      optional: true,
    },
  ],
};

// === SECTION: Planung Modellspezifisch - Mieterstrom ===
const SECTION_MIETERSTROM_PLANNING: SurveySection = {
  id: "mieterstrom-planning",
  title: "Planung: Modellspezifisch – Mieterstrom (M)",
  description: "Details zu Mieterstrom-Projekten",
  visibilityLogic: "Nur wenn in #5 'Mieterstrom' oder 'GGV oder Mieterstrom' ausgewählt",
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
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
    },
    {
      id: "mieterstromChallenges",
      type: "multi-select",
      label: "M2. Gab oder gibt es wesentliche Herausforderungen?",
      options: [
        { value: "keine", label: "Nein, alles läuft gut", exclusive: true }, // P0.3: marked as exclusive
        { value: "opposition", label: "Manche Parteien im Haus sind gegen das Projekt", hasTextField: true },
        { value: "pv_installation", label: "Technische Probleme mit der Installation der PV-Anlage", hasTextField: true },
        { value: "vnb_blocking", label: "Der VNB lässt die Umsetzung von Mieterstrom nicht zu", hasTextField: true },
        { value: "kosten", label: "Die Kosten für die Umsetzung des Mieterstrom sind zu hoch", hasTextField: true },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
    },
    {
      id: "mieterstromExistingProjects",
      type: "single-select",
      label: "M3. Gibt es im Netzgebiet Ihres VNB schon Mieterstrom-Projekte?",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "nein", label: "Nein, es gibt sicher noch keine" },
        { value: "ja_mindestens_eins", label: "Ja, es gibt mindestens eins" },
        { value: "ja_viele", label: "Ja, es gibt schon eine ganze Reihe" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
    },
    {
      id: "mieterstromExistingProjectsVirtuell",
      type: "single-select",
      label: "M4. Gibt es im Netzgebiet Ihres VNB schon Mieterstrom-Projekte mit virtuellem Summenzähler?",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "nein", label: "Nein, es gibt sicher noch keine" },
        { value: "ja_mindestens_eins", label: "Ja, es gibt mindestens eins" },
        { value: "ja_viele", label: "Ja, es gibt schon eine ganze Reihe" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
    },
    {
      id: "mieterstromVnbContact",
      type: "single-select",
      label: "M5. Waren Sie schon im Kontakt mit Ihrem VNB?",
      options: [
        { value: "direkt", label: "Ja, wir hatten direkten Kontakt mit dem VNB" },
        { value: "installateur", label: "Nein, nur über den Installateur/Dienstleister" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
      optional: true,
    },
    {
      id: "mieterstromVirtuellAllowed",
      type: "single-select",
      label: "M6. Lässt Ihr VNB/gMSB die Umsetzung des sogenannten 'virtuellen Summenzählers' durch einen wettbewerblichen MSB zu?",
      options: [
        { value: "ja", label: "Ja" },
        { value: "nein", label: "Nein" },
      ],
      visibilityLogic: "Wenn mieterstromSummenzaehler = 'virtuell'",
    },
    {
      id: "mieterstromVirtuellWandlermessung",
      type: "single-select",
      label: "M7. Wenn Ihr VNB/gMSB die Umsetzung des 'virtuellen Summenzählers' zulässt, verlangt er dennoch den Einbau eines Zählers direkt am Hausanschlusspunkt (Wandlermessung, Kosten >5.000 EUR)?",
      options: [
        { value: "nein", label: "Nein" },
        { value: "ja", label: "Ja", hasTextField: true },
      ],
      visibilityLogic: "Wenn mieterstromVirtuellAllowed = 'ja'",
    },
    {
      id: "mieterstromVnbResponse",
      type: "multi-select",
      label: "M8. Welche Aussage zur Rückmeldung vom VNB trifft zu?",
      description: "Mehrfachauswahl möglich",
      options: [
        { value: "moeglich_gmsb", label: "Wir können Mieterstrom umsetzen, der VNB/gMSB kann dies als Messstellenbetreiber machen" },
        { value: "moeglich_wmsb", label: "Wir können Mieterstrom umsetzen, müssen aber einen wettbewerblichen Messstellenbetreiber beauftragen" },
        { value: "keine_antwort", label: "Unser VNB hat die Anfrage bisher nicht beantwortet" },
        { value: "nicht_moeglich", label: "Unser VNB sagt, dass eine Umsetzung bislang nicht möglich ist", hasTextField: true },
      ],
      optional: true,
    },
    {
      id: "mieterstromVnbSupport",
      type: "multi-select",
      label: "M9. Stellt Ihr VNB konkrete Unterstützung für die massentaugliche Umsetzung von Mieterstrom bereit?",
      options: [
        { value: "messkonzept", label: "Informationen zum Messkonzept und Prozessen", hasTextField: true, textFieldLabel: "Weblink" },
        { value: "formulare", label: "Formulare für die Übermittlung der Teilnehmenden / Änderungen" },
        { value: "portal", label: "Online-Portal für die Übermittlung der Teilnehmenden / Änderungen" },
        { value: "sonstiges", label: "Weiteres", hasTextField: true },
      ],
      optional: true,
    },
    {
      id: "mieterstromVnbHelpful",
      type: "single-select",
      label: "M10. Bietet Ihr VNB eine Kontaktmöglichkeit für Mieterstrom und ist das hilfreich?",
      options: [
        { value: "ja_hilfreich", label: "Ja, es gibt eine Kontaktmöglichkeit und da wurde uns geholfen" },
        { value: "ja_nicht_hilfreich", label: "Ja, aber es gab wenig hilfreiche Information" },
        { value: "nein", label: "Nein, es gibt keine Kontaktmöglichkeit" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
    },
    {
      id: "mieterstromPersonalContacts",
      type: "single-select",
      label: "M11. Haben Sie persönliche Kontakte bei Ihrem Verteilnetzbetreiber?",
      options: [
        { value: "ja_bestanden", label: "Ja, es bestanden schon persönliche Kontakte zum VNB" },
        { value: "ja_entstanden", label: "Ja, persönliche Kontakte sind bei der Umsetzung von Mieterstrom entstanden" },
        { value: "nein", label: "Nein, es bestehen keine persönlichen Kontakte" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
    },
    {
      id: "mieterstromSupportRating",
      type: "rating",
      label: "Wie sehr fühlen Sie sich von Ihrem VNB in der Planung von Mieterstrom unterstützt?",
      min: 1,
      max: 10,
      minLabel: "Unser VNB will das eigentlich lieber verhindern",
      maxLabel: "Unser VNB möchte das wirklich mit uns umsetzen",
    },
  ],
};

// === SECTION: Planung Modellspezifisch - Mieterstrom VNB Angebot ===
const SECTION_MIETERSTROM_VNB_OFFER: SurveySection = {
  id: "mieterstrom-vnb-offer",
  title: "Planung: Modellspezifisch – VNB Angebot Mieterstrom (MP)",
  description: "Details zum MSB-Angebot des VNB für Mieterstrom",
  visibilityLogic: "Nur wenn Mieterstrom ausgewählt und nicht in Betrieb",
  questions: [
    {
      id: "mieterstromFullService",
      type: "single-select",
      label: "MP1a. Full-Service-Angebot",
      options: [
        { value: "nur_full_service", label: "Unser Stadtwerk/VNB bietet den Messstellenbetrieb nur in Kombination mit einem Full-Service-Angebot an - also inkl. der Stromlieferung durch das Stadtwerk" },
        { value: "auch_ohne", label: "Unser Stadtwerk/VNB bietet dies auch ohne Stromlieferverträge an" },
      ],
    },
    {
      id: "mieterstromMsbCosts",
      type: "single-select",
      label: "MP1b. Stellt Ihr VNB/gMSB zusätzliche Kosten für einen 'Einbau auf Kundenwunsch' in Rechnung?",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "nein", label: "Nein, unser VNB/gMSB verlangt hier keine Zusatzkosten" },
        { value: "ja", label: "Ja, unser VNB/gMSB verlangt dafür Zusatzkosten" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
    },
    {
      id: "mieterstromMsbCostsOneTime",
      type: "number",
      label: "Einmalbetrag (EUR)",
      placeholder: "z.B. 500",
      optional: true,
      visibilityLogic: "Wenn mieterstromMsbCosts = 'ja'",
      conditionalRequired: "mieterstromMsbCosts='ja' - mindestens Einmalbetrag oder Jährlicher Betrag erforderlich", // P0.5
    },
    {
      id: "mieterstromMsbCostsYearly",
      type: "number",
      label: "Jährlicher Betrag (EUR)",
      placeholder: "z.B. 100",
      optional: true,
      visibilityLogic: "Wenn mieterstromMsbCosts = 'ja'",
      conditionalRequired: "mieterstromMsbCosts='ja' - mindestens Einmalbetrag oder Jährlicher Betrag erforderlich", // P0.5
    },
    {
      id: "mieterstromModelChoice",
      type: "single-select",
      label: "MP1c. Auswahl an Umsetzungsmodellen",
      options: [
        { value: "virtuell", label: "Einen 'virtuellen Summenzähler' mit Smart Metern - die Installation einer Wandlermessung am Hausanschluss ('physikalischer Summenzähler' für >5.000 EUR) bleibt uns damit erspart" },
        { value: "physikalisch", label: "Ein sogenanntes 'physikalisches Summenzählermodell' (erfordert einen 'physikalischen Summenzähler')" },
      ],
    },
    {
      id: "mieterstromDataProvision",
      type: "single-select",
      label: "MP1d. Bereitstellung der Daten",
      options: [
        { value: "direkt_guenstig", label: "Der VNB/gMSB stellt uns die Daten direkt zur Verfügung (Excel-Listen, Online-Portal o.ä.) - für weniger (oder gleich) 3 EUR/Messstelle/Jahr" },
        { value: "direkt_teuer", label: "Der VNB/gMSB stellt uns die Daten direkt zur Verfügung (Excel-Listen, Online-Portal o.ä.) - verlangt dafür mehr als 3 EUR/Messstelle/Jahr" },
        { value: "marktkommunikation", label: "Der VNB/gMSB stellt die Daten lediglich über die Marktkommunikation zur Verfügung, wir brauchen einen Dienstleister für das Abrufen der Daten" },
      ],
    },
  ],
};

// === SECTION: Betrieb Modellspezifisch - Mieterstrom ===
const SECTION_MIETERSTROM_OPERATION: SurveySection = {
  id: "mieterstrom-operation",
  title: "Betrieb: Modellspezifisch – Mieterstrom (MB)",
  description: "Erfahrungen im laufenden Mieterstrom-Betrieb",
  visibilityLogic: "Nur wenn Mieterstrom in Betrieb",
  questions: [
    {
      id: "mieterstromVnbRole",
      type: "single-select",
      label: "MB1. Welche Rolle übernimmt der VNB in Ihrem Mieterstrom-Projekt?",
      options: [
        { value: "keine", label: "Gar keine - wir machen das mit einem wettbewerblichen Messstellenbetreiber" },
        { value: "msb_dienstleister", label: "Der VNB/gMSB ist Messstellenbetreiber, ein Dienstleister stellt uns die Daten für die Abrechnung zur Verfügung" },
        { value: "msb_direkt", label: "Der VNB/gMSB ist Messstellenbetreiber und stellt uns die Daten für die Abrechnung direkt zur Verfügung" },
        { value: "full_service", label: "Das Stadtwerk übernimmt das ganze Projekt, inkl. der gesamten Stromlieferung und Abrechnung mit den Teilnehmenden" },
      ],
    },
    {
      id: "mieterstromVnbDuration",
      type: "single-select",
      label: "MB2. Wie lange hat die Abstimmung mit dem VNB zum Mieterstrom gedauert?",
      options: [
        { value: "unter_2_monate", label: "Unter 2 Monaten" },
        { value: "2_bis_12_monate", label: "Zwischen 2 und 12 Monaten" },
        { value: "ueber_12_monate", label: "Über 12 Monate" },
      ],
    },
    {
      id: "mieterstromWandlermessung",
      type: "single-select",
      label: "MB3. Hat Ihr VNB einen neuen zusätzlichen Zähler direkt hinter dem Netzanschluss des Gebäudes verlangt (Wandlermessung >5.000 EUR)?",
      options: [
        { value: "nein", label: "Nein" },
        { value: "ja", label: "Ja", hasTextField: true },
        { value: "wissen_nicht", label: "Das wissen wir nicht" },
      ],
    },
    {
      id: "mieterstromMsbProvider",
      type: "single-select",
      label: "MB4.1 Messstellenbetrieb: Wer stellt die Zähler oder die Smart Meter bereit?",
      options: [
        { value: "gmsb", label: "Unser lokaler gMSB (gleiches Unternehmen wie der VNB)" },
        { value: "wmsb", label: "Ein wMSB" },
      ],
    },
    {
      id: "mieterstromDataProvider",
      type: "single-select",
      label: "MB4.2 Übermittlung der verbrauchten Strommengen je Teilnehmer",
      options: [
        { value: "gmsb", label: "Unser lokaler gMSB" },
        { value: "dienstleister", label: "Ein Dienstleister" },
        { value: "wmsb", label: "Ein wMSB" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
    },
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
      visibilityLogic: "Wenn mieterstromMsbProvider = 'gmsb'",
    },
    {
      id: "mieterstromOperationCosts",
      type: "single-select",
      label: "MB5.2 Stellt der VNB/gMSB Ihnen für den Betrieb der Smart Meter zusätzliche Kosten in Rechnung?",
      options: [
        { value: "wissen_nicht", label: "Wissen wir nicht" },
        { value: "nein", label: "Nein, unser VNB/gMSB verlangt hier keine Zusatzkosten" },
        { value: "ja", label: "Ja, unser VNB/gMSB verlangt dafür Zusatzkosten" },
      ],
      visibilityLogic: "Wenn mieterstromMsbProvider = 'gmsb'",
    },
    {
      id: "mieterstromOperationSatisfaction",
      type: "rating",
      label: "MB6. Wie zufrieden sind Sie mit Ihrem VNB bei der Umsetzung des Projektes?",
      min: 1,
      max: 10,
      minLabel: "bremst aktiv", // P1.7: neutralized rating labels
      maxLabel: "unterstützt aktiv",
    },
    {
      id: "mieterstromRejectionResponse",
      type: "multi-select",
      label: "MD1. Falls Ihr VNB die Umsetzung von Mieterstrom nicht oder nur unzureichend anbietet/durchführt, wie haben Sie bislang reagiert?",
      options: [
        { value: "bnetza", label: "Wir haben uns bereits an die BNetzA gewendet" },
        { value: "rechtliche_schritte", label: "Wir überlegen rechtliche Schritte zu gehen" },
        { value: "keine_schritte", label: "Wir sind bei dem Anschluss anderer Projekte auf den VNB angewiesen und sehen von rechtlichen Schritten gegenüber dem VNB ab" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
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
      placeholder: "Ihre Erfahrungen...",
      optional: true,
    },
  ],
};

// === SECTION E: Planung Modellspezifisch - Energy Sharing ===
const SECTION_ENERGY_SHARING: SurveySection = {
  id: "energy-sharing",
  title: "Planung: Modellspezifisch – Energy Sharing (E)",
  description: "Details zu Energy Sharing",
  visibilityLogic: "Nur wenn Energy Sharing ausgewählt",
  questions: [
    {
      id: "esStatus",
      type: "single-select", // Changed from multi-select to single-select per P0.6
      label: "E1. Wo stehen Sie aktuell mit dem Projekt?",
      options: [
        { value: "in_betrieb_vollversorgung", label: "Unser Energy-Sharing Projekt ist schon in Betrieb - Vollversorgungsmodell" },
        { value: "in_betrieb_42c", label: "Unser Energy-Sharing Projekt ist schon in Betrieb - nach §42c EnWG" },
        { value: "planung_bereit", label: "Wir sind in der Planung und wollen loslegen sobald es geht" },
        { value: "info_sammeln", label: "Wir haben grundsätzliches Interesse, sammeln derzeit Infos" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
      required: true,
    },
    {
      id: "esPlantType",
      type: "multi-select",
      label: "E3. Welche Art von Anlage möchten Sie für das Energy Sharing Projekt nutzen?",
      description: "Mehrfachauswahl möglich",
      options: [
        { value: "wind", label: "Windenergieanlage" },
        { value: "buergerwind", label: "Windenergieanlage - Bürgerwindanlage" },
        { value: "pv_freiflaeche", label: "PV-Freiflächenanlage" },
        { value: "buergersolar", label: "Bürgersolaranlage" },
        { value: "pv_efh", label: "PV-Dachanlage auf Einfamilienhaus" },
        { value: "pv_mfh", label: "PV-Dachanlage auf Mehrfamilienhaus" },
        { value: "pv_nichtwohn", label: "PV-Dachanlage auf einem Nicht-Wohngebäude" },
      ],
      visibilityLogic: "Wenn in Planung oder Information sammeln",
    },
    {
      id: "esProjectScope",
      type: "single-select",
      label: "E4. Projektumfang",
      options: [
        { value: "single", label: "Ein einzelnes Projekt" },
        { value: "multiple", label: "Mehrere Projekte" },
      ],
      visibilityLogic: "Wenn in Planung oder Information sammeln",
    },
    {
      id: "esPvSizeKw",
      type: "number",
      label: "Größe der PV-Anlage in kW",
      placeholder: "z.B. 100",
      optional: true,
      visibilityLogic: "Wenn esProjectScope = 'single'",
    },
    {
      id: "esWindSizeKw",
      type: "number",
      label: "Größe der Windenergieanlage in kW",
      placeholder: "z.B. 2000",
      optional: true,
      visibilityLogic: "Wenn esProjectScope = 'single'",
    },
    {
      id: "esPartyCount",
      type: "number",
      label: "Anzahl der belieferten Parteien",
      placeholder: "z.B. 50",
      optional: true,
    },
    {
      id: "esConsumerTypes",
      type: "multi-select",
      label: "E5. Welche Stromverbraucher sollen eingebunden werden?",
      options: [
        { value: "privat", label: "Private Haushalte" },
        { value: "kommune", label: "Kommune" },
        { value: "kommunal_unternehmen", label: "Kommunale Unternehmen" },
        { value: "kmu", label: "KMU" },
        { value: "vereine", label: "Vereine" },
      ],
      visibilityLogic: "Wenn in Planung oder Information sammeln",
    },
    {
      id: "esConsumerScope",
      type: "single-select",
      label: "E6. An wen soll der Strom geliefert werden?",
      options: [
        { value: "alle", label: "An jeden der Interesse hat" },
        { value: "primaer_bestimmte", label: "Primär an bestimmte Stromverbraucher, aber gerne auch andere" },
        { value: "nur_bestimmte", label: "Nur an bestimmte Abnehmer", hasTextField: true },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
      visibilityLogic: "Wenn in Planung oder Information sammeln",
    },
    {
      id: "esMaxDistance",
      type: "text",
      label: "Wie groß ist der maximale geografische Abstand zwischen Anlagen und Verbrauchern?",
      description: "Eine ungefähre Schätzung reicht",
      placeholder: "z.B. 5 km",
      optional: true,
    },
    {
      id: "esVnbContact",
      type: "single-select",
      label: "E6. Waren Sie bereits in Kontakt mit Ihrem VNB zu dem Thema Energy Sharing?",
      options: [
        { value: "yes", label: "Ja" },
        { value: "no", label: "Nein" },
      ],
    },
    {
      id: "esVnbResponse",
      type: "single-select",
      label: "E7. Was war die Rückmeldung des VNB?",
      options: [
        { value: "bereit_06_2026", label: "Der VNB bereitet sich schon darauf vor - ab dem 01.06.2026 können wir starten!" },
        { value: "bereit_12_monate", label: "Der VNB bereitet sich schon darauf vor - in den nächsten 12 Monaten soll die Umsetzung möglich sein" },
        { value: "moeglich_keine_zeit", label: "Der VNB hat angekündigt, dass das möglich sein wird - aber noch keine genaue Zeit genannt" },
        { value: "vertroestet", label: "Der VNB hat uns auf später vertröstet" },
        { value: "weiss_nicht", label: "Der VNB weiß nicht, was Energy Sharing ist" },
        { value: "sonstiges", label: "Sonstiges", hasTextField: true },
      ],
      visibilityLogic: "Wenn esVnbContact = 'yes'",
    },
    {
      id: "esNetzentgelteDiscussion",
      type: "single-select",
      label: "E8. Haben Sie mit Ihrem VNB bereits über die Abrechnung der Netzentgelte gesprochen?",
      options: [
        { value: "ja_vorschlag", label: "Ja - und der VNB hatte schon einen Vorschlag wie das geht", hasTextField: true },
        { value: "ja_unklar", label: "Ja - aber der VNB weiß auch nicht wie das gehen soll", hasTextField: true },
        { value: "nein", label: "Nein" },
      ],
      visibilityLogic: "Wenn esVnbContact = 'yes'",
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

// === SECTION: Abschluss ===
const SECTION_FINAL: SurveySection = {
  id: "final",
  title: "Abschluss",
  description: "Letzte Informationen",
  questions: [
    {
      id: "helpfulInfoSources",
      type: "textarea",
      label: "Welche Informationsquellen fanden Sie besonders hilfreich bei der Suche nach Informationen?", // P1.8: removed D10 prefix
      placeholder: "z.B. Webseiten, Beratungsstellen, Netzwerke, Verbände...",
      optional: true,
    },
    {
      id: "additionalExperiences",
      type: "textarea",
      label: "Welche Erfahrungen möchten Sie noch teilen?", // P1.8: removed D11 prefix
      placeholder: "Ihre Erfahrungen...",
      optional: true,
    },
    {
      id: "documentUpload",
      type: "file",
      label: "Möglichkeit zum Hochladen von Dokumenten",
      description: "z.B. Korrespondenz mit VNB, Messkonzepte, Rechnungen (max. 5 Dateien)",
      optional: true,
    },
    {
      id: "surveyImprovements",
      type: "textarea",
      label: "Haben Sie Verbesserungsvorschläge für diese Umfrage?", // P1.8: removed D12 prefix
      placeholder: "Ihr Feedback zur Umfrage...",
      optional: true,
    },
    {
      id: "npsScore",
      type: "rating",
      label: "Wie wahrscheinlich ist es, dass Sie Anderen die Umsetzung von GGV/Mieterstrom empfehlen würden?",
      min: 0,
      max: 10,
      minLabel: "Sehr unwahrscheinlich",
      maxLabel: "Sehr wahrscheinlich",
      optional: true,
    },
  ],
};

// === HAUPTSCHEMA ===
export const surveySchema: SurveySchema = {
  version: "3.0.0",
  lastUpdated: "2026-02-09",
  title: "Umfrage zu GGV, Mieterstrom & Energy Sharing",
  description: "Diese Umfrage erfasst Erfahrungen mit der Umsetzung von Gemeinschaftlicher Gebäudeversorgung (GGV), Mieterstrom und Energy Sharing in Deutschland.",
  sections: [
    SECTION_ABOUT_YOU,
    SECTION_PROJECT_DETAILS,
    SECTION_PLANNING,
    SECTION_CHALLENGES,
    SECTION_VNB_PLANNING_GGV,
    SECTION_VNB_MSB_DETAILS,
    SECTION_GGV_OPERATION,
    SECTION_SERVICE_PROVIDER,
    SECTION_MIETERSTROM_PLANNING,
    SECTION_MIETERSTROM_VNB_OFFER,
    SECTION_MIETERSTROM_OPERATION,
    SECTION_ENERGY_SHARING,
    SECTION_FINAL,
  ],
};

// Helper to get question options by ID from any section
export function getQuestionById(questionId: string): SurveyQuestion | undefined {
  for (const section of surveySchema.sections) {
    const q = section.questions.find(q => q.id === questionId);
    if (q) return q;
  }
  return undefined;
}

export function getOptionsForQuestion(questionId: string): SurveyOption[] {
  return getQuestionById(questionId)?.options || [];
}

export function getLabelForQuestion(questionId: string): string {
  return getQuestionById(questionId)?.label || '';
}

// Export für JSON-Generierung
export function getSurveySchemaAsJson() {
  return {
    version: surveySchema.version,
    lastUpdated: surveySchema.lastUpdated,
    title: surveySchema.title,
    description: surveySchema.description,
    sections: surveySchema.sections.map(section => ({
      id: section.id,
      title: cleanLabel(section.title),
      description: section.description ? cleanLabel(section.description) : undefined,
      visibilityLogic: section.visibilityLogic,
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
        visibilityLogic: q.visibilityLogic,
        skipLogic: q.skipLogic,
        conditionalRequired: q.conditionalRequired,
      })),
    })),
  };
}
