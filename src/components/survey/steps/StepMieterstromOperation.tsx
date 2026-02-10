import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { RatingQuestion } from "../questions/RatingQuestion";
import { FileUpload } from "../questions/FileUpload";
import { getOptionsForQuestion, getLabelForQuestion, getQuestionById } from "@/data/surveySchema";

interface StepMieterstromOperationProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
}

export function StepMieterstromOperation({ data, updateData, uploadedDocuments, setUploadedDocuments }: StepMieterstromOperationProps) {
  const showGmsbDetails = data.mieterstromMsbProvider === 'gmsb';
  const satisfactionQ = getQuestionById("mieterstromOperationSatisfaction");

  return (
    <div className="space-y-8">
      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <h3 className="font-medium mb-2 text-green-800 dark:text-green-200">Mieterstrom bereits in Betrieb</h3>
        <p className="text-sm text-green-700 dark:text-green-300">
          Vielen Dank, dass Sie Mieterstrom bereits umsetzen! Ihre Erfahrungen helfen anderen bei der Planung.
        </p>
      </div>

      <SingleSelectQuestion
        id="mieterstrom-vnb-role"
        label={getLabelForQuestion("mieterstromVnbRole")}
        options={getOptionsForQuestion("mieterstromVnbRole")}
        value={data.mieterstromVnbRole}
        onChange={(val) => updateData("mieterstromVnbRole", val)}
      />

      <SingleSelectQuestion
        id="mieterstrom-vnb-duration"
        label={getLabelForQuestion("mieterstromVnbDuration")}
        options={getOptionsForQuestion("mieterstromVnbDuration")}
        value={data.mieterstromVnbDuration}
        onChange={(val) => updateData("mieterstromVnbDuration", val)}
      />

      <TextQuestion
        id="mieterstrom-vnb-duration-reasons"
        label="Falls es lange dauerte: Was war das große Problem?"
        type="textarea"
        value={data.mieterstromVnbDurationReasons}
        onChange={(val) => updateData("mieterstromVnbDurationReasons", val)}
        placeholder="Beschreiben Sie die Gründe..."
        optional
      />

      <SingleSelectQuestion
        id="mieterstrom-wandlermessung"
        label={getLabelForQuestion("mieterstromWandlermessung")}
        options={getOptionsForQuestion("mieterstromWandlermessung")}
        value={data.mieterstromWandlermessung}
        otherValue={data.mieterstromWandlermessungComment}
        onChange={(val) => updateData("mieterstromWandlermessung", val)}
        onOtherChange={(val) => updateData("mieterstromWandlermessungComment", val)}
      />

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium">MB4. Wer ist der Messstellenbetreiber und wer übermittelt Ihnen die Daten?</h4>
        
        <SingleSelectQuestion
          id="mieterstrom-msb-provider"
          label={getLabelForQuestion("mieterstromMsbProvider")}
          options={getOptionsForQuestion("mieterstromMsbProvider")}
          value={data.mieterstromMsbProvider}
          onChange={(val) => updateData("mieterstromMsbProvider", val)}
        />

        <SingleSelectQuestion
          id="mieterstrom-data-provider"
          label={getLabelForQuestion("mieterstromDataProvider")}
          options={getOptionsForQuestion("mieterstromDataProvider")}
          value={data.mieterstromDataProvider}
          otherValue={data.mieterstromDataProviderOther}
          onChange={(val) => updateData("mieterstromDataProvider", val)}
          onOtherChange={(val) => updateData("mieterstromDataProviderOther", val)}
        />
      </div>

      {showGmsbDetails && (
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium">MB5. Details zum gMSB</h4>
          
          <SingleSelectQuestion
            id="mieterstrom-msb-install-duration"
            label={getLabelForQuestion("mieterstromMsbInstallDuration")}
            options={getOptionsForQuestion("mieterstromMsbInstallDuration")}
            value={data.mieterstromMsbInstallDuration}
            onChange={(val) => updateData("mieterstromMsbInstallDuration", val)}
          />

          <SingleSelectQuestion
            id="mieterstrom-operation-costs"
            label={getLabelForQuestion("mieterstromOperationCosts")}
            options={getOptionsForQuestion("mieterstromOperationCosts")}
            value={data.mieterstromOperationCosts}
            onChange={(val) => updateData("mieterstromOperationCosts", val)}
          />

          {data.mieterstromOperationCosts === 'ja' && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="grid grid-cols-2 gap-4">
                <TextQuestion
                  id="mieterstrom-operation-costs-one-time"
                  label="Einmalbetrag (EUR)"
                  type="number"
                  value={data.mieterstromOperationCostsOneTime}
                  onChange={(val) => updateData("mieterstromOperationCostsOneTime", val ? parseFloat(val) : undefined)}
                  placeholder="z.B. 500"
                  optional
                />
                <TextQuestion
                  id="mieterstrom-operation-costs-yearly"
                  label="Jährlicher Betrag (EUR)"
                  type="number"
                  value={data.mieterstromOperationCostsYearly}
                  onChange={(val) => updateData("mieterstromOperationCostsYearly", val ? parseFloat(val) : undefined)}
                  placeholder="z.B. 100"
                  optional
                />
              </div>
              <FileUpload
                id="mieterstrom-costs-docs"
                label="Option zum Hochladen der Rechnung"
                description="Falls Sie die Rechnung teilen möchten"
                value={uploadedDocuments}
                onChange={setUploadedDocuments}
              />
            </div>
          )}
        </div>
      )}

      <RatingQuestion
        id="mieterstrom-operation-satisfaction"
        label={getLabelForQuestion("mieterstromOperationSatisfaction")}
        value={data.mieterstromOperationSatisfaction}
        onChange={(val) => updateData("mieterstromOperationSatisfaction", val)}
        minLabel={satisfactionQ?.minLabel || "bremst aktiv"}
        maxLabel={satisfactionQ?.maxLabel || "unterstützt aktiv"}
        min={satisfactionQ?.min || 1}
        max={satisfactionQ?.max || 10}
      />

      <MultiSelectQuestion
        id="mieterstrom-rejection-response"
        label={getLabelForQuestion("mieterstromRejectionResponse")}
        options={getOptionsForQuestion("mieterstromRejectionResponse")}
        value={data.mieterstromRejectionResponse || []}
        otherValue={data.mieterstromRejectionResponseOther}
        onChange={(val) => updateData("mieterstromRejectionResponse", val)}
        onOtherChange={(val) => updateData("mieterstromRejectionResponseOther", val)}
        optional
      />

      <TextQuestion
        id="mieterstrom-info-sources"
        label={getLabelForQuestion("mieterstromInfoSources")}
        type="textarea"
        value={data.mieterstromInfoSources}
        onChange={(val) => updateData("mieterstromInfoSources", val)}
        placeholder="z.B. Webseiten, Beratungsstellen, Netzwerke..."
        optional
      />

      <TextQuestion
        id="mieterstrom-experiences"
        label={getLabelForQuestion("mieterstromExperiences")}
        type="textarea"
        value={data.mieterstromExperiences}
        onChange={(val) => updateData("mieterstromExperiences", val)}
        placeholder="Ihre Erfahrungen..."
        optional
      />

      <FileUpload
        id="mieterstrom-documents"
        label="Möglichkeit zum Hochladen von Dokumenten"
        description="z.B. Korrespondenz mit VNB, Messkonzepte, Rechnungen"
        value={uploadedDocuments}
        onChange={setUploadedDocuments}
      />

    </div>
  );
}
