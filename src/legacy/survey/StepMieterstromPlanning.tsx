import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { RatingQuestion } from "../questions/RatingQuestion";
import { FileUpload } from "../questions/FileUpload";
import { getOptionsForQuestion, getLabelForQuestion, getQuestionById } from "@/data/surveySchema";

interface StepMieterstromPlanningProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
}

export function StepMieterstromPlanning({ data, updateData, uploadedDocuments, setUploadedDocuments }: StepMieterstromPlanningProps) {
  const supportRatingQ = getQuestionById("mieterstromSupportRating");

  return (
    <div className="space-y-8">
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2">Detaillierte Fragen zu Mieterstrom</h3>
        <p className="text-sm text-muted-foreground">
          Dieser Abschnitt behandelt Ihre Erfahrungen mit Mieterstrom-Projekten.
        </p>
      </div>

      <SingleSelectQuestion
        id="mieterstrom-summenzaehler"
        label={getLabelForQuestion("mieterstromSummenzaehler")}
        options={getOptionsForQuestion("mieterstromSummenzaehler")}
        value={data.mieterstromSummenzaehler}
        onChange={(val) => updateData("mieterstromSummenzaehler", val)}
        questionNumber="6.1"
      />

      <SingleSelectQuestion
        id="mieterstrom-existing-projects"
        label={getLabelForQuestion("mieterstromExistingProjects")}
        options={getOptionsForQuestion("mieterstromExistingProjects")}
        value={data.mieterstromExistingProjects}
        onChange={(val) => updateData("mieterstromExistingProjects", val)}
        questionNumber="6.2"
      />

      <SingleSelectQuestion
        id="mieterstrom-existing-projects-virtuell"
        label={getLabelForQuestion("mieterstromExistingProjectsVirtuell")}
        options={getOptionsForQuestion("mieterstromExistingProjectsVirtuell")}
        value={data.mieterstromExistingProjectsVirtuell}
        onChange={(val) => updateData("mieterstromExistingProjectsVirtuell", val)}
        questionNumber="6.3"
      />

      <MultiSelectQuestion
        id="mieterstrom-vnb-contact"
        label={getLabelForQuestion("mieterstromVnbContact")}
        description="Mehrfachauswahl möglich"
        options={getOptionsForQuestion("mieterstromVnbContact")}
        value={Array.isArray(data.mieterstromVnbContact) ? data.mieterstromVnbContact : data.mieterstromVnbContact ? [data.mieterstromVnbContact] : []}
        otherValue={data.mieterstromVnbContactOther}
        onChange={(val) => updateData("mieterstromVnbContact" as any, val)}
        onOtherChange={(val) => updateData("mieterstromVnbContactOther", val)}
        optional
        questionNumber="6.4"
      />

      {/* Korrektur: mieterstromVirtuellAllowed always visible (not only when summenzaehler='virtuell') */}
      <SingleSelectQuestion
        id="mieterstrom-virtuell-allowed"
        label={getLabelForQuestion("mieterstromVirtuellAllowed")}
        options={getOptionsForQuestion("mieterstromVirtuellAllowed")}
        value={data.mieterstromVirtuellAllowed}
        onChange={(val) => updateData("mieterstromVirtuellAllowed", val)}
        questionNumber="6.5"
      />

      {/* Korrektur: Show denied reason when mieterstromVirtuellAllowed = 'nein' */}
      {data.mieterstromVirtuellAllowed === 'nein' && (
        <>
          <TextQuestion
            id="mieterstrom-virtuell-denied-reason"
            label={getLabelForQuestion("mieterstromVirtuellDeniedReason")}
            type="textarea"
            value={data.mieterstromVirtuellDeniedReason}
            onChange={(val) => updateData("mieterstromVirtuellDeniedReason", val)}
            placeholder="Bitte beschreiben Sie die Gründe..."
            optional
            questionNumber="6.6"
          />
          <FileUpload
            id="mieterstrom-virtuell-denied-docs"
            label="Dokumente zum virtuellen Summenzähler hochladen"
            description="z.B. Korrespondenz mit VNB, Ablehnungsschreiben"
            value={data.mieterstromVirtuellDeniedDocuments || []}
            onChange={(docs) => updateData("mieterstromVirtuellDeniedDocuments", docs)}
            questionNumber="6.7"
          />
        </>
      )}

      {/* Korrektur: Show wandlermessung when mieterstromVirtuellAllowed = 'ja' */}
      {data.mieterstromVirtuellAllowed === 'ja' && (
        <>
          <SingleSelectQuestion
            id="mieterstrom-virtuell-wandlermessung"
            label={getLabelForQuestion("mieterstromVirtuellWandlermessung")}
            options={getOptionsForQuestion("mieterstromVirtuellWandlermessung")}
            value={data.mieterstromVirtuellWandlermessung}
            otherValue={data.mieterstromVirtuellWandlermessungComment}
            onChange={(val) => updateData("mieterstromVirtuellWandlermessung", val)}
            onOtherChange={(val) => updateData("mieterstromVirtuellWandlermessungComment", val)}
            questionNumber="6.8"
          />
          {data.mieterstromVirtuellWandlermessung === 'ja' && (
            <FileUpload
              id="mieterstrom-virtuell-wandlermessung-docs"
              label="Dokumente zur Wandlermessung hochladen"
              description="z.B. Messkonzept, Korrespondenz"
              value={data.mieterstromVirtuellWandlermessungDocuments || []}
              onChange={(docs) => updateData("mieterstromVirtuellWandlermessungDocuments", docs)}
              questionNumber="6.9"
            />
          )}
        </>
      )}

      <MultiSelectQuestion
        id="mieterstrom-vnb-response"
        label={getLabelForQuestion("mieterstromVnbResponse")}
        options={getOptionsForQuestion("mieterstromVnbResponse")}
        value={data.mieterstromVnbResponse || []}
        onChange={(val) => updateData("mieterstromVnbResponse", val)}
        optional
        questionNumber="6.10"
      />

      {data.mieterstromVnbResponse?.includes('nicht_moeglich') && (
        <>
          <TextQuestion
            id="mieterstrom-vnb-response-reasons"
            label="Gründe für die Ablehnung"
            type="textarea"
            value={data.mieterstromVnbResponseReasons}
            onChange={(val) => updateData("mieterstromVnbResponseReasons", val)}
            placeholder="Beschreiben Sie die Gründe..."
            optional
            questionNumber="6.11"
          />
          <FileUpload
            id="mieterstrom-rejection-docs"
            label="Möglichkeit zum Hochladen von Dokumenten"
            description="z.B. Korrespondenz mit dem VNB, Ablehnungsschreiben"
            value={uploadedDocuments}
            onChange={setUploadedDocuments}
            questionNumber="6.12"
          />
        </>
      )}

      <RatingQuestion
        id="mieterstrom-support-rating"
        label={getLabelForQuestion("mieterstromSupportRating")}
        value={data.mieterstromSupportRating}
        onChange={(val) => updateData("mieterstromSupportRating", val)}
        minLabel={supportRatingQ?.minLabel || "Unser VNB will das eigentlich lieber verhindern"}
        maxLabel={supportRatingQ?.maxLabel || "Unser VNB möchte das wirklich mit uns umsetzen"}
        min={supportRatingQ?.min || 1}
        max={supportRatingQ?.max || 10}
        questionNumber="6.13"
      />
    </div>
  );
}
