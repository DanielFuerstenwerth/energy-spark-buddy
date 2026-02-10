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

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium">C4. Stellt Ihr VNB konkrete Unterstützung für die massentaugliche Umsetzung der GGV online bereit?</h4>
        
        <TextQuestion
          id="vnb-support-messkonzept"
          label={getLabelForQuestion("vnbSupportMesskonzept")}
          value={data.vnbSupportMesskonzept}
          onChange={(val) => updateData("vnbSupportMesskonzept", val)}
          placeholder="https://..."
          optional
        />

        <TextQuestion
          id="vnb-support-formulare"
          label={getLabelForQuestion("vnbSupportFormulare")}
          value={data.vnbSupportFormulare}
          onChange={(val) => updateData("vnbSupportFormulare", val)}
          placeholder="https://..."
          optional
        />

        {/* Korrektur: vnbSupportPortal is now a text field (was single-select) */}
        <TextQuestion
          id="vnb-support-portal"
          label={getLabelForQuestion("vnbSupportPortal")}
          value={typeof data.vnbSupportPortal === 'string' ? data.vnbSupportPortal : ''}
          onChange={(val) => updateData("vnbSupportPortal", val as any)}
          placeholder="https://..."
          optional
        />

        <TextQuestion
          id="vnb-support-other"
          label={getLabelForQuestion("vnbSupportOther")}
          value={data.vnbSupportOther}
          onChange={(val) => updateData("vnbSupportOther", val)}
          placeholder="Weitere Unterstützungsangebote..."
          optional
        />
      </div>

      <SingleSelectQuestion
        id="vnb-contact-helpful"
        label={getLabelForQuestion("vnbContactHelpful")}
        options={getOptionsForQuestion("vnbContactHelpful")}
        value={data.vnbContactHelpful}
        otherValue={data.vnbContactHelpfulOther}
        onChange={(val) => updateData("vnbContactHelpful", val)}
        onOtherChange={(val) => updateData("vnbContactHelpfulOther", val)}
      />

      <SingleSelectQuestion
        id="vnb-personal-contacts"
        label={getLabelForQuestion("vnbPersonalContacts")}
        options={getOptionsForQuestion("vnbPersonalContacts")}
        value={data.vnbPersonalContacts}
        otherValue={data.vnbPersonalContactsOther}
        onChange={(val) => updateData("vnbPersonalContacts", val)}
        onOtherChange={(val) => updateData("vnbPersonalContactsOther", val)}
      />

      <RatingQuestion
        id="vnb-support-rating"
        label={getLabelForQuestion("vnbSupportRating")}
        value={data.vnbSupportRating}
        onChange={(val) => updateData("vnbSupportRating", val)}
        minLabel={supportRatingQ?.minLabel || "bremst aktiv"}
        maxLabel={supportRatingQ?.maxLabel || "unterstützt aktiv"}
        min={supportRatingQ?.min || 1}
        max={supportRatingQ?.max || 10}
      />

      <SingleSelectQuestion
        id="vnb-msb-offer"
        label={getLabelForQuestion("vnbMsbOffer")}
        options={getOptionsForQuestion("vnbMsbOffer")}
        value={data.vnbMsbOffer}
        onChange={(val) => updateData("vnbMsbOffer", val)}
      />
    </div>
  );
}
