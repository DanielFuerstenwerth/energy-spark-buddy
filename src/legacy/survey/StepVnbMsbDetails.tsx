import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { FileUpload } from "../questions/FileUpload";
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
            questionNumber="4.5"
          />

          <SingleSelectQuestion
            id="vnb-additional-costs"
            label={getLabelForQuestion("vnbAdditionalCosts")}
            options={getOptionsForQuestion("vnbAdditionalCosts")}
            value={data.vnbAdditionalCosts}
            onChange={(val) => updateData("vnbAdditionalCosts", val)}
            questionNumber="4.6"
          />

          {data.vnbAdditionalCosts === 'ja' && (
            <ConditionalCostFields
              oneTimeValue={data.vnbAdditionalCostsOneTime}
              yearlyValue={data.vnbAdditionalCostsYearly}
              onOneTimeChange={(val) => updateData("vnbAdditionalCostsOneTime", val)}
              onYearlyChange={(val) => updateData("vnbAdditionalCostsYearly", val)}
              idPrefix="vnb-costs"
              oneTimeQuestionNumber="4.7"
              yearlyQuestionNumber="4.8"
            />
          )}

          <SingleSelectQuestion
            id="vnb-full-service"
            label={getLabelForQuestion("vnbFullService")}
            options={getOptionsForQuestion("vnbFullService")}
            value={data.vnbFullService}
            onChange={(val) => updateData("vnbFullService", val)}
            questionNumber="4.9"
          />

          <MultiSelectQuestion
            id="vnb-data-provision"
            label={getLabelForQuestion("vnbDataProvision")}
            description="Mehrfachauswahl möglich"
            options={getOptionsForQuestion("vnbDataProvision")}
            value={data.vnbDataProvision || []}
            otherValue={data.vnbDataProvisionOther}
            onChange={(val) => updateData("vnbDataProvision", val)}
            onOtherChange={(val) => updateData("vnbDataProvisionOther", val)}
            questionNumber="4.10"
          />

          <SingleSelectQuestion
            id="vnb-data-cost"
            label={getLabelForQuestion("vnbDataCost")}
            options={getOptionsForQuestion("vnbDataCost")}
            value={data.vnbDataCost}
            onChange={(val) => updateData("vnbDataCost", val)}
            questionNumber="4.11"
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
              questionNumber="4.12"
            />
          )}

          <SingleSelectQuestion
            id="vnb-esa-cost"
            label={getLabelForQuestion("vnbEsaCost")}
            options={getOptionsForQuestion("vnbEsaCost")}
            value={data.vnbEsaCost}
            onChange={(val) => updateData("vnbEsaCost", val)}
            questionNumber="4.13"
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
              questionNumber="4.14"
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
            questionNumber="4.15"
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
            questionNumber="4.16"
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
        questionNumber="4.17"
      />

      {/* Korrektur: Show comment only when vnbWandlermessung = 'ja' or 'wissen_nicht' */}
      {(data.vnbWandlermessung === 'ja' || data.vnbWandlermessung === 'wissen_nicht') && (
        <>
          <TextQuestion
            id="vnb-wandlermessung-comment"
            label={getLabelForQuestion("vnbWandlermessungComment")}
            type="textarea"
            value={data.vnbWandlermessungComment}
            onChange={(val) => updateData("vnbWandlermessungComment", val)}
            placeholder="Weitere Details..."
            optional
            questionNumber="4.18"
          />
          {/* Korrektur: Upload for Wandlermessung documents */}
          <FileUpload
            id="vnb-wandlermessung-docs"
            label="Dokumente zur Wandlermessung hochladen"
            description="z.B. Messkonzept, Korrespondenz mit VNB"
            value={data.vnbWandlermessungDocuments || []}
            onChange={(docs) => updateData("vnbWandlermessungDocuments", docs)}
            questionNumber="4.19"
          />
        </>
      )}

      <SingleSelectQuestion
        id="vnb-planning-duration"
        label={getLabelForQuestion("vnbPlanningDuration")}
        options={getOptionsForQuestion("vnbPlanningDuration")}
        value={data.vnbPlanningDuration}
        onChange={(val) => updateData("vnbPlanningDuration", val)}
        questionNumber="4.20"
      />

      <TextQuestion
        id="vnb-planning-duration-reasons"
        label={getLabelForQuestion("vnbPlanningDurationReasons")}
        type="textarea"
        value={data.vnbPlanningDurationReasons}
        onChange={(val) => updateData("vnbPlanningDurationReasons", val)}
        placeholder="Beschreiben Sie die Gründe..."
        optional
        questionNumber="4.21"
      />
    </div>
  );
}
