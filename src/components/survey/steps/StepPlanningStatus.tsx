import { SurveyData } from "@/types/survey";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { getOptionsForQuestion, getLabelForQuestion, getQuestionById } from "@/data/surveySchema";

interface StepPlanningStatusProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepPlanningStatus({ data, updateData }: StepPlanningStatusProps) {
  const showGgvReasons = data.ggvOrMieterstromDecision === 'sicher_ggv';
  const showMieterstromReasons = data.ggvOrMieterstromDecision === 'sicher_mieterstrom';

  const handlePlanningStatusChange = (val: string) => {
    updateData("planningStatus", [val]);
  };

  return (
    <div className="space-y-8">
      <SingleSelectQuestion
        id="planning-status"
        label={getLabelForQuestion("planningStatus")}
        options={getOptionsForQuestion("planningStatus")}
        value={data.planningStatus[0] || undefined}
        otherValue={data.planningStatusOther}
        onChange={handlePlanningStatusChange}
        onOtherChange={(val) => updateData("planningStatusOther", val)}
      />

      <SingleSelectQuestion
        id="ggv-decision"
        label={getLabelForQuestion("ggvOrMieterstromDecision")}
        options={getOptionsForQuestion("ggvOrMieterstromDecision")}
        value={data.ggvOrMieterstromDecision}
        onChange={(val) => updateData("ggvOrMieterstromDecision", val)}
        optional
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
      />
    </div>
  );
}
