import { SurveyData } from "@/types/survey";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { SurveyVnbCombobox } from "../questions/SurveyVnbCombobox";
import { ProjectLocationRows, ProjectLocation } from "../questions/ProjectLocationRows";
import { getOptionsForQuestion, getLabelForQuestion } from "@/data/surveySchema";

const BUILDING_TYPE_OPTIONS = [
  { value: "wohngebaeude", label: "Wohngebäude" },
  { value: "gewerbe", label: "Gewerbegebäude" },
  { value: "gemischt", label: "Gemischt" },
];

const PROJECT_SCOPE_OPTIONS = [
  { value: "single", label: "Ein einzelnes Projekt" },
  { value: "multiple", label: "Mehrere Projekte" },
];

interface StepProjectDetailsProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepProjectDetails({ data, updateData }: StepProjectDetailsProps) {
  const projectTypes = data.projectTypes;
  const hasGgv = projectTypes.includes('ggv') || projectTypes.includes('ggv_oder_mieterstrom');
  const hasMieterstrom = projectTypes.includes('mieterstrom'); // Korrektur: ggv_oder_mieterstrom öffnet NUR GGV-Pfad
  const hasEnergySharing = projectTypes.includes('energysharing');
  const onlyEnergySharing = hasEnergySharing && !hasGgv && !hasMieterstrom;

  // Determine if any focus is "multiple"
  const isMultiple = data.ggvProjectType === 'multiple' || data.mieterstromProjectType === 'multiple';

  // Location handling
  const handleLocationChange = (locations: ProjectLocation[]) => {
    if (isMultiple) {
      updateData("projectLocations", locations);
    } else {
      const loc = locations[0] || {};
      updateData("projectPlz", loc.plz || '');
      updateData("projectAddress", loc.address || '');
    }
  };

  const currentLocations: ProjectLocation[] = isMultiple
    ? (data.projectLocations?.length ? data.projectLocations : [{}])
    : [{ plz: data.projectPlz, address: data.projectAddress }];

  return (
    <div className="space-y-8">
      {/* 1. VNB */}
      <SurveyVnbCombobox
        id="vnb-name"
        label={getLabelForQuestion("vnbName")}
        description="Suchen oder geben Sie den Namen Ihres VNB ein"
        value={data.vnbName}
        onChange={(val) => updateData("vnbName", val)}
        optional
        questionNumber="2.1"
      />

      {/* 2. Projektart */}
      <MultiSelectQuestion
        id="project-types"
        label={getLabelForQuestion("projectTypes")}
        description="Mehrfachauswahl möglich - Wahl beeinflusst spätere Auswahl der Fragen"
        options={getOptionsForQuestion("projectTypes")}
        value={data.projectTypes}
        onChange={(val) => updateData("projectTypes", val)}
        questionNumber="2.2"
      />

      {/* 3.1 Planungsstand – GGV (oder einziger Planungsstand wenn nur ein Modell) */}
      {projectTypes.length > 0 && !onlyEnergySharing && (hasGgv || (!hasMieterstrom)) && (
        <SingleSelectQuestion
          id="planning-status"
          label={hasGgv && hasMieterstrom
            ? getLabelForQuestion("planningStatus").replace("mit dem Projekt", "mit dem GGV-Projekt")
            : getLabelForQuestion("planningStatus")}
          description="Fragen zu Erfahrungen im Betrieb werden nur bei Wahl der vorletzten Antwortoption gestellt"
          options={getOptionsForQuestion("planningStatus")}
          value={data.planningStatus[0] || undefined}
          otherValue={data.planningStatusOther}
          onChange={(val) => updateData("planningStatus", [val])}
          onOtherChange={(val) => updateData("planningStatusOther", val)}
          questionNumber="2.3"
        />
      )}

      {/* 3.1b Planungsstand – Mieterstrom (nur wenn BEIDE gewählt) */}
      {hasGgv && hasMieterstrom && (
        <SingleSelectQuestion
          id="mieterstrom-planning-status"
          label={getLabelForQuestion("planningStatus").replace("mit dem Projekt", "mit dem Mieterstrom-Projekt")}
          description="Fragen zu Erfahrungen im Betrieb werden nur bei Wahl der vorletzten Antwortoption gestellt"
          options={getOptionsForQuestion("mieterstromPlanningStatus")}
          value={data.mieterstromPlanningStatus?.[0] || undefined}
          otherValue={data.mieterstromPlanningStatusOther}
          onChange={(val) => updateData("mieterstromPlanningStatus", [val])}
          onOtherChange={(val) => updateData("mieterstromPlanningStatusOther", val)}
          questionNumber="2.3b"
        />
      )}

      {/* Wenn NUR Mieterstrom (ohne GGV), nutze den regulären planningStatus */}
      {hasMieterstrom && !hasGgv && projectTypes.length > 0 && (
        <SingleSelectQuestion
          id="planning-status"
          label={getLabelForQuestion("planningStatus")}
          description="Fragen zu Erfahrungen im Betrieb werden nur bei Wahl der vorletzten Antwortoption gestellt"
          options={getOptionsForQuestion("planningStatus")}
          value={data.planningStatus[0] || undefined}
          otherValue={data.planningStatusOther}
          onChange={(val) => updateData("planningStatus", [val])}
          onOtherChange={(val) => updateData("planningStatusOther", val)}
          questionNumber="2.3"
        />
      )}

      {/* Only Energy Sharing → skip rest */}
      {onlyEnergySharing && (
        <p className="text-muted-foreground">
          Sie haben nur Energy Sharing ausgewählt. Die Fragen zu GGV/Mieterstrom entfallen.
        </p>
      )}

      {/* 3. Project scope (single/multiple) – shown when GGV or Mieterstrom */}
      {!onlyEnergySharing && projectTypes.length > 0 && (
        <>
          {hasGgv && !hasMieterstrom && (
            <SingleSelectQuestion
              id="ggv-type"
              label="Projektumfang"
              options={PROJECT_SCOPE_OPTIONS}
              value={data.ggvProjectType}
              onChange={(val) => updateData("ggvProjectType", val as 'single' | 'multiple')}
              questionNumber="2.4"
            />
          )}

          {hasMieterstrom && !hasGgv && (
            <SingleSelectQuestion
              id="mieterstrom-type"
              label="Projektumfang"
              options={PROJECT_SCOPE_OPTIONS}
              value={data.mieterstromProjectType}
              onChange={(val) => updateData("mieterstromProjectType", val)}
              questionNumber="2.4"
            />
          )}

          {hasGgv && hasMieterstrom && (
            <SingleSelectQuestion
              id="ggv-type"
              label="Projektumfang"
              options={PROJECT_SCOPE_OPTIONS}
              value={data.ggvProjectType}
              onChange={(val) => {
                updateData("ggvProjectType", val as 'single' | 'multiple');
                updateData("mieterstromProjectType", val);
              }}
              questionNumber="2.4"
            />
          )}

          {/* 4. Project dimension details */}
          {hasGgv && (
            <GgvDetails data={data} updateData={updateData} />
          )}

          {hasMieterstrom && (
            <MieterstromDetails data={data} updateData={updateData} />
          )}
        </>
      )}

      {/* 5. PLZ + Adresse am Ende – nur bei GGV/Mieterstrom (nicht bei nur-ES) */}
      {projectTypes.length > 0 && !onlyEnergySharing && (
        <ProjectLocationRows
          locations={currentLocations}
          onChange={handleLocationChange}
          multiple={isMultiple}
          questionNumber="2.14"
        />
      )}
    </div>
  );
}

/** GGV dimension details */
function GgvDetails({ data, updateData }: { data: SurveyData; updateData: StepProjectDetailsProps['updateData'] }) {
  return (
    <div className="space-y-6 pt-4 border-t">
      <h3 className="font-medium">Dimension des GGV-Projekts</h3>

      {data.ggvProjectType === 'multiple' && (
        <TextQuestion
          id="ggv-building-count"
          label="Gesamtzahl der Projekte"
          type="number"
          value={data.ggvBuildingCount}
          onChange={(val) => updateData("ggvBuildingCount", val ? parseInt(val) : undefined)}
          placeholder="z.B. 5"
          optional
          questionNumber="2.5"
        />
      )}

      <TextQuestion
        id="ggv-pv-size"
        label={data.ggvProjectType === 'multiple' ? "Gesamte Größe der PV-Anlagen in kW" : "Größe der PV-Anlage in kW"}
        type="number"
        value={data.ggvPvSizeKw}
        onChange={(val) => updateData("ggvPvSizeKw", val ? parseFloat(val) : undefined)}
        placeholder={data.ggvProjectType === 'multiple' ? "z.B. 150" : "z.B. 30"}
        optional
        questionNumber="2.6"
      />

      <TextQuestion
        id="ggv-party-count"
        label={data.ggvProjectType === 'multiple' ? "Gesamtanzahl der Parteien" : "Anzahl der Parteien, die Strom abnehmen"}
        type="number"
        value={data.ggvPartyCount}
        onChange={(val) => updateData("ggvPartyCount", val ? parseInt(val) : undefined)}
        placeholder={data.ggvProjectType === 'multiple' ? "z.B. 60" : "z.B. 12"}
        optional
        questionNumber="2.7"
      />

      <SingleSelectQuestion
        id="ggv-building-type"
        label="Art des Gebäudes"
        options={BUILDING_TYPE_OPTIONS}
        value={data.ggvBuildingType}
        onChange={(val) => updateData("ggvBuildingType", val)}
        questionNumber="2.8"
      />

      <TextQuestion
        id="ggv-additional"
        label="Zusätzliche Informationen"
        type="textarea"
        value={data.ggvAdditionalInfo}
        onChange={(val) => updateData("ggvAdditionalInfo", val)}
        placeholder="Weitere Details zu Ihrem Projekt..."
        optional
        questionNumber="2.9"
      />
    </div>
  );
}

/** Mieterstrom dimension details */
function MieterstromDetails({ data, updateData }: { data: SurveyData; updateData: StepProjectDetailsProps['updateData'] }) {
  return (
    <div className="space-y-6 pt-4 border-t">
      <h3 className="font-medium">Dimension des Mieterstrom-Projekts</h3>

      <TextQuestion
        id="mieterstrom-pv-size"
        label="Größe der PV-Anlage(n) in kW"
        type="number"
        value={data.mieterstromPvSizeKw}
        onChange={(val) => updateData("mieterstromPvSizeKw", val ? parseFloat(val) : undefined)}
        placeholder="z.B. 50"
        optional
        questionNumber="2.10"
      />

      <TextQuestion
        id="mieterstrom-party-count"
        label={data.mieterstromProjectType === 'multiple' ? "Gesamtanzahl der Parteien" : "Anzahl der Parteien, die Strom abnehmen"}
        type="number"
        value={data.mieterstromPartyCount}
        onChange={(val) => updateData("mieterstromPartyCount", val ? parseInt(val) : undefined)}
        placeholder="z.B. 24"
        optional
        questionNumber="2.11"
      />

      <SingleSelectQuestion
        id="mieterstrom-building-type"
        label="Art des Gebäudes"
        options={BUILDING_TYPE_OPTIONS}
        value={data.mieterstromBuildingType}
        onChange={(val) => updateData("mieterstromBuildingType", val)}
        questionNumber="2.12"
      />

      <TextQuestion
        id="mieterstrom-additional"
        label="Zusätzliche Informationen"
        type="textarea"
        value={data.mieterstromAdditionalInfo}
        onChange={(val) => updateData("mieterstromAdditionalInfo", val)}
        placeholder="Weitere Details zu Ihrem Projekt..."
        optional
        questionNumber="2.13"
      />
    </div>
  );
}
