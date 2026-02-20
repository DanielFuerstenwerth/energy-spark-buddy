/**
 * Survey label resolution for edge functions.
 * Maps DB column names → human-readable question labels & option labels.
 * 
 * IMPORTANT: questionLabel and option labels MUST match the EXACT wording
 * shown to users in the UI (from surveySchema.ts). Do NOT abbreviate.
 * 
 * Schema Version: v0.0
 */

export const SCHEMA_VERSION = "v0.0";

// DB column → { questionLabel, options: { value → label } }
export interface QuestionMeta {
  questionLabel: string;
  section: string;
  type: string;
  /** Stable question number for machine-readable identification (e.g. "1.1", "4.3b") */
  uiNumber?: string;
  options?: Record<string, string>; // value → human-readable label (EXACT UI wording)
}

// Build the full registry — ALL labels are EXACT copies from the UI schema
export const COLUMN_LABELS: Record<string, QuestionMeta> = {
  // === Meta ===
  id: { questionLabel: "ID", section: "Meta", type: "uuid" },
  created_at: { questionLabel: "Erstellt am", section: "Meta", type: "timestamp" },
  status: { questionLabel: "Status", section: "Meta", type: "text" },
  session_group_id: { questionLabel: "Sitzungs-ID", section: "Meta", type: "uuid" },
  schema_version: { questionLabel: "Schema-Version", section: "Meta", type: "text" },
  evaluation_label: { questionLabel: "Bewertungs-Label", section: "Meta", type: "text" },
  project_type_tag: { questionLabel: "Projekttyp-Tag", section: "Meta", type: "text", options: { ggv: "GGV", ms: "Mieterstrom", es: "Energy Sharing" } },
  draft_token: { questionLabel: "Entwurfs-Token", section: "Meta", type: "uuid" },
  uploaded_documents: { questionLabel: "Hochgeladene Dokumente", section: "Meta", type: "text[]", uiNumber: "8.2" },

  // === 1. Über Sie ===
  actor_types: {
    questionLabel: "In welche Akteursgruppe fallen Sie?",
    section: "1. Über Sie", type: "multi-select", uiNumber: "1.1",
    options: {
      buergerenergie: "Bürgerenergiegenossenschaft",
      weg: "Wohnungseigentümergemeinschaft",
      vermieter_privat: "Vermieter/in - Privatperson",
      vermieter_prof_klein: "Vermieter/in - Professionell (<100 Einheiten)",
      vermieter_wohnungsunternehmen: "Vermieter/in - Wohnungsunternehmen (>100 Einheiten)",
      kommune: "Kommune / kommunales Unternehmen",
      kmu: "Kleine und Mittelständische Unternehmen (KMU)",
      dienstleister: "Dienstleister für GGV/Mieterstrom/Energy Sharing",
      installateur: "Installateur von PV-Anlagen",
      msb: "Wettbewerblicher Messstellenbetreiber",
      stadtwerk: "Stadtwerk/EVU",
      andere: "Andere",
    },
  },
  actor_text_fields: { questionLabel: "Akteursgruppe Freitextfelder", section: "1. Über Sie", type: "text" },
  actor_other: { questionLabel: "Akteursgruppe Sonstiges", section: "1. Über Sie", type: "text" },
  actor_dienstleister_category: {
    questionLabel: "In welche Kategorie von Dienstleister ordnen Sie sich ein?",
    section: "1. Über Sie", type: "multi-select", uiNumber: "1.1a",
    options: {
      data_provision: "Datenbereitstellung (ESA-Zugang zu gMSB-Werten)",
      invoicing_prep: "Datenbereitstellung und Vorbereitung der Abrechnung (durchzuführen durch den Betreiber)",
      full_settlement: "Vollständige Abrechnung mit Teilnehmenden (im Auftrag des Betreibers oder auf eigenes Risiko)",
      metering_full: "Messstellenbetrieb inkl. Datenbereitstellung",
      metering_invoicing_prep: "Messstellenbetrieb inkl. Datenbereitstellung und Vorbereitung der Abrechnung (durchzuführen durch den Betreiber)",
      metering_full_settlement: "Messstellenbetrieb und vollständige Abrechnung mit Teilnehmenden (im Auftrag des Betreibers oder auf eigenes Risiko)",
      beratung: "Beratung für Immobilieneigentümer zur Umsetzung von GGV/Mieterstrom",
      software: "Software / IT-Plattform für Dienstleister, MSB und/oder VNB",
      sonstiges: "Sonstiges",
    },
  },
  actor_dienstleister_category_other: { questionLabel: "Dienstleister-Kategorie Sonstiges", section: "1. Über Sie", type: "text", uiNumber: "1.1a" },
  actor_dienstleister_category_details: { questionLabel: "Dienstleister-Kategorie Details", section: "1. Über Sie", type: "text", uiNumber: "1.1d" },
  dienstleister_website: { questionLabel: "Für Dienstleister: Webadresse und Kontaktdaten", section: "1. Über Sie", type: "text[]", uiNumber: "1.1b" },
  dienstleister_kontakt: { questionLabel: "Für Dienstleister: Email-Kontakt", section: "1. Über Sie", type: "text[]", uiNumber: "1.1b" },
  motivation: {
    questionLabel: "Wie würden Sie Ihre Motivation einordnen?",
    section: "1. Über Sie", type: "multi-select", uiNumber: "1.2",
    options: {
      pv_nutzung: "Wir werden auf jeden Fall eine PV-Anlage bauen (oder haben diese schon gebaut) und möchten den Strom vor Ort nutzen",
      energiewende: "Wir möchten gerne Energiewende vor Ort umsetzen - sobald die Nutzung geklärt ist, kommt die PV-Anlage",
      geschaeft: "Der Bau und Betrieb von PV-Anlagen ist ein wesentliches Anliegen von unserem Unternehmen/Verein",
      sonstiges: "Sonstiges",
    },
  },
  motivation_other: { questionLabel: "Motivation Sonstiges", section: "1. Über Sie", type: "text", uiNumber: "1.2" },
  motivation_details: { questionLabel: "Motivation Details", section: "1. Über Sie", type: "text", uiNumber: "1.2d" },
  contact_email: { questionLabel: "Falls wir Sie bei Rückfragen kontaktieren dürfen, lassen Sie gerne eine E-Mail da", section: "1. Über Sie", type: "email", uiNumber: "1.3" },
  confirmation_for_update: {
    questionLabel: "Falls Sie eine Info über die Ergebnisse der Umfrage per E-Mail erhalten möchten, lassen Sie uns das wissen:",
    section: "1. Über Sie", type: "single-select", uiNumber: "1.4",
    options: {
      ja: "Ja, ich möchte eine Info erhalten",
      nein: "Nein, ich schaue selber online nach Updates",
    },
  },

  // === 2. Projekt ===
  vnb_name: { questionLabel: "Welcher Verteilnetzbetreiber ist für Ihr Projekt zuständig?", section: "2. Projekt", type: "vnb-select", uiNumber: "2.1" },
  project_types: {
    questionLabel: "Welche Art von Projekt möchten Sie gerne umsetzen / haben Sie umgesetzt?",
    section: "2. Projekt", type: "multi-select", uiNumber: "2.2",
    options: {
      ggv: "GGV (Gemeinschaftliche Gebäudeversorgung)",
      mieterstrom: "Mieterstrom",
      ggv_oder_mieterstrom: "Entweder GGV oder Mieterstrom (nur für Projekte im Planungsstadium)",
      energysharing: "Energy Sharing (in Zukunft möglich)",
    },
  },
  project_focus: { questionLabel: "Projektfokus", section: "2. Projekt", type: "text" },
  planning_status: {
    questionLabel: "Wo stehen Sie aktuell mit dem Projekt?",
    section: "2. Projekt", type: "single-select", uiNumber: "2.3",
    options: {
      info_sammeln: "Wir haben grundsätzliches Interesse, sammeln derzeit Informationen",
      planung_stockt_ggv: "Wir sind fortgeschritten in der Planung, aber es stockt mit der Umsetzung GGV/Mieterstrom",
      planung_stockt_pv: "Wir sind fortgeschritten in der Planung, aber es stockt mit der Installation der PV-Anlage",
      planung_fast_fertig: "Wir sind fast fertig mit der Planung",
      pv_laeuft_ggv_planung: "Die PV-Anlage läuft schon, aber die GGV/Mieterstrom ist noch in Planung",
      pv_laeuft_ggv_laeuft: "Die PV-Anlage läuft bereits mit GGV/Mieterstrom",
      sonstiges: "Sonstiges",
    },
  },
  planning_status_other: { questionLabel: "Planungsstatus Sonstiges", section: "2. Projekt", type: "text", uiNumber: "2.3" },
  mieterstrom_planning_status: {
    questionLabel: "Wo stehen Sie aktuell mit dem Mieterstrom-Projekt?",
    section: "2. Projekt", type: "single-select", uiNumber: "2.3b",
    options: {
      info_sammeln: "Wir haben grundsätzliches Interesse, sammeln derzeit Informationen",
      planung_stockt_ggv: "Wir sind fortgeschritten in der Planung, aber es stockt mit der Umsetzung des Mieterstroms",
      planung_stockt_pv: "Wir sind fortgeschritten in der Planung, aber es stockt mit der Installation der PV-Anlage",
      planung_fast_fertig: "Wir sind fast fertig mit der Planung",
      pv_laeuft_ggv_planung: "Die PV-Anlage läuft schon, aber Mieterstrom ist noch in Planung",
      pv_laeuft_ggv_laeuft: "Die PV-Anlage läuft bereits mit Mieterstrom",
      sonstiges: "Sonstiges",
    },
  },
  mieterstrom_planning_status_other: { questionLabel: "Mieterstrom Planungsstatus Sonstiges", section: "2. Projekt", type: "text", uiNumber: "2.3b" },

  // GGV Projekt-Details
  ggv_project_type: {
    questionLabel: "Wie viele GGV-Projekte planen/betreiben Sie?",
    section: "2. Projekt", type: "single-select", uiNumber: "2.4",
    options: {
      single: "Ein einzelnes Projekt",
      multiple: "Mehrere Projekte (im Fall von verschiedenen Verteilnetzbetreibern bitte einen zusätzlichen Verteilnetzbetreiber auswählen)",
    },
  },
  ggv_pv_size_kw: { questionLabel: "Größe der PV-Anlage in kW - GGV", section: "2. Projekt", type: "number", uiNumber: "2.6" },
  ggv_party_count: { questionLabel: "Anzahl der Parteien, die Strom abnehmen - GGV", section: "2. Projekt", type: "number", uiNumber: "2.7" },
  ggv_building_type: {
    questionLabel: "Art des Gebäudes - GGV",
    section: "2. Projekt", type: "single-select", uiNumber: "2.8",
    options: { wohngebaeude: "Wohngebäude", gewerbe: "Gewerbegebäude", gemischt: "Gemischt" },
  },
  ggv_building_count: { questionLabel: "Gesamtzahl der Projekte - GGV", section: "2. Projekt", type: "number", uiNumber: "2.5" },
  ggv_additional_info: { questionLabel: "Zusätzliche Informationen - GGV", section: "2. Projekt", type: "textarea", uiNumber: "2.9" },
  project_plz: { questionLabel: "PLZ Projektstandort", section: "2. Projekt", type: "text", uiNumber: "2.14" },
  project_address: { questionLabel: "Adresse Projektstandort", section: "2. Projekt", type: "text", uiNumber: "2.14" },

  // Mieterstrom Projekt-Details
  mieterstrom_project_type: {
    questionLabel: "Wie viele Mieterstrom-Projekte planen/betreiben Sie?",
    section: "2. Projekt", type: "single-select", uiNumber: "2.4b",
    options: {
      single: "Ein einzelnes Projekt",
      multiple: "Mehrere Projekte (im Fall von verschiedenen Verteilnetzbetreibern bitte einen zusätzlichen Verteilnetzbetreiber auswählen)",
    },
  },
  mieterstrom_pv_size_kw: { questionLabel: "Größe der PV-Anlage(n) in kW - Mieterstrom", section: "2. Projekt", type: "number", uiNumber: "2.10" },
  mieterstrom_party_count: { questionLabel: "Anzahl der Parteien, die Strom abnehmen - Mieterstrom", section: "2. Projekt", type: "number", uiNumber: "2.11" },
  mieterstrom_building_type: {
    questionLabel: "Art des Gebäudes - Mieterstrom",
    section: "2. Projekt", type: "single-select", uiNumber: "2.12",
    options: { wohngebaeude: "Wohngebäude", gewerbe: "Gewerbegebäude", gemischt: "Gemischt" },
  },
  mieterstrom_building_count: { questionLabel: "Gesamtzahl der Projekte - Mieterstrom", section: "2. Projekt", type: "number", uiNumber: "2.5b" },
  mieterstrom_additional_info: { questionLabel: "Zusätzliche Informationen - Mieterstrom", section: "2. Projekt", type: "textarea", uiNumber: "2.13" },
  mieterstrom_foerderung: {
    questionLabel: "Erhalten Sie eine Förderung für das Mieterstromprojekt oder beabsichtigen Sie diese zu beantragen?",
    section: "2. Projekt", type: "single-select", uiNumber: "2.15",
    options: { ja: "Ja", nein: "Nein", weiss_nicht: "Das wissen wir nicht" },
  },
  mieterstrom_foerderung_nein_grund: {
    questionLabel: "Warum keine Förderung?",
    section: "2. Projekt", type: "single-select", uiNumber: "2.16",
    options: {
      beantragt_nicht_geklappt: "Wir würden gerne, aber das war/ist nicht so einfach",
      bewusst_dagegen: "Wir haben uns bewusst dagegen entschieden",
    },
  },
  mieterstrom_foerderung_nein_grund_other: { questionLabel: "Mieterstrom Förderung Begründung", section: "2. Projekt", type: "text", uiNumber: "2.16" },

  // === 3. Planung Allgemein ===
  ggv_or_mieterstrom_decision: {
    questionLabel: "Haben Sie sich schon entschieden, ob Sie GGV oder Mieterstrom umsetzen möchten?",
    section: "3. Planung", type: "single-select", uiNumber: "3.1",
    options: {
      sicher_ggv: "Sicher GGV",
      unsicher: "Noch unsicher",
      sicher_mieterstrom: "Sicher Mieterstrom",
      beides: "Beides",
    },
  },
  ggv_decision_reasons: {
    questionLabel: "Was sind Ihre Gründe für die Entscheidung für die GGV?",
    section: "3. Planung", type: "multi-select", uiNumber: "3.2",
    options: {
      buerokratie_mieterstrom: "Bürokratische Herausforderungen bei Mieterstrom",
      reststrom_pflicht: "Reststrom-Pflicht bei Mieterstrom",
      ladesaeulen_waermepumpen: "Einbindung Ladesäulen/Wärmepumpen einfacher",
      vnb_empfehlung: "VNB-Empfehlung",
      finanziell_attraktiver: "Finanziell attraktiver",
      sonstiges: "Sonstiges",
    },
  },
  ggv_decision_reasons_other: { questionLabel: "Gründe für GGV Sonstiges", section: "3. Planung", type: "text", uiNumber: "3.2" },
  ggv_decision_reasons_details: { questionLabel: "Gründe für GGV Details", section: "3. Planung", type: "text", uiNumber: "3.2d" },
  mieterstrom_decision_reasons: {
    questionLabel: "Was sind Ihre Gründe für die Entscheidung für Mieterstrom?",
    section: "3. Planung", type: "multi-select", uiNumber: "3.3",
    options: {
      einfacher_umsetzung: "Einfachere Umsetzung",
      kein_dienstleister_ggv: "Kein Dienstleister für GGV verfügbar",
      vnb_empfehlung: "VNB-Empfehlung",
      vnb_kann_ggv_nicht: "VNB kann GGV nicht umsetzen",
      finanziell_attraktiver: "Finanziell attraktiver",
      sonstiges: "Sonstiges",
    },
  },
  mieterstrom_decision_reasons_other: { questionLabel: "Gründe für Mieterstrom Sonstiges", section: "3. Planung", type: "text", uiNumber: "3.3" },
  mieterstrom_decision_reasons_details: { questionLabel: "Gründe für Mieterstrom Details", section: "3. Planung", type: "text", uiNumber: "3.3d" },
  implementation_approach: {
    questionLabel: "Welchen Ansatz verfolgen Sie bei der Umsetzung?",
    section: "3. Planung", type: "multi-select", uiNumber: "3.4",
    options: {
      alleine: "Möglichst viel alleine machen",
      dienstleister_ok: "Dienstleister OK wenn preislich attraktiv",
      dienstleister_alles: "Dienstleister soll alles übernehmen",
    },
  },
  implementation_approach_other: { questionLabel: "Umsetzungsansatz Sonstiges", section: "3. Planung", type: "text", uiNumber: "3.4" },
  challenges: {
    questionLabel: "Gibt es Herausforderungen oder Hindernisse bei der Umsetzung?",
    section: "3. Planung", type: "multi-select", uiNumber: "3.5",
    options: {
      keine: "Nein, alles läuft gut",
      opposition: "Parteien sind gegen das Projekt",
      pv_installation: "Technische Probleme PV-Installation",
      vnb_blockiert: "VNB blockiert Umsetzung",
      kosten_zu_hoch: "Kosten zu hoch",
      sonstiges: "Sonstiges",
    },
  },
  challenges_details: { questionLabel: "Herausforderungen Details", section: "3. Planung", type: "text", uiNumber: "3.5d" },
  vnb_rejection_response: {
    questionLabel: "Falls der VNB Ihnen Steine in den Weg gelegt hat: Wie haben Sie reagiert?",
    section: "3. Planung", type: "multi-select", uiNumber: "3.6",
    options: {
      kein_grund: "Kein Grund zur Beschwerde",
      unsicher_aufgaben: "Unklar was VNB machen müsste",
      bnetza: "An BNetzA gewendet",
      rechtliche_schritte: "Rechtliche Schritte erwogen",
      keine_schritte: "Von Schritten abgesehen",
      sonstiges: "Sonstiges",
    },
  },
  vnb_rejection_response_other: { questionLabel: "Reaktion auf VNB-Ablehnung Sonstiges", section: "3. Planung", type: "text", uiNumber: "3.6" },
  vnb_rejection_response_details: { questionLabel: "Reaktion auf VNB-Ablehnung Details", section: "3. Planung", type: "text", uiNumber: "3.6d" },

  // === 4. Planung GGV ===
  vnb_existing_projects: {
    questionLabel: "Gibt es in Ihrem Netzgebiet bereits andere GGV-Projekte?",
    section: "4. GGV Planung", type: "single-select", uiNumber: "4.1",
    options: {
      wissen_nicht: "Wissen wir nicht",
      nein: "Nein",
      ja_mindestens_eins: "Ja, mindestens eins",
      ja_viele: "Ja, eine ganze Reihe",
      sonstiges: "Sonstiges",
    },
  },
  vnb_existing_projects_other: { questionLabel: "Bestehende Projekte Sonstiges", section: "4. GGV Planung", type: "text", uiNumber: "4.1" },
  vnb_contact: {
    questionLabel: "Hatten Sie bereits Kontakt mit dem VNB zum Thema GGV?",
    section: "4. GGV Planung", type: "multi-select", uiNumber: "4.2",
    options: {
      ja_direkt: "Ja, direkter Kontakt",
      ja_installateur: "Ja, über unseren Installateur/Dienstleister",
      nein: "Noch kein Kontakt",
      sonstiges: "Sonstiges",
    },
  },
  vnb_contact_other: { questionLabel: "VNB-Kontakt Sonstiges", section: "4. GGV Planung", type: "text", uiNumber: "4.2" },
  vnb_contact_details: { questionLabel: "VNB-Kontakt Details", section: "4. GGV Planung", type: "text", uiNumber: "4.2d" },
  vnb_response: {
    questionLabel: "Wie ist der aktuelle Stand der GGV mit dem VNB?",
    section: "4. GGV Planung", type: "single-select", uiNumber: "4.3",
    options: {
      moeglich_gmssb: "Umsetzbar mit gMSB",
      moeglich_wmsb: "Umsetzbar nur mit wMSB",
      nicht_moeglich: "Nicht möglich laut VNB",
      keine_antwort: "Keine Antwort vom VNB",
      weiss_nicht: "Wissen wir nicht",
    },
  },
  vnb_response_reasons: { questionLabel: "VNB-Antwort Details", section: "4. GGV Planung", type: "text", uiNumber: "4.3" },
  vnb_msb_timeline: {
    questionLabel: "Falls mit gMSB: Wann kann der gMSB die Übernahme durchführen?",
    section: "4. GGV Planung", type: "single-select", uiNumber: "4.3a",
    options: {
      ja_12_monate: "Innerhalb 12 Monate",
      ja_spaeter: "Über 12 Monate",
      nicht_gefragt: "Nicht gefragt",
      keine_aussage: "Keine Aussage",
    },
  },
  vnb_rejection_timeline: {
    questionLabel: "Falls nicht möglich: Wann wird es möglich sein?",
    section: "4. GGV Planung", type: "single-select", uiNumber: "4.3b",
    options: {
      ja_12_monate: "Innerhalb 12 Monate",
      ja_spaeter: "Über 12 Monate",
      nicht_gefragt: "Nicht gefragt",
      keine_aussage: "Keine Aussage",
    },
  },

  // GGV MSB Details
  vnb_start_timeline: {
    questionLabel: "Wann kann der Messbetrieb mit dem gMSB beginnen?",
    section: "4. GGV MSB", type: "single-select", uiNumber: "4.5",
    options: {
      sofort: "Sofort",
      zeitnah: "Zeitnah",
      "12_monate": "In den nächsten 12 Monaten",
      spaeter: "In mehr als 12 Monaten",
      weiss_nicht: "Wissen wir nicht",
      sonstiges: "Sonstiges",
    },
  },
  vnb_start_timeline_other: { questionLabel: "Start Messbetrieb Sonstiges", section: "4. GGV MSB", type: "text", uiNumber: "4.5" },
  vnb_additional_costs: {
    questionLabel: "Entstehen Zusatzkosten für den Einbau auf Kundenwunsch?",
    section: "4. GGV MSB", type: "single-select", uiNumber: "4.6",
    options: {
      wissen_nicht: "Wissen wir nicht",
      nein: "Keine Zusatzkosten",
      ja: "Ja, Zusatzkosten",
    },
  },
  vnb_additional_costs_one_time: { questionLabel: "Zusatzkosten Einmalbetrag (EUR)", section: "4. GGV MSB", type: "number", uiNumber: "4.7" },
  vnb_additional_costs_yearly: { questionLabel: "Zusatzkosten jährlich (EUR)", section: "4. GGV MSB", type: "number", uiNumber: "4.8" },
  vnb_additional_costs_other: { questionLabel: "Zusatzkosten Sonstiges", section: "4. GGV MSB", type: "text", uiNumber: "4.6" },
  vnb_full_service: {
    questionLabel: "Wird die GGV-Umsetzung an ein Full-Service-Angebot geknüpft?",
    section: "4. GGV MSB", type: "single-select", uiNumber: "4.9",
    options: {
      nur_full_service: "Nur mit Full-Service-Angebot",
      auch_ohne: "Auch ohne Full-Service",
      weiss_nicht: "Wissen wir nicht",
    },
  },
  vnb_data_provision: {
    questionLabel: "Wie stellt der VNB die Messdaten bereit?",
    section: "4. GGV MSB", type: "multi-select", uiNumber: "4.10",
    options: {
      mail_excel: "Per Mail als Excel",
      portal_verrechnete_werte: "Online-Portal mit verrechneten Werten",
      portal_alle_messwerte: "Online-Portal mit allen Messwerten",
      dienstleister_marktkommunikation: "Dienstleister über Marktkommunikation",
      wissen_nicht: "Wissen wir nicht",
      sonstiges: "Sonstiges",
    },
  },
  vnb_data_provision_other: { questionLabel: "Datenbereitstellung Sonstiges", section: "4. GGV MSB", type: "text", uiNumber: "4.10" },
  vnb_data_cost: {
    questionLabel: "Was kostet die Datenbereitstellung durch den VNB?",
    section: "4. GGV MSB", type: "single-select", uiNumber: "4.11",
    options: {
      kostenlos: "Kostenlos",
      weniger_3_eur: "≤3 EUR/Messstelle/Jahr",
      mehr_3_eur: ">3 EUR/Messstelle/Jahr",
      aktuell_kostenlos: "Aktuell kostenlos, wird sich ändern",
      weiss_nicht: "Wissen wir nicht",
      sonstiges: "Sonstiges",
    },
  },
  vnb_data_cost_amount: { questionLabel: "Kosten Datenbereitstellung Betrag (EUR)", section: "4. GGV MSB", type: "number", uiNumber: "4.12" },
  vnb_esa_cost: {
    questionLabel: "Was kostet der ESA-Zugang beim VNB?",
    section: "4. GGV MSB", type: "single-select", uiNumber: "4.13",
    options: {
      wissen_nicht: "Wissen wir nicht",
      kostenlos: "Kostenlos",
      weniger_3_eur: "≤3 EUR/Messstelle/Jahr",
      mehr_3_eur: ">3 EUR/Messstelle/Jahr",
    },
  },
  vnb_esa_cost_amount: { questionLabel: "ESA-Kosten Betrag (EUR)", section: "4. GGV MSB", type: "number", uiNumber: "4.14" },

  // GGV Messkonzept
  vnb_wandlermessung: {
    questionLabel: "Verlangt der VNB eine Wandlermessung?",
    section: "4. GGV Messkonzept", type: "single-select", uiNumber: "4.17",
    options: { ja: "Ja", nein: "Nein", weiss_nicht: "Wissen wir nicht" },
  },
  vnb_wandlermessung_comment: { questionLabel: "Wandlermessung Kommentar", section: "4. GGV Messkonzept", type: "textarea", uiNumber: "4.18" },
  vnb_wandlermessung_documents: { questionLabel: "Wandlermessung Dokumente", section: "4. GGV Messkonzept", type: "file", uiNumber: "4.19" },
  vnb_planning_duration: {
    questionLabel: "Wie lange hat die Planungsabstimmung mit dem VNB gedauert?",
    section: "4. GGV Messkonzept", type: "single-select", uiNumber: "4.20",
    options: {
      unter_2_monate: "Unter 2 Monaten",
      "2_bis_12_monate": "2-12 Monate",
      ueber_12_monate: "Über 12 Monate",
    },
  },
  vnb_planning_duration_reasons: { questionLabel: "Gründe für die Dauer der Planungsabstimmung", section: "4. GGV Messkonzept", type: "textarea", uiNumber: "4.21" },

  // GGV VNB-Unterstützung
  vnb_support_messkonzept: {
    questionLabel: "Hat der VNB Informationen zum Messkonzept bereitgestellt?",
    section: "4. GGV Unterstützung", type: "single-select", uiNumber: "4.22",
    options: { ja: "Ja", nein: "Nein", weiss_nicht: "Wissen wir nicht" },
  },
  vnb_support_messkonzept_other: { questionLabel: "VNB Messkonzept Details", section: "4. GGV Unterstützung", type: "text", uiNumber: "4.22" },
  vnb_support_formulare: {
    questionLabel: "Hat der VNB spezielle Formulare für GGV-Anmeldung bereitgestellt?",
    section: "4. GGV Unterstützung", type: "single-select", uiNumber: "4.23",
    options: { ja: "Ja", nein: "Nein", weiss_nicht: "Wissen wir nicht" },
  },
  vnb_support_formulare_other: { questionLabel: "VNB Formulare Details", section: "4. GGV Unterstützung", type: "text", uiNumber: "4.23" },
  vnb_support_portal: {
    questionLabel: "Bietet der VNB ein Online-Portal für GGV an?",
    section: "4. GGV Unterstützung", type: "single-select", uiNumber: "4.24",
    options: { ja: "Ja", nein: "Nein", weiss_nicht: "Wissen wir nicht" },
  },
  vnb_support_portal_other: { questionLabel: "VNB Portal Details", section: "4. GGV Unterstützung", type: "text", uiNumber: "4.24" },
  vnb_support_other: { questionLabel: "Weitere Unterstützung durch den VNB", section: "4. GGV Unterstützung", type: "text", uiNumber: "4.25" },
  vnb_support_other_details: { questionLabel: "VNB Unterstützung Details", section: "4. GGV Unterstützung", type: "text", uiNumber: "4.25" },
  vnb_contact_helpful: {
    questionLabel: "War die Kontaktmöglichkeit mit dem VNB hilfreich?",
    section: "4. GGV Unterstützung", type: "single-select", uiNumber: "4.26",
    options: {
      ja_hilfreich: "Ja, hilfreich",
      ja_nicht_hilfreich: "Ja, aber wenig hilfreich",
      nein: "Nein, keine Kontaktmöglichkeit",
      sonstiges: "Sonstiges",
    },
  },
  vnb_contact_helpful_other: { questionLabel: "VNB Kontakt Sonstiges", section: "4. GGV Unterstützung", type: "text", uiNumber: "4.26" },
  vnb_personal_contacts: {
    questionLabel: "Haben Sie persönliche Kontakte beim VNB?",
    section: "4. GGV Unterstützung", type: "single-select", uiNumber: "4.27",
    options: {
      ja_bestanden: "Ja, bestanden schon vorher",
      ja_entstanden: "Ja, bei der GGV-Umsetzung entstanden",
      nein: "Nein",
      sonstiges: "Sonstiges",
    },
  },
  vnb_personal_contacts_other: { questionLabel: "Persönliche Kontakte Sonstiges", section: "4. GGV Unterstützung", type: "text", uiNumber: "4.27" },
  vnb_support_rating: { questionLabel: "Wie bewerten Sie die Unterstützung durch den VNB insgesamt? (1-10)", section: "4. GGV Unterstützung", type: "rating", uiNumber: "4.28" },

  // === 5. Betrieb GGV ===
  operation_vnb_duration: {
    questionLabel: "Wie lange hat die Abstimmung mit dem VNB im Betrieb gedauert?",
    section: "5. GGV Betrieb", type: "single-select", uiNumber: "5.1",
    options: {
      unter_2_monate: "Unter 2 Monaten",
      "2_bis_12_monate": "2-12 Monate",
      ueber_12_monate: "Über 12 Monate",
    },
  },
  operation_vnb_duration_reasons: { questionLabel: "Gründe für die Dauer der Abstimmung im Betrieb", section: "5. GGV Betrieb", type: "textarea", uiNumber: "5.2" },
  operation_wandlermessung: {
    questionLabel: "Wurde eine Wandlermessung im Betrieb verlangt?",
    section: "5. GGV Betrieb", type: "single-select", uiNumber: "5.3",
    options: {
      ja: "Ja",
      nein: "Nein",
      nein_freiwillig: "Nein, aber freiwillig eingebaut",
      wissen_nicht: "Wissen wir nicht",
    },
  },
  operation_wandlermessung_comment: { questionLabel: "Wandlermessung Betrieb Kommentar", section: "5. GGV Betrieb", type: "textarea", uiNumber: "5.4" },
  operation_msb_provider: {
    questionLabel: "Wer ist Ihr Messstellenbetreiber?",
    section: "5. GGV Betrieb", type: "single-select", uiNumber: "5.5",
    options: { gmsb: "Lokaler grundzuständiger MSB (gMSB)", wmsb: "Wettbewerblicher MSB (wMSB)", weiss_nicht: "Wissen wir nicht" },
  },
  operation_allocation_provider: {
    questionLabel: "Wer führt die Aufteilung des PV-Stroms durch?",
    section: "5. GGV Betrieb", type: "single-select", uiNumber: "5.6",
    options: {
      gmsb: "Lokaler gMSB",
      wmsb: "Wettbewerblicher MSB (wMSB)",
      sonstiges: "Dienstleister / Sonstiges",
      weiss_nicht: "Wissen wir nicht",
    },
  },
  operation_allocation_provider_other: { questionLabel: "Aufteilung Sonstiges", section: "5. GGV Betrieb", type: "text", uiNumber: "5.6" },
  operation_data_provider: {
    questionLabel: "Wer übermittelt Ihnen die Daten im Betrieb?",
    section: "5. GGV Betrieb", type: "single-select", uiNumber: "5.7",
    options: {
      gmsb: "Lokaler gMSB",
      wmsb: "Wettbewerblicher MSB (wMSB)",
      dienstleister: "ESA-Dienstleister",
      abrechnung_dienstleister: "Abrechnung komplett durch Dienstleister",
      weiss_nicht: "Wissen wir nicht",
    },
  },
  operation_data_provider_other: { questionLabel: "Datenübermittlung Sonstiges", section: "5. GGV Betrieb", type: "text", uiNumber: "5.7" },
  operation_msb_duration: {
    questionLabel: "Wie lange hat es gedauert bis die Smart Meter eingebaut waren?",
    section: "5. GGV Betrieb", type: "single-select", uiNumber: "5.8",
    options: {
      wissen_nicht: "Weiß ich nicht",
      schnell: "Problemlos und schnell",
      "4_monate": "Ca. 4 Monate",
      laenger: "Deutlich länger als 4 Monate",
    },
  },
  operation_msb_additional_costs: {
    questionLabel: "Entstehen Zusatzkosten für den Smart-Meter-Einbau im Betrieb?",
    section: "5. GGV Betrieb", type: "single-select", uiNumber: "5.9",
    options: {
      nein: "Keine Zusatzkosten",
      ja: "Ja, Zusatzkosten",
      wissen_nicht: "Wissen wir nicht",
    },
  },
  operation_msb_additional_costs_one_time: { questionLabel: "Zusatzkosten Betrieb Einmalbetrag (EUR)", section: "5. GGV Betrieb", type: "number", uiNumber: "5.10" },
  operation_msb_additional_costs_yearly: { questionLabel: "Zusatzkosten Betrieb jährlich (EUR)", section: "5. GGV Betrieb", type: "number", uiNumber: "5.11" },
  operation_data_format: {
    questionLabel: "In welchem Format werden die Daten im Betrieb bereitgestellt?",
    section: "5. GGV Betrieb", type: "single-select", uiNumber: "5.12",
    options: {
      mail_excel: "Per Mail als Excel",
      portal_verrechnete_werte: "Online-Portal mit verrechneten Werten",
      portal_alle_messwerte: "Online-Portal mit allen Messwerten",
      dienstleister_marktkommunikation: "Dienstleister über Marktkommunikation",
      wissen_nicht: "Wissen wir nicht",
      sonstiges: "Sonstiges",
    },
  },
  operation_data_format_other: { questionLabel: "Datenformat Sonstiges", section: "5. GGV Betrieb", type: "text", uiNumber: "5.12" },
  operation_data_cost: {
    questionLabel: "Was kostet die Datenbereitstellung im Betrieb?",
    section: "5. GGV Betrieb", type: "single-select", uiNumber: "5.13",
    options: {
      kostenlos: "Kostenlos",
      weniger_3_eur: "≤3 EUR/Messstelle/Jahr",
      mehr_3_eur: ">3 EUR/Messstelle/Jahr",
      aktuell_kostenlos: "Aktuell kostenlos, wird sich ändern",
      weiss_nicht: "Wissen wir nicht",
      sonstiges: "Sonstiges",
    },
  },
  operation_data_cost_amount: { questionLabel: "Kosten Daten Betrieb Betrag (EUR)", section: "5. GGV Betrieb", type: "number", uiNumber: "5.14" },
  operation_esa_cost: {
    questionLabel: "Was kostet der ESA-Zugang im Betrieb?",
    section: "5. GGV Betrieb", type: "single-select", uiNumber: "5.15",
    options: {
      wissen_nicht: "Wissen wir nicht",
      kostenlos: "Kostenlos",
      weniger_3_eur: "≤3 EUR/Messstelle/Jahr",
      mehr_3_eur: ">3 EUR/Messstelle/Jahr",
    },
  },
  operation_esa_cost_amount: { questionLabel: "ESA-Kosten Betrieb Betrag (EUR)", section: "5. GGV Betrieb", type: "number", uiNumber: "5.16" },
  operation_satisfaction_rating: { questionLabel: "Wie zufrieden sind Sie insgesamt mit der Zusammenarbeit mit dem VNB im Betrieb? (1-10)", section: "5. GGV Betrieb", type: "rating", uiNumber: "5.17" },

  // Dienstleister
  service_provider_name: { questionLabel: "Name des Dienstleisters (1)", section: "5. Dienstleister", type: "text", uiNumber: "5.18" },
  service_provider_services: {
    questionLabel: "Welche Leistungen erbringt der Dienstleister (1)?",
    section: "5. Dienstleister", type: "multi-select", uiNumber: "5.18a",
    options: {
      data_provision: "Datenbereitstellung (ESA-Zugang zu gMSB-Werten)",
      invoicing_prep: "Datenbereitstellung und Vorbereitung der Abrechnung",
      full_settlement: "Vollständige Abrechnung mit Teilnehmenden",
      metering_full: "Messstellenbetrieb inkl. Datenbereitstellung",
      metering_invoicing_prep: "Messstellenbetrieb inkl. Datenbereitstellung und Vorbereitung der Abrechnung",
      metering_full_settlement: "Messstellenbetrieb und vollständige Abrechnung mit Teilnehmenden",
      beratung: "Beratung",
      software: "Software / IT-Plattform",
      sonstiges: "Sonstiges",
    },
  },
  service_provider_comments: { questionLabel: "Erfahrungsbericht zum Dienstleister (1)", section: "5. Dienstleister", type: "textarea", uiNumber: "5.19" },
  service_provider_2_name: { questionLabel: "Name des Dienstleisters (2)", section: "5. Dienstleister", type: "text", uiNumber: "5.20" },
  service_provider_2_services: {
    questionLabel: "Welche Leistungen erbringt der Dienstleister (2)?",
    section: "5. Dienstleister", type: "multi-select", uiNumber: "5.20a",
    options: {
      data_provision: "Datenbereitstellung (ESA-Zugang zu gMSB-Werten)",
      invoicing_prep: "Datenbereitstellung und Vorbereitung der Abrechnung",
      full_settlement: "Vollständige Abrechnung mit Teilnehmenden",
      metering_full: "Messstellenbetrieb inkl. Datenbereitstellung",
      metering_invoicing_prep: "Messstellenbetrieb inkl. Datenbereitstellung und Vorbereitung der Abrechnung",
      metering_full_settlement: "Messstellenbetrieb und vollständige Abrechnung mit Teilnehmenden",
      beratung: "Beratung",
      software: "Software / IT-Plattform",
      sonstiges: "Sonstiges",
    },
  },
  service_provider_2_comments: { questionLabel: "Erfahrungsbericht zum Dienstleister (2)", section: "5. Dienstleister", type: "textarea", uiNumber: "5.21" },
  sp_quality_rating: { questionLabel: "Wie bewerten Sie die Qualität des Dienstleisters? (1-10)", section: "5. Dienstleister", type: "rating", uiNumber: "G.5" },
  sp_price_rating: { questionLabel: "Wie bewerten Sie das Preis-Leistungs-Verhältnis? (1-10)", section: "5. Dienstleister", type: "rating", uiNumber: "G.6" },
  sp_rating_comment: { questionLabel: "Kommentar zur Dienstleister-Bewertung", section: "5. Dienstleister", type: "textarea", uiNumber: "G.7" },

  // === 4. Mieterstrom Planung ===
  mieterstrom_summenzaehler: {
    questionLabel: "Welches Summenzähler-Modell bevorzugen Sie?",
    section: "4. MS Planung", type: "single-select", uiNumber: "6.1",
    options: {
      virtuell: "Virtueller Summenzähler",
      physikalisch: "Physikalischer Summenzähler",
      kein_unterschied: "Unterschied nicht bekannt",
      keine_praeferenz: "Keine Präferenz",
      sonstiges: "Sonstiges",
    },
  },
  mieterstrom_existing_projects: {
    questionLabel: "Gibt es in Ihrem Netzgebiet bereits andere Mieterstrom-Projekte?",
    section: "4. MS Planung", type: "single-select", uiNumber: "6.2",
    options: {
      wissen_nicht: "Wissen wir nicht",
      nein: "Nein",
      ja_mindestens_eins: "Ja, mindestens eins",
      ja_viele: "Ja, eine ganze Reihe",
      sonstiges: "Sonstiges",
    },
  },
  mieterstrom_existing_projects_virtuell: {
    questionLabel: "Gibt es davon MS-Projekte mit virtuellem Summenzähler?",
    section: "4. MS Planung", type: "single-select", uiNumber: "6.3",
    options: {
      wissen_nicht: "Wissen wir nicht",
      nein: "Nein",
      ja_mindestens_eins: "Ja, mindestens eins",
      ja_viele: "Ja, eine ganze Reihe",
      sonstiges: "Sonstiges",
    },
  },
  mieterstrom_vnb_contact: {
    questionLabel: "Hatten Sie bereits Kontakt mit dem VNB zum Thema Mieterstrom?",
    section: "4. MS Planung", type: "multi-select", uiNumber: "6.4",
    options: {
      ja_direkt: "Ja, direkter Kontakt",
      ja_installateur: "Ja, über unseren Installateur/Dienstleister",
      nein: "Noch kein Kontakt",
      sonstiges: "Sonstiges",
    },
  },
  mieterstrom_vnb_contact_other: { questionLabel: "VNB-Kontakt MS Sonstiges", section: "4. MS Planung", type: "text", uiNumber: "6.4" },
  mieterstrom_vnb_contact_details: { questionLabel: "VNB-Kontakt MS Details", section: "4. MS Planung", type: "text", uiNumber: "6.4d" },
  mieterstrom_virtuell_allowed: {
    questionLabel: "Erlaubt der VNB den virtuellen Summenzähler?",
    section: "4. MS Planung", type: "single-select", uiNumber: "6.5",
    options: { ja: "Ja", nein: "Nein", weiss_nicht: "Wissen wir nicht" },
  },
  mieterstrom_virtuell_denied_reason: { questionLabel: "Grund für die Ablehnung des virtuellen Summenzählers", section: "4. MS Planung", type: "textarea", uiNumber: "6.6" },
  mieterstrom_virtuell_denied_documents: { questionLabel: "Dokumente zur Ablehnung virt. Summenzähler", section: "4. MS Planung", type: "file", uiNumber: "6.7" },
  mieterstrom_virtuell_wandlermessung: {
    questionLabel: "Verlangt der VNB eine Wandlermessung für den virtuellen Summenzähler?",
    section: "4. MS Planung", type: "single-select", uiNumber: "6.8",
    options: { ja: "Ja", nein: "Nein", weiss_nicht: "Wissen wir nicht" },
  },
  mieterstrom_virtuell_wandlermessung_comment: { questionLabel: "Wandlermessung virt. Summenzähler Kommentar", section: "4. MS Planung", type: "textarea", uiNumber: "6.8" },
  mieterstrom_virtuell_wandlermessung_documents: { questionLabel: "Wandlermessung virt. Summenzähler Dokumente", section: "4. MS Planung", type: "file", uiNumber: "6.9" },
  mieterstrom_vnb_response: {
    questionLabel: "Wie ist die Antwort des VNB zum Thema Mieterstrom?",
    section: "4. MS Planung", type: "multi-select", uiNumber: "6.10",
    options: {
      moeglich_gmsb: "Umsetzbar mit gMSB",
      moeglich_wmsb: "Umsetzbar nur mit wMSB",
      nicht_moeglich: "Nicht möglich laut VNB",
      keine_antwort: "Keine Antwort vom VNB",
      weiss_nicht: "Wissen wir nicht",
    },
  },
  mieterstrom_vnb_response_reasons: { questionLabel: "VNB-Antwort MS Details", section: "4. MS Planung", type: "text", uiNumber: "6.10" },
  mieterstrom_vnb_response_details: { questionLabel: "VNB-Antwort MS Freitext Details", section: "4. MS Planung", type: "text", uiNumber: "6.10d" },
  mieterstrom_support_rating: { questionLabel: "Wie bewerten Sie die Unterstützung des VNB beim Thema Mieterstrom? (1-10)", section: "4. MS Planung", type: "rating", uiNumber: "6.13" },

  // MS VNB Angebot
  mieterstrom_full_service: {
    questionLabel: "Wird die Mieterstrom-Umsetzung an ein Full-Service-Angebot geknüpft?",
    section: "4. MS VNB Angebot", type: "single-select", uiNumber: "6.14",
    options: {
      nur_full_service: "Nur mit Full-Service-Angebot",
      auch_ohne: "Auch ohne Full-Service",
      weiss_nicht: "Wissen wir nicht",
    },
  },
  mieterstrom_msb_costs: {
    questionLabel: "Entstehen Zusatzkosten für den Smart-Meter-Einbau (Mieterstrom)?",
    section: "4. MS VNB Angebot", type: "single-select", uiNumber: "6.15",
    options: {
      wissen_nicht: "Wissen wir nicht",
      nein: "Keine Zusatzkosten",
      ja: "Ja, Zusatzkosten",
      sonstiges: "Sonstiges",
    },
  },
  mieterstrom_msb_costs_other: { questionLabel: "MS Zusatzkosten Sonstiges", section: "4. MS VNB Angebot", type: "text", uiNumber: "6.15" },
  mieterstrom_msb_costs_one_time: { questionLabel: "MS Zusatzkosten Einmalbetrag (EUR)", section: "4. MS VNB Angebot", type: "number", uiNumber: "6.16" },
  mieterstrom_msb_costs_yearly: { questionLabel: "MS Zusatzkosten jährlich (EUR)", section: "4. MS VNB Angebot", type: "number", uiNumber: "6.17" },
  mieterstrom_model_choice: {
    questionLabel: "Welches Umsetzungsmodell bietet der VNB an?",
    section: "4. MS VNB Angebot", type: "single-select", uiNumber: "6.18",
    options: {
      virtuell: "Virtueller Summenzähler",
      physikalisch: "Nur physikalisches Modell",
      beide: "Beide Modelle",
      weiss_nicht: "Wissen wir nicht",
    },
  },
  mieterstrom_data_provision: {
    questionLabel: "Wie stellt der VNB die Daten für Mieterstrom bereit?",
    section: "4. MS VNB Angebot", type: "single-select", uiNumber: "6.19",
    options: {
      direkt_guenstig: "Direkt, ≤3 EUR/Messstelle/Jahr",
      direkt_teuer: "Direkt, >3 EUR/Messstelle/Jahr",
      marktkommunikation: "Über Marktkommunikation",
      weiss_nicht: "Wissen wir nicht",
    },
  },

  // === 5. Betrieb Mieterstrom ===
  mieterstrom_vnb_role: {
    questionLabel: "Welche Rolle spielt der VNB im Mieterstrom-Betrieb?",
    section: "5. MS Betrieb", type: "single-select", uiNumber: "6.20",
    options: {
      keine: "Keine, wir nutzen einen wMSB",
      msb_dienstleister: "VNB/gMSB ist MSB, Daten über Dienstleister",
      msb_direkt: "VNB/gMSB ist MSB, Daten direkt",
      full_service: "Stadtwerk übernimmt alles",
      weiss_nicht: "Wissen wir nicht",
    },
  },
  mieterstrom_vnb_duration: {
    questionLabel: "Wie lange hat die Abstimmung mit dem VNB für Mieterstrom gedauert?",
    section: "5. MS Betrieb", type: "single-select", uiNumber: "6.21",
    options: {
      unter_2_monate: "Unter 2 Monaten",
      "2_bis_12_monate": "2-12 Monate",
      ueber_12_monate: "Über 12 Monate",
    },
  },
  mieterstrom_vnb_duration_reasons: { questionLabel: "Gründe für die Dauer der Abstimmung (MS)", section: "5. MS Betrieb", type: "textarea", uiNumber: "6.22" },
  mieterstrom_wandlermessung: {
    questionLabel: "Wurde eine Wandlermessung im Mieterstrom-Betrieb verlangt?",
    section: "5. MS Betrieb", type: "single-select", uiNumber: "6.23",
    options: { nein: "Nein", ja: "Ja", wissen_nicht: "Wissen wir nicht" },
  },
  mieterstrom_wandlermessung_comment: { questionLabel: "Wandlermessung MS Kommentar", section: "5. MS Betrieb", type: "text", uiNumber: "6.23" },
  mieterstrom_msb_install_duration: {
    questionLabel: "Wie lange hat der Smart-Meter-Einbau gedauert (Mieterstrom)?",
    section: "5. MS Betrieb", type: "single-select", uiNumber: "6.24",
    options: {
      wissen_nicht: "Weiß ich nicht",
      schnell: "Problemlos und schnell",
      "4_monate": "4 Monate Frist eingehalten",
      laenger: "Frist deutlich überschritten",
    },
  },
  mieterstrom_operation_costs: {
    questionLabel: "Entstehen Zusatzkosten für den Smart-Meter-Betrieb (Mieterstrom)?",
    section: "5. MS Betrieb", type: "single-select", uiNumber: "6.25",
    options: {
      wissen_nicht: "Wissen wir nicht",
      nein: "Keine Zusatzkosten",
      ja: "Ja, Zusatzkosten",
    },
  },
  mieterstrom_operation_costs_one_time: { questionLabel: "Betriebskosten MS Einmalbetrag (EUR)", section: "5. MS Betrieb", type: "number", uiNumber: "6.26" },
  mieterstrom_operation_costs_yearly: { questionLabel: "Betriebskosten MS jährlich (EUR)", section: "5. MS Betrieb", type: "number", uiNumber: "6.27" },
  mieterstrom_rejection_response: {
    questionLabel: "Falls der VNB beim Mieterstrom Probleme gemacht hat: Wie haben Sie reagiert?",
    section: "5. MS Betrieb", type: "multi-select", uiNumber: "6.28",
    options: {
      bnetza: "An BNetzA gewendet",
      rechtliche_schritte: "Rechtliche Schritte erwogen",
      keine_schritte: "Von Schritten abgesehen",
      sonstiges: "Sonstiges",
    },
  },
  mieterstrom_rejection_response_other: { questionLabel: "Reaktion MS Ablehnung Sonstiges", section: "5. MS Betrieb", type: "text", uiNumber: "6.28" },
  mieterstrom_rejection_response_details: { questionLabel: "Reaktion MS Ablehnung Details", section: "5. MS Betrieb", type: "text", uiNumber: "6.28d" },
  mieterstrom_info_sources: { questionLabel: "Welche Informationsquellen haben Sie zum Thema Mieterstrom genutzt?", section: "5. MS Betrieb", type: "textarea", uiNumber: "6.29" },
  mieterstrom_experiences: { questionLabel: "Weitere Erfahrungen zum Thema Mieterstrom", section: "5. MS Betrieb", type: "textarea", uiNumber: "6.30" },

  // === 4. Energy Sharing ===
  es_status: {
    questionLabel: "Wie ist der aktuelle Status Ihres Energy-Sharing-Projekts?",
    section: "4. ES", type: "single-select", uiNumber: "7.1",
    options: {
      in_betrieb_vollversorgung: "In Betrieb (Vollversorgung)",
      in_betrieb_42c: "In Betrieb (§42c EnWG)",
      planung_bereit: "Planung, bereit zum Start",
      info_sammeln: "Informationen sammeln",
      sonstiges: "Sonstiges",
    },
  },
  es_status_other: { questionLabel: "ES Status Sonstiges", section: "4. ES", type: "text", uiNumber: "7.1" },
  es_in_operation_details: { questionLabel: "Details zum Energy-Sharing-Betrieb", section: "4. ES", type: "textarea", uiNumber: "7.2" },
  es_operator_details: { questionLabel: "Details zum Betreiber des Energy-Sharing-Projekts", section: "4. ES", type: "textarea", uiNumber: "7.3" },
  es_plant_type: {
    questionLabel: "Welche Art von Erzeugungsanlage nutzen Sie?",
    section: "4. ES", type: "multi-select", uiNumber: "7.4",
    options: {
      wind: "Windenergieanlage",
      buergerwind: "Bürgerwindanlage",
      pv_freiflaeche: "PV-Freiflächenanlage",
      buergersolar: "Bürgersolaranlage",
      pv_efh: "PV auf Einfamilienhaus",
      pv_mfh: "PV auf Mehrfamilienhaus",
      pv_nichtwohn: "PV auf Nicht-Wohngebäude",
    },
  },
  es_plant_type_details: { questionLabel: "ES Anlagentyp Details", section: "4. ES", type: "text[]", uiNumber: "7.4" },
  es_technology_description: { questionLabel: "Beschreibung der Erzeugungstechnologie", section: "4. ES", type: "textarea", uiNumber: "7.6b" },
  es_project_scope: {
    questionLabel: "Umfang des Energy-Sharing-Projekts",
    section: "4. ES", type: "single-select", uiNumber: "7.5",
    options: { single: "Eine einzelne Anlage", multiple: "Mehrere Anlagen" },
  },
  es_capacity_size_kw: { questionLabel: "Installierte Leistung der Anlage(n) in kW", section: "4. ES", type: "number", uiNumber: "7.6" },
  es_party_count: { questionLabel: "Anzahl der teilnehmenden Parteien", section: "4. ES", type: "number", uiNumber: "7.7" },
  es_consumer_types: {
    questionLabel: "Welche Verbrauchertypen sind beteiligt?",
    section: "4. ES", type: "multi-select", uiNumber: "7.8",
    options: {
      privat: "Private Haushalte",
      kommune: "Kommune",
      kommunal_unternehmen: "Kommunale Unternehmen",
      kmu: "KMU",
      vereine: "Vereine",
    },
  },
  es_consumer_details: { questionLabel: "Details zu den Verbrauchern", section: "4. ES", type: "textarea", uiNumber: "7.9" },
  es_consumer_scope: {
    questionLabel: "An wen soll der Strom geliefert werden?",
    section: "4. ES", type: "single-select", uiNumber: "7.10",
    options: {
      alle: "An jeden Interessierten",
      primaer_bestimmte: "Primär bestimmte Abnehmer",
      nur_bestimmte: "Nur bestimmte Abnehmer",
      sonstiges: "Sonstiges",
    },
  },
  es_consumer_scope_other: { questionLabel: "ES Lieferumfang Sonstiges", section: "4. ES", type: "text", uiNumber: "7.10" },
  es_max_distance: { questionLabel: "Maximaler Abstand zwischen Anlage und Verbraucher", section: "4. ES", type: "text", uiNumber: "7.11" },
  es_vnb_contact: {
    questionLabel: "Hatten Sie bereits Kontakt mit dem VNB zum Thema Energy Sharing?",
    section: "4. ES", type: "single-select", uiNumber: "7.12",
    options: { ja: "Ja", nein: "Nein" },
  },
  es_vnb_response: {
    questionLabel: "Wie hat der VNB auf Ihre Anfrage zum Energy Sharing reagiert?",
    section: "4. ES", type: "single-select", uiNumber: "7.13",
    options: {
      bereit_06_2026: "Bereit ab 01.06.2026",
      bereit_12_monate: "In 12 Monaten möglich",
      moeglich_keine_zeit: "Möglich, keine genaue Zeit",
      vertroestet: "Auf später vertröstet",
      weiss_nicht: "VNB kennt Energy Sharing nicht",
      sonstiges: "Sonstiges",
    },
  },
  es_vnb_response_other: { questionLabel: "ES VNB-Rückmeldung Sonstiges", section: "4. ES", type: "text", uiNumber: "7.13" },
  es_netzentgelte_discussion: { questionLabel: "Gibt es eine Diskussion über reduzierte Netzentgelte?", section: "4. ES", type: "textarea", uiNumber: "7.14" },
  es_netzentgelte_details: { questionLabel: "Netzentgelte Details", section: "4. ES", type: "textarea", uiNumber: "7.14" },
  es_info_sources: { questionLabel: "Welche Informationsquellen haben Sie zum Thema Energy Sharing genutzt?", section: "4. ES", type: "textarea", uiNumber: "7.15" },

  // === GGV-Transparenz ===
  ggv_transparenz_opt_in: {
    questionLabel: "Möchten Sie Ihr Projekt auf ggv-transparenz.de veröffentlichen?",
    section: "GGV-Transparenz", type: "single-select", uiNumber: "G.1",
    options: { ja: "Ja", nein: "Nein" },
  },
  ggv_project_name: { questionLabel: "Projektname für ggv-transparenz.de", section: "GGV-Transparenz", type: "text", uiNumber: "G.1a" },
  ggv_project_city: { questionLabel: "Stadt/Ort des GGV-Projekts", section: "GGV-Transparenz", type: "text", uiNumber: "G.2" },
  ggv_project_website: { questionLabel: "Website des GGV-Projekts", section: "GGV-Transparenz", type: "text", uiNumber: "G.3" },
  ggv_project_links: { questionLabel: "Weitere Links zum GGV-Projekt", section: "GGV-Transparenz", type: "text[]", uiNumber: "G.3a" },
  ggv_experience_notes: { questionLabel: "Erfahrungsnotizen zum GGV-Projekt", section: "GGV-Transparenz", type: "textarea", uiNumber: "G.4" },

  // === 6. Abschluss ===
  additional_experiences: { questionLabel: "Möchten Sie uns noch etwas mitteilen?", section: "6. Abschluss", type: "textarea", uiNumber: "8.1" },
  survey_improvements: { questionLabel: "Haben Sie Verbesserungsvorschläge für diese Umfrage?", section: "6. Abschluss", type: "textarea", uiNumber: "8.3" },
  nps_score: { questionLabel: "Wie wahrscheinlich ist es, dass Sie diese Umfrage weiterempfehlen? (0-10)", section: "6. Abschluss", type: "rating", uiNumber: "8.4" },
};

/**
 * Resolve a single cell value: if the column has options, replace the identifier
 * with the human-readable label. For arrays, resolve each element.
 * Uses pipe (|) as separator for multi-select values.
 */
export function resolveValue(column: string, rawValue: unknown): string {
  if (rawValue === null || rawValue === undefined) return "";
  
  const meta = COLUMN_LABELS[column];
  if (!meta?.options) {
    // No mapping available — return raw value
    if (Array.isArray(rawValue)) return rawValue.map(String).join(" | ");
    if (typeof rawValue === "object") return JSON.stringify(rawValue);
    return String(rawValue);
  }

  const opts = meta.options;
  
  if (Array.isArray(rawValue)) {
    return rawValue.map(v => opts[String(v)] || String(v)).join(" | ");
  }
  
  const str = String(rawValue);
  return opts[str] || str;
}

/**
 * Format a raw value for machine-readable output.
 * Arrays are pipe-separated (|), objects JSON-stringified, primitives as-is.
 * NO label resolution – values stay as technical IDs.
 */
export function formatRawValue(rawValue: unknown): string {
  if (rawValue === null || rawValue === undefined) return "";
  if (Array.isArray(rawValue)) return rawValue.map(String).join("|");
  if (typeof rawValue === "object") return JSON.stringify(rawValue);
  return String(rawValue);
}

/**
 * Generate a codebook as CSV (semicolon-separated, UTF-8 BOM) for Excel.
 * Single sheet: Frage-Nr | DB-Spalte | Abschnitt | Fragetext | Typ | Antwort-ID | Antwort-Label
 */
export function generateCodebookCsv(): string {
  const bom = "\uFEFF";
  const header = ["Frage-Nr", "DB-Spalte", "Abschnitt", "Fragetext", "Typ", "Antwort-ID", "Antwort-Label"].join(";");
  
  const rows: string[] = [];
  
  const escapeCsv = (val: string): string => {
    if (val.includes(";") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };
  
  for (const [column, meta] of Object.entries(COLUMN_LABELS)) {
    if (meta.options && Object.keys(meta.options).length > 0) {
      // One row per option
      for (const [value, label] of Object.entries(meta.options)) {
        rows.push([
          escapeCsv(meta.uiNumber || ""),
          escapeCsv(column),
          escapeCsv(meta.section),
          escapeCsv(meta.questionLabel),
          escapeCsv(meta.type),
          escapeCsv(value),
          escapeCsv(label),
        ].join(";"));
      }
    } else {
      // Single row for non-option fields
      rows.push([
        escapeCsv(meta.uiNumber || ""),
        escapeCsv(column),
        escapeCsv(meta.section),
        escapeCsv(meta.questionLabel),
        escapeCsv(meta.type),
        "",
        "",
      ].join(";"));
    }
  }
  
  return bom + [header, ...rows].join("\n");
}
