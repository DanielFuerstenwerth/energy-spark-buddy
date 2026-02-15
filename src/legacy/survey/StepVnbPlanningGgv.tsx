import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { RatingQuestion } from "../questions/RatingQuestion";
import { FileUpload } from "../questions/FileUpload";
import { getOptionsForQuestion, getLabelForQuestion, getQuestionById } from "@/data/surveySchema";

interface StepVnbPlanningGgvProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
}

export function StepVnbPlanningGgv({ data, updateData, uploadedDocuments, setUploadedDocuments }: StepVnbPlanningGgvProps) {
  const supportRatingQ = getQuestionById("vnbSupportRating");

  return (
    <div className="space-y-8">
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2">Detaillierte Fragen zur Planung zusammen mit dem VNB (GGV)</h3>
        <p className="text-sm text-muted-foreground">
          Dieser Abschnitt behandelt Ihre Erfahrungen mit dem Verteilnetzbetreiber bei der GGV-Planung.
        </p>
      </div>

      <SingleSelectQuestion
        id="vnb-existing-projects"
        label={getLabelForQuestion("vnbExistingProjects")}
        options={getOptionsForQuestion("vnbExistingProjects")}
        value={data.vnbExistingProjects}
        otherValue={data.vnbExistingProjectsOther}
        onChange={(val) => updateData("vnbExistingProjects", val)}
        onOtherChange={(val) => updateData("vnbExistingProjectsOther", val)}
        questionNumber="4.1"
      />

      {/* Korrektur: vnbContact is multi-select per schema */}
      <MultiSelectQuestion
        id="vnb-contact"
        label={getLabelForQuestion("vnbContact")}
        description="Mehrfachauswahl möglich"
        options={getOptionsForQuestion("vnbContact")}
        value={data.vnbContact}
        otherValue={data.vnbContactOther}
        onChange={(val) => updateData("vnbContact", val)}
        onOtherChange={(val) => updateData("vnbContactOther", val)}
        optional
        questionNumber="4.2"
      />

      <MultiSelectQuestion
        id="vnb-response"
        label={getLabelForQuestion("vnbResponse")}
        description="Mehrfachauswahl möglich"
        options={getOptionsForQuestion("vnbResponse")}
        value={data.vnbResponse}
        optionTextValues={data.challengesDetails}
        onChange={(val) => updateData("vnbResponse", val)}
        onOptionTextChange={(optVal, text) => updateData("challengesDetails", { ...data.challengesDetails, [optVal]: text })}
        optional
        questionNumber="4.3"
      />

      {data.vnbResponse?.includes('nicht_moeglich') && (
        <FileUpload
          id="vnb-rejection-docs"
          label="Möglichkeit zum Hochladen von Dokumenten"
          description="z.B. Korrespondenz mit dem VNB, Ablehnungsschreiben"
          value={uploadedDocuments}
          onChange={setUploadedDocuments}
        />
      )}

      <SingleSelectQuestion
        id="vnb-msb-offer"
        label={getLabelForQuestion("vnbMsbOffer")}
        options={getOptionsForQuestion("vnbMsbOffer")}
        value={data.vnbMsbOffer}
        onChange={(val) => updateData("vnbMsbOffer", val)}
        questionNumber="4.4"
      />
    </div>
  );
}
