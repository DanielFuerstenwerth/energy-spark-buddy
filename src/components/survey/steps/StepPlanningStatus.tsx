import { SurveyData } from "@/types/survey";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { getOptionsForQuestion, getLabelForQuestion, getQuestionById } from "@/data/surveySchema";

interface StepPlanningStatusProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepPlanningStatus({ data, updateData }: StepPlanningStatusProps) {
  // Determine visibility of #19/#20 based on #5 (projectTypes) only, not #18
  const projectTypes = data.projectTypes || [];
  const showGgvReasons = projectTypes.includes('ggv') || projectTypes.includes('ggv_oder_mieterstrom');
  const showMieterstromReasons = projectTypes.includes('mieterstrom') || projectTypes.includes('ggv_oder_mieterstrom');

  return (
    <div className="space-y-8">

      <SingleSelectQuestion
        id="ggv-decision"
        label={getLabelForQuestion("ggvOrMieterstromDecision")}
        options={getOptionsForQuestion("ggvOrMieterstromDecision")}
        value={data.ggvOrMieterstromDecision}
        onChange={(val) => updateData("ggvOrMieterstromDecision", val)}
        optional
        questionNumber="3.1"
      />

      {showGgvReasons && (
        <MultiSelectQuestion
          id="ggv-reasons"
          label={getLabelForQuestion("ggvDecisionReasons")}
          options={getOptionsForQuestion("ggvDecisionReasons")}
          value={data.ggvDecisionReasons}
          otherValue={data.ggvDecisionReasonsOther}
          onChange={(val) => updateData("ggvDecisionReasons", val)}
          onOtherChange={(val) => updateData("ggvDecisionReasonsOther", val)}
          questionNumber="3.2"
        />
      )}

      {showMieterstromReasons && (
        <MultiSelectQuestion
          id="mieterstrom-reasons"
          label={getLabelForQuestion("mieterstromDecisionReasons")}
          options={getOptionsForQuestion("mieterstromDecisionReasons")}
          value={data.mieterstromDecisionReasons}
          otherValue={data.mieterstromDecisionReasonsOther}
          onChange={(val) => updateData("mieterstromDecisionReasons", val)}
          onOtherChange={(val) => updateData("mieterstromDecisionReasonsOther", val)}
          questionNumber="3.3"
        />
      )}

      <MultiSelectQuestion
        id="implementation-approach"
        label={getLabelForQuestion("implementationApproach")}
        description={getQuestionById("implementationApproach")?.description}
        options={getOptionsForQuestion("implementationApproach")}
        value={data.implementationApproach}
        onChange={(val) => updateData("implementationApproach", val)}
        optional
        questionNumber="3.4"
      />
    </div>
  );
}
