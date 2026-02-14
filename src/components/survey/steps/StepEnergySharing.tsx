import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { ProjectLocationRows, ProjectLocation } from "../questions/ProjectLocationRows";
import { getOptionsForQuestion, getLabelForQuestion } from "@/data/surveySchema";

interface StepEnergySharingProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepEnergySharing({ data, updateData }: StepEnergySharingProps) {
  const esStatusValue = Array.isArray(data.esStatus) ? data.esStatus[0] : data.esStatus;
  const isInOperation = esStatusValue?.includes('in_betrieb') || false;
  const isMultipleProjects = data.esProjectScope === 'multiple';

  const esLocations: ProjectLocation[] = isMultipleProjects
    ? (data.esProjectLocations?.length ? data.esProjectLocations : [{}])
    : [{ plz: undefined, address: undefined }];

  const handleEsLocationChange = (locations: ProjectLocation[]) => {
    updateData("esProjectLocations", locations);
  };

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
        label={getLabelForQuestion("esStatus")}
        options={getOptionsForQuestion("esStatus")}
        value={esStatusValue}
        otherValue={data.esStatusOther}
        onChange={(val) => updateData("esStatus", [val])}
        onOtherChange={(val) => updateData("esStatusOther", val)}
        questionNumber="7.1"
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
            questionNumber="7.2"
          />

          <TextQuestion
            id="es-operator-details"
            label="Wer betreibt die Anlagen, wie erfolgt die Zuteilung der Strommengen, wer übernimmt die Abrechnung?"
            type="textarea"
            value={data.esOperatorDetails}
            onChange={(val) => updateData("esOperatorDetails", val)}
            placeholder="Beschreiben Sie den Betrieb..."
            questionNumber="7.3"
          />
        </div>
      )}

      {/* Korrektur: esPlantType, esProjectScope, esCapacitySizeKw, esPartyCount, esConsumerTypes always visible */}
      <MultiSelectQuestion
        id="es-plant-type"
        label={getLabelForQuestion("esPlantType")}
        description="Mehrfachauswahl möglich"
        options={getOptionsForQuestion("esPlantType")}
        value={data.esPlantType}
        onChange={(val) => updateData("esPlantType", val)}
        questionNumber="7.4"
      />

      <SingleSelectQuestion
        id="es-project-scope"
        label={getLabelForQuestion("esProjectScope")}
        options={getOptionsForQuestion("esProjectScope")}
        value={data.esProjectScope}
        onChange={(val) => updateData("esProjectScope", val)}
        questionNumber="7.5"
      />

      {/* Standorte der Erzeugungsanlagen */}
      <ProjectLocationRows
        locations={isMultipleProjects ? esLocations : [esLocations[0]]}
        onChange={handleEsLocationChange}
        multiple={isMultipleProjects}
        label={isMultipleProjects ? "Standorte der Erzeugungsanlagen" : "Standort der Erzeugungsanlage"}
        questionNumber="7.5b"
      />

      {/* Korrektur: Consolidated to esCapacitySizeKw (was esPvSizeKw + esWindSizeKw) */}
      <TextQuestion
        id="es-capacity-size"
        label={getLabelForQuestion("esCapacitySizeKw")}
        type="number"
        value={data.esCapacitySizeKw}
        onChange={(val) => updateData("esCapacitySizeKw", val ? parseFloat(val) : undefined)}
        placeholder="z.B. 100"
        optional
        questionNumber="7.6"
      />

      <TextQuestion
        id="es-technology-description"
        label={getLabelForQuestion("esTechnologyDescription")}
        type="textarea"
        value={data.esTechnologyDescription}
        onChange={(val) => updateData("esTechnologyDescription", val)}
        placeholder="z.B. PV-Dachanlage, Windkraftanlage, Biogas..."
        optional
        questionNumber="7.6b"
      />

      <TextQuestion
        id="es-party-count"
        label={getLabelForQuestion("esPartyCount")}
        type="number"
        value={data.esPartyCount}
        onChange={(val) => updateData("esPartyCount", val ? parseInt(val) : undefined)}
        placeholder="z.B. 50"
        optional
        questionNumber="7.7"
      />

      <MultiSelectQuestion
        id="es-consumer-types"
        label={getLabelForQuestion("esConsumerTypes")}
        options={getOptionsForQuestion("esConsumerTypes")}
        value={data.esConsumerTypes}
        onChange={(val) => updateData("esConsumerTypes", val)}
        questionNumber="7.8"
      />

      <TextQuestion
        id="es-consumer-details"
        label="Wie viele Stromverbraucher welchen Typs sollen eingebunden werden?"
        type="textarea"
        value={data.esConsumerDetails}
        onChange={(val) => updateData("esConsumerDetails", val)}
        placeholder="z.B. 30 Haushalte, 5 KMU..."
        optional
        questionNumber="7.9"
      />

      <SingleSelectQuestion
        id="es-consumer-scope"
        label={getLabelForQuestion("esConsumerScope")}
        options={getOptionsForQuestion("esConsumerScope")}
        value={data.esConsumerScope}
        otherValue={data.esConsumerScopeOther}
        onChange={(val) => updateData("esConsumerScope", val)}
        onOtherChange={(val) => updateData("esConsumerScopeOther", val)}
        questionNumber="7.10"
      />

      <TextQuestion
        id="es-max-distance"
        label={getLabelForQuestion("esMaxDistance")}
        description="Eine ungefähre Schätzung reicht"
        value={data.esMaxDistance}
        onChange={(val) => updateData("esMaxDistance", val)}
        placeholder="z.B. 5 km"
        optional
        questionNumber="7.11"
      />

      <div className="space-y-6 pt-4 border-t">
        <SingleSelectQuestion
          id="es-vnb-contact"
          label={getLabelForQuestion("esVnbContact")}
          options={getOptionsForQuestion("esVnbContact")}
          value={data.esVnbContact === true ? 'yes' : data.esVnbContact === false ? 'no' : undefined}
          onChange={(val) => updateData("esVnbContact", val === 'yes')}
          questionNumber="7.12"
        />

        {data.esVnbContact && (
          <>
            <SingleSelectQuestion
              id="es-vnb-response"
              label={getLabelForQuestion("esVnbResponse")}
              options={getOptionsForQuestion("esVnbResponse")}
              value={data.esVnbResponse}
              otherValue={data.esVnbResponseOther}
              onChange={(val) => updateData("esVnbResponse", val)}
              onOtherChange={(val) => updateData("esVnbResponseOther", val)}
              questionNumber="7.13"
            />

            <SingleSelectQuestion
              id="es-netzentgelte-discussion"
              label={getLabelForQuestion("esNetzentgelteDiscussion")}
              options={getOptionsForQuestion("esNetzentgelteDiscussion")}
              value={data.esNetzentgelteDiscussion}
              otherValue={data.esNetzentgelteDetails}
              onChange={(val) => updateData("esNetzentgelteDiscussion", val)}
              onOtherChange={(val) => updateData("esNetzentgelteDetails", val)}
              questionNumber="7.14"
            />
          </>
        )}
      </div>

      <TextQuestion
        id="es-info-sources"
        label={getLabelForQuestion("esInfoSources")}
        type="textarea"
        value={data.esInfoSources}
        onChange={(val) => updateData("esInfoSources", val)}
        placeholder="z.B. Webseiten, Verbände, Beratungsstellen..."
        optional
        questionNumber="7.15"
      />
    </div>
  );
}
