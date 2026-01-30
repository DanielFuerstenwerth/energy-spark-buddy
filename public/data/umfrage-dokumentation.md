# Umfrage zu GGV, Mieterstrom & Energy Sharing
**Version:** 2.1.0  
**Stand:** 2026-01-26

Diese Umfrage erfasst Erfahrungen mit der Umsetzung von Gemeinschaftlicher Gebäudeversorgung (GGV), Mieterstrom und Energy Sharing in Deutschland.

---

## Legende

### Fragetypen
- **single-select** = Einfachauswahl (nur eine Option wählbar)
- **multi-select** = Mehrfachauswahl (mehrere Optionen wählbar)
- **text** = Einzeiliges Textfeld
- **textarea** = Mehrzeiliges Textfeld
- **number** = Zahlenfeld
- **email** = E-Mail-Feld
- **rating** = Bewertungsskala (1-10)
- **file** = Datei-Upload
- **vnb-select** = VNB-Auswahlfeld mit Suchfunktion
- **project-focus** = Projektfokus-Auswahl

### Spezielle Eigenschaften
- **[PFLICHT]** = Pflichtfeld
- **[OPTIONAL]** = Optionales Feld
- **[EXKLUSIV]** = Bei Auswahl werden alle anderen Optionen abgewählt und gesperrt
- **[+ TEXTFELD: "..."]** = Bei Auswahl erscheint ein zusätzliches Textfeld
- **[BEDINGT PFLICHT: ...]** = Wird Pflichtfeld unter bestimmten Bedingungen

---

## A. Über Sie
**Beschreibung:** Einordnung & Motivation

### A1. Zu welcher Akteursgruppe würden Sie sich zählen?
- **ID:** `actorTypes`
- **Typ:** multi-select
- **Beschreibung:** Mehrfachauswahl möglich
- **[PFLICHT]**

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `buergerenergie` | Bürgerenergiegenossenschaft | [+ TEXTFELD: "Name der Genossenschaft (optional)"] |
| `weg` | Wohnungseigentümergemeinschaft | |
| `vermieter_privat` | Vermieter/in - Privatperson | |
| `vermieter_prof_klein` | Vermieter/in - Professionell (<100 Einheiten) | |
| `vermieter_wohnungsunternehmen` | Vermieter/in - Wohnungsunternehmen (>100 Einheiten) | |
| `kommune` | Kommune / kommunales Unternehmen | |
| `kmu` | Kleine und Mittelständische Unternehmen (KMU) | |
| `dienstleister` | Dienstleister für GGV/Mieterstrom/Energy Sharing | [+ TEXTFELD: "Welche Dienstleistung?"] |
| `installateur` | Installateur von PV-Anlagen | |
| `msb` | Wettbewerblicher Messstellenbetreiber | |
| `stadtwerk` | Stadtwerk/EVU | |
| `andere` | Andere | [+ TEXTFELD: "Bitte beschreiben"] |

---

### A2. Was ist Ihre Motivation?
- **ID:** `motivation`
- **Typ:** multi-select
- **Beschreibung:** Mehrfachauswahl möglich
- **[PFLICHT]**

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `pv_nutzung` | Wir werden auf jeden Fall eine PV-Anlage bauen (oder haben diese schon gebaut) und möchten den Strom vor Ort nutzen | |
| `energiewende` | Wir möchten gerne Energiewende vor Ort umsetzen - sobald die Nutzung geklärt ist, kommt die PV-Anlage | |
| `geschaeft` | Der Bau und Betrieb von PV-Anlagen ist ein wesentliches Anliegen von unserem Unternehmen | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### A3. Welche Projektart interessiert Sie?
- **ID:** `projectTypes`
- **Typ:** multi-select
- **Beschreibung:** Mehrfachauswahl möglich
- **[PFLICHT]**

**Optionen:**
| Wert | Label |
|------|-------|
| `ggv` | GGV (Gemeinschaftliche Gebäudeversorgung) |
| `mieterstrom` | Mieterstrom |
| `ggv_oder_mieterstrom` | Entweder GGV oder Mieterstrom |
| `energysharing` | Energy Sharing (in Zukunft möglich) |

---

### Kontakt E-Mail
- **ID:** `contactEmail`
- **Typ:** email
- **Beschreibung:** Optional - falls wir Rückfragen haben
- **Platzhalter:** `ihre@email.de`
- **[OPTIONAL]**

---

## Projektdetails
**Beschreibung:** VNB und Projektdimensionen

### Projektfokus
- **ID:** `projectFocus`
- **Typ:** project-focus
- **Beschreibung:** GGV, Mieterstrom oder Energy Sharing

**Sichtbarkeitslogik:**
> Sichtbar wenn `projectTypes` eines von [ggv, mieterstrom, ggv_oder_mieterstrom] enthält

**Optionen:**
| Wert | Label |
|------|-------|
| `ggv` | GGV - Gemeinschaftliche Gebäudeversorgung |
| `mieterstrom` | Mieterstrom - Mieterstrom-Modelle |
| `energysharing` | Energy Sharing - Gemeinschaftliche Nutzung |

---

### Welcher Verteilnetzbetreiber ist für Ihr Projekt zuständig?
- **ID:** `vnbName`
- **Typ:** vnb-select
- **Beschreibung:** Suchen oder geben Sie den Namen Ihres VNB ein
- **[OPTIONAL]**

---

### Projektumfang (GGV)
- **ID:** `ggvProjectType`
- **Typ:** single-select

**Sichtbarkeitslogik:**
> Nur wenn `projectFocus = 'ggv'`

**Optionen:**
| Wert | Label |
|------|-------|
| `single` | Ein einzelnes Projekt |
| `multiple` | Mehrere Projekte |

---

### Größe der PV-Anlage in kW (GGV)
- **ID:** `ggvPvSizeKw`
- **Typ:** number
- **Platzhalter:** `z.B. 30`
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Nur wenn `projectFocus = 'ggv'`

---

### Anzahl der Parteien, die Strom abnehmen (GGV)
- **ID:** `ggvPartyCount`
- **Typ:** number
- **Platzhalter:** `z.B. 12`
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Nur wenn `projectFocus = 'ggv'`

---

### Art des Gebäudes (GGV)
- **ID:** `ggvBuildingType`
- **Typ:** single-select

**Sichtbarkeitslogik:**
> Nur wenn `projectFocus = 'ggv'`

**Optionen:**
| Wert | Label |
|------|-------|
| `wohngebaeude` | Wohngebäude |
| `gewerbe` | Gewerbegebäude |
| `gemischt` | Gemischt |

---

### Gesamtzahl der Projekte (GGV)
- **ID:** `ggvBuildingCount`
- **Typ:** number
- **Platzhalter:** `z.B. 5`
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Nur wenn `projectFocus = 'ggv'` UND `ggvProjectType = 'multiple'`

---

### Zusätzliche Informationen (GGV)
- **ID:** `ggvAdditionalInfo`
- **Typ:** textarea
- **Platzhalter:** `Weitere Details zu Ihrem Projekt...`
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Nur wenn `projectFocus = 'ggv'`

---

### Projektumfang (Mieterstrom)
- **ID:** `mieterstromProjectType`
- **Typ:** single-select

**Sichtbarkeitslogik:**
> Nur wenn `projectFocus = 'mieterstrom'`

**Optionen:**
| Wert | Label |
|------|-------|
| `single` | Ein einzelnes Projekt |
| `multiple` | Mehrere Projekte |

---

### Größe der PV-Anlage(n) in kW (Mieterstrom)
- **ID:** `mieterstromPvSizeKw`
- **Typ:** number
- **Platzhalter:** `z.B. 50`
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Nur wenn `projectFocus = 'mieterstrom'`

---

### Anzahl der Mietparteien
- **ID:** `mieterstromPartyCount`
- **Typ:** number
- **Platzhalter:** `z.B. 24`
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Nur wenn `projectFocus = 'mieterstrom'`

---

### Art des Gebäudes (Mieterstrom)
- **ID:** `mieterstromBuildingType`
- **Typ:** single-select

**Sichtbarkeitslogik:**
> Nur wenn `projectFocus = 'mieterstrom'`

**Optionen:**
| Wert | Label |
|------|-------|
| `wohngebaeude` | Wohngebäude |
| `gewerbe` | Gewerbegebäude |
| `gemischt` | Gemischt |

---

### Zusätzliche Informationen (Mieterstrom)
- **ID:** `mieterstromAdditionalInfo`
- **Typ:** textarea
- **Platzhalter:** `Weitere Details zu Ihrem Projekt...`
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Nur wenn `projectFocus = 'mieterstrom'`

---

## B. Planungsstand
**Beschreibung:** Aktueller Status

**Sichtbarkeitslogik (gesamte Sektion):**
> Nur wenn GGV oder Mieterstrom ausgewählt (nicht nur Energy Sharing)

---

### B1. Wo stehen Sie aktuell?
- **ID:** `planningStatus`
- **Typ:** single-select ⚠️ (Einzelauswahl!)
- **[PFLICHT]**

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `info_sammeln` | Wir habe(n) grundsätzliches Interesse, sammeln derzeit Informationen | |
| `planung_stockt_ggv` | Wir sind fortgeschritten in der Planung, aber es stockt mit der Umsetzung GGV/Mieterstrom | |
| `planung_stockt_pv` | Wir sind fortgeschritten in der Planung, aber es stockt mit der Installation der PV-Anlage | |
| `planung_fast_fertig` | Wir sind fast fertig mit der Planung | |
| `pv_laeuft_ggv_planung` | Die PV-Anlage läuft schon, aber die GGV/Mieterstrom ist noch in Planung | |
| `pv_laeuft_ggv_laeuft` | Die PV-Anlage läuft bereits mit GGV/Mieterstrom | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### B2. Wie sicher sind Sie, ob Sie GGV oder Mieterstrom umsetzen?
- **ID:** `ggvOrMieterstromDecision`
- **Typ:** single-select

**Sichtbarkeitslogik:**
> Nur wenn `projectTypes` enthält `'ggv_oder_mieterstrom'`

**Optionen:**
| Wert | Label |
|------|-------|
| `sicher_ggv` | Wir sind sicher - es wird/ist GGV |
| `unsicher` | Wir sind unsicher - es fehlen noch Informationen für eine Entscheidung |
| `sicher_mieterstrom` | Wir sind sicher - es wird/ist Mieterstrom |

---

### B3. Warum haben Sie sich für GGV entschieden?
- **ID:** `ggvDecisionReasons`
- **Typ:** multi-select
- **Beschreibung:** Mehrfachauswahl möglich

**Sichtbarkeitslogik:**
> Nur wenn `ggvOrMieterstromDecision = 'sicher_ggv'`

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `buerokratie_mieterstrom` | Wegen der bürokratischen Herausforderungen bei Mieterstrom | |
| `reststrom_pflicht` | Wegen der Pflicht zum Einkauf von Reststrom bei Mieterstrom | |
| `ladesaeulen_waermepumpen` | Weil die Einbindung von Ladesäulen/Wärmepumpen einfacher ist | |
| `vnb_empfehlung` | Weil unser VNB das empfiehlt | |
| `finanziell_attraktiver` | Weil das finanziell attraktiver ist | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### B4. Warum haben Sie sich für Mieterstrom entschieden?
- **ID:** `mieterstromDecisionReasons`
- **Typ:** multi-select
- **Beschreibung:** Mehrfachauswahl möglich

**Sichtbarkeitslogik:**
> Nur wenn `ggvOrMieterstromDecision = 'sicher_mieterstrom'`

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `einfacher_umsetzung` | Weil das in der Umsetzung einfacher zu sein scheint | |
| `kein_dienstleister_ggv` | Weil wir für die GGV nicht den richtigen Dienstleister finden | |
| `vnb_empfehlung` | Weil unser VNB das empfiehlt | |
| `vnb_kann_ggv_nicht` | Weil der VNB die GGV nicht umsetzen kann | |
| `finanziell_attraktiver` | Weil das finanziell attraktiver ist | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### B5. Wie möchten Sie die Umsetzung angehen?
- **ID:** `implementationApproach`
- **Typ:** multi-select
- **Beschreibung:** Mehrfachauswahl möglich

**Optionen:**
| Wert | Label |
|------|-------|
| `alleine` | Wir möchten möglichst viel alleine machen - inkl. der Abrechnung mit den Teilnehmenden |
| `dienstleister_ok` | Dienstleister sind OK, solange das preislich attraktiv ist |
| `dienstleister_alles` | Ideal wäre es, wenn sich ein Dienstleister um alles kümmert |

---

## B6. Herausforderungen
**Beschreibung:** Erlebte Schwierigkeiten

**Sichtbarkeitslogik (gesamte Sektion):**
> Nur wenn GGV oder Mieterstrom ausgewählt

---

### Gab oder gibt es wesentliche Herausforderungen?
- **ID:** `challenges`
- **Typ:** multi-select
- **Beschreibung:** Mehrfachauswahl möglich

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `keine` | Nein, alles läuft gut | **[EXKLUSIV]** ⚠️ Wählt andere ab und sperrt sie |
| `pv_installation` | Technische Probleme mit der Installation der PV-Anlage | [+ TEXTFELD: "Was war das Problem?"] |
| `vnb_blockiert` | Der VNB lässt die Umsetzung von GGV / Mieterstrom nicht zu | [+ TEXTFELD: "Gründe des VNB"] |
| `kosten_zu_hoch` | Die Kosten für die Umsetzung der GGV / Mieterstrom sind zu hoch | [+ TEXTFELD: "Details zu den Kosten"] |
| `sonstiges` | Sonstiges | [+ TEXTFELD: "Andere Herausforderungen"] |

---

## C. VNB Planung (GGV)
**Beschreibung:** Details zur GGV-Planung mit dem Verteilnetzbetreiber

**Sichtbarkeitslogik (gesamte Sektion):**
> Nur wenn GGV ausgewählt ODER `ggvOrMieterstromDecision = 'sicher_ggv'`

---

### C1. Gibt es im Netzgebiet Ihres VNB schon GGV-Projekte?
- **ID:** `vnbExistingProjects`
- **Typ:** single-select

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `wissen_nicht` | Wissen wir nicht | |
| `nein` | Nein, es gibt sicher noch keine | |
| `ja_mindestens_eins` | Ja, es gibt mindestens eins | |
| `ja_viele` | Ja, es gibt schon eine ganze Reihe | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### C2. Waren Sie schon im Kontakt mit Ihrem VNB?
- **ID:** `vnbContact`
- **Typ:** single-select ⚠️ (Einzelauswahl!)
- **[OPTIONAL]**

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `ja_direkt` | Ja, wir hatten direkten Kontakt mit dem VNB | |
| `ja_installateur` | Ja, über den Installateur/Dienstleister | |
| `nein` | Nein, noch kein Kontakt | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### C3. Welche Aussage zur Rückmeldung vom VNB zur GGV trifft zu?
- **ID:** `vnbResponse`
- **Typ:** multi-select
- **Beschreibung:** Mehrfachauswahl möglich
- **[OPTIONAL]**

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `moeglich_gmssb` | Umsetzung der GGV ist heute schon möglich, der VNB/gMSB kann dies auch als Messstellenbetreiber machen | |
| `moeglich_wmsb` | Umsetzung der GGV ist heute schon möglich, wir müssen aber einen wettbewerblichen Messstellenbetreiber beauftragen | |
| `keine_antwort` | Unser VNB hat die Anfrage bisher nicht beantwortet | |
| `nicht_moeglich` | Unser VNB sagt, dass eine Umsetzung bislang nicht möglich ist | [+ TEXTFELD: "Gründe des VNB"] |

---

### C4.1 Informationen zum Messkonzept (Weblink)
- **ID:** `vnbSupportMesskonzept`
- **Typ:** text
- **Platzhalter:** `https://...`
- **Hilfetext:** Stellt Ihr VNB konkrete Unterstützung für die massentaugliche Umsetzung der GGV online bereit?
- **[OPTIONAL]**

---

### C4.2 Formulare für die Übermittlung der Teilnehmenden & Aufteilungsschlüssel (Weblink)
- **ID:** `vnbSupportFormulare`
- **Typ:** text
- **Platzhalter:** `https://...`
- **[OPTIONAL]**

---

### C4.3 Online-Portal für die Übermittlung der Teilnehmenden & Aufteilungsschlüssel
- **ID:** `vnbSupportPortal`
- **Typ:** single-select
- **[OPTIONAL]**

**Optionen:**
| Wert | Label |
|------|-------|
| `ja` | Ja, vorhanden |
| `nein` | Nein, nicht vorhanden |

---

### C4.4 Weiteres
- **ID:** `vnbSupportOther`
- **Typ:** text
- **Platzhalter:** `Weitere Unterstützungsangebote...`
- **[OPTIONAL]**

---

### C5. Bietet Ihr VNB eine Kontaktmöglichkeit zur GGV und ist das hilfreich?
- **ID:** `vnbContactHelpful`
- **Typ:** single-select

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `ja_hilfreich` | Ja, es gibt eine Kontaktmöglichkeit (Mailadresse/Telefonnummer) und da wurde uns geholfen | |
| `ja_nicht_hilfreich` | Ja, aber es gab wenig hilfreiche Information | |
| `nein` | Nein, es gibt keine Kontaktmöglichkeit | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### C6. Haben Sie persönliche Kontakte bei Ihrem Verteilnetzbetreiber?
- **ID:** `vnbPersonalContacts`
- **Typ:** single-select

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `ja_bestanden` | Ja, es bestanden schon persönliche Kontakte zum VNB | |
| `ja_entstanden` | Ja, persönliche Kontakte sind bei der Umsetzung der GGV entstanden | |
| `nein` | Nein, es bestehen keine persönlichen Kontakte | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### C7. Wie sehr fühlen Sie sich von Ihrem VNB in der Planung der GGV unterstützt?
- **ID:** `vnbSupportRating`
- **Typ:** rating
- **Skala:** 1 bis 10
- **Ankerbeschriftungen:**
  - **1:** "bremst aktiv"
  - **10:** "unterstützt aktiv"

---

### C8. Bietet Ihr VNB an, den Messstellenbetrieb in der GGV zu übernehmen?
- **ID:** `vnbMsbOffer`
- **Typ:** single-select

**Skip-Logik:**
> Je nach Auswahl werden unterschiedliche Folgefragen angezeigt

**Optionen:**
| Wert | Label |
|------|-------|
| `ja` | Ja, der VNB/gMSB bietet an, den Messstellenbetrieb zu übernehmen |
| `nein_wmsb` | Nein - ich brauche dafür einen wettbewerblichen Messstellenbetreiber |
| `nein_gar_nicht` | Nein - und auch mit einem wettbewerblichen Messstellenbetreiber geht das nicht |

---

## C8. MSB Details
**Beschreibung:** Details zum Messstellenbetreiber-Angebot

**Sichtbarkeitslogik (gesamte Sektion):**
> Nur wenn `vnbMsbOffer` beantwortet

---

### C8.1a Ab wann kann das starten? (wenn VNB MSB anbietet)
- **ID:** `vnbStartTimeline`
- **Typ:** single-select

**Sichtbarkeitslogik:**
> Nur wenn `vnbMsbOffer = 'ja'`

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `sofort` | Sofort - wir sind in der Planung und das sieht gut aus | |
| `zeitnah` | Zeitnah - wir warten auf den Start jederzeit | |
| `12_monate` | In den nächsten 12 Monaten | |
| `spaeter` | Später als in 12 Monaten | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### C8.1b Stellt Ihr VNB/gMSB zusätzliche Kosten für einen 'Einbau auf Kundenwunsch' in Rechnung?
- **ID:** `vnbAdditionalCosts`
- **Typ:** single-select

**Sichtbarkeitslogik:**
> Nur wenn `vnbMsbOffer = 'ja'`

**Optionen:**
| Wert | Label |
|------|-------|
| `wissen_nicht` | Wissen wir nicht |
| `nein` | Nein, unser VNB/gMSB verlangt hier keine Zusatzkosten |
| `ja` | Ja, unser VNB/gMSB verlangt dafür Zusatzkosten |

---

### Einmalbetrag (EUR)
- **ID:** `vnbAdditionalCostsOneTime`
- **Typ:** number
- **Platzhalter:** `z.B. 500`
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Nur wenn `vnbAdditionalCosts = 'ja'`

**[BEDINGT PFLICHT]:**
> Wenn `vnbAdditionalCosts = 'ja'` → Mindestens Einmalbetrag ODER Jährlicher Betrag muss ausgefüllt sein

---

### Jährlicher Betrag (EUR)
- **ID:** `vnbAdditionalCostsYearly`
- **Typ:** number
- **Platzhalter:** `z.B. 100`
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Nur wenn `vnbAdditionalCosts = 'ja'`

**[BEDINGT PFLICHT]:**
> Wenn `vnbAdditionalCosts = 'ja'` → Mindestens Einmalbetrag ODER Jährlicher Betrag muss ausgefüllt sein

---

### C8.1c Einschränkende Bedingung Full-Service-Angebot
- **ID:** `vnbFullService`
- **Typ:** single-select

**Sichtbarkeitslogik:**
> Nur wenn `vnbMsbOffer = 'ja'`

**Optionen:**
| Wert | Label |
|------|-------|
| `nur_full_service` | Unser Stadtwerk/VNB bietet den Messstellenbetrieb in der GGV nur in Kombination mit einem Full-Service-Angebot an - also inkl. der Stromlieferung durch das Stadtwerk |
| `auch_ohne` | Unser Stadtwerk/VNB bietet die Zusammenarbeit an der GGV auch an, ohne selber den Strom zu verkaufen |

---

### C8.1d Wie beabsichtigt Ihr VNB, Ihnen die für die Abrechnung benötigten Daten bereitzustellen?
- **ID:** `vnbDataProvision`
- **Typ:** single-select

**Sichtbarkeitslogik:**
> Nur wenn `vnbMsbOffer = 'ja'`

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `mail_excel` | Der VNB/gMSB stellt uns die Daten per Mail als Excel zur Verfügung | |
| `portal_verrechnete_werte` | Der VNB/gMSB stellt uns die Daten über ein Online-Portal zur Verfügung, in dem wir die verrechneten Werte runterladen können | |
| `portal_alle_messwerte` | Der VNB/gMSB stellt uns die Daten über ein Online-Portal zur Verfügung, in dem wir auf alle Messwerte der Teilnehmer zugreifen können, um diese selber zu verrechnen | |
| `dienstleister_marktkommunikation` | Für das Abrufen der Daten brauchen wir einen eigenen Dienstleister, der die Daten über die Marktkommunikation vom VNB/gMSB abruft | |
| `wissen_nicht` | Wissen wir nicht | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### C8.1e Falls Ihr VNB/gMSB die Daten direkt an Sie übermittelt, was wird es kosten?
- **ID:** `vnbDataCost`
- **Typ:** single-select

**Sichtbarkeitslogik:**
> Nur wenn `vnbMsbOffer = 'ja'`

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `kostenlos` | Kostenlos | |
| `weniger_3_eur` | Weniger als 3 EUR/Messstelle/Jahr | |
| `mehr_3_eur` | Mehr als 3 EUR/Messstelle/Jahr | |
| `keine_auskunft` | Dazu gibt es noch keine Auskunft | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### C8.1f Falls die Daten von einem Dienstleister über die 'ESA-Marktrolle' abgeholt werden müssen: Verlangt der VNB/gMSB dafür Geld?
- **ID:** `vnbEsaCost`
- **Typ:** single-select

**Sichtbarkeitslogik:**
> Nur wenn `vnbMsbOffer = 'ja'`

**Optionen:**
| Wert | Label |
|------|-------|
| `wissen_nicht` | Wissen wir nicht |
| `kostenlos` | Das macht er umsonst |
| `weniger_3_eur` | Dafür verlangt er weniger (oder gleich) 3 EUR/Messstelle/Jahr |
| `mehr_3_eur` | Dafür verlangt er mehr als 3 EUR/Messstelle/Jahr |

---

### C8.2a Hat der VNB in Aussicht gestellt, ab wann der grundzuständige Messstellenbetreiber die Verrechnung durchführen kann?
- **ID:** `vnbMsbTimeline`
- **Typ:** single-select

**Sichtbarkeitslogik:**
> Nur wenn `vnbMsbOffer = 'nein_wmsb'`

**Optionen:**
| Wert | Label |
|------|-------|
| `ja_12_monate` | Ja, innerhalb der nächsten 12 Monate |
| `ja_spaeter` | Ja, in über 12 Monaten |
| `nicht_gefragt` | Nein, das haben wir nicht gefragt |
| `keine_aussage` | Nein, dazu gab es keine Aussage |

---

### C8.2b Gibt es schon eine Aussage, ab wann eine Umsetzung möglich sein wird?
- **ID:** `vnbRejectionTimeline`
- **Typ:** single-select

**Sichtbarkeitslogik:**
> Nur wenn `vnbMsbOffer = 'nein_gar_nicht'`

**Optionen:**
| Wert | Label |
|------|-------|
| `ja_12_monate` | Ja, innerhalb der nächsten 12 Monate |
| `ja_spaeter` | Ja, in über 12 Monaten |
| `nicht_gefragt` | Nein, das haben wir nicht gefragt |
| `keine_aussage` | Nein, dazu gab es keine Aussage |

---

### C9. Verlangt Ihr VNB einen neuen zusätzlichen Zähler direkt hinter dem Netzanschluss des Gebäudes?
- **ID:** `vnbWandlermessung`
- **Typ:** single-select
- **Beschreibung:** Erfordert die Installation einer 'Wandlermessung' für > 5.000 EUR

**Optionen:**
| Wert | Label |
|------|-------|
| `ja` | Ja |
| `nein` | Nein |
| `wissen_nicht` | Das wissen wir nicht |

---

### Ergänzende Informationen zur Wandlermessung
- **ID:** `vnbWandlermessungComment`
- **Typ:** textarea
- **Platzhalter:** `Weitere Details...`
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Wenn `vnbWandlermessung` beantwortet

---

### C10. Wie lange sind Sie bereits in Diskussionen zur Umsetzung der GGV mit Ihrem VNB?
- **ID:** `vnbPlanningDuration`
- **Typ:** single-select

**Optionen:**
| Wert | Label |
|------|-------|
| `unter_2_monate` | Unter 2 Monaten |
| `2_bis_12_monate` | Zwischen 2 und 12 Monaten |
| `ueber_12_monate` | Über 12 Monate |

---

### Woran scheitert die Umsetzung bislang?
- **ID:** `vnbPlanningDurationReasons`
- **Typ:** textarea
- **Platzhalter:** `Beschreiben Sie die Gründe...`
- **[OPTIONAL]**

---

## D. GGV Betrieb
**Beschreibung:** Erfahrungen im laufenden Betrieb

**Sichtbarkeitslogik (gesamte Sektion):**
> Nur wenn `planningStatus` = `'pv_laeuft_ggv_laeuft'`

---

### D0. Seit wann ist die GGV in Betrieb?
- **ID:** `operationStartDate`
- **Typ:** text
- **Platzhalter:** `z.B. Januar 2025`
- **[OPTIONAL]**

---

### D1. Wie lange hat die Abstimmung mit dem VNB zur GGV gedauert?
- **ID:** `operationVnbDuration`
- **Typ:** single-select

**Optionen:**
| Wert | Label |
|------|-------|
| `unter_2_monate` | Unter 2 Monaten |
| `2_bis_12_monate` | Zwischen 2 und 12 Monaten |
| `ueber_12_monate` | Über 12 Monate |

---

### D2. Hat Ihr VNB einen neuen zusätzlichen Zähler direkt hinter dem Netzanschluss des Gebäudes verlangt (Wandlermessung >5.000 EUR)?
- **ID:** `operationWandlermessung`
- **Typ:** single-select

**Optionen:**
| Wert | Label |
|------|-------|
| `ja` | Ja |
| `nein` | Nein |
| `wissen_nicht` | Das wissen wir nicht |

---

### D3. Wer ist der Messstellenbetreiber?
- **ID:** `operationMsbProvider`
- **Typ:** single-select

**Optionen:**
| Wert | Label |
|------|-------|
| `gmsb` | Unser lokaler gMSB (meist das gleiche Unternehmen wie der VNB) |
| `wmsb` | Ein wMSB |

---

### D4. Wer übernimmt die Aufteilung?
- **ID:** `operationAllocationProvider`
- **Typ:** single-select

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `gmsb` | Unser lokaler gMSB | |
| `wmsb` | Ein wMSB | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### D5. Wie lange hat es gedauert von Bestellung bis zum Einbau der Smart Meter?
- **ID:** `operationMsbDuration`
- **Typ:** single-select

**Optionen:**
| Wert | Label |
|------|-------|
| `wissen_nicht` | Weiß ich nicht |
| `schnell` | Das ging problemlos und schnell |
| `4_monate` | Ca. 4 Monate (gesetzlich vorgegebene Frist) |
| `laenger` | Deutlich länger als 4 Monate |

---

### D6. Stellt der VNB/gMSB zusätzliche Kosten in Rechnung?
- **ID:** `operationMsbAdditionalCosts`
- **Typ:** single-select

**Optionen:**
| Wert | Label |
|------|-------|
| `nein` | Nein, unser VNB/gMSB verlangt hier keine Zusatzkosten |
| `ja` | Ja, unser VNB/gMSB verlangt dafür Zusatzkosten |
| `wissen_nicht` | Wissen wir nicht |

---

### D7. Wie übermittelt Ihr VNB/MSB die Daten für die Abrechnung?
- **ID:** `operationDataFormat`
- **Typ:** single-select

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `mail_excel` | Der VNB/gMSB stellt uns die Daten per Mail als Excel zur Verfügung | |
| `portal_verrechnete_werte` | Der VNB/gMSB stellt uns die Daten über ein Online-Portal zur Verfügung, in dem wir die verrechneten Werte runterladen können | |
| `portal_alle_messwerte` | Der VNB/gMSB stellt uns die Daten über ein Online-Portal zur Verfügung, in dem wir auf alle Messwerte der Teilnehmer zugreifen können | |
| `dienstleister_marktkommunikation` | Für das Abrufen der Daten brauchen wir einen eigenen Dienstleister, der die Daten über die Marktkommunikation vom VNB/gMSB abruft | |
| `wissen_nicht` | Wissen wir nicht | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### D8. Wie zufrieden sind Sie mit Ihrem VNB bei der Umsetzung der GGV?
- **ID:** `operationSatisfactionRating`
- **Typ:** rating
- **Skala:** 1 bis 10
- **Ankerbeschriftungen:**
  - **1:** "Sehr unzufrieden"
  - **10:** "Sehr zufrieden"

---

## Dienstleister
**Beschreibung:** Feedback zu Dienstleistern & Reaktionen

**Sichtbarkeitslogik (gesamte Sektion):**
> Nur bei GGV-Fokus

---

### Mit welchem Dienstleister arbeiten Sie zusammen?
- **ID:** `serviceProviderName`
- **Typ:** text
- **Platzhalter:** `Name des Dienstleisters`
- **[OPTIONAL]**

---

### Zufriedenheit mit Dienstleister 1
- **ID:** `serviceProviderRating`
- **Typ:** rating
- **Skala:** 1 bis 10
- **Ankerbeschriftungen:**
  - **1:** "Sehr unzufrieden"
  - **10:** "Sehr zufrieden"
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Wenn `serviceProviderName` ausgefüllt

---

### Kommentare zu Dienstleister 1
- **ID:** `serviceProviderComments`
- **Typ:** textarea
- **Platzhalter:** `Was lief gut? Was könnte besser sein?`
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Wenn `serviceProviderName` ausgefüllt

---

### Dienstleister 2 (optional)
- **ID:** `serviceProvider2Name`
- **Typ:** text
- **Platzhalter:** `Name des zweiten Dienstleisters`
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Wenn `serviceProviderName` ausgefüllt

---

### Zufriedenheit mit Dienstleister 2
- **ID:** `serviceProvider2Rating`
- **Typ:** rating
- **Skala:** 1 bis 10
- **Ankerbeschriftungen:**
  - **1:** "Sehr unzufrieden"
  - **10:** "Sehr zufrieden"
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Wenn `serviceProvider2Name` ausgefüllt

---

### Falls Ihr VNB die GGV nicht oder nur unzureichend anbietet/umsetzt, wie haben Sie bislang reagiert?
- **ID:** `vnbRejectionResponse`
- **Typ:** multi-select
- **[OPTIONAL]**

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `bnetza` | Wir haben uns bereits an die BNetzA gewendet | |
| `rechtliche_schritte` | Wir überlegen rechtliche Schritte zu gehen | |
| `keine_schritte` | Wir sind bei dem Anschluss anderer Projekte auf den VNB angewiesen und sehen von rechtlichen Schritten gegenüber dem VNB ab | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

## M. Mieterstrom Planung
**Beschreibung:** Details zu Mieterstrom-Projekten

**Sichtbarkeitslogik (gesamte Sektion):**
> Nur wenn Mieterstrom ausgewählt ODER `ggvOrMieterstromDecision = 'sicher_mieterstrom'`

---

### M1. Möchten Sie Mieterstrom mit virtuellem oder mit physikalischem Summenzähler umsetzen?
- **ID:** `mieterstromSummenzaehler`
- **Typ:** single-select

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `virtuell` | Mit virtuellem Summenzähler | |
| `physikalisch` | Mit physikalischem Summenzähler | |
| `kein_unterschied` | Wir kennen den Unterschied nicht | |
| `keine_praeferenz` | Wir haben keine Präferenz | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### M2. Gab oder gibt es wesentliche Herausforderungen? (Mieterstrom)
- **ID:** `mieterstromChallenges`
- **Typ:** multi-select

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `keine` | Nein, alles läuft gut | **[EXKLUSIV]** ⚠️ Wählt andere ab und sperrt sie |
| `opposition` | Manche Parteien im Haus sind gegen das Projekt | [+ TEXTFELD] |
| `pv_installation` | Technische Probleme mit der Installation der PV-Anlage | [+ TEXTFELD] |
| `vnb_blocking` | Der VNB lässt die Umsetzung von Mieterstrom nicht zu | [+ TEXTFELD] |
| `kosten` | Die Kosten für die Umsetzung des Mieterstrom sind zu hoch | [+ TEXTFELD] |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### M3. Gibt es im Netzgebiet Ihres VNB schon Mieterstrom-Projekte?
- **ID:** `mieterstromExistingProjects`
- **Typ:** single-select

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `wissen_nicht` | Wissen wir nicht | |
| `nein` | Nein, es gibt sicher noch keine | |
| `ja_mindestens_eins` | Ja, es gibt mindestens eins | |
| `ja_viele` | Ja, es gibt schon eine ganze Reihe | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### M4. Gibt es im Netzgebiet Ihres VNB schon Mieterstrom-Projekte mit virtuellem Summenzähler?
- **ID:** `mieterstromExistingProjectsVirtuell`
- **Typ:** single-select

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `wissen_nicht` | Wissen wir nicht | |
| `nein` | Nein, es gibt sicher noch keine | |
| `ja_mindestens_eins` | Ja, es gibt mindestens eins | |
| `ja_viele` | Ja, es gibt schon eine ganze Reihe | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

*[Weitere Mieterstrom-Fragen M5-M11 folgen dem gleichen Schema...]*

---

### Wie sehr fühlen Sie sich von Ihrem VNB in der Planung von Mieterstrom unterstützt?
- **ID:** `mieterstromSupportRating`
- **Typ:** rating
- **Skala:** 1 bis 10
- **Ankerbeschriftungen:**
  - **1:** "bremst aktiv"
  - **10:** "unterstützt aktiv"

---

## MP. VNB Angebot (Mieterstrom)
**Beschreibung:** Details zum MSB-Angebot des VNB für Mieterstrom

**Sichtbarkeitslogik (gesamte Sektion):**
> Nur wenn Mieterstrom ausgewählt UND nicht in Betrieb

---

### MP1a. Full-Service-Angebot
- **ID:** `mieterstromFullService`
- **Typ:** single-select

**Optionen:**
| Wert | Label |
|------|-------|
| `nur_full_service` | Unser Stadtwerk/VNB bietet den Messstellenbetrieb nur in Kombination mit einem Full-Service-Angebot an - also inkl. der Stromlieferung durch das Stadtwerk |
| `auch_ohne` | Unser Stadtwerk/VNB bietet dies auch ohne Stromlieferverträge an |

---

### MP1b. Stellt Ihr VNB/gMSB zusätzliche Kosten für einen 'Einbau auf Kundenwunsch' in Rechnung? (Mieterstrom)
- **ID:** `mieterstromMsbCosts`
- **Typ:** single-select

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `wissen_nicht` | Wissen wir nicht | |
| `nein` | Nein, unser VNB/gMSB verlangt hier keine Zusatzkosten | |
| `ja` | Ja, unser VNB/gMSB verlangt dafür Zusatzkosten | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### Einmalbetrag (EUR) - Mieterstrom
- **ID:** `mieterstromMsbCostsOneTime`
- **Typ:** number
- **Platzhalter:** `z.B. 500`
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Wenn `mieterstromMsbCosts = 'ja'`

**[BEDINGT PFLICHT]:**
> Wenn `mieterstromMsbCosts = 'ja'` → Mindestens Einmalbetrag ODER Jährlicher Betrag muss ausgefüllt sein

---

### Jährlicher Betrag (EUR) - Mieterstrom
- **ID:** `mieterstromMsbCostsYearly`
- **Typ:** number
- **Platzhalter:** `z.B. 100`
- **[OPTIONAL]**

**Sichtbarkeitslogik:**
> Wenn `mieterstromMsbCosts = 'ja'`

**[BEDINGT PFLICHT]:**
> Wenn `mieterstromMsbCosts = 'ja'` → Mindestens Einmalbetrag ODER Jährlicher Betrag muss ausgefüllt sein

---

## MB. Mieterstrom Betrieb
**Beschreibung:** Erfahrungen im laufenden Mieterstrom-Betrieb

**Sichtbarkeitslogik (gesamte Sektion):**
> Nur wenn Mieterstrom in Betrieb (`mieterstromInOperation = true`)

---

### MB6. Wie zufrieden sind Sie mit Ihrem VNB bei der Umsetzung des Projektes?
- **ID:** `mieterstromOperationSatisfaction`
- **Typ:** rating
- **Skala:** 1 bis 10
- **Ankerbeschriftungen:**
  - **1:** "bremst aktiv"
  - **10:** "unterstützt aktiv"

---

## E. Energy Sharing
**Beschreibung:** Details zu Energy Sharing

**Sichtbarkeitslogik (gesamte Sektion):**
> Nur wenn Energy Sharing ausgewählt (`projectTypes` enthält `'energysharing'`)

---

### E1. Wo stehen Sie aktuell mit dem Projekt?
- **ID:** `esStatus`
- **Typ:** single-select ⚠️ (Einzelauswahl!)
- **[PFLICHT]**

**Optionen:**
| Wert | Label | Besonderheit |
|------|-------|--------------|
| `in_betrieb_vollversorgung` | Unser Energy-Sharing Projekt ist schon in Betrieb - Vollversorgungsmodell | |
| `in_betrieb_42c` | Unser Energy-Sharing Projekt ist schon in Betrieb - nach §42c EnWG | |
| `planung_bereit` | Wir sind in der Planung und wollen loslegen sobald es geht | |
| `info_sammeln` | Wir haben grundsätzliches Interesse, sammeln derzeit Infos | |
| `sonstiges` | Sonstiges | [+ TEXTFELD] |

---

### E3. Welche Art von Anlage möchten Sie für das Energy Sharing Projekt nutzen?
- **ID:** `esPlantType`
- **Typ:** multi-select
- **Beschreibung:** Mehrfachauswahl möglich

**Sichtbarkeitslogik:**
> Wenn in Planung oder Information sammeln

**Optionen:**
| Wert | Label |
|------|-------|
| `wind` | Windenergieanlage |
| `buergerwind` | Windenergieanlage - Bürgerwindanlage |
| `pv_freiflaeche` | PV-Freiflächenanlage |
| `buergersolar` | Bürgersolaranlage |
| `pv_efh` | PV-Dachanlage auf Einfamilienhaus |
| `pv_mfh` | PV-Dachanlage auf Mehrfamilienhaus |
| `pv_nichtwohn` | PV-Dachanlage auf einem Nicht-Wohngebäude |

---

*[Weitere Energy Sharing Fragen E4-E8 folgen dem gleichen Schema...]*

---

## Abschluss
**Beschreibung:** Letzte Informationen

---

### Welche Informationsquellen fanden Sie besonders hilfreich bei der Suche nach Informationen?
- **ID:** `helpfulInfoSources`
- **Typ:** textarea
- **Platzhalter:** `z.B. Webseiten, Beratungsstellen, Netzwerke, Verbände...`
- **[OPTIONAL]**

---

### Welche Erfahrungen möchten Sie noch teilen?
- **ID:** `additionalExperiences`
- **Typ:** textarea
- **Platzhalter:** `Ihre Erfahrungen...`
- **[OPTIONAL]**

---

### Möglichkeit zum Hochladen von Dokumenten
- **ID:** `documentUpload`
- **Typ:** file
- **Beschreibung:** z.B. Korrespondenz mit VNB, Messkonzepte, Rechnungen (max. 5 Dateien)
- **[OPTIONAL]**

---

### Haben Sie Verbesserungsvorschläge für diese Umfrage?
- **ID:** `surveyImprovements`
- **Typ:** textarea
- **Platzhalter:** `Ihr Feedback zur Umfrage...`
- **[OPTIONAL]**

---

### Wie wahrscheinlich ist es, dass Sie Anderen die Umsetzung von GGV/Mieterstrom empfehlen würden?
- **ID:** `npsScore`
- **Typ:** rating
- **Skala:** 0 bis 10
- **Ankerbeschriftungen:**
  - **0:** "Sehr unwahrscheinlich"
  - **10:** "Sehr wahrscheinlich"
- **[OPTIONAL]**

---

# Anhang: Spezielle Validierungsregeln

## 1. Exklusive Optionen
Bei folgenden Fragen gilt: Wenn die mit **[EXKLUSIV]** markierte Option gewählt wird, werden alle anderen Optionen abgewählt und gesperrt:
- `challenges` → Option `keine`
- `mieterstromChallenges` → Option `keine`

## 2. Bedingte Pflichtfelder
| Trigger-Frage | Trigger-Wert | Dann Pflicht |
|---------------|--------------|--------------|
| `vnbAdditionalCosts` | `'ja'` | Mindestens `vnbAdditionalCostsOneTime` ODER `vnbAdditionalCostsYearly` |
| `mieterstromMsbCosts` | `'ja'` | Mindestens `mieterstromMsbCostsOneTime` ODER `mieterstromMsbCostsYearly` |

## 3. Textfeld-Pflicht bei Auswahl
Wenn eine Option mit **[+ TEXTFELD: "..."]** ausgewählt ist, wird das zugehörige Textfeld zum Pflichtfeld.

---

*Ende der Dokumentation*
