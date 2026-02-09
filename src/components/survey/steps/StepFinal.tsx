import { SurveyData } from "@/types/survey";
import { TextQuestion } from "../questions/TextQuestion";
import { NpsQuestion } from "../questions/NpsQuestion";
import { FileUpload } from "../questions/FileUpload";
import { getLabelForQuestion } from "@/data/surveySchema";

interface StepFinalProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
}

export function StepFinal({ data, updateData, uploadedDocuments, setUploadedDocuments }: StepFinalProps) {
  return (
    <div className="space-y-8">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Abschluss</h3>
        <p className="text-sm text-muted-foreground">
          Vielen Dank, dass Sie sich die Zeit nehmen! Ihre Erfahrungen helfen uns, die Transparenz zu verbessern.
        </p>
      </div>

      <TextQuestion
        id="helpful-info-sources"
        label={getLabelForQuestion("helpfulInfoSources")}
        type="textarea"
        value={data.helpfulInfoSources}
        onChange={(val) => updateData("helpfulInfoSources", val)}
        placeholder="z.B. Webseiten, Beratungsstellen, Netzwerke, Verbände..."
        optional
      />

      <TextQuestion
        id="additional-experiences"
        label={getLabelForQuestion("additionalExperiences")}
        type="textarea"
        value={data.additionalExperiences}
        onChange={(val) => updateData("additionalExperiences", val)}
        placeholder="Ihre Erfahrungen..."
        optional
      />

      <FileUpload
        id="documents"
        label={getLabelForQuestion("uploadedDocuments")}
        description="z.B. Korrespondenz mit VNB, Messkonzepte, Rechnungen (max. 5 Dateien)"
        value={uploadedDocuments}
        onChange={setUploadedDocuments}
      />

      <TextQuestion
        id="survey-improvements"
        label={getLabelForQuestion("surveyImprovements")}
        type="textarea"
        value={data.surveyImprovements}
        onChange={(val) => updateData("surveyImprovements", val)}
        placeholder="Ihr Feedback zur Umfrage..."
        optional
      />

      <NpsQuestion
        id="nps"
        label={getLabelForQuestion("npsScore")}
        value={data.npsScore}
        onChange={(val) => updateData("npsScore", val)}
        optional
      />
    </div>
  );
}
