import { SurveyData } from "@/types/survey";
import { StepPlanningStatus } from "./StepPlanningStatus";
import { StepChallenges } from "./StepChallenges";

interface StepPlanningGeneralProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepPlanningGeneral({ data, updateData }: StepPlanningGeneralProps) {
  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-lg font-semibold mb-4">Planungsstand</h3>
        <StepPlanningStatus data={data} updateData={updateData} />
      </div>

      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold mb-4">Herausforderungen</h3>
        <StepChallenges data={data} updateData={updateData} />
      </div>
    </div>
  );
}
