import { SurveyData } from "@/types/survey";
import { StepGgvOperation } from "./StepGgvOperation";
import { StepServiceProvider } from "./StepServiceProvider";
import { StepMieterstromOperation } from "./StepMieterstromOperation";

interface StepOperationModelProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
  showGgv: boolean;
  showGgvInOperation: boolean;
  showMieterstrom: boolean;
  showMieterstromInOperation: boolean;
}

export function StepOperationModel({
  data,
  updateData,
  uploadedDocuments,
  setUploadedDocuments,
  showGgv,
  showGgvInOperation,
  showMieterstrom,
  showMieterstromInOperation,
}: StepOperationModelProps) {
  return (
    <div className="space-y-10">
      {showGgv && (
        <div>
          {showGgvInOperation && (
            <StepGgvOperation
              data={data}
              updateData={updateData}
              uploadedDocuments={uploadedDocuments}
              setUploadedDocuments={setUploadedDocuments}
            />
          )}
          <div className={showGgvInOperation ? "mt-8 border-t pt-8" : ""}>
            <StepServiceProvider data={data} updateData={updateData} />
          </div>
        </div>
      )}

      {showMieterstrom && showMieterstromInOperation && (
        <div className={showGgv ? "border-t pt-8" : ""}>
          <StepMieterstromOperation
            data={data}
            updateData={updateData}
            uploadedDocuments={uploadedDocuments}
            setUploadedDocuments={setUploadedDocuments}
          />
        </div>
      )}

      {!showGgv && !showMieterstromInOperation && showMieterstrom && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Dieser Abschnitt wird relevant, sobald Ihr Mieterstrom-Projekt in Betrieb ist.
          </p>
        </div>
      )}
    </div>
  );
}
