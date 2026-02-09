import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { SurveyVnbCombobox } from "../questions/SurveyVnbCombobox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Users } from "lucide-react";

const BUILDING_TYPE_OPTIONS = [
  { value: "wohngebaeude", label: "Wohngebäude" },
  { value: "gewerbe", label: "Gewerbegebäude" },
  { value: "gemischt", label: "Gemischt" },
];

interface StepProjectDetailsProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  globalData?: SurveyData;
}

export function StepProjectDetails({ data, updateData, globalData }: StepProjectDetailsProps) {
  // Use globalData for project type detection if available, fall back to data
  const projectTypes = globalData?.projectTypes ?? data.projectTypes;
  const hasGgv = projectTypes.includes('ggv') || projectTypes.includes('ggv_oder_mieterstrom');
  const hasMieterstrom = projectTypes.includes('mieterstrom') || projectTypes.includes('ggv_oder_mieterstrom');
  const hasEnergySharing = projectTypes.includes('energysharing');
  const onlyEnergySharing = hasEnergySharing && !hasGgv && !hasMieterstrom;

  if (onlyEnergySharing) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Sie haben nur Energy Sharing ausgewählt. Die Fragen zu GGV/Mieterstrom entfallen.
        </p>
        <SurveyVnbCombobox
          id="vnb-name"
          label="Welcher Verteilnetzbetreiber ist für Ihr Projekt zuständig?"
          description="Suchen oder geben Sie den Namen Ihres VNB ein"
          value={data.vnbName}
          onChange={(val) => updateData("vnbName", val)}
          optional
        />
        <div className="grid gap-4 md:grid-cols-2">
          <TextQuestion
            id="project-address"
            label="Adresse des Projekts"
            value={data.projectAddress}
            onChange={(val) => updateData("projectAddress", val)}
            placeholder="z.B. Musterstraße 1, Berlin"
            optional
          />
          <TextQuestion
            id="project-plz"
            label="PLZ"
            value={data.projectPlz}
            onChange={(val) => updateData("projectPlz", val)}
            placeholder="z.B. 10115"
            optional
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-medium">Wählen Sie den Schwerpunkt, zu dem Sie Details teilen möchten:</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { id: 'ggv', title: 'GGV', desc: 'Gemeinschaftliche Gebäudeversorgung', icon: Building2, enabled: hasGgv },
            { id: 'mieterstrom', title: 'Mieterstrom', desc: 'Mieterstrom-Modelle', icon: Home, enabled: hasMieterstrom },
            { id: 'energysharing', title: 'Energy Sharing', desc: 'Gemeinschaftliche Nutzung', icon: Users, enabled: hasEnergySharing },
          ].filter(o => o.enabled).map((option) => (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all hover:shadow-md ${data.projectFocus === option.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}
              onClick={() => updateData("projectFocus", option.id as 'ggv' | 'mieterstrom' | 'energysharing')}
            >
              <CardHeader className="text-center pb-2">
                <option.icon className="w-10 h-10 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">{option.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{option.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <SurveyVnbCombobox
        id="vnb-name"
        label="Welcher Verteilnetzbetreiber ist für Ihr Projekt zuständig?"
        description="Suchen oder geben Sie den Namen Ihres VNB ein"
        value={data.vnbName}
        onChange={(val) => updateData("vnbName", val)}
        optional
      />

      <div className="grid gap-4 md:grid-cols-2">
        <TextQuestion
          id="project-address"
          label="Adresse des Projekts"
          value={data.projectAddress}
          onChange={(val) => updateData("projectAddress", val)}
          placeholder="z.B. Musterstraße 1, Berlin"
          optional
        />
        <TextQuestion
          id="project-plz"
          label="PLZ"
          value={data.projectPlz}
          onChange={(val) => updateData("projectPlz", val)}
          placeholder="z.B. 10115"
          optional
        />
      </div>

      {/* GGV Project Details */}
      {data.projectFocus === 'ggv' && (
        <div className="space-y-6 pt-4 border-t">
          <h3 className="font-medium">Welche Dimension hat das angestrebte oder umgesetzte GGV-Projekt?</h3>
          
          <SingleSelectQuestion
            id="ggv-type"
            label="Projektumfang"
            options={[
              { value: 'single', label: 'Ein einzelnes Projekt' },
              { value: 'multiple', label: 'Mehrere Projekte' },
            ]}
            value={data.ggvProjectType}
            onChange={(val) => updateData("ggvProjectType", val as 'single' | 'multiple')}
          />

          {data.ggvProjectType === 'single' && (
            <>
              <TextQuestion
                id="ggv-pv-size"
                label="Größe der PV-Anlage in kW"
                type="number"
                value={data.ggvPvSizeKw}
                onChange={(val) => updateData("ggvPvSizeKw", val ? parseFloat(val) : undefined)}
                placeholder="z.B. 30"
                optional
              />
              <TextQuestion
                id="ggv-party-count"
                label="Anzahl der Parteien, die Strom abnehmen"
                type="number"
                value={data.ggvPartyCount}
                onChange={(val) => updateData("ggvPartyCount", val ? parseInt(val) : undefined)}
                placeholder="z.B. 12"
                optional
              />
              <SingleSelectQuestion
                id="ggv-building-type"
                label="Art des Gebäudes"
                options={BUILDING_TYPE_OPTIONS}
                value={data.ggvBuildingType}
                onChange={(val) => updateData("ggvBuildingType", val)}
              />
            </>
          )}

          {data.ggvProjectType === 'multiple' && (
            <>
              <TextQuestion
                id="ggv-building-count"
                label="Gesamtzahl der Projekte"
                type="number"
                value={data.ggvBuildingCount}
                onChange={(val) => updateData("ggvBuildingCount", val ? parseInt(val) : undefined)}
                placeholder="z.B. 5"
                optional
              />
              <TextQuestion
                id="ggv-pv-size"
                label="Gesamte Größe der PV-Anlagen in kW"
                type="number"
                value={data.ggvPvSizeKw}
                onChange={(val) => updateData("ggvPvSizeKw", val ? parseFloat(val) : undefined)}
                placeholder="z.B. 150"
                optional
              />
              <TextQuestion
                id="ggv-party-count"
                label="Gesamtanzahl der Parteien, die Strom abnehmen"
                type="number"
                value={data.ggvPartyCount}
                onChange={(val) => updateData("ggvPartyCount", val ? parseInt(val) : undefined)}
                placeholder="z.B. 60"
                optional
              />
              <SingleSelectQuestion
                id="ggv-building-type"
                label="Art der Gebäude"
                options={BUILDING_TYPE_OPTIONS}
                value={data.ggvBuildingType}
                onChange={(val) => updateData("ggvBuildingType", val)}
              />
            </>
          )}

          <TextQuestion
            id="ggv-additional"
            label="Zusätzliche Informationen"
            type="textarea"
            value={data.ggvAdditionalInfo}
            onChange={(val) => updateData("ggvAdditionalInfo", val)}
            placeholder="Weitere Details zu Ihrem Projekt..."
            optional
          />
        </div>
      )}

      {/* Mieterstrom Project Details */}
      {data.projectFocus === 'mieterstrom' && (
        <div className="space-y-6 pt-4 border-t">
          <h3 className="font-medium">Welche Dimension hat das angestrebte oder umgesetzte Mieterstrom-Projekt?</h3>
          
          <SingleSelectQuestion
            id="mieterstrom-type"
            label="Projektumfang"
            options={[
              { value: 'single', label: 'Ein einzelnes Projekt' },
              { value: 'multiple', label: 'Mehrere Projekte' },
            ]}
            value={data.mieterstromProjectType}
            onChange={(val) => updateData("mieterstromProjectType", val)}
          />

          <TextQuestion
            id="mieterstrom-pv-size"
            label="Größe der PV-Anlage(n) in kW"
            type="number"
            value={data.mieterstromPvSizeKw}
            onChange={(val) => updateData("mieterstromPvSizeKw", val ? parseFloat(val) : undefined)}
            placeholder="z.B. 50"
            optional
          />

          <TextQuestion
            id="mieterstrom-party-count"
            label="Anzahl der Mietparteien"
            type="number"
            value={data.mieterstromPartyCount}
            onChange={(val) => updateData("mieterstromPartyCount", val ? parseInt(val) : undefined)}
            placeholder="z.B. 24"
            optional
          />

          <SingleSelectQuestion
            id="mieterstrom-building-type"
            label="Art des Gebäudes"
            options={BUILDING_TYPE_OPTIONS}
            value={data.mieterstromBuildingType}
            onChange={(val) => updateData("mieterstromBuildingType", val)}
          />

          <TextQuestion
            id="mieterstrom-additional"
            label="Zusätzliche Informationen"
            type="textarea"
            value={data.mieterstromAdditionalInfo}
            onChange={(val) => updateData("mieterstromAdditionalInfo", val)}
            placeholder="Weitere Details zu Ihrem Projekt..."
            optional
          />
        </div>
      )}
    </div>
  );
}
