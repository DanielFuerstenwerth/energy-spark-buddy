import { SurveyData } from "@/types/survey";
import { TextQuestion } from "../questions/TextQuestion";
import { NpsQuestion } from "../questions/NpsQuestion";
import { FileUpload } from "../questions/FileUpload";

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

      {/* P1.8: Removed D10/D11/D12 prefixes - numbering comes from UI */}
      <TextQuestion
        id="helpful-info-sources"
        label="Welche Informationsquellen fanden Sie besonders hilfreich bei der Suche nach Informationen?"
        type="textarea"
        value={data.helpfulInfoSources}
        onChange={(val) => updateData("helpfulInfoSources", val)}
        placeholder="z.B. Webseiten, Beratungsstellen, Netzwerke, Verbände..."
        optional
      />

      <TextQuestion
        id="additional-experiences"
        label="Welche Erfahrungen möchten Sie noch teilen?"
        type="textarea"
        value={data.additionalExperiences}
        onChange={(val) => updateData("additionalExperiences", val)}
        placeholder="Ihre Erfahrungen..."
        optional
      />

      <FileUpload
        id="documents"
        label="Möglichkeit zum Hochladen von Dokumenten"
        description="z.B. Korrespondenz mit VNB, Messkonzepte, Rechnungen (max. 5 Dateien)"
        value={uploadedDocuments}
        onChange={setUploadedDocuments}
      />

      <TextQuestion
        id="survey-improvements"
        label="Haben Sie Verbesserungsvorschläge für diese Umfrage?"
        type="textarea"
        value={data.surveyImprovements}
        onChange={(val) => updateData("surveyImprovements", val)}
        placeholder="Ihr Feedback zur Umfrage..."
        optional
      />

      <NpsQuestion
        id="nps"
        label="Wie wahrscheinlich ist es, dass Sie Anderen die Umsetzung von GGV/Mieterstrom empfehlen würden?"
        value={data.npsScore}
        onChange={(val) => updateData("npsScore", val)}
        optional
      />
    </div>
  );
}
