import { SurveyData } from "@/types/survey";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { getOptionsForQuestion, getLabelForQuestion } from "@/data/surveySchema";

interface StepAboutYouProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepAboutYou({ data, updateData }: StepAboutYouProps) {
  return (
    <div className="space-y-8">
      <MultiSelectQuestion
        id="actor-types"
        label={getLabelForQuestion("actorTypes")}
        description="Mehrfachauswahl möglich"
        options={getOptionsForQuestion("actorTypes")}
        value={data.actorTypes}
        optionTextValues={data.actorTextFields}
        onChange={(val) => updateData("actorTypes", val)}
        onOptionTextChange={(optVal, text) => updateData("actorTextFields", { ...data.actorTextFields, [optVal]: text })}
        optional
      />

      <MultiSelectQuestion
        id="motivation"
        label={getLabelForQuestion("motivation")}
        description="Mehrfachauswahl möglich"
        options={getOptionsForQuestion("motivation")}
        value={data.motivation}
        otherValue={data.motivationOther}
        onChange={(val) => updateData("motivation", val)}
        onOtherChange={(val) => updateData("motivationOther", val)}
      />

      <MultiSelectQuestion
        id="project-types"
        label={getLabelForQuestion("projectTypes")}
        description="Mehrfachauswahl möglich"
        options={getOptionsForQuestion("projectTypes")}
        value={data.projectTypes}
        onChange={(val) => updateData("projectTypes", val)}
      />

      <TextQuestion
        id="contact-email"
        label={getLabelForQuestion("contactEmail")}
        type="email"
        value={data.contactEmail}
        onChange={(val) => updateData("contactEmail", val)}
        placeholder="ihre@email.de"
        optional
      />
    </div>
  );
}
