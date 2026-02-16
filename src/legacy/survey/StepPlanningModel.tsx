import { SurveyData } from "@/types/survey";
import { StepVnbPlanningGgv } from "./StepVnbPlanningGgv";
import { StepVnbMsbDetails } from "./StepVnbMsbDetails";
import { StepGgvSupport } from "./StepGgvSupport";
import { StepMieterstromPlanning } from "./StepMieterstromPlanning";
import { StepMieterstromVnbOffer } from "./StepMieterstromVnbOffer";
import { StepEnergySharing } from "./StepEnergySharing";

interface StepPlanningModelProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
  showGgv: boolean;
  showMieterstrom: boolean;
  showEnergySharing: boolean;
}

export function StepPlanningModel({
  data,
  updateData,
  uploadedDocuments,
  setUploadedDocuments,
  showGgv,
  showMieterstrom,
  showEnergySharing,
}: StepPlanningModelProps) {
  const showMsbDetails = showGgv && !!data.vnbResponse;
  const showMieterstromVnbOffer = showMieterstrom && data.mieterstromVnbResponse?.includes('moeglich_gmsb');

  return (
    <div className="space-y-10">
      {showGgv && (
        <div>
          <StepVnbPlanningGgv
            data={data}
            updateData={updateData}
            uploadedDocuments={uploadedDocuments}
            setUploadedDocuments={setUploadedDocuments}
          />
          {showMsbDetails && (
            <div className="mt-8 border-t pt-8">
              <StepVnbMsbDetails data={data} updateData={updateData} />
            </div>
          )}
          <div className="mt-8">
            <StepGgvSupport data={data} updateData={updateData} />
          </div>
        </div>
      )}

      {showMieterstrom && (
        <div className={showGgv ? "border-t pt-8" : ""}>
          <StepMieterstromPlanning
            data={data}
            updateData={updateData}
            uploadedDocuments={uploadedDocuments}
            setUploadedDocuments={setUploadedDocuments}
          />
          {showMieterstromVnbOffer && (
            <div className="mt-8 border-t pt-8">
              <StepMieterstromVnbOffer data={data} updateData={updateData} />
            </div>
          )}
        </div>
      )}

      {showEnergySharing && (
        <div className={(showGgv || showMieterstrom) ? "border-t pt-8" : ""}>
          <StepEnergySharing data={data} updateData={updateData} />
        </div>
      )}
    </div>
  );
}
