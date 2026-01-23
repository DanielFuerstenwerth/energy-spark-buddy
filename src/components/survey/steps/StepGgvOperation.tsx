import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { RatingQuestion } from "../questions/RatingQuestion";
import { FileUpload } from "../questions/FileUpload";

const DURATION_OPTIONS = [
  { value: "unter_2_monate", label: "Unter 2 Monaten" },
  { value: "2_bis_12_monate", label: "Zwischen 2 und 12 Monaten" },
  { value: "ueber_12_monate", label: "Über 12 Monate" },
];

const WANDLERMESSUNG_OPTIONS = [
  { value: "ja", label: "Ja" },
  { value: "nein", label: "Nein" },
  { value: "wissen_nicht", label: "Das wissen wir nicht" },
];

const MSB_PROVIDER_OPTIONS = [
  { value: "gmsb", label: "Unser lokaler gMSB (meist das gleiche Unternehmen wie der VNB)" },
  { value: "wmsb", label: "Ein wMSB" },
];

const ALLOCATION_PROVIDER_OPTIONS = [
  { value: "gmsb", label: "Unser lokaler gMSB" },
  { value: "wmsb", label: "Ein wMSB" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const MSB_DURATION_OPTIONS = [
  { value: "wissen_nicht", label: "Weiß ich nicht" },
  { value: "schnell", label: "Das ging problemlos und schnell" },
  { value: "4_monate", label: "Ca. 4 Monate (gesetzlich vorgegebene Frist)" },
  { value: "laenger", label: "Deutlich länger als 4 Monate" },
];

const ADDITIONAL_COSTS_OPTIONS = [
  { value: "nein", label: "Nein, unser VNB/gMSB verlangt hier keine Zusatzkosten" },
  { value: "ja", label: "Ja, unser VNB/gMSB verlangt dafür Zusatzkosten" },
  { value: "wissen_nicht", label: "Wissen wir nicht" },
];

const ALLOCATION_WHO_OPTIONS = [
  { value: "wissen_nicht", label: "Weiß ich nicht" },
  { value: "dienstleister", label: "Das macht ein Dienstleister, den ich bezahle" },
  { value: "selber", label: "Das mache ich selber, auf Basis der kompletten Verbrauchsdaten aller Teilnehmenden" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const DATA_FORMAT_OPTIONS = [
  { value: "mail_excel", label: "Der VNB/gMSB stellt uns die Daten per Mail als Excel zur Verfügung" },
  { value: "portal_verrechnete_werte", label: "Der VNB/gMSB stellt uns die Daten über ein Online-Portal zur Verfügung, in dem wir die verrechneten Werte runterladen können" },
  { value: "portal_alle_messwerte", label: "Der VNB/gMSB stellt uns die Daten über ein Online-Portal zur Verfügung, in dem wir auf alle Messwerte der Teilnehmer zugreifen können" },
  { value: "dienstleister_marktkommunikation", label: "Für das Abrufen der Daten brauchen wir einen eigenen Dienstleister, der die Daten über die Marktkommunikation vom VNB/gMSB abruft" },
  { value: "wissen_nicht", label: "Wissen wir nicht" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const DATA_COST_OPTIONS = [
  { value: "kostenlos", label: "Kostenlos" },
  { value: "weniger_3_eur", label: "Dauerhaft weniger (oder gleich) 3 EUR/Messstelle pro Jahr" },
  { value: "mehr_3_eur", label: "Dauerhaft mehr als 3 EUR/Messstelle pro Jahr" },
  { value: "aktuell_kostenlos", label: "Aktuell kostenlos, das wird sich aber ändern" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const ESA_COST_OPTIONS = [
  { value: "wissen_nicht", label: "Wissen wir nicht" },
  { value: "kostenlos", label: "Nein, das macht er umsonst" },
  { value: "weniger_3_eur", label: "Ja, dafür verlangt er weniger (oder gleich) 3 EUR/Messstelle/Jahr" },
  { value: "mehr_3_eur", label: "Ja, dafür verlangt er mehr als 3 EUR/Messstelle/Jahr" },
];

interface StepGgvOperationProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
}

export function StepGgvOperation({ data, updateData, uploadedDocuments, setUploadedDocuments }: StepGgvOperationProps) {
  return (
    <div className="space-y-8">
      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <h3 className="font-medium mb-2 text-green-800 dark:text-green-200">GGV bereits in Betrieb</h3>
        <p className="text-sm text-green-700 dark:text-green-300">
          Vielen Dank, dass Sie die GGV bereits umsetzen! Ihre Erfahrungen helfen anderen bei der Planung.
        </p>
      </div>

      <SingleSelectQuestion
        id="operation-vnb-duration"
        label="D0. Wie lange hat die Abstimmung mit dem VNB zur GGV gedauert?"
        options={DURATION_OPTIONS}
        value={data.operationVnbDuration}
        onChange={(val) => updateData("operationVnbDuration", val)}
      />

      <TextQuestion
        id="operation-vnb-duration-reasons"
        label="Falls es lange dauerte: Was war das große Problem?"
        type="textarea"
        value={data.operationVnbDurationReasons}
        onChange={(val) => updateData("operationVnbDurationReasons", val)}
        placeholder="Beschreiben Sie die Gründe..."
        optional
      />

      <SingleSelectQuestion
        id="operation-wandlermessung"
        label="D1. Hat Ihr VNB einen neuen zusätzlichen Zähler direkt hinter dem Netzanschluss des Gebäudes verlangt (Wandlermessung > 5.000 EUR)?"
        options={WANDLERMESSUNG_OPTIONS}
        value={data.operationWandlermessung}
        onChange={(val) => updateData("operationWandlermessung", val)}
      />

      <TextQuestion
        id="operation-wandlermessung-comment"
        label="Ergänzende Informationen zur Wandlermessung"
        type="textarea"
        value={data.operationWandlermessungComment}
        onChange={(val) => updateData("operationWandlermessungComment", val)}
        placeholder="Weitere Details..."
        optional
      />

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium">D2. Wer ist der Messstellenbetreiber und wie erhalten Sie die Daten?</h4>
        
        <SingleSelectQuestion
          id="operation-msb-provider"
          label="D2.1 Messstellenbetrieb: Wer baut die Smart Meter ein und betreibt sie?"
          options={MSB_PROVIDER_OPTIONS}
          value={data.operationMsbProvider}
          onChange={(val) => updateData("operationMsbProvider", val)}
        />

        <SingleSelectQuestion
          id="operation-allocation-provider"
          label="D2.2 Aufteilung der PV-Stromerzeugung auf die Teilnehmenden (Verrechnung)"
          options={ALLOCATION_PROVIDER_OPTIONS}
          value={data.operationAllocationProvider}
          otherValue={data.operationDataProviderOther}
          onChange={(val) => updateData("operationAllocationProvider", val)}
          onOtherChange={(val) => updateData("operationDataProviderOther", val)}
        />

        <SingleSelectQuestion
          id="operation-data-provider"
          label="D2.3 Übermittlung der errechneten Strommengen je Teilnehmer"
          options={MSB_PROVIDER_OPTIONS}
          value={data.operationDataProvider}
          onChange={(val) => updateData("operationDataProvider", val)}
        />
      </div>

      {data.operationMsbProvider === 'gmsb' && (
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium">D3. Details zum gMSB (Grundzuständiger Messstellenbetreiber)</h4>
          
          <SingleSelectQuestion
            id="operation-msb-duration"
            label="D3.1 Wie lange hat es gedauert von Bestellung bis zum Einbau der Smart Meter?"
            options={MSB_DURATION_OPTIONS}
            value={data.operationMsbDuration}
            onChange={(val) => updateData("operationMsbDuration", val)}
          />

          <SingleSelectQuestion
            id="operation-msb-additional-costs"
            label="D3.2 Stellt der VNB/gMSB zusätzliche Kosten für den 'Einbau auf Kundenwunsch' in Rechnung?"
            options={ADDITIONAL_COSTS_OPTIONS}
            value={data.operationMsbAdditionalCosts}
            onChange={(val) => updateData("operationMsbAdditionalCosts", val)}
          />

          {data.operationMsbAdditionalCosts === 'ja' && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="grid grid-cols-2 gap-4">
                <TextQuestion
                  id="operation-msb-costs-one-time"
                  label="Einmalbetrag (EUR)"
                  type="number"
                  value={data.operationMsbAdditionalCostsOneTime}
                  onChange={(val) => updateData("operationMsbAdditionalCostsOneTime", val ? parseFloat(val) : undefined)}
                  placeholder="z.B. 500"
                  optional
                />
                <TextQuestion
                  id="operation-msb-costs-yearly"
                  label="Jährlicher Betrag (EUR)"
                  type="number"
                  value={data.operationMsbAdditionalCostsYearly}
                  onChange={(val) => updateData("operationMsbAdditionalCostsYearly", val ? parseFloat(val) : undefined)}
                  placeholder="z.B. 100"
                  optional
                />
              </div>
              <FileUpload
                id="operation-costs-docs"
                label="Option zum Hochladen der Rechnung"
                description="Falls Sie die Rechnung teilen möchten"
                value={uploadedDocuments}
                onChange={setUploadedDocuments}
              />
            </div>
          )}
        </div>
      )}

      {data.operationAllocationProvider && data.operationAllocationProvider !== 'gmsb' && (
        <SingleSelectQuestion
          id="operation-allocation-who"
          label="D4. Falls jemand anderes als der VNB/gMSB die Aufteilung der Strommengen vornimmt, wer ist das?"
          options={ALLOCATION_WHO_OPTIONS}
          value={data.operationAllocationWho}
          otherValue={data.operationAllocationWhoOther}
          onChange={(val) => updateData("operationAllocationWho", val)}
          onOtherChange={(val) => updateData("operationAllocationWhoOther", val)}
        />
      )}

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium">D5. Datenübermittlung</h4>
        
        <SingleSelectQuestion
          id="operation-data-format"
          label="D5.1 Wie erhalten Sie die Daten?"
          options={DATA_FORMAT_OPTIONS}
          value={data.operationDataFormat}
          otherValue={data.operationDataFormatOther}
          onChange={(val) => updateData("operationDataFormat", val)}
          onOtherChange={(val) => updateData("operationDataFormatOther", val)}
        />

        <SingleSelectQuestion
          id="operation-data-cost"
          label="D5.2 Wieviel kostet die Bereitstellung der verrechneten Werte?"
          description="Dabei sind die Kosten für die Smart Meter nicht zu berücksichtigen"
          options={DATA_COST_OPTIONS}
          value={data.operationDataCost}
          onChange={(val) => updateData("operationDataCost", val)}
        />

        {data.operationDataCost === 'mehr_3_eur' && (
          <TextQuestion
            id="operation-data-cost-amount"
            label="Betrag in EUR/Messstelle/Jahr"
            type="number"
            value={data.operationDataCostAmount}
            onChange={(val) => updateData("operationDataCostAmount", val ? parseFloat(val) : undefined)}
            placeholder="z.B. 5"
            optional
          />
        )}

        <SingleSelectQuestion
          id="operation-esa-cost"
          label="D6. Falls Ihr Dienstleister die Werte vom VNB/gMSB für Sie abruft (ESA-Marktrolle), verlangt der VNB/gMSB dafür Geld?"
          options={ESA_COST_OPTIONS}
          value={data.operationEsaCost}
          onChange={(val) => updateData("operationEsaCost", val)}
        />

        {data.operationEsaCost === 'mehr_3_eur' && (
          <TextQuestion
            id="operation-esa-cost-amount"
            label="Betrag in EUR/Messstelle/Jahr"
            type="number"
            value={data.operationEsaCostAmount}
            onChange={(val) => updateData("operationEsaCostAmount", val ? parseFloat(val) : undefined)}
            placeholder="z.B. 5"
            optional
          />
        )}
      </div>

      <RatingQuestion
        id="operation-satisfaction-rating"
        label="D7. Wie zufrieden sind Sie mit Ihrem VNB bei der Umsetzung des Projektes?"
        value={data.operationSatisfactionRating}
        onChange={(val) => updateData("operationSatisfactionRating", val)}
        minLabel="Unser VNB will das eigentlich lieber verhindern"
        maxLabel="Unser VNB möchte das wirklich mit uns umsetzen"
        min={1}
        max={10}
      />
    </div>
  );
}
