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
      {showGgv && showGgvInOperation && (
        <div>
          <StepGgvOperation
            data={data}
            updateData={updateData}
            uploadedDocuments={uploadedDocuments}
            setUploadedDocuments={setUploadedDocuments}
          />
          <div className="mt-8 border-t pt-8">
            <StepServiceProvider data={data} updateData={updateData} />
          </div>
        </div>
      )}

      {showMieterstrom && showMieterstromInOperation && (
        <div className={(showGgv && showGgvInOperation) ? "border-t pt-8" : ""}>
          <StepMieterstromOperation
            data={data}
            updateData={updateData}
            uploadedDocuments={uploadedDocuments}
            setUploadedDocuments={setUploadedDocuments}
          />
        </div>
      )}
    </div>
  );
}
