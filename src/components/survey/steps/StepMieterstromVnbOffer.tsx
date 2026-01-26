import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { ConditionalCostFields } from "../questions/ConditionalCostFields";

const FULL_SERVICE_OPTIONS = [
  { value: "nur_full_service", label: "Unser Stadtwerk/VNB bietet den Messstellenbetrieb nur in Kombination mit einem Full-Service-Angebot an - also inkl. der Stromlieferung durch das Stadtwerk" },
  { value: "auch_ohne", label: "Unser Stadtwerk/VNB bietet dies auch ohne Stromlieferverträge an" },
];

const MSB_COSTS_OPTIONS = [
  { value: "wissen_nicht", label: "Wissen wir nicht" },
  { value: "nein", label: "Nein, unser VNB/gMSB verlangt hier keine Zusatzkosten" },
  { value: "ja", label: "Ja, unser VNB/gMSB verlangt dafür Zusatzkosten" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const MODEL_CHOICE_OPTIONS = [
  { value: "virtuell", label: "Einen 'virtuellen Summenzähler' mit Smart Metern - die Installation einer Wandlermessung am Hausanschluss ('physikalischer Summenzähler' für >5.000 EUR) bleibt uns damit erspart" },
  { value: "physikalisch", label: "Ein sogenanntes 'physikalisches Summenzählermodell' (erfordert einen 'physikalischen Summenzähler')" },
];

const DATA_PROVISION_OPTIONS = [
  { value: "direkt_guenstig", label: "Der VNB/gMSB stellt uns die Daten direkt zur Verfügung (Excel-Listen, Online-Portal o.ä.) - für weniger (oder gleich) 3 EUR/Messstelle/Jahr" },
  { value: "direkt_teuer", label: "Der VNB/gMSB stellt uns die Daten direkt zur Verfügung (Excel-Listen, Online-Portal o.ä.) - verlangt dafür mehr als 3 EUR/Messstelle/Jahr" },
  { value: "marktkommunikation", label: "Der VNB/gMSB stellt die Daten lediglich über die Marktkommunikation zur Verfügung, wir brauchen einen Dienstleister für das Abrufen der Daten" },
];

interface StepMieterstromVnbOfferProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepMieterstromVnbOffer({ data, updateData }: StepMieterstromVnbOfferProps) {
  return (
    <div className="space-y-8">
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2">MP1. Angebot des VNB/gMSB für Mieterstrom</h3>
        <p className="text-sm text-muted-foreground">
          Wenn der VNB anbietet, den Messstellenbetrieb im Mieterstrom zu übernehmen, was genau bietet er an?
        </p>
      </div>

      <SingleSelectQuestion
        id="mieterstrom-full-service"
        label="MP1a. Full-Service-Angebot"
        options={FULL_SERVICE_OPTIONS}
        value={data.mieterstromFullService}
        onChange={(val) => updateData("mieterstromFullService", val)}
      />

      <SingleSelectQuestion
        id="mieterstrom-msb-costs"
        label="MP1b. Stellt Ihr VNB/gMSB zusätzliche Kosten für einen 'Einbau auf Kundenwunsch' in Rechnung?"
        options={MSB_COSTS_OPTIONS}
        value={data.mieterstromMsbCosts}
        otherValue={data.mieterstromMsbCostsOther}
        onChange={(val) => updateData("mieterstromMsbCosts", val)}
        onOtherChange={(val) => updateData("mieterstromMsbCostsOther", val)}
      />

      {data.mieterstromMsbCosts === 'ja' && (
        <ConditionalCostFields
          oneTimeValue={data.mieterstromMsbCostsOneTime}
          yearlyValue={data.mieterstromMsbCostsYearly}
          onOneTimeChange={(val) => updateData("mieterstromMsbCostsOneTime", val)}
          onYearlyChange={(val) => updateData("mieterstromMsbCostsYearly", val)}
          idPrefix="mieterstrom-msb-costs"
        />
      )}

      <SingleSelectQuestion
        id="mieterstrom-model-choice"
        label="MP1c. Auswahl an Umsetzungsmodellen"
        options={MODEL_CHOICE_OPTIONS}
        value={data.mieterstromModelChoice}
        onChange={(val) => updateData("mieterstromModelChoice", val)}
      />

      <SingleSelectQuestion
        id="mieterstrom-data-provision"
        label="MP1d. Bereitstellung der Daten"
        options={DATA_PROVISION_OPTIONS}
        value={data.mieterstromDataProvision}
        onChange={(val) => updateData("mieterstromDataProvision", val)}
      />
    </div>
  );
}
