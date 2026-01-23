import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { RatingQuestion } from "../questions/RatingQuestion";
import { FileUpload } from "../questions/FileUpload";

const VNB_ROLE_OPTIONS = [
  { value: "keine", label: "Gar keine - wir machen das mit einem wettbewerblichen Messstellenbetreiber" },
  { value: "msb_dienstleister", label: "Der VNB/gMSB ist Messstellenbetreiber, ein Dienstleister stellt uns die Daten für die Abrechnung zur Verfügung" },
  { value: "msb_direkt", label: "Der VNB/gMSB ist Messstellenbetreiber und stellt uns die Daten für die Abrechnung direkt zur Verfügung" },
  { value: "full_service", label: "Das Stadtwerk übernimmt das ganze Projekt, inkl. der gesamten Stromlieferung und Abrechnung mit den Teilnehmenden" },
];

const DURATION_OPTIONS = [
  { value: "unter_2_monate", label: "Unter 2 Monaten" },
  { value: "2_bis_12_monate", label: "Zwischen 2 und 12 Monaten" },
  { value: "ueber_12_monate", label: "Über 12 Monate" },
];

const WANDLERMESSUNG_OPTIONS = [
  { value: "nein", label: "Nein" },
  { value: "ja", label: "Ja", hasTextField: true },
  { value: "wissen_nicht", label: "Das wissen wir nicht" },
];

const MSB_PROVIDER_OPTIONS = [
  { value: "gmsb", label: "Unser lokaler gMSB (gleiches Unternehmen wie der VNB)" },
  { value: "wmsb", label: "Ein wMSB" },
];

const DATA_PROVIDER_OPTIONS = [
  { value: "gmsb", label: "Unser lokaler gMSB" },
  { value: "dienstleister", label: "Ein Dienstleister" },
  { value: "wmsb", label: "Ein wMSB" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const MSB_DURATION_OPTIONS = [
  { value: "wissen_nicht", label: "Weiß ich nicht" },
  { value: "schnell", label: "Das ging problemlos und schnell" },
  { value: "4_monate", label: "Die 4 Monate gesetzliche Frist wurden gerade so eingehalten" },
  { value: "laenger", label: "Die Frist von 4 Monaten wurde deutlich überschritten" },
];

const ADDITIONAL_COSTS_OPTIONS = [
  { value: "wissen_nicht", label: "Wissen wir nicht" },
  { value: "nein", label: "Nein, unser VNB/gMSB verlangt hier keine Zusatzkosten" },
  { value: "ja", label: "Ja, unser VNB/gMSB verlangt dafür Zusatzkosten" },
];

const REJECTION_RESPONSE_OPTIONS = [
  { value: "bnetza", label: "Wir haben uns bereits an die BNetzA gewendet" },
  { value: "rechtliche_schritte", label: "Wir überlegen rechtliche Schritte zu gehen" },
  { value: "keine_schritte", label: "Wir sind bei dem Anschluss anderer Projekte auf den VNB angewiesen und sehen von rechtlichen Schritten gegenüber dem VNB ab" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

interface StepMieterstromOperationProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
}

export function StepMieterstromOperation({ data, updateData, uploadedDocuments, setUploadedDocuments }: StepMieterstromOperationProps) {
  const showGmsbDetails = data.mieterstromMsbProvider === 'gmsb';

  return (
    <div className="space-y-8">
      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <h3 className="font-medium mb-2 text-green-800 dark:text-green-200">Mieterstrom bereits in Betrieb</h3>
        <p className="text-sm text-green-700 dark:text-green-300">
          Vielen Dank, dass Sie Mieterstrom bereits umsetzen! Ihre Erfahrungen helfen anderen bei der Planung.
        </p>
      </div>

      <SingleSelectQuestion
        id="mieterstrom-vnb-role"
        label="MB1. Welche Rolle übernimmt der VNB in Ihrem Mieterstrom-Projekt?"
        options={VNB_ROLE_OPTIONS}
        value={data.mieterstromVnbRole}
        onChange={(val) => updateData("mieterstromVnbRole", val)}
      />

      <SingleSelectQuestion
        id="mieterstrom-vnb-duration"
        label="MB2. Wie lange hat die Abstimmung mit dem VNB zum Mieterstrom gedauert?"
        options={DURATION_OPTIONS}
        value={data.mieterstromVnbDuration}
        onChange={(val) => updateData("mieterstromVnbDuration", val)}
      />

      <TextQuestion
        id="mieterstrom-vnb-duration-reasons"
        label="Falls es lange dauerte: Was war das große Problem?"
        type="textarea"
        value={data.mieterstromVnbDurationReasons}
        onChange={(val) => updateData("mieterstromVnbDurationReasons", val)}
        placeholder="Beschreiben Sie die Gründe..."
        optional
      />

      <SingleSelectQuestion
        id="mieterstrom-wandlermessung"
        label="MB3. Hat Ihr VNB einen neuen zusätzlichen Zähler direkt hinter dem Netzanschluss des Gebäudes verlangt (Wandlermessung >5.000 EUR)?"
        options={WANDLERMESSUNG_OPTIONS}
        value={data.mieterstromWandlermessung}
        otherValue={data.mieterstromWandlermessungComment}
        onChange={(val) => updateData("mieterstromWandlermessung", val)}
        onOtherChange={(val) => updateData("mieterstromWandlermessungComment", val)}
      />

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium">MB4. Wer ist der Messstellenbetreiber und wer übermittelt Ihnen die Daten?</h4>
        
        <SingleSelectQuestion
          id="mieterstrom-msb-provider"
          label="MB4.1 Messstellenbetrieb: Wer stellt die Zähler oder die Smart Meter bereit?"
          options={MSB_PROVIDER_OPTIONS}
          value={data.mieterstromMsbProvider}
          onChange={(val) => updateData("mieterstromMsbProvider", val)}
        />

        <SingleSelectQuestion
          id="mieterstrom-data-provider"
          label="MB4.2 Übermittlung der verbrauchten Strommengen je Teilnehmer"
          options={DATA_PROVIDER_OPTIONS}
          value={data.mieterstromDataProvider}
          otherValue={data.mieterstromDataProviderOther}
          onChange={(val) => updateData("mieterstromDataProvider", val)}
          onOtherChange={(val) => updateData("mieterstromDataProviderOther", val)}
        />
      </div>

      {showGmsbDetails && (
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium">MB5. Details zum gMSB</h4>
          
          <SingleSelectQuestion
            id="mieterstrom-msb-install-duration"
            label="MB5.1 Wie lange hat es gedauert von Bestellung bis zum Einbau der Smart Meter?"
            options={MSB_DURATION_OPTIONS}
            value={data.mieterstromMsbInstallDuration}
            onChange={(val) => updateData("mieterstromMsbInstallDuration", val)}
          />

          <SingleSelectQuestion
            id="mieterstrom-operation-costs"
            label="MB5.2 Stellt der VNB/gMSB Ihnen für den Betrieb der Smart Meter zusätzliche Kosten in Rechnung?"
            options={ADDITIONAL_COSTS_OPTIONS}
            value={data.mieterstromOperationCosts}
            onChange={(val) => updateData("mieterstromOperationCosts", val)}
          />

          {data.mieterstromOperationCosts === 'ja' && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="grid grid-cols-2 gap-4">
                <TextQuestion
                  id="mieterstrom-operation-costs-one-time"
                  label="Einmalbetrag (EUR)"
                  type="number"
                  value={data.mieterstromOperationCostsOneTime}
                  onChange={(val) => updateData("mieterstromOperationCostsOneTime", val ? parseFloat(val) : undefined)}
                  placeholder="z.B. 500"
                  optional
                />
                <TextQuestion
                  id="mieterstrom-operation-costs-yearly"
                  label="Jährlicher Betrag (EUR)"
                  type="number"
                  value={data.mieterstromOperationCostsYearly}
                  onChange={(val) => updateData("mieterstromOperationCostsYearly", val ? parseFloat(val) : undefined)}
                  placeholder="z.B. 100"
                  optional
                />
              </div>
              <FileUpload
                id="mieterstrom-costs-docs"
                label="Option zum Hochladen der Rechnung"
                description="Falls Sie die Rechnung teilen möchten"
                value={uploadedDocuments}
                onChange={setUploadedDocuments}
              />
            </div>
          )}
        </div>
      )}

      <RatingQuestion
        id="mieterstrom-operation-satisfaction"
        label="MB6. Wie zufrieden sind Sie mit Ihrem VNB bei der Umsetzung des Projektes?"
        value={data.mieterstromOperationSatisfaction}
        onChange={(val) => updateData("mieterstromOperationSatisfaction", val)}
        minLabel="Unser VNB will das eigentlich lieber verhindern"
        maxLabel="Unser VNB möchte das wirklich mit uns umsetzen"
        min={1}
        max={10}
      />

      <MultiSelectQuestion
        id="mieterstrom-rejection-response"
        label="MD1. Falls Ihr VNB die Umsetzung von Mieterstrom nicht oder nur unzureichend anbietet/durchführt, wie haben Sie bislang reagiert?"
        options={REJECTION_RESPONSE_OPTIONS}
        value={data.mieterstromRejectionResponse || []}
        otherValue={data.mieterstromRejectionResponseOther}
        onChange={(val) => updateData("mieterstromRejectionResponse", val)}
        onOtherChange={(val) => updateData("mieterstromRejectionResponseOther", val)}
        optional
      />

      <TextQuestion
        id="mieterstrom-info-sources"
        label="MD2. Welche Informationsquellen fanden Sie besonders hilfreich bei der Suche nach Informationen zu Mieterstrom?"
        type="textarea"
        value={data.mieterstromInfoSources}
        onChange={(val) => updateData("mieterstromInfoSources", val)}
        placeholder="z.B. Webseiten, Beratungsstellen, Netzwerke..."
        optional
      />

      <TextQuestion
        id="mieterstrom-experiences"
        label="MD3. Welche Erfahrungen möchten Sie noch teilen?"
        type="textarea"
        value={data.mieterstromExperiences}
        onChange={(val) => updateData("mieterstromExperiences", val)}
        placeholder="Ihre Erfahrungen..."
        optional
      />

      <FileUpload
        id="mieterstrom-documents"
        label="Möglichkeit zum Hochladen von Dokumenten"
        description="z.B. Korrespondenz mit VNB, Messkonzepte, Rechnungen"
        value={uploadedDocuments}
        onChange={setUploadedDocuments}
      />

      <TextQuestion
        id="mieterstrom-survey-improvements"
        label="MD4. Haben Sie Verbesserungsvorschläge für diese Umfrage?"
        type="textarea"
        value={data.mieterstromSurveyImprovements}
        onChange={(val) => updateData("mieterstromSurveyImprovements", val)}
        placeholder="Ihr Feedback zur Umfrage..."
        optional
      />
    </div>
  );
}
