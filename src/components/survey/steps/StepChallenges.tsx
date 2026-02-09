import { SurveyData } from "@/types/survey";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { getOptionsForQuestion, getLabelForQuestion } from "@/data/surveySchema";

interface StepChallengesProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepChallenges({ data, updateData }: StepChallengesProps) {
  return (
    <div className="space-y-8">
      <MultiSelectQuestion
        id="challenges"
        label={getLabelForQuestion("challenges")}
        description="Mehrfachauswahl möglich"
        options={getOptionsForQuestion("challenges")}
        value={data.challenges}
        optionTextValues={data.challengesDetails}
        onChange={(val) => updateData("challenges", val)}
        onOptionTextChange={(optVal, text) => updateData("challengesDetails", { ...data.challengesDetails, [optVal]: text })}
      />
    </div>
  );
}
