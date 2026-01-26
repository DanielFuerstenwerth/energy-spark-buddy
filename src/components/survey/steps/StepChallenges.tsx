import { SurveyData } from "@/types/survey";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";

const CHALLENGE_OPTIONS = [
  { value: "keine", label: "Nein, alles läuft gut", exclusive: true }, // P0.3: marked as exclusive
  { value: "pv_installation", label: "Technische Probleme mit der Installation der PV-Anlage", hasTextField: true, textFieldLabel: "Was war das Problem?", textFieldPlaceholder: "Beschreiben Sie die Probleme..." },
  { value: "vnb_blockiert", label: "Der VNB lässt die Umsetzung von GGV / Mieterstrom nicht zu", hasTextField: true, textFieldLabel: "Gründe des VNB", textFieldPlaceholder: "Welche Gründe wurden genannt?" },
  { value: "kosten_zu_hoch", label: "Die Kosten für die Umsetzung der GGV / Mieterstrom sind zu hoch", hasTextField: true, textFieldLabel: "Details zu den Kosten", textFieldPlaceholder: "Welche Kosten sind zu hoch?" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true, textFieldLabel: "Andere Herausforderungen", textFieldPlaceholder: "Beschreiben Sie weitere Herausforderungen..." },
];

interface StepChallengesProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepChallenges({ data, updateData }: StepChallengesProps) {
  return (
    <div className="space-y-8">
      <MultiSelectQuestion
        id="challenges"
        label="B6. Gab oder gibt es wesentliche Herausforderungen?"
        description="Mehrfachauswahl möglich"
        options={CHALLENGE_OPTIONS}
        value={data.challenges}
        optionTextValues={data.challengesDetails}
        onChange={(val) => updateData("challenges", val)}
        onOptionTextChange={(optVal, text) => updateData("challengesDetails", { ...data.challengesDetails, [optVal]: text })}
      />
    </div>
  );
}
