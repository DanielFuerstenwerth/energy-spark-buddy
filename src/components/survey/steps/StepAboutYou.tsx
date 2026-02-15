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
      {/* === OPTION C: Kompakter Callout === */}
      <div className="rounded-md border border-border bg-muted/50 px-4 py-3">
        <p className="font-semibold text-foreground mb-1">Hinweis zur Datennutzung</p>
        <p className="text-sm text-foreground/80">
          Ihre Antworten werden für eine Bewertung der Verteilnetzbetreiber auf{" "}
          <a href="https://www.vnb-transparenz.de" target="_blank" rel="noopener noreferrer" className="underline font-medium">vnb-transparenz.de</a>{" "}
          genutzt. Freitextantworten werden nicht veröffentlicht, können aber anonymisiert als Excel an berechtigte Anliegenträger weitergegeben werden.
        </p>
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs mt-2 text-muted-foreground hover:text-foreground hover:underline cursor-pointer">
            <ChevronDown className={`h-3 w-3 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
            {detailsOpen ? "Weniger anzeigen" : "Mehr erfahren"}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 text-sm space-y-2 text-foreground">
            <p>Das Bündnis Bürgerenergie (BBEn) wird die gesamten Antworten inkl. der Freitextfelder anonym (d.h. ohne E-Mail-Adressen) als Excel-Datenbank an berechtigte Anliegenträger (z.B. Wissenschaft, Energieagenturen) auf Anfrage zur Verfügung stellen.</p>
            <p>Alle GGV-Projekte werden zusätzlich auf einer Deutschlandkarte auf der Seite{" "}
              <a href="https://www.ggv-transparenz.de" target="_blank" rel="noopener noreferrer" className="underline font-medium">ggv-transparenz.de</a>{" "}
              dargestellt.
            </p>
            <p>Sollten Sie Feedback zu Ihrem Verteilnetzbetreiber geben wollen, welches nicht veröffentlicht werden soll, wenden Sie sich bitte per E-Mail an{" "}
              <a href="mailto:vnb-transparenz@1000gw.de" className="underline font-medium">vnb-transparenz@1000gw.de</a>.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </div>

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
