import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { ConditionalCostFields } from "../questions/ConditionalCostFields";
import { getOptionsForQuestion, getLabelForQuestion, getQuestionById } from "@/data/surveySchema";

interface StepVnbMsbDetailsProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepVnbMsbDetails({ data, updateData }: StepVnbMsbDetailsProps) {
  const vnbOffersMsb = data.vnbMsbOffer === 'ja';
  const vnbDoesNotOfferMsb = data.vnbMsbOffer === 'nein_wmsb';
  const vnbRejectsCompletely = data.vnbMsbOffer === 'nein_gar_nicht';

  return (
    <div className="space-y-8">
      {vnbOffersMsb && (
        <>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">C8.1 Der VNB bietet Messstellenbetrieb an</h3>
            <p className="text-sm text-muted-foreground">Details zum Angebot Ihres VNB</p>
          </div>

          <SingleSelectQuestion
            id="vnb-start-timeline"
            label={getLabelForQuestion("vnbStartTimeline")}
            options={getOptionsForQuestion("vnbStartTimeline")}
            value={data.vnbStartTimeline}
            otherValue={data.vnbStartTimelineOther}
            onChange={(val) => updateData("vnbStartTimeline", val)}
            onOtherChange={(val) => updateData("vnbStartTimelineOther", val)}
          />

          <SingleSelectQuestion
            id="vnb-additional-costs"
            label={getLabelForQuestion("vnbAdditionalCosts")}
            options={getOptionsForQuestion("vnbAdditionalCosts")}
            value={data.vnbAdditionalCosts}
            onChange={(val) => updateData("vnbAdditionalCosts", val)}
          />

          {data.vnbAdditionalCosts === 'ja' && (
            <ConditionalCostFields
              oneTimeValue={data.vnbAdditionalCostsOneTime}
              yearlyValue={data.vnbAdditionalCostsYearly}
              onOneTimeChange={(val) => updateData("vnbAdditionalCostsOneTime", val)}
              onYearlyChange={(val) => updateData("vnbAdditionalCostsYearly", val)}
              idPrefix="vnb-costs"
            />
          )}

          <SingleSelectQuestion
            id="vnb-full-service"
            label={getLabelForQuestion("vnbFullService")}
            options={getOptionsForQuestion("vnbFullService")}
            value={data.vnbFullService}
            onChange={(val) => updateData("vnbFullService", val)}
          />

          <SingleSelectQuestion
            id="vnb-data-provision"
            label={getLabelForQuestion("vnbDataProvision")}
            options={getOptionsForQuestion("vnbDataProvision")}
            value={data.vnbDataProvision}
            otherValue={data.vnbDataProvisionOther}
            onChange={(val) => updateData("vnbDataProvision", val)}
            onOtherChange={(val) => updateData("vnbDataProvisionOther", val)}
          />

          <SingleSelectQuestion
            id="vnb-data-cost"
            label={getLabelForQuestion("vnbDataCost")}
            options={getOptionsForQuestion("vnbDataCost")}
            value={data.vnbDataCost}
            onChange={(val) => updateData("vnbDataCost", val)}
          />

          {data.vnbDataCost === 'mehr_3_eur' && (
            <TextQuestion
              id="vnb-data-cost-amount"
              label="Betrag in EUR/Messstelle/Jahr"
              type="number"
              value={data.vnbDataCostAmount}
              onChange={(val) => updateData("vnbDataCostAmount", val ? parseFloat(val) : undefined)}
              placeholder="z.B. 5"
              optional
            />
          )}

          <SingleSelectQuestion
            id="vnb-esa-cost"
            label={getLabelForQuestion("vnbEsaCost")}
            options={getOptionsForQuestion("vnbEsaCost")}
            value={data.vnbEsaCost}
            onChange={(val) => updateData("vnbEsaCost", val)}
          />

          {data.vnbEsaCost === 'mehr_3_eur' && (
            <TextQuestion
              id="vnb-esa-cost-amount"
              label="Betrag in EUR/Messstelle/Jahr"
              type="number"
              value={data.vnbEsaCostAmount}
              onChange={(val) => updateData("vnbEsaCostAmount", val ? parseFloat(val) : undefined)}
              placeholder="z.B. 5"
              optional
            />
          )}
        </>
      )}

      {vnbDoesNotOfferMsb && (
        <>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">C8.2a VNB bietet keinen eigenen Messstellenbetrieb</h3>
          </div>

          <SingleSelectQuestion
            id="vnb-msb-timeline"
            label={getLabelForQuestion("vnbMsbTimeline")}
            options={getOptionsForQuestion("vnbMsbTimeline")}
            value={data.vnbMsbTimeline}
            onChange={(val) => updateData("vnbMsbTimeline", val)}
          />
        </>
      )}

      {vnbRejectsCompletely && (
        <>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">C8.2b VNB lehnt Umsetzung ab</h3>
          </div>

          <SingleSelectQuestion
            id="vnb-rejection-timeline"
            label={getLabelForQuestion("vnbRejectionTimeline")}
            options={getOptionsForQuestion("vnbRejectionTimeline")}
            value={data.vnbRejectionTimeline}
            onChange={(val) => updateData("vnbRejectionTimeline", val)}
          />
        </>
      )}

      <SingleSelectQuestion
        id="vnb-wandlermessung"
        label={getLabelForQuestion("vnbWandlermessung")}
        description={getQuestionById("vnbWandlermessung")?.description}
        options={getOptionsForQuestion("vnbWandlermessung")}
        value={data.vnbWandlermessung}
        onChange={(val) => updateData("vnbWandlermessung", val)}
      />

      {data.vnbWandlermessung && (
        <TextQuestion
          id="vnb-wandlermessung-comment"
          label={getLabelForQuestion("vnbWandlermessungComment")}
          type="textarea"
          value={data.vnbWandlermessungComment}
          onChange={(val) => updateData("vnbWandlermessungComment", val)}
          placeholder="Weitere Details..."
          optional
        />
      )}

      <SingleSelectQuestion
        id="vnb-planning-duration"
        label={getLabelForQuestion("vnbPlanningDuration")}
        options={getOptionsForQuestion("vnbPlanningDuration")}
        value={data.vnbPlanningDuration}
        onChange={(val) => updateData("vnbPlanningDuration", val)}
      />

      <TextQuestion
        id="vnb-planning-duration-reasons"
        label={getLabelForQuestion("vnbPlanningDurationReasons")}
        type="textarea"
        value={data.vnbPlanningDurationReasons}
        onChange={(val) => updateData("vnbPlanningDurationReasons", val)}
        placeholder="Beschreiben Sie die Gründe..."
        optional
      />
    </div>
  );
}
