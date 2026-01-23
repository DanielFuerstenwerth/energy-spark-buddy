import { SurveyData } from "@/types/survey";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";

const PLANNING_STATUS_OPTIONS = [
  { value: "info_sammeln", label: "Wir habe(n) grundsätzliches Interesse, sammeln derzeit Informationen" },
  { value: "planung_stockt_ggv", label: "Wir sind fortgeschritten in der Planung, aber es stockt mit der Umsetzung GGV/Mieterstrom" },
  { value: "planung_stockt_pv", label: "Wir sind fortgeschritten in der Planung, aber es stockt mit der Installation der PV-Anlage" },
  { value: "planung_fast_fertig", label: "Wir sind fast fertig mit der Planung" },
  { value: "pv_laeuft_ggv_planung", label: "Die PV-Anlage läuft schon, aber die GGV/Mieterstrom ist noch in Planung" },
  { value: "pv_laeuft_ggv_laeuft", label: "Die PV-Anlage läuft bereits mit GGV/Mieterstrom" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const GGV_DECISION_OPTIONS = [
  { value: "sicher_ggv", label: "Wir sind sicher - es wird/ist GGV" },
  { value: "unsicher", label: "Wir sind unsicher - es fehlen noch Informationen für eine Entscheidung" },
  { value: "sicher_mieterstrom", label: "Wir sind sicher - es wird/ist Mieterstrom" },
];

const GGV_REASONS_OPTIONS = [
  { value: "buerokratie_mieterstrom", label: "Wegen der bürokratischen Herausforderungen bei Mieterstrom" },
  { value: "reststrom_pflicht", label: "Wegen der Pflicht zum Einkauf von Reststrom bei Mieterstrom" },
  { value: "ladesaeulen_waermepumpen", label: "Weil die Einbindung von Ladesäulen/Wärmepumpen einfacher ist" },
  { value: "vnb_empfehlung", label: "Weil unser VNB das empfiehlt" },
  { value: "finanziell_attraktiver", label: "Weil das finanziell attraktiver ist" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const MIETERSTROM_REASONS_OPTIONS = [
  { value: "einfacher_umsetzung", label: "Weil das in der Umsetzung einfacher zu sein scheint" },
  { value: "kein_dienstleister_ggv", label: "Weil wir für die GGV nicht den richtigen Dienstleister finden" },
  { value: "vnb_empfehlung", label: "Weil unser VNB das empfiehlt" },
  { value: "vnb_kann_ggv_nicht", label: "Weil der VNB die GGV nicht umsetzen kann" },
  { value: "finanziell_attraktiver", label: "Weil das finanziell attraktiver ist" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const IMPLEMENTATION_APPROACH_OPTIONS = [
  { value: "alleine", label: "Wir möchten möglichst viel alleine machen - inkl. der Abrechnung mit den Teilnehmenden" },
  { value: "dienstleister_ok", label: "Dienstleister sind OK, solange das preislich attraktiv ist" },
  { value: "dienstleister_alles", label: "Ideal wäre es, wenn sich ein Dienstleister um alles kümmert" },
];

interface StepPlanningStatusProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepPlanningStatus({ data, updateData }: StepPlanningStatusProps) {
  const showGgvReasons = data.ggvOrMieterstromDecision === 'sicher_ggv';
  const showMieterstromReasons = data.ggvOrMieterstromDecision === 'sicher_mieterstrom';

  return (
    <div className="space-y-8">
      <MultiSelectQuestion
        id="planning-status"
        label="B1. Wo stehen Sie aktuell mit dem Projekt?"
        description="Mehrfachauswahl möglich"
        options={PLANNING_STATUS_OPTIONS}
        value={data.planningStatus}
        otherValue={data.planningStatusOther}
        onChange={(val) => updateData("planningStatus", val)}
        onOtherChange={(val) => updateData("planningStatusOther", val)}
      />

      <SingleSelectQuestion
        id="ggv-decision"
        label="B2. Sind Sie bereits festgelegt auf GGV oder Mieterstrom?"
        options={GGV_DECISION_OPTIONS}
        value={data.ggvOrMieterstromDecision}
        onChange={(val) => updateData("ggvOrMieterstromDecision", val)}
        optional
      />

      {showGgvReasons && (
        <MultiSelectQuestion
          id="ggv-reasons"
          label="B3. Falls Sie derzeit eher zur GGV tendieren oder sich dafür entschlossen haben - warum?"
          options={GGV_REASONS_OPTIONS}
          value={data.ggvDecisionReasons}
          otherValue={data.ggvDecisionReasonsOther}
          onChange={(val) => updateData("ggvDecisionReasons", val)}
          onOtherChange={(val) => updateData("ggvDecisionReasonsOther", val)}
        />
      )}

      {showMieterstromReasons && (
        <MultiSelectQuestion
          id="mieterstrom-reasons"
          label="B4. Falls Sie derzeit eher zu Mieterstrom tendieren oder sich dafür entschlossen haben - warum?"
          options={MIETERSTROM_REASONS_OPTIONS}
          value={data.mieterstromDecisionReasons}
          otherValue={data.mieterstromDecisionReasonsOther}
          onChange={(val) => updateData("mieterstromDecisionReasons", val)}
          onOtherChange={(val) => updateData("mieterstromDecisionReasonsOther", val)}
        />
      )}

      <MultiSelectQuestion
        id="implementation-approach"
        label="B5. Wollen/wollten Sie das Projekt weitgehend alleine umsetzen, oder planen/planten Sie die Zusammenarbeit mit einem Dienstleister?"
        description="Über die Installation der PV-Anlage hinaus - Mehrfachauswahl möglich"
        options={IMPLEMENTATION_APPROACH_OPTIONS}
        value={data.implementationApproach}
        onChange={(val) => updateData("implementationApproach", val)}
        optional
      />
    </div>
  );
}
