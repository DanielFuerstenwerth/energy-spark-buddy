import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { RatingQuestion } from "../questions/RatingQuestion";
import { getOptionsForQuestion, getLabelForQuestion, getQuestionById } from "@/data/surveySchema";

interface StepGgvSupportProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepGgvSupport({ data, updateData }: StepGgvSupportProps) {
  const supportRatingQ = getQuestionById("vnbSupportRating");

  return (
    <div className="space-y-8">
      <div className="space-y-6 pt-4 border-t">
        <h4 className="font-medium">C4. Stellt Ihr VNB konkrete Unterstützung für die massentaugliche Umsetzung der GGV online bereit?</h4>
        
        <SingleSelectQuestion
          id="vnb-support-messkonzept"
          label={getLabelForQuestion("vnbSupportMesskonzept")}
          options={getOptionsForQuestion("vnbSupportMesskonzept")}
          value={data.vnbSupportMesskonzept}
          otherValue={data.vnbSupportMesskonzeptOther}
          onChange={(val) => updateData("vnbSupportMesskonzept", val)}
          onOtherChange={(val) => updateData("vnbSupportMesskonzeptOther", val)}
          optional
          questionNumber="4.22"
          otherPlaceholder="https://..."
          otherHint="Gerne können Sie hier die Links zu den betreffenden Informationen eintragen"
        />

        <SingleSelectQuestion
          id="vnb-support-formulare"
          label={getLabelForQuestion("vnbSupportFormulare")}
          options={getOptionsForQuestion("vnbSupportFormulare")}
          value={data.vnbSupportFormulare}
          otherValue={data.vnbSupportFormulareOther}
          onChange={(val) => updateData("vnbSupportFormulare", val)}
          onOtherChange={(val) => updateData("vnbSupportFormulareOther", val)}
          optional
          questionNumber="4.23"
          otherPlaceholder="https://..."
          otherHint="Gerne können Sie hier die Links zu den betreffenden Informationen eintragen"
        />

        <SingleSelectQuestion
          id="vnb-support-portal"
          label={getLabelForQuestion("vnbSupportPortal")}
          options={getOptionsForQuestion("vnbSupportPortal")}
          value={typeof data.vnbSupportPortal === 'string' ? data.vnbSupportPortal : ''}
          otherValue={data.vnbSupportPortalOther}
          onChange={(val) => updateData("vnbSupportPortal", val as any)}
          onOtherChange={(val) => updateData("vnbSupportPortalOther", val)}
          optional
          questionNumber="4.24"
          otherPlaceholder="https://..."
          otherHint="Gerne können Sie hier die Links zu den betreffenden Informationen eintragen"
        />

        <TextQuestion
          id="vnb-support-other"
          label={getLabelForQuestion("vnbSupportOther")}
          value={data.vnbSupportOther}
          onChange={(val) => updateData("vnbSupportOther", val)}
          placeholder="Weitere Unterstützungsangebote..."
          optional
          questionNumber="4.25"
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
        questionNumber="4.26"
      />

      <SingleSelectQuestion
        id="vnb-personal-contacts"
        label={getLabelForQuestion("vnbPersonalContacts")}
        options={getOptionsForQuestion("vnbPersonalContacts")}
        value={data.vnbPersonalContacts}
        otherValue={data.vnbPersonalContactsOther}
        onChange={(val) => updateData("vnbPersonalContacts", val)}
        onOtherChange={(val) => updateData("vnbPersonalContactsOther", val)}
        questionNumber="4.27"
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
        questionNumber="4.28"
      />
    </div>
  );
}
