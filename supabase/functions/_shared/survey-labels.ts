/**
 * Survey label resolution for edge functions.
 * Maps DB column names → human-readable question labels & option labels.
 * 
 * This is a self-contained copy of the mapping data from the frontend schema,
 * kept in sync manually. When the schema version changes, update this file.
 * 
 * Schema Version: v0.0
 */

export const SCHEMA_VERSION = "v0.0";

// DB column → { questionLabel, options: { value → label } }
export interface QuestionMeta {
  questionLabel: string;
  section: string;
  type: string;
  options?: Record<string, string>; // value → human-readable label
}

// Build the full registry
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
  uploaded_documents: { questionLabel: "Hochgeladene Dokumente", section: "Meta", type: "text[]" },

  // === 1. Über Sie ===
  actor_types: { questionLabel: "In welche Akteursgruppe fallen Sie?", section: "1. Über Sie", type: "multi-select", options: { buergerenergie: "Bürgerenergiegenossenschaft", weg: "Wohnungseigentümergemeinschaft", vermieter_privat: "Vermieter/in - Privatperson", vermieter_prof_klein: "Vermieter/in - Professionell (<100 Einheiten)", vermieter_wohnungsunternehmen: "Vermieter/in - Wohnungsunternehmen (>100 Einheiten)", kommune: "Kommune / kommunales Unternehmen", kmu: "Kleine und Mittelständische Unternehmen (KMU)", dienstleister: "Dienstleister für GGV/Mieterstrom/Energy Sharing", installateur: "Installateur von PV-Anlagen", msb: "Wettbewerblicher Messstellenbetreiber", stadtwerk: "Stadtwerk/EVU", andere: "Andere" } },
  actor_text_fields: { questionLabel: "Akteursgruppe Freitextfelder", section: "1. Über Sie", type: "text" },
  actor_other: { questionLabel: "Akteursgruppe Sonstiges", section: "1. Über Sie", type: "text" },
  actor_dienstleister_category: { questionLabel: "Dienstleister-Kategorie", section: "1. Über Sie", type: "multi-select", options: { data_provision: "Datenbereitstellung (ESA-Zugang zu gMSB-Werten)", invoicing_prep: "Datenbereitstellung und Vorbereitung der Abrechnung", full_settlement: "Vollständige Abrechnung mit Teilnehmenden", metering_full: "Messstellenbetrieb inkl. Datenbereitstellung", metering_invoicing_prep: "Messstellenbetrieb inkl. Datenbereitstellung und Vorbereitung der Abrechnung", metering_full_settlement: "Messstellenbetrieb und vollständige Abrechnung", beratung: "Beratung für Immobilieneigentümer", software: "Software / IT-Plattform", sonstiges: "Sonstiges" } },
  actor_dienstleister_category_other: { questionLabel: "Dienstleister-Kategorie Sonstiges", section: "1. Über Sie", type: "text" },
  dienstleister_website: { questionLabel: "Dienstleister Webadresse", section: "1. Über Sie", type: "text[]" },
  dienstleister_kontakt: { questionLabel: "Dienstleister Kontakt", section: "1. Über Sie", type: "text[]" },
  motivation: { questionLabel: "Motivation", section: "1. Über Sie", type: "multi-select", options: { pv_nutzung: "PV-Anlage bauen und Strom vor Ort nutzen", energiewende: "Energiewende vor Ort umsetzen", geschaeft: "Bau und Betrieb von PV-Anlagen als Geschäft", sonstiges: "Sonstiges" } },
  motivation_other: { questionLabel: "Motivation Sonstiges", section: "1. Über Sie", type: "text" },
  contact_email: { questionLabel: "Kontakt-Email", section: "1. Über Sie", type: "email" },
  confirmation_for_update: { questionLabel: "Info über Ergebnisse gewünscht?", section: "1. Über Sie", type: "single-select", options: { ja: "Ja, ich möchte eine Info erhalten", nein: "Nein, ich schaue selber online nach Updates" } },

  // === 2. Projekt ===
  vnb_name: { questionLabel: "Verteilnetzbetreiber", section: "2. Projekt", type: "vnb-select" },
  project_types: { questionLabel: "Projektart", section: "2. Projekt", type: "multi-select", options: { ggv: "GGV (Gemeinschaftliche Gebäudeversorgung)", mieterstrom: "Mieterstrom", ggv_oder_mieterstrom: "GGV oder Mieterstrom (unentschieden)", energysharing: "Energy Sharing" } },
  project_focus: { questionLabel: "Projektfokus", section: "2. Projekt", type: "text" },
  planning_status: { questionLabel: "Planungsstatus", section: "2. Projekt", type: "single-select", options: { info_sammeln: "Informationen sammeln", planung_stockt_ggv: "Planung stockt (GGV/Mieterstrom)", planung_stockt_pv: "Planung stockt (PV-Installation)", planung_fast_fertig: "Fast fertig mit der Planung", pv_laeuft_ggv_planung: "PV läuft, GGV/Mieterstrom in Planung", pv_laeuft_ggv_laeuft: "PV läuft mit GGV/Mieterstrom", sonstiges: "Sonstiges" } },
  planning_status_other: { questionLabel: "Planungsstatus Sonstiges", section: "2. Projekt", type: "text" },
  mieterstrom_planning_status: { questionLabel: "Mieterstrom Planungsstatus", section: "2. Projekt", type: "single-select", options: { info_sammeln: "Informationen sammeln", planung_stockt_ggv: "Planung stockt (Mieterstrom)", planung_stockt_pv: "Planung stockt (PV-Installation)", planung_fast_fertig: "Fast fertig mit der Planung", pv_laeuft_ggv_planung: "PV läuft, Mieterstrom in Planung", pv_laeuft_ggv_laeuft: "PV läuft mit Mieterstrom", sonstiges: "Sonstiges" } },
  mieterstrom_planning_status_other: { questionLabel: "Mieterstrom Planungsstatus Sonstiges", section: "2. Projekt", type: "text" },

  // GGV Projekt-Details
  ggv_project_type: { questionLabel: "GGV Projektumfang", section: "2. Projekt", type: "single-select", options: { single: "Ein einzelnes Projekt", multiple: "Mehrere Projekte" } },
  ggv_pv_size_kw: { questionLabel: "GGV PV-Größe (kW)", section: "2. Projekt", type: "number" },
  ggv_party_count: { questionLabel: "GGV Anzahl Parteien", section: "2. Projekt", type: "number" },
  ggv_building_type: { questionLabel: "GGV Gebäudeart", section: "2. Projekt", type: "single-select", options: { wohngebaeude: "Wohngebäude", gewerbe: "Gewerbegebäude", gemischt: "Gemischt" } },
  ggv_building_count: { questionLabel: "GGV Gesamtzahl Projekte", section: "2. Projekt", type: "number" },
  ggv_additional_info: { questionLabel: "GGV Zusätzliche Informationen", section: "2. Projekt", type: "textarea" },
  project_plz: { questionLabel: "PLZ Projektstandort", section: "2. Projekt", type: "text" },
  project_address: { questionLabel: "Adresse Projektstandort", section: "2. Projekt", type: "text" },

  // Mieterstrom Projekt-Details
  mieterstrom_project_type: { questionLabel: "Mieterstrom Projektumfang", section: "2. Projekt", type: "single-select", options: { single: "Ein einzelnes Projekt", multiple: "Mehrere Projekte" } },
  mieterstrom_pv_size_kw: { questionLabel: "Mieterstrom PV-Größe (kW)", section: "2. Projekt", type: "number" },
  mieterstrom_party_count: { questionLabel: "Mieterstrom Anzahl Parteien", section: "2. Projekt", type: "number" },
  mieterstrom_building_type: { questionLabel: "Mieterstrom Gebäudeart", section: "2. Projekt", type: "single-select", options: { wohngebaeude: "Wohngebäude", gewerbe: "Gewerbegebäude", gemischt: "Gemischt" } },
  mieterstrom_building_count: { questionLabel: "Mieterstrom Gesamtzahl Projekte", section: "2. Projekt", type: "number" },
  mieterstrom_additional_info: { questionLabel: "Mieterstrom Zusätzliche Informationen", section: "2. Projekt", type: "textarea" },
  mieterstrom_foerderung: { questionLabel: "Mieterstrom Förderung", section: "2. Projekt", type: "single-select", options: { ja: "Ja", nein: "Nein", weiss_nicht: "Das wissen wir nicht" } },
  mieterstrom_foerderung_nein_grund: { questionLabel: "Mieterstrom Förderung - Warum nicht?", section: "2. Projekt", type: "single-select", options: { beantragt_nicht_geklappt: "Wir würden gerne, aber das war nicht so einfach", bewusst_dagegen: "Wir haben uns bewusst dagegen entschieden" } },
  mieterstrom_foerderung_nein_grund_other: { questionLabel: "Mieterstrom Förderung Begründung", section: "2. Projekt", type: "text" },

  // === 3. Planung Allgemein ===
  ggv_or_mieterstrom_decision: { questionLabel: "GGV oder Mieterstrom Entscheidung", section: "3. Planung", type: "single-select", options: { sicher_ggv: "Sicher GGV", unsicher: "Noch unsicher", sicher_mieterstrom: "Sicher Mieterstrom" } },
  ggv_decision_reasons: { questionLabel: "Gründe für GGV", section: "3. Planung", type: "multi-select", options: { buerokratie_mieterstrom: "Bürokratische Herausforderungen bei Mieterstrom", reststrom_pflicht: "Reststrom-Pflicht bei Mieterstrom", ladesaeulen_waermepumpen: "Einbindung Ladesäulen/Wärmepumpen einfacher", vnb_empfehlung: "VNB-Empfehlung", finanziell_attraktiver: "Finanziell attraktiver", sonstiges: "Sonstiges" } },
  ggv_decision_reasons_other: { questionLabel: "Gründe für GGV Sonstiges", section: "3. Planung", type: "text" },
  mieterstrom_decision_reasons: { questionLabel: "Gründe für Mieterstrom", section: "3. Planung", type: "multi-select", options: { einfacher_umsetzung: "Einfachere Umsetzung", kein_dienstleister_ggv: "Kein Dienstleister für GGV", vnb_empfehlung: "VNB-Empfehlung", vnb_kann_ggv_nicht: "VNB kann GGV nicht umsetzen", finanziell_attraktiver: "Finanziell attraktiver", sonstiges: "Sonstiges" } },
  mieterstrom_decision_reasons_other: { questionLabel: "Gründe für Mieterstrom Sonstiges", section: "3. Planung", type: "text" },
  implementation_approach: { questionLabel: "Umsetzungsansatz", section: "3. Planung", type: "multi-select", options: { alleine: "Möglichst viel alleine machen", dienstleister_ok: "Dienstleister OK wenn preislich attraktiv", dienstleister_alles: "Dienstleister soll alles übernehmen" } },
  implementation_approach_other: { questionLabel: "Umsetzungsansatz Sonstiges", section: "3. Planung", type: "text" },
  challenges: { questionLabel: "Herausforderungen", section: "3. Planung", type: "multi-select", options: { keine: "Nein, alles läuft gut", opposition: "Parteien sind gegen das Projekt", pv_installation: "Technische Probleme PV-Installation", vnb_blockiert: "VNB blockiert Umsetzung", kosten_zu_hoch: "Kosten zu hoch", sonstiges: "Sonstiges" } },
  challenges_details: { questionLabel: "Herausforderungen Details", section: "3. Planung", type: "text" },
  vnb_rejection_response: { questionLabel: "Reaktion auf VNB-Ablehnung", section: "3. Planung", type: "multi-select", options: { kein_grund: "Kein Grund zur Beschwerde", unsicher_aufgaben: "Unklar was VNB machen müsste", bnetza: "An BNetzA gewendet", rechtliche_schritte: "Rechtliche Schritte erwogen", keine_schritte: "Von Schritten abgesehen", sonstiges: "Sonstiges" } },
  vnb_rejection_response_other: { questionLabel: "Reaktion auf VNB-Ablehnung Sonstiges", section: "3. Planung", type: "text" },
  vnb_rejection_response_details: { questionLabel: "Reaktion auf VNB-Ablehnung Details", section: "3. Planung", type: "text" },

  // === 4. Planung GGV ===
  vnb_existing_projects: { questionLabel: "Bestehende GGV-Projekte im Netzgebiet", section: "4. GGV Planung", type: "single-select", options: { wissen_nicht: "Wissen wir nicht", nein: "Nein", ja_mindestens_eins: "Ja, mindestens eins", ja_viele: "Ja, eine ganze Reihe", sonstiges: "Sonstiges" } },
  vnb_existing_projects_other: { questionLabel: "Bestehende Projekte Sonstiges", section: "4. GGV Planung", type: "text" },
  vnb_contact: { questionLabel: "Kontakt mit VNB", section: "4. GGV Planung", type: "multi-select", options: { ja_direkt: "Direkter Kontakt", ja_installateur: "Über Installateur/Dienstleister", nein: "Noch kein Kontakt", sonstiges: "Sonstiges" } },
  vnb_contact_other: { questionLabel: "VNB-Kontakt Sonstiges", section: "4. GGV Planung", type: "text" },
  vnb_response: { questionLabel: "Aktueller Stand GGV mit VNB", section: "4. GGV Planung", type: "single-select", options: { moeglich_gmssb: "Umsetzbar mit gMSB", moeglich_wmsb: "Umsetzbar nur mit wMSB", nicht_moeglich: "Nicht möglich", keine_antwort: "Keine Antwort vom VNB", weiss_nicht: "Wissen wir nicht" } },
  vnb_response_reasons: { questionLabel: "VNB-Antwort Details", section: "4. GGV Planung", type: "text" },
  vnb_msb_timeline: { questionLabel: "Zeitrahmen gMSB Übernahme", section: "4. GGV Planung", type: "single-select", options: { ja_12_monate: "Innerhalb 12 Monate", ja_spaeter: "Über 12 Monate", nicht_gefragt: "Nicht gefragt", keine_aussage: "Keine Aussage" } },
  vnb_rejection_timeline: { questionLabel: "Zeitrahmen bei VNB-Ablehnung", section: "4. GGV Planung", type: "single-select", options: { ja_12_monate: "Innerhalb 12 Monate", ja_spaeter: "Über 12 Monate", nicht_gefragt: "Nicht gefragt", keine_aussage: "Keine Aussage" } },

  // GGV MSB Details
  vnb_start_timeline: { questionLabel: "Start Messbetrieb gMSB", section: "4. GGV MSB", type: "single-select", options: { sofort: "Sofort", zeitnah: "Zeitnah", "12_monate": "In den nächsten 12 Monaten", spaeter: "In mehr als 12 Monaten", weiss_nicht: "Wissen wir nicht", sonstiges: "Sonstiges" } },
  vnb_start_timeline_other: { questionLabel: "Start Messbetrieb Sonstiges", section: "4. GGV MSB", type: "text" },
  vnb_additional_costs: { questionLabel: "Zusatzkosten Einbau auf Kundenwunsch", section: "4. GGV MSB", type: "single-select", options: { wissen_nicht: "Wissen wir nicht", nein: "Keine Zusatzkosten", ja: "Ja, Zusatzkosten" } },
  vnb_additional_costs_one_time: { questionLabel: "Zusatzkosten Einmalbetrag (EUR)", section: "4. GGV MSB", type: "number" },
  vnb_additional_costs_yearly: { questionLabel: "Zusatzkosten jährlich (EUR)", section: "4. GGV MSB", type: "number" },
  vnb_full_service: { questionLabel: "Full-Service-Bedingung", section: "4. GGV MSB", type: "single-select", options: { nur_full_service: "Nur mit Full-Service-Angebot", auch_ohne: "Auch ohne Full-Service", weiss_nicht: "Wissen wir nicht" } },
  vnb_data_provision: { questionLabel: "Datenbereitstellung durch VNB", section: "4. GGV MSB", type: "multi-select", options: { mail_excel: "Per Mail als Excel", portal_verrechnete_werte: "Online-Portal mit verrechneten Werten", portal_alle_messwerte: "Online-Portal mit allen Messwerten", dienstleister_marktkommunikation: "Dienstleister über Marktkommunikation", wissen_nicht: "Wissen wir nicht", sonstiges: "Sonstiges" } },
  vnb_data_provision_other: { questionLabel: "Datenbereitstellung Sonstiges", section: "4. GGV MSB", type: "text" },
  vnb_data_cost: { questionLabel: "Kosten Datenbereitstellung", section: "4. GGV MSB", type: "single-select", options: { kostenlos: "Kostenlos", weniger_3_eur: "≤3 EUR/Messstelle/Jahr", mehr_3_eur: ">3 EUR/Messstelle/Jahr", aktuell_kostenlos: "Aktuell kostenlos, wird sich ändern", weiss_nicht: "Wissen wir nicht", sonstiges: "Sonstiges" } },
  vnb_data_cost_amount: { questionLabel: "Kosten Datenbereitstellung Betrag", section: "4. GGV MSB", type: "number" },
  vnb_esa_cost: { questionLabel: "ESA-Kosten VNB", section: "4. GGV MSB", type: "single-select", options: { wissen_nicht: "Wissen wir nicht", kostenlos: "Kostenlos", weniger_3_eur: "≤3 EUR/Messstelle/Jahr", mehr_3_eur: ">3 EUR/Messstelle/Jahr" } },
  vnb_esa_cost_amount: { questionLabel: "ESA-Kosten Betrag", section: "4. GGV MSB", type: "number" },

  // GGV Messkonzept
  vnb_wandlermessung: { questionLabel: "Wandlermessung GGV Planung", section: "4. GGV Messkonzept", type: "single-select", options: { ja: "Ja", nein: "Nein", weiss_nicht: "Wissen wir nicht" } },
  vnb_wandlermessung_comment: { questionLabel: "Wandlermessung Kommentar", section: "4. GGV Messkonzept", type: "textarea" },
  vnb_wandlermessung_documents: { questionLabel: "Wandlermessung Dokumente", section: "4. GGV Messkonzept", type: "file" },
  vnb_planning_duration: { questionLabel: "Dauer Planungsabstimmung mit VNB", section: "4. GGV Messkonzept", type: "single-select", options: { unter_2_monate: "Unter 2 Monaten", "2_bis_12_monate": "2-12 Monate", ueber_12_monate: "Über 12 Monate" } },
  vnb_planning_duration_reasons: { questionLabel: "Gründe für lange Planungsdauer", section: "4. GGV Messkonzept", type: "textarea" },

  // GGV VNB-Unterstützung
  vnb_support_messkonzept: { questionLabel: "VNB Info zum Messkonzept", section: "4. GGV Unterstützung", type: "single-select", options: { ja: "Ja", nein: "Nein", weiss_nicht: "Wissen wir nicht" } },
  vnb_support_messkonzept_other: { questionLabel: "VNB Messkonzept Details", section: "4. GGV Unterstützung", type: "text" },
  vnb_support_formulare: { questionLabel: "VNB Formulare verfügbar", section: "4. GGV Unterstützung", type: "single-select", options: { ja: "Ja", nein: "Nein", weiss_nicht: "Wissen wir nicht" } },
  vnb_support_formulare_other: { questionLabel: "VNB Formulare Details", section: "4. GGV Unterstützung", type: "text" },
  vnb_support_portal: { questionLabel: "VNB Online-Portal verfügbar", section: "4. GGV Unterstützung", type: "single-select", options: { ja: "Ja", nein: "Nein", weiss_nicht: "Wissen wir nicht" } },
  vnb_support_portal_other: { questionLabel: "VNB Portal Details", section: "4. GGV Unterstützung", type: "text" },
  vnb_support_other: { questionLabel: "VNB Weitere Unterstützung", section: "4. GGV Unterstützung", type: "text" },
  vnb_support_other_details: { questionLabel: "VNB Unterstützung Details", section: "4. GGV Unterstützung", type: "text" },
  vnb_contact_helpful: { questionLabel: "VNB Kontaktmöglichkeit hilfreich", section: "4. GGV Unterstützung", type: "single-select", options: { ja_hilfreich: "Ja, hilfreich", ja_nicht_hilfreich: "Ja, aber wenig hilfreich", nein: "Nein, keine Kontaktmöglichkeit", sonstiges: "Sonstiges" } },
  vnb_contact_helpful_other: { questionLabel: "VNB Kontakt Sonstiges", section: "4. GGV Unterstützung", type: "text" },
  vnb_personal_contacts: { questionLabel: "Persönliche Kontakte bei VNB", section: "4. GGV Unterstützung", type: "single-select", options: { ja_bestanden: "Ja, bestanden schon", ja_entstanden: "Ja, bei GGV-Umsetzung entstanden", nein: "Nein", sonstiges: "Sonstiges" } },
  vnb_personal_contacts_other: { questionLabel: "Persönliche Kontakte Sonstiges", section: "4. GGV Unterstützung", type: "text" },
  vnb_support_rating: { questionLabel: "VNB Unterstützung Bewertung (1-10)", section: "4. GGV Unterstützung", type: "rating" },

  // === 5. Betrieb GGV ===
  operation_vnb_duration: { questionLabel: "Dauer Abstimmung VNB (Betrieb)", section: "5. GGV Betrieb", type: "single-select", options: { unter_2_monate: "Unter 2 Monaten", "2_bis_12_monate": "2-12 Monate", ueber_12_monate: "Über 12 Monate" } },
  operation_vnb_duration_reasons: { questionLabel: "Gründe für lange Abstimmung", section: "5. GGV Betrieb", type: "textarea" },
  operation_wandlermessung: { questionLabel: "Wandlermessung GGV Betrieb", section: "5. GGV Betrieb", type: "single-select", options: { ja: "Ja", nein: "Nein", nein_freiwillig: "Nein, aber freiwillig eingebaut", wissen_nicht: "Wissen wir nicht" } },
  operation_wandlermessung_comment: { questionLabel: "Wandlermessung Betrieb Kommentar", section: "5. GGV Betrieb", type: "textarea" },
  operation_msb_provider: { questionLabel: "MSB-Betreiber", section: "5. GGV Betrieb", type: "single-select", options: { gmsb: "Lokaler gMSB", wmsb: "wMSB", weiss_nicht: "Wissen wir nicht" } },
  operation_allocation_provider: { questionLabel: "Aufteilung PV-Strom", section: "5. GGV Betrieb", type: "single-select", options: { gmsb: "Lokaler gMSB", wmsb: "wMSB", sonstiges: "Dienstleister / Sonstiges", weiss_nicht: "Wissen wir nicht" } },
  operation_allocation_provider_other: { questionLabel: "Aufteilung Sonstiges", section: "5. GGV Betrieb", type: "text" },
  operation_data_provider: { questionLabel: "Datenübermittlung Betrieb", section: "5. GGV Betrieb", type: "single-select", options: { gmsb: "Lokaler gMSB", wmsb: "wMSB", dienstleister: "ESA-Dienstleister", abrechnung_dienstleister: "Abrechnung komplett durch Dienstleister", weiss_nicht: "Wissen wir nicht" } },
  operation_data_provider_other: { questionLabel: "Datenübermittlung Sonstiges", section: "5. GGV Betrieb", type: "text" },
  operation_msb_duration: { questionLabel: "Dauer bis Smart Meter Einbau", section: "5. GGV Betrieb", type: "single-select", options: { wissen_nicht: "Weiß ich nicht", schnell: "Problemlos und schnell", "4_monate": "Ca. 4 Monate", laenger: "Deutlich länger als 4 Monate" } },
  operation_msb_additional_costs: { questionLabel: "Zusatzkosten Einbau Betrieb", section: "5. GGV Betrieb", type: "single-select", options: { nein: "Keine Zusatzkosten", ja: "Ja, Zusatzkosten", wissen_nicht: "Wissen wir nicht" } },
  operation_msb_additional_costs_one_time: { questionLabel: "Zusatzkosten Betrieb Einmalbetrag", section: "5. GGV Betrieb", type: "number" },
  operation_msb_additional_costs_yearly: { questionLabel: "Zusatzkosten Betrieb jährlich", section: "5. GGV Betrieb", type: "number" },
  operation_data_format: { questionLabel: "Datenformat Betrieb", section: "5. GGV Betrieb", type: "single-select", options: { mail_excel: "Per Mail als Excel", portal_verrechnete_werte: "Online-Portal verrechnete Werte", portal_alle_messwerte: "Online-Portal alle Messwerte", dienstleister_marktkommunikation: "Dienstleister Marktkommunikation", wissen_nicht: "Wissen wir nicht", sonstiges: "Sonstiges" } },
  operation_data_format_other: { questionLabel: "Datenformat Sonstiges", section: "5. GGV Betrieb", type: "text" },
  operation_data_cost: { questionLabel: "Kosten Datenbereitstellung Betrieb", section: "5. GGV Betrieb", type: "single-select", options: { kostenlos: "Kostenlos", weniger_3_eur: "≤3 EUR/Messstelle/Jahr", mehr_3_eur: ">3 EUR/Messstelle/Jahr", aktuell_kostenlos: "Aktuell kostenlos, wird sich ändern", weiss_nicht: "Wissen wir nicht", sonstiges: "Sonstiges" } },
  operation_data_cost_amount: { questionLabel: "Kosten Daten Betrieb Betrag", section: "5. GGV Betrieb", type: "number" },
  operation_esa_cost: { questionLabel: "ESA-Kosten Betrieb", section: "5. GGV Betrieb", type: "single-select", options: { wissen_nicht: "Wissen wir nicht", kostenlos: "Kostenlos", weniger_3_eur: "≤3 EUR/Messstelle/Jahr", mehr_3_eur: ">3 EUR/Messstelle/Jahr" } },
  operation_esa_cost_amount: { questionLabel: "ESA-Kosten Betrieb Betrag", section: "5. GGV Betrieb", type: "number" },
  operation_satisfaction_rating: { questionLabel: "Zufriedenheit mit VNB (1-10)", section: "5. GGV Betrieb", type: "rating" },

  // Dienstleister
  service_provider_name: { questionLabel: "Dienstleister 1 Name", section: "5. Dienstleister", type: "text" },
  service_provider_services: { questionLabel: "Dienstleister 1 Leistungen", section: "5. Dienstleister", type: "multi-select", options: { data_provision: "Datenbereitstellung (ESA-Zugang)", invoicing_prep: "Datenbereitstellung + Abrechnungsvorbereitung", full_settlement: "Vollständige Abrechnung", metering_full: "MSB inkl. Datenbereitstellung", metering_invoicing_prep: "MSB inkl. Daten + Abrechnungsvorbereitung", metering_full_settlement: "MSB + vollständige Abrechnung", beratung: "Beratung", software: "Software / IT-Plattform", sonstiges: "Sonstiges" } },
  service_provider_comments: { questionLabel: "Dienstleister 1 Erfahrungsbericht", section: "5. Dienstleister", type: "textarea" },
  service_provider_2_name: { questionLabel: "Dienstleister 2 Name", section: "5. Dienstleister", type: "text" },
  service_provider_2_services: { questionLabel: "Dienstleister 2 Leistungen", section: "5. Dienstleister", type: "multi-select", options: { data_provision: "Datenbereitstellung (ESA-Zugang)", invoicing_prep: "Datenbereitstellung + Abrechnungsvorbereitung", full_settlement: "Vollständige Abrechnung", metering_full: "MSB inkl. Datenbereitstellung", metering_invoicing_prep: "MSB inkl. Daten + Abrechnungsvorbereitung", metering_full_settlement: "MSB + vollständige Abrechnung", beratung: "Beratung", software: "Software / IT-Plattform", sonstiges: "Sonstiges" } },
  service_provider_2_comments: { questionLabel: "Dienstleister 2 Kommentare", section: "5. Dienstleister", type: "textarea" },
  sp_quality_rating: { questionLabel: "Dienstleister Qualitätsbewertung (1-10)", section: "5. Dienstleister", type: "rating" },
  sp_price_rating: { questionLabel: "Dienstleister Preisbewertung (1-10)", section: "5. Dienstleister", type: "rating" },
  sp_rating_comment: { questionLabel: "Dienstleister Bewertung Kommentar", section: "5. Dienstleister", type: "textarea" },

  // === 4. Mieterstrom Planung ===
  mieterstrom_summenzaehler: { questionLabel: "Summenzähler Modell", section: "4. MS Planung", type: "single-select", options: { virtuell: "Virtueller Summenzähler", physikalisch: "Physikalischer Summenzähler", kein_unterschied: "Unterschied nicht bekannt", keine_praeferenz: "Keine Präferenz", sonstiges: "Sonstiges" } },
  mieterstrom_existing_projects: { questionLabel: "Bestehende MS-Projekte im Netzgebiet", section: "4. MS Planung", type: "single-select", options: { wissen_nicht: "Wissen wir nicht", nein: "Nein", ja_mindestens_eins: "Ja, mindestens eins", ja_viele: "Ja, eine ganze Reihe", sonstiges: "Sonstiges" } },
  mieterstrom_existing_projects_virtuell: { questionLabel: "MS-Projekte mit virt. Summenzähler", section: "4. MS Planung", type: "single-select", options: { wissen_nicht: "Wissen wir nicht", nein: "Nein", ja_mindestens_eins: "Ja, mindestens eins", ja_viele: "Ja, eine ganze Reihe", sonstiges: "Sonstiges" } },
  mieterstrom_vnb_contact: { questionLabel: "Kontakt mit VNB (Mieterstrom)", section: "4. MS Planung", type: "multi-select", options: { ja_direkt: "Direkter Kontakt", ja_installateur: "Über Installateur/Dienstleister", nein: "Noch kein Kontakt", sonstiges: "Sonstiges" } },
  mieterstrom_vnb_contact_other: { questionLabel: "VNB-Kontakt MS Sonstiges", section: "4. MS Planung", type: "text" },
  mieterstrom_virtuell_allowed: { questionLabel: "Virtueller Summenzähler erlaubt", section: "4. MS Planung", type: "single-select", options: { ja: "Ja", nein: "Nein", weiss_nicht: "Wissen wir nicht" } },
  mieterstrom_virtuell_denied_reason: { questionLabel: "Grund Ablehnung virt. Summenzähler", section: "4. MS Planung", type: "textarea" },
  mieterstrom_virtuell_denied_documents: { questionLabel: "Dokumente Ablehnung virt. SZ", section: "4. MS Planung", type: "file" },
  mieterstrom_virtuell_wandlermessung: { questionLabel: "Wandlermessung für virt. Summenzähler", section: "4. MS Planung", type: "single-select", options: { ja: "Ja", nein: "Nein", weiss_nicht: "Wissen wir nicht" } },
  mieterstrom_virtuell_wandlermessung_comment: { questionLabel: "Wandlermessung virt. SZ Kommentar", section: "4. MS Planung", type: "textarea" },
  mieterstrom_virtuell_wandlermessung_documents: { questionLabel: "Wandlermessung virt. SZ Dokumente", section: "4. MS Planung", type: "file" },
  mieterstrom_vnb_response: { questionLabel: "VNB-Antwort Mieterstrom", section: "4. MS Planung", type: "multi-select", options: { moeglich_gmsb: "Umsetzbar mit gMSB", moeglich_wmsb: "Umsetzbar nur mit wMSB", nicht_moeglich: "Nicht möglich", keine_antwort: "Keine Antwort", weiss_nicht: "Wissen wir nicht" } },
  mieterstrom_vnb_response_reasons: { questionLabel: "VNB-Antwort MS Details", section: "4. MS Planung", type: "text" },
  mieterstrom_support_rating: { questionLabel: "VNB MS Unterstützung (1-10)", section: "4. MS Planung", type: "rating" },

  // MS VNB Angebot
  mieterstrom_full_service: { questionLabel: "MS Full-Service-Bedingung", section: "4. MS VNB Angebot", type: "single-select", options: { nur_full_service: "Nur mit Full-Service", auch_ohne: "Auch ohne Full-Service", weiss_nicht: "Wissen wir nicht" } },
  mieterstrom_msb_costs: { questionLabel: "MS Zusatzkosten Einbau", section: "4. MS VNB Angebot", type: "single-select", options: { wissen_nicht: "Wissen wir nicht", nein: "Keine Zusatzkosten", ja: "Ja, Zusatzkosten", sonstiges: "Sonstiges" } },
  mieterstrom_msb_costs_other: { questionLabel: "MS Zusatzkosten Sonstiges", section: "4. MS VNB Angebot", type: "text" },
  mieterstrom_msb_costs_one_time: { questionLabel: "MS Zusatzkosten Einmalbetrag", section: "4. MS VNB Angebot", type: "number" },
  mieterstrom_msb_costs_yearly: { questionLabel: "MS Zusatzkosten jährlich", section: "4. MS VNB Angebot", type: "number" },
  mieterstrom_model_choice: { questionLabel: "MS Umsetzungsmodell VNB", section: "4. MS VNB Angebot", type: "single-select", options: { virtuell: "Virtueller Summenzähler", physikalisch: "Nur physikalisches Modell", beide: "Beide Modelle", weiss_nicht: "Wissen wir nicht" } },
  mieterstrom_data_provision: { questionLabel: "MS Datenbereitstellung VNB", section: "4. MS VNB Angebot", type: "single-select", options: { direkt_guenstig: "Direkt, ≤3 EUR/Messstelle/Jahr", direkt_teuer: "Direkt, >3 EUR/Messstelle/Jahr", marktkommunikation: "Über Marktkommunikation", weiss_nicht: "Wissen wir nicht" } },

  // === 5. Betrieb Mieterstrom ===
  mieterstrom_vnb_role: { questionLabel: "VNB Rolle im MS-Projekt", section: "5. MS Betrieb", type: "single-select", options: { keine: "Keine, mit wMSB", msb_dienstleister: "VNB/gMSB ist MSB, Daten über Dienstleister", msb_direkt: "VNB/gMSB ist MSB, Daten direkt", full_service: "Stadtwerk übernimmt alles", weiss_nicht: "Wissen wir nicht" } },
  mieterstrom_vnb_duration: { questionLabel: "Dauer Abstimmung VNB (MS Betrieb)", section: "5. MS Betrieb", type: "single-select", options: { unter_2_monate: "Unter 2 Monaten", "2_bis_12_monate": "2-12 Monate", ueber_12_monate: "Über 12 Monate" } },
  mieterstrom_vnb_duration_reasons: { questionLabel: "Gründe für lange Abstimmung MS", section: "5. MS Betrieb", type: "textarea" },
  mieterstrom_wandlermessung: { questionLabel: "Wandlermessung MS Betrieb", section: "5. MS Betrieb", type: "single-select", options: { nein: "Nein", ja: "Ja", wissen_nicht: "Wissen wir nicht" } },
  mieterstrom_wandlermessung_comment: { questionLabel: "Wandlermessung MS Kommentar", section: "5. MS Betrieb", type: "text" },
  mieterstrom_msb_install_duration: { questionLabel: "Dauer Smart Meter Einbau MS", section: "5. MS Betrieb", type: "single-select", options: { wissen_nicht: "Weiß ich nicht", schnell: "Problemlos und schnell", "4_monate": "4 Monate Frist eingehalten", laenger: "Frist deutlich überschritten" } },
  mieterstrom_operation_costs: { questionLabel: "Betriebskosten Smart Meter MS", section: "5. MS Betrieb", type: "single-select", options: { wissen_nicht: "Wissen wir nicht", nein: "Keine Zusatzkosten", ja: "Ja, Zusatzkosten" } },
  mieterstrom_operation_costs_one_time: { questionLabel: "Betriebskosten MS Einmalbetrag", section: "5. MS Betrieb", type: "number" },
  mieterstrom_operation_costs_yearly: { questionLabel: "Betriebskosten MS jährlich", section: "5. MS Betrieb", type: "number" },
  mieterstrom_rejection_response: { questionLabel: "Reaktion auf MS VNB-Ablehnung", section: "5. MS Betrieb", type: "multi-select", options: { bnetza: "An BNetzA gewendet", rechtliche_schritte: "Rechtliche Schritte erwogen", keine_schritte: "Von Schritten abgesehen", sonstiges: "Sonstiges" } },
  mieterstrom_rejection_response_other: { questionLabel: "Reaktion MS Ablehnung Sonstiges", section: "5. MS Betrieb", type: "text" },
  mieterstrom_info_sources: { questionLabel: "MS Informationsquellen", section: "5. MS Betrieb", type: "textarea" },
  mieterstrom_experiences: { questionLabel: "MS Weitere Erfahrungen", section: "5. MS Betrieb", type: "textarea" },

  // === 4. Energy Sharing ===
  es_status: { questionLabel: "Energy Sharing Status", section: "4. ES", type: "single-select", options: { in_betrieb_vollversorgung: "In Betrieb (Vollversorgung)", in_betrieb_42c: "In Betrieb (§42c EnWG)", planung_bereit: "Planung, bereit zum Start", info_sammeln: "Informationen sammeln", sonstiges: "Sonstiges" } },
  es_status_other: { questionLabel: "ES Status Sonstiges", section: "4. ES", type: "text" },
  es_in_operation_details: { questionLabel: "ES Betrieb Details", section: "4. ES", type: "textarea" },
  es_operator_details: { questionLabel: "ES Betreiber Details", section: "4. ES", type: "textarea" },
  es_plant_type: { questionLabel: "ES Anlagentyp", section: "4. ES", type: "multi-select", options: { wind: "Windenergieanlage", buergerwind: "Bürgerwindanlage", pv_freiflaeche: "PV-Freiflächenanlage", buergersolar: "Bürgersolaranlage", pv_efh: "PV auf Einfamilienhaus", pv_mfh: "PV auf Mehrfamilienhaus", pv_nichtwohn: "PV auf Nicht-Wohngebäude" } },
  es_plant_type_details: { questionLabel: "ES Anlagentyp Details", section: "4. ES", type: "text[]" },
  es_technology_description: { questionLabel: "ES Erzeugungstechnologie", section: "4. ES", type: "textarea" },
  es_project_scope: { questionLabel: "ES Projektumfang", section: "4. ES", type: "single-select", options: { single: "Eine einzelne Anlage", multiple: "Mehrere Anlagen" } },
  es_capacity_size_kw: { questionLabel: "ES Anlagengröße (kW)", section: "4. ES", type: "number" },
  es_party_count: { questionLabel: "ES Anzahl Parteien", section: "4. ES", type: "number" },
  es_consumer_types: { questionLabel: "ES Verbrauchertypen", section: "4. ES", type: "multi-select", options: { privat: "Private Haushalte", kommune: "Kommune", kommunal_unternehmen: "Kommunale Unternehmen", kmu: "KMU", vereine: "Vereine" } },
  es_consumer_details: { questionLabel: "ES Verbraucher Details", section: "4. ES", type: "textarea" },
  es_consumer_scope: { questionLabel: "ES Lieferumfang", section: "4. ES", type: "single-select", options: { alle: "An jeden Interessierten", primaer_bestimmte: "Primär bestimmte Abnehmer", nur_bestimmte: "Nur bestimmte Abnehmer", sonstiges: "Sonstiges" } },
  es_consumer_scope_other: { questionLabel: "ES Lieferumfang Sonstiges", section: "4. ES", type: "text" },
  es_max_distance: { questionLabel: "ES Max. Abstand Anlage-Verbraucher", section: "4. ES", type: "text" },
  es_vnb_contact: { questionLabel: "ES Kontakt mit VNB", section: "4. ES", type: "single-select", options: { ja: "Ja", nein: "Nein" } },
  es_vnb_response: { questionLabel: "ES Rückmeldung VNB", section: "4. ES", type: "single-select", options: { bereit_06_2026: "Bereit ab 01.06.2026", bereit_12_monate: "In 12 Monaten möglich", moeglich_keine_zeit: "Möglich, keine genaue Zeit", vertroestet: "Auf später vertröstet", weiss_nicht: "VNB kennt ES nicht", sonstiges: "Sonstiges" } },
  es_vnb_response_other: { questionLabel: "ES VNB-Rückmeldung Sonstiges", section: "4. ES", type: "text" },
  es_netzentgelte_discussion: { questionLabel: "ES Netzentgelte Diskussion", section: "4. ES", type: "textarea" },
  es_netzentgelte_details: { questionLabel: "ES Netzentgelte Details", section: "4. ES", type: "textarea" },
  es_info_sources: { questionLabel: "ES Informationsquellen", section: "4. ES", type: "textarea" },

  // === GGV-Transparenz ===
  ggv_transparenz_opt_in: { questionLabel: "GGV-Transparenz Opt-In", section: "GGV-Transparenz", type: "single-select", options: { ja: "Ja", nein: "Nein" } },
  ggv_project_name: { questionLabel: "GGV Projektname", section: "GGV-Transparenz", type: "text" },
  ggv_project_city: { questionLabel: "GGV Projektstadt", section: "GGV-Transparenz", type: "text" },
  ggv_project_website: { questionLabel: "GGV Projekt-Website", section: "GGV-Transparenz", type: "text" },
  ggv_project_links: { questionLabel: "GGV Projekt-Links", section: "GGV-Transparenz", type: "text[]" },
  ggv_experience_notes: { questionLabel: "GGV Erfahrungsnotizen", section: "GGV-Transparenz", type: "textarea" },

  // === 6. Abschluss ===
  additional_experiences: { questionLabel: "Weitere Erfahrungen", section: "6. Abschluss", type: "textarea" },
  survey_improvements: { questionLabel: "Verbesserungsvorschläge Umfrage", section: "6. Abschluss", type: "textarea" },
  nps_score: { questionLabel: "Empfehlungswahrscheinlichkeit (0-10)", section: "6. Abschluss", type: "rating" },
};

/**
 * Resolve a single cell value: if the column has options, replace the identifier
 * with the human-readable label. For arrays, resolve each element.
 */
export function resolveValue(column: string, rawValue: unknown): string {
  if (rawValue === null || rawValue === undefined) return "";
  
  const meta = COLUMN_LABELS[column];
  if (!meta?.options) {
    // No mapping available — return raw value
    if (Array.isArray(rawValue)) return rawValue.map(String).join(", ");
    if (typeof rawValue === "object") return JSON.stringify(rawValue);
    return String(rawValue);
  }

  const opts = meta.options;
  
  if (Array.isArray(rawValue)) {
    return rawValue.map(v => opts[String(v)] || String(v)).join(", ");
  }
  
  const str = String(rawValue);
  return opts[str] || str;
}

/**
 * Generate a codebook as CSV (semicolon-separated, UTF-8 BOM) for Excel.
 * Single sheet: DB-Spalte | Abschnitt | Fragetext | Typ | Antwort-ID | Antwort-Label
 */
export function generateCodebookCsv(): string {
  const bom = "\uFEFF";
  const header = ["DB-Spalte", "Abschnitt", "Fragetext", "Typ", "Antwort-ID", "Antwort-Label"].join(";");
  
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
          escapeCsv(column),
          escapeCsv(meta.section),
          escapeCsv(meta.questionLabel),
          escapeCsv(meta.type),
          escapeCsv(value),
          escapeCsv(label),
        ].join(";"));
      }
    } else {
      // One row for the column (no options)
      rows.push([
        escapeCsv(column),
        escapeCsv(meta.section),
        escapeCsv(meta.questionLabel),
        escapeCsv(meta.type),
        "",
        "(Freitext / Zahl)",
      ].join(";"));
    }
  }
  
  return bom + [header, ...rows].join("\n");
}
