import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { RatingQuestion } from "../questions/RatingQuestion";
import { FileUpload } from "../questions/FileUpload";
import { getOptionsForQuestion, getLabelForQuestion, getQuestionById } from "@/data/surveySchema";

interface StepGgvOperationProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
}

export function StepGgvOperation({ data, updateData, uploadedDocuments, setUploadedDocuments }: StepGgvOperationProps) {
  const satisfactionQ = getQuestionById("operationSatisfactionRating");

  return (
    <div className="space-y-8">
      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <h3 className="font-medium mb-2 text-green-800 dark:text-green-200">GGV bereits in Betrieb</h3>
        <p className="text-sm text-green-700 dark:text-green-300">
          Vielen Dank, dass Sie die GGV bereits umsetzen! Ihre Erfahrungen helfen anderen bei der Planung.
        </p>
      </div>

      <SingleSelectQuestion
        id="operation-vnb-duration"
        label={getLabelForQuestion("operationVnbDuration")}
        options={getOptionsForQuestion("operationVnbDuration")}
        value={data.operationVnbDuration}
        onChange={(val) => updateData("operationVnbDuration", val)}
      />

      <TextQuestion
        id="operation-vnb-duration-reasons"
        label={getLabelForQuestion("operationVnbDurationReasons")}
        type="textarea"
        value={data.operationVnbDurationReasons}
        onChange={(val) => updateData("operationVnbDurationReasons", val)}
        placeholder="Beschreiben Sie die Gründe..."
        optional
      />

      <SingleSelectQuestion
        id="operation-wandlermessung"
        label={getLabelForQuestion("operationWandlermessung")}
        options={getOptionsForQuestion("operationWandlermessung")}
        value={data.operationWandlermessung}
        onChange={(val) => updateData("operationWandlermessung", val)}
      />

      {/* Korrektur: operationWandlermessungComment only when = 'ja' */}
      {data.operationWandlermessung === 'ja' && (
        <TextQuestion
          id="operation-wandlermessung-comment"
          label={getLabelForQuestion("operationWandlermessungComment")}
          type="textarea"
          value={data.operationWandlermessungComment}
          onChange={(val) => updateData("operationWandlermessungComment", val)}
          placeholder="Weitere Details..."
          optional
        />
      )}

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium">D2. Wer ist der Messstellenbetreiber und wie erhalten Sie die Daten?</h4>
        
        <SingleSelectQuestion
          id="operation-msb-provider"
          label={getLabelForQuestion("operationMsbProvider")}
          options={getOptionsForQuestion("operationMsbProvider")}
          value={data.operationMsbProvider}
          onChange={(val) => updateData("operationMsbProvider", val)}
        />

        <SingleSelectQuestion
          id="operation-allocation-provider"
          label={getLabelForQuestion("operationAllocationProvider")}
          options={getOptionsForQuestion("operationAllocationProvider")}
          value={data.operationAllocationProvider}
          otherValue={data.operationDataProviderOther}
          onChange={(val) => updateData("operationAllocationProvider", val)}
          onOtherChange={(val) => updateData("operationDataProviderOther", val)}
        />

        <SingleSelectQuestion
          id="operation-data-provider"
          label={getLabelForQuestion("operationDataProvider")}
          options={getOptionsForQuestion("operationDataProvider")}
          value={data.operationDataProvider}
          onChange={(val) => updateData("operationDataProvider", val)}
        />
      </div>

      {/* Korrektur: D3 only when operationMsbProvider = 'gmsb' */}
      {data.operationMsbProvider === 'gmsb' && (
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium">D3. Details zum gMSB (Grundzuständiger Messstellenbetreiber)</h4>
          
          <SingleSelectQuestion
            id="operation-msb-duration"
            label={getLabelForQuestion("operationMsbDuration")}
            options={getOptionsForQuestion("operationMsbDuration")}
            value={data.operationMsbDuration}
            onChange={(val) => updateData("operationMsbDuration", val)}
          />

          <SingleSelectQuestion
            id="operation-msb-additional-costs"
            label={getLabelForQuestion("operationMsbAdditionalCosts")}
            options={getOptionsForQuestion("operationMsbAdditionalCosts")}
            value={data.operationMsbAdditionalCosts}
            onChange={(val) => updateData("operationMsbAdditionalCosts", val)}
          />

          {data.operationMsbAdditionalCosts === 'ja' && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="grid grid-cols-2 gap-4">
                <TextQuestion
                  id="operation-msb-costs-one-time"
                  label="Einmalbetrag (EUR)"
                  type="number"
                  value={data.operationMsbAdditionalCostsOneTime}
                  onChange={(val) => updateData("operationMsbAdditionalCostsOneTime", val ? parseFloat(val) : undefined)}
                  placeholder="z.B. 500"
                  optional
                />
                <TextQuestion
                  id="operation-msb-costs-yearly"
                  label="Jährlicher Betrag (EUR)"
                  type="number"
                  value={data.operationMsbAdditionalCostsYearly}
                  onChange={(val) => updateData("operationMsbAdditionalCostsYearly", val ? parseFloat(val) : undefined)}
                  placeholder="z.B. 100"
                  optional
                />
              </div>
              <FileUpload
                id="operation-costs-docs"
                label="Option zum Hochladen der Rechnung"
                description="Falls Sie die Rechnung teilen möchten"
                value={uploadedDocuments}
                onChange={setUploadedDocuments}
              />
            </div>
          )}
        </div>
      )}

      {/* Korrektur: operationAllocationWho GELÖSCHT */}

      {/* Korrektur: D5/D6 only when operationDataProvider = 'gmsb' */}
      {data.operationDataProvider === 'gmsb' && (
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium">D5. Datenübermittlung</h4>
          
          <SingleSelectQuestion
            id="operation-data-format"
            label={getLabelForQuestion("operationDataFormat")}
            options={getOptionsForQuestion("operationDataFormat")}
            value={data.operationDataFormat}
            otherValue={data.operationDataFormatOther}
            onChange={(val) => updateData("operationDataFormat", val)}
            onOtherChange={(val) => updateData("operationDataFormatOther", val)}
          />

          <SingleSelectQuestion
            id="operation-data-cost"
            label={getLabelForQuestion("operationDataCost")}
            description={getQuestionById("operationDataCost")?.description}
            options={getOptionsForQuestion("operationDataCost")}
            value={data.operationDataCost}
            onChange={(val) => updateData("operationDataCost", val)}
          />

          {data.operationDataCost === 'mehr_3_eur' && (
            <TextQuestion
              id="operation-data-cost-amount"
              label="Betrag in EUR/Messstelle/Jahr"
              type="number"
              value={data.operationDataCostAmount}
              onChange={(val) => updateData("operationDataCostAmount", val ? parseFloat(val) : undefined)}
              placeholder="z.B. 5"
              optional
            />
          )}

          <SingleSelectQuestion
            id="operation-esa-cost"
            label={getLabelForQuestion("operationEsaCost")}
            options={getOptionsForQuestion("operationEsaCost")}
            value={data.operationEsaCost}
            onChange={(val) => updateData("operationEsaCost", val)}
          />

          {data.operationEsaCost === 'mehr_3_eur' && (
            <TextQuestion
              id="operation-esa-cost-amount"
              label="Betrag in EUR/Messstelle/Jahr"
              type="number"
              value={data.operationEsaCostAmount}
              onChange={(val) => updateData("operationEsaCostAmount", val ? parseFloat(val) : undefined)}
              placeholder="z.B. 5"
              optional
            />
          )}
        </div>
      )}

      <RatingQuestion
        id="operation-satisfaction-rating"
        label={getLabelForQuestion("operationSatisfactionRating")}
        value={data.operationSatisfactionRating}
        onChange={(val) => updateData("operationSatisfactionRating", val)}
        minLabel={satisfactionQ?.minLabel || "Unser VNB will das eigentlich lieber verhindern"}
        maxLabel={satisfactionQ?.maxLabel || "Unser VNB möchte das wirklich mit uns umsetzen"}
        min={satisfactionQ?.min || 1}
        max={satisfactionQ?.max || 10}
      />
    </div>
  );
}
