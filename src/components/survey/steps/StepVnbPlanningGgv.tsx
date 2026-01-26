import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { RatingQuestion } from "../questions/RatingQuestion";
import { FileUpload } from "../questions/FileUpload";

const VNB_EXISTING_PROJECTS_OPTIONS = [
  { value: "wissen_nicht", label: "Wissen wir nicht" },
  { value: "nein", label: "Nein, es gibt sicher noch keine" },
  { value: "ja_mindestens_eins", label: "Ja, es gibt mindestens eins" },
  { value: "ja_viele", label: "Ja, es gibt schon eine ganze Reihe" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

// Changed to single-select per P0.6
const VNB_CONTACT_OPTIONS = [
  { value: "ja_direkt", label: "Ja, wir hatten direkten Kontakt mit dem VNB" },
  { value: "ja_installateur", label: "Ja, über den Installateur/Dienstleister" },
  { value: "nein", label: "Nein, noch kein Kontakt" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const VNB_RESPONSE_OPTIONS = [
  { value: "moeglich_gmssb", label: "Umsetzung der GGV ist heute schon möglich, der VNB/gMSB kann dies auch als Messstellenbetreiber machen" },
  { value: "moeglich_wmsb", label: "Umsetzung der GGV ist heute schon möglich, wir müssen aber einen wettbewerblichen Messstellenbetreiber beauftragen" },
  { value: "keine_antwort", label: "Unser VNB hat die Anfrage bisher nicht beantwortet" },
  { value: "nicht_moeglich", label: "Unser VNB sagt, dass eine Umsetzung bislang nicht möglich ist", hasTextField: true, textFieldLabel: "Gründe des VNB" },
];

const VNB_CONTACT_HELPFUL_OPTIONS = [
  { value: "ja_hilfreich", label: "Ja, es gibt eine Kontaktmöglichkeit (Mailadresse/Telefonnummer) und da wurde uns geholfen" },
  { value: "ja_nicht_hilfreich", label: "Ja, aber es gab wenig hilfreiche Information" },
  { value: "nein", label: "Nein, es gibt keine Kontaktmöglichkeit" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const VNB_PERSONAL_CONTACTS_OPTIONS = [
  { value: "ja_bestanden", label: "Ja, es bestanden schon persönliche Kontakte zum VNB" },
  { value: "ja_entstanden", label: "Ja, persönliche Kontakte sind bei der Umsetzung der GGV entstanden" },
  { value: "nein", label: "Nein, es bestehen keine persönlichen Kontakte" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const VNB_MSB_OFFER_OPTIONS = [
  { value: "ja", label: "Ja, der VNB/gMSB bietet an, den Messstellenbetrieb zu übernehmen" },
  { value: "nein_wmsb", label: "Nein - ich brauche dafür einen wettbewerblichen Messstellenbetreiber" },
  { value: "nein_gar_nicht", label: "Nein - und auch mit einem wettbewerblichen Messstellenbetreiber geht das nicht" },
];

interface StepVnbPlanningGgvProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
}

export function StepVnbPlanningGgv({ data, updateData, uploadedDocuments, setUploadedDocuments }: StepVnbPlanningGgvProps) {
  return (
    <div className="space-y-8">
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2">Detaillierte Fragen zur Planung zusammen mit dem VNB (GGV)</h3>
        <p className="text-sm text-muted-foreground">
          Dieser Abschnitt behandelt Ihre Erfahrungen mit dem Verteilnetzbetreiber bei der GGV-Planung.
        </p>
      </div>

      <SingleSelectQuestion
        id="vnb-existing-projects"
        label="C1. Gibt es im Netzgebiet Ihres VNB schon GGV-Projekte?"
        options={VNB_EXISTING_PROJECTS_OPTIONS}
        value={data.vnbExistingProjects}
        otherValue={data.vnbExistingProjectsOther}
        onChange={(val) => updateData("vnbExistingProjects", val)}
        onOtherChange={(val) => updateData("vnbExistingProjectsOther", val)}
      />

      {/* Changed to SingleSelectQuestion per P0.6 */}
      <SingleSelectQuestion
        id="vnb-contact"
        label="C2. Waren Sie schon im Kontakt mit Ihrem VNB?"
        options={VNB_CONTACT_OPTIONS}
        value={data.vnbContact[0] || undefined}
        otherValue={data.vnbContactOther}
        onChange={(val) => updateData("vnbContact", [val])}
        onOtherChange={(val) => updateData("vnbContactOther", val)}
        optional
      />

      <MultiSelectQuestion
        id="vnb-response"
        label="C3. Welche Aussage zur Rückmeldung vom VNB zur GGV trifft zu?"
        description="Mehrfachauswahl möglich"
        options={VNB_RESPONSE_OPTIONS}
        value={data.vnbResponse}
        optionTextValues={data.challengesDetails}
        onChange={(val) => updateData("vnbResponse", val)}
        onOptionTextChange={(optVal, text) => updateData("challengesDetails", { ...data.challengesDetails, [optVal]: text })}
        optional
      />

      {data.vnbResponse?.includes('nicht_moeglich') && (
        <FileUpload
          id="vnb-rejection-docs"
          label="Möglichkeit zum Hochladen von Dokumenten"
          description="z.B. Korrespondenz mit dem VNB, Ablehnungsschreiben"
          value={uploadedDocuments}
          onChange={setUploadedDocuments}
        />
      )}

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium">C4. Stellt Ihr VNB konkrete Unterstützung für die massentaugliche Umsetzung der GGV online bereit?</h4>
        
        <TextQuestion
          id="vnb-support-messkonzept"
          label="Informationen zum Messkonzept (Weblink)"
          value={data.vnbSupportMesskonzept}
          onChange={(val) => updateData("vnbSupportMesskonzept", val)}
          placeholder="https://..."
          optional
        />

        <TextQuestion
          id="vnb-support-formulare"
          label="Formulare für die Übermittlung der Teilnehmenden & Aufteilungsschlüssel (Weblink)"
          value={data.vnbSupportFormulare}
          onChange={(val) => updateData("vnbSupportFormulare", val)}
          placeholder="https://..."
          optional
        />

        <SingleSelectQuestion
          id="vnb-support-portal"
          label="Online-Portal für die Übermittlung der Teilnehmenden & Aufteilungsschlüssel"
          options={[
            { value: "ja", label: "Ja, vorhanden" },
            { value: "nein", label: "Nein, nicht vorhanden" },
          ]}
          value={data.vnbSupportPortal ? "ja" : data.vnbSupportPortal === false ? "nein" : undefined}
          onChange={(val) => updateData("vnbSupportPortal", val === "ja")}
          optional
        />

        <TextQuestion
          id="vnb-support-other"
          label="Weiteres"
          value={data.vnbSupportOther}
          onChange={(val) => updateData("vnbSupportOther", val)}
          placeholder="Weitere Unterstützungsangebote..."
          optional
        />
      </div>

      <SingleSelectQuestion
        id="vnb-contact-helpful"
        label="C5. Bietet Ihr VNB eine Kontaktmöglichkeit zur GGV und ist das hilfreich?"
        options={VNB_CONTACT_HELPFUL_OPTIONS}
        value={data.vnbContactHelpful}
        otherValue={data.vnbContactHelpfulOther}
        onChange={(val) => updateData("vnbContactHelpful", val)}
        onOtherChange={(val) => updateData("vnbContactHelpfulOther", val)}
      />

      <SingleSelectQuestion
        id="vnb-personal-contacts"
        label="C6. Haben Sie persönliche Kontakte bei Ihrem Verteilnetzbetreiber?"
        options={VNB_PERSONAL_CONTACTS_OPTIONS}
        value={data.vnbPersonalContacts}
        otherValue={data.vnbPersonalContactsOther}
        onChange={(val) => updateData("vnbPersonalContacts", val)}
        onOtherChange={(val) => updateData("vnbPersonalContactsOther", val)}
      />

      {/* P1.7: Neutralized rating labels */}
      <RatingQuestion
        id="vnb-support-rating"
        label="C7. Wie sehr fühlen Sie sich von Ihrem VNB in der Planung der GGV unterstützt?"
        value={data.vnbSupportRating}
        onChange={(val) => updateData("vnbSupportRating", val)}
        minLabel="bremst aktiv"
        maxLabel="unterstützt aktiv"
        min={1}
        max={10}
      />

      <SingleSelectQuestion
        id="vnb-msb-offer"
        label="C8. Bietet Ihr VNB an, den Messstellenbetrieb in der GGV zu übernehmen?"
        options={VNB_MSB_OFFER_OPTIONS}
        value={data.vnbMsbOffer}
        onChange={(val) => updateData("vnbMsbOffer", val)}
      />
    </div>
  );
}
