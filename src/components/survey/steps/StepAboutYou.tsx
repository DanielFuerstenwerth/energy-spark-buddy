import { SurveyData } from "@/types/survey";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { getOptionsForQuestion, getLabelForQuestion } from "@/data/surveySchema";
import { Callout } from "@/components/ui/callout";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface StepAboutYouProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepAboutYou({ data, updateData }: StepAboutYouProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="space-y-8">
      <Callout variant="info">
        <p className="font-medium mb-1">Hinweis zur Datennutzung</p>
        <p>
          Ihre Antworten werden für eine Bewertung und den Vergleich der Verteilnetzbetreiber auf{" "}
          <a href="https://www.vnb-transparenz.de" target="_blank" rel="noopener noreferrer" className="underline font-medium">vnb-transparenz.de</a>{" "}
          genutzt. <strong>Freitextantworten werden nicht veröffentlicht</strong>, können aber anonymisiert als Excel an berechtigte Anliegenträger weitergegeben werden.
        </p>
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs mt-2 text-accent hover:underline cursor-pointer">
            <ChevronDown className={`h-3 w-3 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
            {detailsOpen ? "Weniger anzeigen" : "Alle Details anzeigen"}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 text-xs space-y-1.5 text-muted-foreground">
            <p>Die Plattform wird frei verfügbar sein und die Option eines Excel-Downloads beinhalten.</p>
            <p>Die Antworten in den Freitextfeldern werden nicht veröffentlicht, werden aber anonym (d.h. ohne E-Mail-Adressen) als Excel-Datenbank vom BBEn berechtigten Anliegenträgern (z.B. Wissenschaft, Energieagenturen) auf Anfrage zur Verfügung gestellt.</p>
            <p>GGV-Projekte werden zusätzlich auf der Plattform <a href="https://www.ggv-transparenz.de" target="_blank" rel="noopener noreferrer" className="underline">ggv-transparenz.de</a> dargestellt.</p>
            <p>Sollten Sie Feedback geben wollen, welches nicht veröffentlicht werden soll, wenden Sie sich bitte per E-Mail an{" "}
              <a href="mailto:vnb-transparenz@1000gw.de" className="underline">vnb-transparenz@1000gw.de</a>.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </Callout>

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
        questionNumber="1.1"
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
        questionNumber="1.2"
      />

      <TextQuestion
        id="contact-email"
        label={getLabelForQuestion("contactEmail")}
        type="email"
        value={data.contactEmail}
        onChange={(val) => updateData("contactEmail", val)}
        placeholder="ihre@email.de"
        optional
        questionNumber="1.3"
      />

      <SingleSelectQuestion
        id="confirmation-for-update"
        label={getLabelForQuestion("confirmationForUpdate")}
        options={getOptionsForQuestion("confirmationForUpdate")}
        value={data.confirmationForUpdate}
        onChange={(val) => updateData("confirmationForUpdate", val)}
        optional
        questionNumber="1.4"
      />
    </div>
  );
}
