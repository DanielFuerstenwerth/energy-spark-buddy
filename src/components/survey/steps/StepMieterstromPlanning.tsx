import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { RatingQuestion } from "../questions/RatingQuestion";
import { FileUpload } from "../questions/FileUpload";

const MIETERSTROM_SUMMENZAEHLER_OPTIONS = [
  { value: "virtuell", label: "Mit virtuellem Summenzähler" },
  { value: "physikalisch", label: "Mit physikalischem Summenzähler" },
  { value: "kein_unterschied", label: "Wir kennen den Unterschied nicht" },
  { value: "keine_praeferenz", label: "Wir haben keine Präferenz" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const MIETERSTROM_CHALLENGES_OPTIONS = [
  { value: "keine", label: "Nein, alles läuft gut" },
  { value: "opposition", label: "Manche Parteien im Haus sind gegen das Projekt", hasTextField: true },
  { value: "pv_installation", label: "Technische Probleme mit der Installation der PV-Anlage", hasTextField: true },
  { value: "vnb_blocking", label: "Der VNB lässt die Umsetzung von Mieterstrom nicht zu", hasTextField: true },
  { value: "kosten", label: "Die Kosten für die Umsetzung des Mieterstrom sind zu hoch", hasTextField: true },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const MIETERSTROM_EXISTING_PROJECTS_OPTIONS = [
  { value: "wissen_nicht", label: "Wissen wir nicht" },
  { value: "nein", label: "Nein, es gibt sicher noch keine" },
  { value: "ja_mindestens_eins", label: "Ja, es gibt mindestens eins" },
  { value: "ja_viele", label: "Ja, es gibt schon eine ganze Reihe" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const MIETERSTROM_VNB_CONTACT_OPTIONS = [
  { value: "direkt", label: "Ja, wir hatten direkten Kontakt mit dem VNB" },
  { value: "installateur", label: "Nein, nur über den Installateur/Dienstleister" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const MIETERSTROM_VIRTUELL_OPTIONS = [
  { value: "ja", label: "Ja" },
  { value: "nein", label: "Nein" },
];

const MIETERSTROM_WANDLERMESSUNG_OPTIONS = [
  { value: "nein", label: "Nein" },
  { value: "ja", label: "Ja", hasTextField: true },
];

const MIETERSTROM_VNB_RESPONSE_OPTIONS = [
  { value: "moeglich_gmsb", label: "Wir können Mieterstrom umsetzen, der VNB/gMSB kann dies als Messstellenbetreiber machen" },
  { value: "moeglich_wmsb", label: "Wir können Mieterstrom umsetzen, müssen aber einen wettbewerblichen Messstellenbetreiber beauftragen" },
  { value: "keine_antwort", label: "Unser VNB hat die Anfrage bisher nicht beantwortet" },
  { value: "nicht_moeglich", label: "Unser VNB sagt, dass eine Umsetzung bislang nicht möglich ist", hasTextField: true },
];

const MIETERSTROM_VNB_SUPPORT_OPTIONS = [
  { value: "messkonzept", label: "Informationen zum Messkonzept und Prozessen", hasTextField: true, textFieldLabel: "Weblink" },
  { value: "formulare", label: "Formulare für die Übermittlung der Teilnehmenden / Änderungen" },
  { value: "portal", label: "Online-Portal für die Übermittlung der Teilnehmenden / Änderungen" },
  { value: "sonstiges", label: "Weiteres", hasTextField: true },
];

const MIETERSTROM_CONTACT_HELPFUL_OPTIONS = [
  { value: "ja_hilfreich", label: "Ja, es gibt eine Kontaktmöglichkeit (Mailadresse/Telefonnummer) und da wurde uns geholfen" },
  { value: "ja_nicht_hilfreich", label: "Ja, aber es gab wenig hilfreiche Information" },
  { value: "nein", label: "Nein, es gibt keine Kontaktmöglichkeit" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const MIETERSTROM_PERSONAL_CONTACTS_OPTIONS = [
  { value: "ja_bestanden", label: "Ja, es bestanden schon persönliche Kontakte zum VNB" },
  { value: "ja_entstanden", label: "Ja, persönliche Kontakte sind bei der Umsetzung von Mieterstrom entstanden" },
  { value: "nein", label: "Nein, es bestehen keine persönlichen Kontakte" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

interface StepMieterstromPlanningProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
}

export function StepMieterstromPlanning({ data, updateData, uploadedDocuments, setUploadedDocuments }: StepMieterstromPlanningProps) {
  return (
    <div className="space-y-8">
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2">Detaillierte Fragen zu Mieterstrom</h3>
        <p className="text-sm text-muted-foreground">
          Dieser Abschnitt behandelt Ihre Erfahrungen mit Mieterstrom-Projekten.
        </p>
      </div>

      <SingleSelectQuestion
        id="mieterstrom-summenzaehler"
        label="M1. Möchten Sie Mieterstrom mit virtuellem oder mit physikalischem Summenzähler umsetzen?"
        options={MIETERSTROM_SUMMENZAEHLER_OPTIONS}
        value={data.mieterstromSummenzaehler}
        onChange={(val) => updateData("mieterstromSummenzaehler", val)}
      />

      <MultiSelectQuestion
        id="mieterstrom-challenges"
        label="M2. Gab oder gibt es wesentliche Herausforderungen?"
        options={MIETERSTROM_CHALLENGES_OPTIONS}
        value={data.mieterstromChallenges || []}
        optionTextValues={{
          opposition: data.mieterstromChallengesOpposition,
          pv_installation: data.mieterstromChallengesPv,
          vnb_blocking: data.mieterstromChallengesVnb,
          kosten: data.mieterstromChallengesCosts,
          sonstiges: data.mieterstromChallengesOther,
        }}
        onChange={(val) => updateData("mieterstromChallenges", val)}
        onOptionTextChange={(optVal, text) => {
          if (optVal === 'opposition') updateData("mieterstromChallengesOpposition", text);
          if (optVal === 'pv_installation') updateData("mieterstromChallengesPv", text);
          if (optVal === 'vnb_blocking') updateData("mieterstromChallengesVnb", text);
          if (optVal === 'kosten') updateData("mieterstromChallengesCosts", text);
          if (optVal === 'sonstiges') updateData("mieterstromChallengesOther", text);
        }}
      />

      <SingleSelectQuestion
        id="mieterstrom-existing-projects"
        label="M3. Gibt es im Netzgebiet Ihres VNB schon Mieterstrom-Projekte?"
        options={MIETERSTROM_EXISTING_PROJECTS_OPTIONS}
        value={data.mieterstromExistingProjects}
        onChange={(val) => updateData("mieterstromExistingProjects", val)}
      />

      <SingleSelectQuestion
        id="mieterstrom-existing-projects-virtuell"
        label="M4. Gibt es im Netzgebiet Ihres VNB schon Mieterstrom-Projekte mit virtuellem Summenzähler?"
        options={MIETERSTROM_EXISTING_PROJECTS_OPTIONS}
        value={data.mieterstromExistingProjectsVirtuell}
        onChange={(val) => updateData("mieterstromExistingProjectsVirtuell", val)}
      />

      <SingleSelectQuestion
        id="mieterstrom-vnb-contact"
        label="M5. Waren Sie schon im Kontakt mit Ihrem VNB?"
        options={MIETERSTROM_VNB_CONTACT_OPTIONS}
        value={data.mieterstromVnbContact}
        otherValue={data.mieterstromVnbContactOther}
        onChange={(val) => updateData("mieterstromVnbContact", val)}
        onOtherChange={(val) => updateData("mieterstromVnbContactOther", val)}
        optional
      />

      <SingleSelectQuestion
        id="mieterstrom-virtuell-allowed"
        label="M6. Lässt Ihr VNB/gMSB die Umsetzung des sogenannten 'virtuellen Summenzählers' durch einen wettbewerblichen MSB zu?"
        options={MIETERSTROM_VIRTUELL_OPTIONS}
        value={data.mieterstromVirtuellAllowed}
        onChange={(val) => updateData("mieterstromVirtuellAllowed", val)}
      />

      {data.mieterstromVirtuellAllowed === 'ja' && (
        <SingleSelectQuestion
          id="mieterstrom-virtuell-wandlermessung"
          label="M7. Wenn Ihr VNB/gMSB die Umsetzung des 'virtuellen Summenzählers' zulässt, verlangt er dennoch den Einbau eines Zählers direkt am Hausanschlusspunkt (Wandlermessung, Kosten >5.000 EUR)?"
          options={MIETERSTROM_WANDLERMESSUNG_OPTIONS}
          value={data.mieterstromVirtuellWandlermessung}
          otherValue={data.mieterstromVirtuellWandlermessungComment}
          onChange={(val) => updateData("mieterstromVirtuellWandlermessung", val)}
          onOtherChange={(val) => updateData("mieterstromVirtuellWandlermessungComment", val)}
        />
      )}

      <MultiSelectQuestion
        id="mieterstrom-vnb-response"
        label="M8. Welche Aussage zur Rückmeldung vom VNB trifft zu?"
        options={MIETERSTROM_VNB_RESPONSE_OPTIONS}
        value={data.mieterstromVnbResponse || []}
        onChange={(val) => updateData("mieterstromVnbResponse", val)}
        optional
      />

      {data.mieterstromVnbResponse?.includes('nicht_moeglich') && (
        <>
          <TextQuestion
            id="mieterstrom-vnb-response-reasons"
            label="Gründe für die Ablehnung"
            type="textarea"
            value={data.mieterstromVnbResponseReasons}
            onChange={(val) => updateData("mieterstromVnbResponseReasons", val)}
            placeholder="Beschreiben Sie die Gründe..."
            optional
          />
          <FileUpload
            id="mieterstrom-rejection-docs"
            label="Möglichkeit zum Hochladen von Dokumenten"
            description="z.B. Korrespondenz mit dem VNB, Ablehnungsschreiben"
            value={uploadedDocuments}
            onChange={setUploadedDocuments}
          />
        </>
      )}

      <MultiSelectQuestion
        id="mieterstrom-vnb-support"
        label="M9. Stellt Ihr VNB konkrete Unterstützung für die massentaugliche Umsetzung von Mieterstrom bereit?"
        options={MIETERSTROM_VNB_SUPPORT_OPTIONS}
        value={data.mieterstromVnbSupport || []}
        otherValue={data.mieterstromVnbSupportOther}
        onChange={(val) => updateData("mieterstromVnbSupport", val)}
        onOtherChange={(val) => updateData("mieterstromVnbSupportOther", val)}
      />

      <SingleSelectQuestion
        id="mieterstrom-vnb-helpful"
        label="M10. Bietet Ihr VNB eine Kontaktmöglichkeit für Mieterstrom und ist das hilfreich?"
        options={MIETERSTROM_CONTACT_HELPFUL_OPTIONS}
        value={data.mieterstromVnbHelpful}
        otherValue={data.mieterstromVnbHelpfulOther}
        onChange={(val) => updateData("mieterstromVnbHelpful", val)}
        onOtherChange={(val) => updateData("mieterstromVnbHelpfulOther", val)}
      />

      <SingleSelectQuestion
        id="mieterstrom-personal-contacts"
        label="M11. Haben Sie persönliche Kontakte bei Ihrem Verteilnetzbetreiber?"
        options={MIETERSTROM_PERSONAL_CONTACTS_OPTIONS}
        value={data.mieterstromPersonalContacts}
        otherValue={data.mieterstromPersonalContactsOther}
        onChange={(val) => updateData("mieterstromPersonalContacts", val)}
        onOtherChange={(val) => updateData("mieterstromPersonalContactsOther", val)}
      />

      <RatingQuestion
        id="mieterstrom-support-rating"
        label="Wie sehr fühlen Sie sich von Ihrem VNB in der Planung von Mieterstrom unterstützt?"
        value={data.mieterstromSupportRating}
        onChange={(val) => updateData("mieterstromSupportRating", val)}
        minLabel="Unser VNB will das eigentlich lieber verhindern"
        maxLabel="Unser VNB möchte das wirklich mit uns umsetzen"
        min={1}
        max={10}
      />
    </div>
  );
}
