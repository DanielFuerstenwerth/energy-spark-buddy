import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";

const ES_STATUS_OPTIONS = [
  { value: "in_betrieb_vollversorgung", label: "Unser Energy-Sharing Projekt ist schon in Betrieb - Vollversorgungsmodell" },
  { value: "in_betrieb_42c", label: "Unser Energy-Sharing Projekt ist schon in Betrieb - nach §42c EnWG" },
  { value: "planung_bereit", label: "Wir sind in der Planung und wollen loslegen sobald es geht" },
  { value: "info_sammeln", label: "Wir haben grundsätzliches Interesse, sammeln derzeit Infos" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const ES_PLANT_TYPE_OPTIONS = [
  { value: "wind", label: "Windenergieanlage" },
  { value: "buergerwind", label: "Windenergieanlage - Bürgerwindanlage" },
  { value: "pv_freiflaeche", label: "PV-Freiflächenanlage" },
  { value: "buergersolar", label: "Bürgersolaranlage" },
  { value: "pv_efh", label: "PV-Dachanlage auf Einfamilienhaus" },
  { value: "pv_mfh", label: "PV-Dachanlage auf Mehrfamilienhaus" },
  { value: "pv_nichtwohn", label: "PV-Dachanlage auf einem Nicht-Wohngebäude" },
];

const ES_PROJECT_SCOPE_OPTIONS = [
  { value: "single", label: "Ein einzelnes Projekt" },
  { value: "multiple", label: "Mehrere Projekte" },
];

const ES_CONSUMER_TYPES_OPTIONS = [
  { value: "privat", label: "Private Haushalte" },
  { value: "kommune", label: "Kommune" },
  { value: "kommunal_unternehmen", label: "Kommunale Unternehmen" },
  { value: "kmu", label: "KMU" },
  { value: "vereine", label: "Vereine" },
];

const ES_CONSUMER_SCOPE_OPTIONS = [
  { value: "alle", label: "An jeden der Interesse hat" },
  { value: "primaer_bestimmte", label: "Primär an bestimmte Stromverbraucher, aber gerne auch andere" },
  { value: "nur_bestimmte", label: "Nur an bestimmte Abnehmer", hasTextField: true },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const ES_VNB_RESPONSE_OPTIONS = [
  { value: "bereit_06_2026", label: "Der VNB bereitet sich schon darauf vor - ab dem 01.06.2026 können wir starten!" },
  { value: "bereit_12_monate", label: "Der VNB bereitet sich schon darauf vor - in den nächsten 12 Monaten soll die Umsetzung möglich sein" },
  { value: "moeglich_keine_zeit", label: "Der VNB hat angekündigt, dass das möglich sein wird - aber noch keine genaue Zeit genannt" },
  { value: "vertroestet", label: "Der VNB hat uns auf später vertröstet" },
  { value: "weiss_nicht", label: "Der VNB weiß nicht, was Energy Sharing ist" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const ES_NETZENTGELTE_OPTIONS = [
  { value: "ja_vorschlag", label: "Ja - und der VNB hatte schon einen Vorschlag wie das geht", hasTextField: true },
  { value: "ja_unklar", label: "Ja - aber der VNB weiß auch nicht wie das gehen soll", hasTextField: true },
  { value: "nein", label: "Nein" },
];

interface StepEnergySharingProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepEnergySharing({ data, updateData }: StepEnergySharingProps) {
  // Changed to single-select: esStatus is now a string, not array
  const esStatusValue = Array.isArray(data.esStatus) ? data.esStatus[0] : data.esStatus;
  const isInOperation = esStatusValue?.includes('in_betrieb') || false;
  const isPlanning = esStatusValue === 'planung_bereit' || esStatusValue === 'info_sammeln';

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Energy Sharing</h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Energy Sharing ermöglicht die gemeinschaftliche Nutzung von erneuerbarem Strom.
        </p>
      </div>

      <SingleSelectQuestion
        id="es-status"
        label="E1. Wo stehen Sie aktuell mit dem Projekt?"
        options={ES_STATUS_OPTIONS}
        value={esStatusValue}
        otherValue={data.esStatusOther}
        onChange={(val) => updateData("esStatus", [val])}
        onOtherChange={(val) => updateData("esStatusOther", val)}
      />

      {isInOperation && (
        <div className="space-y-6 pt-4 border-t">
          <h4 className="font-medium">E2. Wenn das Projekt schon in Betrieb ist:</h4>
          
          <TextQuestion
            id="es-in-operation-details"
            label="Welche Erzeugungsanlagen sind eingebunden und wer wird beliefert?"
            type="textarea"
            value={data.esInOperationDetails}
            onChange={(val) => updateData("esInOperationDetails", val)}
            placeholder="Beschreiben Sie Ihre Anlagen und Abnehmer..."
          />

          <TextQuestion
            id="es-operator-details"
            label="Wer betreibt die Anlagen, wie erfolgt die Zuteilung der Strommengen, wer übernimmt die Abrechnung?"
            type="textarea"
            value={data.esOperatorDetails}
            onChange={(val) => updateData("esOperatorDetails", val)}
            placeholder="Beschreiben Sie den Betrieb..."
          />
        </div>
      )}

      {isPlanning && (
        <div className="space-y-6 pt-4 border-t">
          <MultiSelectQuestion
            id="es-plant-type"
            label="E3. Welche Art von Anlage möchten Sie für das Energy Sharing Projekt nutzen?"
            description="Mehrfachauswahl möglich"
            options={ES_PLANT_TYPE_OPTIONS}
            value={data.esPlantType}
            onChange={(val) => updateData("esPlantType", val)}
          />

          <SingleSelectQuestion
            id="es-project-scope"
            label="E4. Projektumfang"
            options={ES_PROJECT_SCOPE_OPTIONS}
            value={data.esProjectScope}
            onChange={(val) => updateData("esProjectScope", val)}
          />

          {data.esProjectScope === 'single' && (
            <div className="grid grid-cols-2 gap-4">
              <TextQuestion
                id="es-pv-size"
                label="Größe der PV-Anlage in kW"
                type="number"
                value={data.esPvSizeKw}
                onChange={(val) => updateData("esPvSizeKw", val ? parseFloat(val) : undefined)}
                placeholder="z.B. 100"
                optional
              />
              <TextQuestion
                id="es-wind-size"
                label="Größe der Windenergieanlage in kW"
                type="number"
                value={data.esWindSizeKw}
                onChange={(val) => updateData("esWindSizeKw", val ? parseFloat(val) : undefined)}
                placeholder="z.B. 2000"
                optional
              />
              <TextQuestion
                id="es-party-count"
                label="Anzahl der belieferten Parteien"
                type="number"
                value={data.esPartyCount}
                onChange={(val) => updateData("esPartyCount", val ? parseInt(val) : undefined)}
                placeholder="z.B. 50"
                optional
              />
            </div>
          )}

          {data.esProjectScope === 'multiple' && (
            <div className="grid grid-cols-2 gap-4">
              <TextQuestion
                id="es-total-pv-size"
                label="Gesamte Größe der PV-Anlagen in kW"
                type="number"
                value={data.esTotalPvSizeKw}
                onChange={(val) => updateData("esTotalPvSizeKw", val ? parseFloat(val) : undefined)}
                placeholder="z.B. 500"
                optional
              />
              <TextQuestion
                id="es-total-wind-size"
                label="Gesamte Größe der Windenergieanlagen in kW"
                type="number"
                value={data.esTotalWindSizeKw}
                onChange={(val) => updateData("esTotalWindSizeKw", val ? parseFloat(val) : undefined)}
                placeholder="z.B. 5000"
                optional
              />
              <TextQuestion
                id="es-party-count"
                label="Gesamte Anzahl der belieferten Parteien"
                type="number"
                value={data.esPartyCount}
                onChange={(val) => updateData("esPartyCount", val ? parseInt(val) : undefined)}
                placeholder="z.B. 200"
                optional
              />
            </div>
          )}

          <MultiSelectQuestion
            id="es-consumer-types"
            label="E5. Welche Stromverbraucher sollen eingebunden werden?"
            options={ES_CONSUMER_TYPES_OPTIONS}
            value={data.esConsumerTypes}
            onChange={(val) => updateData("esConsumerTypes", val)}
          />

          <TextQuestion
            id="es-consumer-details"
            label="Wie viele Stromverbraucher welchen Typs sollen eingebunden werden?"
            type="textarea"
            value={data.esConsumerDetails}
            onChange={(val) => updateData("esConsumerDetails", val)}
            placeholder="z.B. 30 Haushalte, 5 KMU..."
            optional
          />

          <SingleSelectQuestion
            id="es-consumer-scope"
            label="E6. An wen soll der Strom geliefert werden?"
            options={ES_CONSUMER_SCOPE_OPTIONS}
            value={data.esConsumerScope}
            otherValue={data.esConsumerScopeOther}
            onChange={(val) => updateData("esConsumerScope", val)}
            onOtherChange={(val) => updateData("esConsumerScopeOther", val)}
          />

          <TextQuestion
            id="es-max-distance"
            label="Wie groß ist der maximale geografische Abstand zwischen Anlagen und Verbrauchern?"
            description="Eine ungefähre Schätzung reicht"
            value={data.esMaxDistance}
            onChange={(val) => updateData("esMaxDistance", val)}
            placeholder="z.B. 5 km"
            optional
          />
        </div>
      )}

      <div className="space-y-6 pt-4 border-t">
        <SingleSelectQuestion
          id="es-vnb-contact"
          label="E6. Waren Sie bereits in Kontakt mit Ihrem VNB zu dem Thema Energy Sharing?"
          options={[
            { value: "yes", label: "Ja" },
            { value: "no", label: "Nein" },
          ]}
          value={data.esVnbContact === true ? 'yes' : data.esVnbContact === false ? 'no' : undefined}
          onChange={(val) => updateData("esVnbContact", val === 'yes')}
        />

        {data.esVnbContact && (
          <>
            <SingleSelectQuestion
              id="es-vnb-response"
              label="E7. Was war die Rückmeldung des VNB?"
              options={ES_VNB_RESPONSE_OPTIONS}
              value={data.esVnbResponse}
              otherValue={data.esVnbResponseOther}
              onChange={(val) => updateData("esVnbResponse", val)}
              onOtherChange={(val) => updateData("esVnbResponseOther", val)}
            />

            <SingleSelectQuestion
              id="es-netzentgelte-discussion"
              label="E8. Haben Sie mit Ihrem VNB bereits über die Abrechnung der Netzentgelte gesprochen?"
              options={ES_NETZENTGELTE_OPTIONS}
              value={data.esNetzentgelteDiscussion}
              otherValue={data.esNetzentgelteDetails}
              onChange={(val) => updateData("esNetzentgelteDiscussion", val)}
              onOtherChange={(val) => updateData("esNetzentgelteDetails", val)}
            />
          </>
        )}
      </div>

      <TextQuestion
        id="es-info-sources"
        label="Welche Informationsquellen fanden Sie besonders hilfreich bei der Suche nach Informationen zu Energy Sharing?"
        type="textarea"
        value={data.esInfoSources}
        onChange={(val) => updateData("esInfoSources", val)}
        placeholder="z.B. Webseiten, Verbände, Beratungsstellen..."
        optional
      />
    </div>
  );
}
