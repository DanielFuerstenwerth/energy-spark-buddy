import { SurveyData } from "@/types/survey";
import { TextQuestion } from "../questions/TextQuestion";
import { NpsQuestion } from "../questions/NpsQuestion";
import { FileUpload } from "../questions/FileUpload";
import { getLabelForQuestion } from "@/data/surveySchema";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface StepFinalProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
  dataUsageConfirmed: boolean;
  onDataUsageConfirmedChange: (val: boolean) => void;
}

export function StepFinal({ data, updateData, uploadedDocuments, setUploadedDocuments, dataUsageConfirmed, onDataUsageConfirmedChange }: StepFinalProps) {
  return (
    <div className="space-y-8">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Abschluss</h3>
        <p className="text-sm text-muted-foreground">
          Vielen Dank, dass Sie sich die Zeit nehmen! Ihre Erfahrungen helfen uns, die Transparenz zu verbessern.
        </p>
      </div>

      {/* Korrektur: helpfulInfoSources GELÖSCHT */}

      <TextQuestion
        id="additional-experiences"
        label={getLabelForQuestion("additionalExperiences")}
        type="textarea"
        value={data.additionalExperiences}
        onChange={(val) => updateData("additionalExperiences", val)}
        placeholder="Ihre Erfahrungen..."
        optional
        questionNumber="8.1"
      />

      <FileUpload
        id="documents"
        label={getLabelForQuestion("documentUpload")}
        description="z.B. Korrespondenz mit VNB, Messkonzepte, Rechnungen (max. 5 Dateien)"
        value={uploadedDocuments}
        onChange={setUploadedDocuments}
        questionNumber="8.2"
      />

      <TextQuestion
        id="survey-improvements"
        label={getLabelForQuestion("surveyImprovements")}
        type="textarea"
        value={data.surveyImprovements}
        onChange={(val) => updateData("surveyImprovements", val)}
        placeholder="Ihr Feedback zur Umfrage..."
        optional
        questionNumber="8.3"
      />

      <NpsQuestion
        id="nps"
        label={getLabelForQuestion("npsScore")}
        value={data.npsScore}
        onChange={(val) => updateData("npsScore", val)}
        optional
        questionNumber="8.4"
      />
      <div className="border-t pt-6 mt-8">
        <div className="flex items-start gap-3">
          <Checkbox
            id="data-usage-confirmed"
            checked={dataUsageConfirmed}
            onCheckedChange={(checked) => onDataUsageConfirmedChange(checked === true)}
            className="mt-0.5"
          />
          <Label htmlFor="data-usage-confirmed" className="text-sm leading-relaxed cursor-pointer">
            Ich habe zur Kenntnis genommen, dass meine Antworten für die Bewertung von Verteilnetzbetreibern genutzt und als Excel-Daten an berechtigte Anliegenträger weitergegeben werden können.
          </Label>
        </div>
      </div>
    </div>
  );
}
