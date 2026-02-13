import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { ConditionalCostFields } from "../questions/ConditionalCostFields";
import { getOptionsForQuestion, getLabelForQuestion } from "@/data/surveySchema";

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
        label={getLabelForQuestion("mieterstromFullService")}
        options={getOptionsForQuestion("mieterstromFullService")}
        value={data.mieterstromFullService}
        onChange={(val) => updateData("mieterstromFullService", val)}
        questionNumber="6.14"
      />

      <SingleSelectQuestion
        id="mieterstrom-msb-costs"
        label={getLabelForQuestion("mieterstromMsbCosts")}
        options={getOptionsForQuestion("mieterstromMsbCosts")}
        value={data.mieterstromMsbCosts}
        otherValue={data.mieterstromMsbCostsOther}
        onChange={(val) => updateData("mieterstromMsbCosts", val)}
        onOtherChange={(val) => updateData("mieterstromMsbCostsOther", val)}
        questionNumber="6.15"
      />

      {data.mieterstromMsbCosts === 'ja' && (
        <ConditionalCostFields
          oneTimeValue={data.mieterstromMsbCostsOneTime}
          yearlyValue={data.mieterstromMsbCostsYearly}
          onOneTimeChange={(val) => updateData("mieterstromMsbCostsOneTime", val)}
          onYearlyChange={(val) => updateData("mieterstromMsbCostsYearly", val)}
          idPrefix="mieterstrom-msb-costs"
          oneTimeQuestionNumber="6.16"
          yearlyQuestionNumber="6.17"
        />
      )}

      <SingleSelectQuestion
        id="mieterstrom-model-choice"
        label={getLabelForQuestion("mieterstromModelChoice")}
        options={getOptionsForQuestion("mieterstromModelChoice")}
        value={data.mieterstromModelChoice}
        onChange={(val) => updateData("mieterstromModelChoice", val)}
        questionNumber="6.18"
      />

      <SingleSelectQuestion
        id="mieterstrom-data-provision"
        label={getLabelForQuestion("mieterstromDataProvision")}
        options={getOptionsForQuestion("mieterstromDataProvision")}
        value={data.mieterstromDataProvision}
        onChange={(val) => updateData("mieterstromDataProvision", val)}
        questionNumber="6.19"
      />
    </div>
  );
}
