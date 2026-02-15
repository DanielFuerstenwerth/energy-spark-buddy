/**
 * SurveyRenderer - Dynamic question renderer driven by surveySchema.ts (SSOT)
 * 
 * Renders questions from any SurveySection by mapping question types
 * to the appropriate UI components. No hardcoded step logic.
 */

import { SurveyData } from "@/types/survey";
import { SurveyQuestion, SurveySection, cleanLabel, QUESTION_REGISTRY } from "@/data/surveySchema";
import { evaluateRule } from "@/lib/visibilityRules";
import { MultiSelectQuestion } from "./questions/MultiSelectQuestion";
import { SingleSelectQuestion } from "./questions/SingleSelectQuestion";
import { TextQuestion } from "./questions/TextQuestion";
import { RatingQuestion } from "./questions/RatingQuestion";
import { NpsQuestion } from "./questions/NpsQuestion";
import { FileUpload } from "./questions/FileUpload";
import { SurveyVnbCombobox } from "./questions/SurveyVnbCombobox";
import { ProjectLocationRows, ProjectLocation } from "./questions/ProjectLocationRows";
import { ConditionalCostFields } from "./questions/ConditionalCostFields";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Info, ChevronDown } from "lucide-react";
import { useState } from "react";

interface SurveyRendererProps {
  sections: SurveySection[];
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
}

function getFieldValue(data: SurveyData, field: string): unknown {
  return (data as unknown as Record<string, unknown>)[field];
}

function isQuestionVisible(q: SurveyQuestion, data: SurveyData): boolean {
  if (q.visibilityRule) return evaluateRule(q.visibilityRule, data);
  return true;
}

/**
 * Check if a section should be visible based on data state.
 */
export function isSectionVisible(section: SurveySection, data: SurveyData): boolean {
  if (section.visibilityRule) return evaluateRule(section.visibilityRule, data);
  return true;
}

function getUiNumber(questionId: string): string | undefined {
  return QUESTION_REGISTRY[questionId]?.uiNumber;
}

function renderQuestion(
  q: SurveyQuestion,
  data: SurveyData,
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void,
  uploadedDocuments: string[],
  setUploadedDocuments: (docs: string[]) => void,
): React.ReactNode {
  const qId = q.id as keyof SurveyData;
  const uiNumber = getUiNumber(q.id);
  const label = cleanLabel(q.label);

  // Helper to get value safely
  const getValue = <T,>(field: string): T => getFieldValue(data, field) as T;
  const setValue = (field: string, value: unknown) => updateData(field as keyof SurveyData, value as SurveyData[keyof SurveyData]);

  switch (q.type) {
    case 'vnb-select':
      return (
        <SurveyVnbCombobox
          key={q.id}
          id={q.id}
          label={label}
          description={q.description}
          value={getValue<string>(q.id)}
          onChange={(v) => setValue(q.id, v)}
          optional={q.optional}
          questionNumber={uiNumber}
        />
      );

    case 'multi-select':
      return (
        <MultiSelectQuestion
          key={q.id}
          id={q.id}
          label={label}
          description={q.description}
          options={q.options || []}
          value={getValue<string[]>(q.id) || []}
          optionTextValues={getValue<Record<string, string>>(`${q.id}Details`) || getValue<Record<string, string>>('actorTextFields')}
          onChange={(v) => setValue(q.id, v)}
          onOptionTextChange={(optVal, text) => {
            const detailsKey = `${q.id}Details`;
            const existingDetails = getValue<Record<string, string>>(detailsKey) || {};
            // Special case: actorTypes uses actorTextFields
            if (q.id === 'actorTypes') {
              const existing = getValue<Record<string, string>>('actorTextFields') || {};
              setValue('actorTextFields', { ...existing, [optVal]: text });
            } else {
              setValue(detailsKey, { ...existingDetails, [optVal]: text });
            }
          }}
          optional={q.optional}
          questionNumber={uiNumber}
        />
      );

    case 'single-select':
      return (
        <SingleSelectQuestion
          key={q.id}
          id={q.id}
          label={label}
          description={q.description || q.helpText}
          options={q.options || []}
          value={getValue<string>(q.id)}
          otherValue={getValue<string>(`${q.id}Other`)}
          onChange={(v) => setValue(q.id, v)}
          onOtherChange={(v) => setValue(`${q.id}Other`, v)}
          optional={q.optional}
          questionNumber={uiNumber}
        />
      );

    case 'text':
      // Special case: projectLocations
      if (q.id === 'projectLocations') {
        return (
          <ProjectLocationRows
            key={q.id}
            locations={getValue<ProjectLocation[]>('projectLocations') || [{}]}
            onChange={(locs) => setValue('projectLocations', locs)}
            multiple={true}
            questionNumber={uiNumber}
            label={label}
          />
        );
      }
      return (
        <TextQuestion
          key={q.id}
          id={q.id}
          label={label}
          description={q.description}
          value={getValue<string>(q.id)}
          onChange={(v) => setValue(q.id, v)}
          placeholder={q.placeholder}
          type="text"
          optional={q.optional}
          questionNumber={uiNumber}
        />
      );

    case 'textarea':
      return (
        <TextQuestion
          key={q.id}
          id={q.id}
          label={label}
          description={q.description}
          value={getValue<string>(q.id)}
          onChange={(v) => setValue(q.id, v)}
          placeholder={q.placeholder}
          type="textarea"
          optional={q.optional}
          questionNumber={uiNumber}
        />
      );

    case 'email':
      return (
        <TextQuestion
          key={q.id}
          id={q.id}
          label={label}
          description={q.description}
          value={getValue<string>(q.id)}
          onChange={(v) => setValue(q.id, v)}
          placeholder={q.placeholder}
          type="email"
          optional={q.optional}
          questionNumber={uiNumber}
        />
      );

    case 'number':
      return (
        <TextQuestion
          key={q.id}
          id={q.id}
          label={label}
          description={q.description}
          value={getValue<number>(q.id)}
          onChange={(v) => {
            const num = v === '' ? undefined : parseFloat(v);
            setValue(q.id, num);
          }}
          placeholder={q.placeholder}
          type="number"
          optional={q.optional}
          questionNumber={uiNumber}
        />
      );

    case 'rating':
      // Use NPS component for 0-10 scales, Rating for 1-10
      if ((q.min ?? 1) === 0) {
        return (
          <NpsQuestion
            key={q.id}
            id={q.id}
            label={label}
            description={q.description}
            value={getValue<number>(q.id)}
            onChange={(v) => setValue(q.id, v)}
            optional={q.optional}
            questionNumber={uiNumber}
          />
        );
      }
      return (
        <RatingQuestion
          key={q.id}
          id={q.id}
          label={label}
          description={q.description}
          value={getValue<number>(q.id)}
          onChange={(v) => setValue(q.id, v)}
          min={q.min}
          max={q.max}
          minLabel={q.minLabel}
          maxLabel={q.maxLabel}
          optional={q.optional}
          questionNumber={uiNumber}
        />
      );

    case 'file':
      return (
        <FileUpload
          key={q.id}
          id={q.id}
          label={label}
          description={q.description}
          value={uploadedDocuments}
          onChange={setUploadedDocuments}
          optional={q.optional}
          questionNumber={uiNumber}
        />
      );

    case 'project-focus':
      // This is handled through projectTypes multi-select, skip rendering
      return null;

    default:
      return (
        <TextQuestion
          key={q.id}
          id={q.id}
          label={label}
          description={q.description}
          value={getValue<string>(q.id)}
          onChange={(v) => setValue(q.id, v)}
          placeholder={q.placeholder}
          optional={q.optional}
          questionNumber={uiNumber}
        />
      );
  }
}

interface SurveyRendererFullProps extends SurveyRendererProps {
  /** Show data usage notice at top of about section */
  showPrivacyNotice?: boolean;
  /** Data usage confirmation checkbox state */
  dataUsageConfirmed?: boolean;
  onDataUsageConfirmedChange?: (val: boolean) => void;
  /** Show the final confirmation checkbox */
  showDataUsageCheckbox?: boolean;
}

function PrivacyNotice() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  return (
    <div className="rounded-lg bg-muted p-4 mb-6">
      <p className="font-semibold text-sm text-foreground mb-1">Hinweis zur Datennutzung</p>
      <p className="text-xs text-muted-foreground">
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
          <p>Das Bündnis Bürgerenergie (BBEn) wird die gesamten Antworten inkl. der Freitextfelder anonym (d.h. ohne E-Mail-Adressen) als Excel-Datenbank an berechtigte Anliegenträger (z.B. Wissenschaft, Energieagenturen, Solarenergieverbände) auf Anfrage zur Verfügung stellen.</p>
          <p>Alle GGV-Projekte werden zusätzlich auf einer Deutschlandkarte auf der Seite{" "}
            <a href="https://www.ggv-transparenz.de" target="_blank" rel="noopener noreferrer" className="underline font-medium">ggv-transparenz.de</a>{" "}
            dargestellt.
          </p>
          <p>Sollten Sie Feedback zu Ihrem Verteilnetzbetreiber geben wollen, welches nicht veröffentlicht werden soll, schreiben Sie bitte an:{" "}
            <a href="mailto:vnb-transparenz@1000gw.de" className="underline font-medium">vnb-transparenz@1000gw.de</a>.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function SurveyRenderer({ sections, data, updateData, uploadedDocuments, setUploadedDocuments, showPrivacyNotice, dataUsageConfirmed, onDataUsageConfirmedChange, showDataUsageCheckbox }: SurveyRendererFullProps) {
  return (
    <div className="space-y-8">
      {showPrivacyNotice && <PrivacyNotice />}
      {sections.map((section) => {
        const visibleQuestions = section.questions.filter(q => isQuestionVisible(q, data));
        if (visibleQuestions.length === 0) return null;

        return (
          <div key={section.id}>
            {/* Section sub-header (only if multiple sections in this step) */}
            {sections.length > 1 && (
              <div className="mb-6 pb-3 border-b">
                <h3 className="text-lg font-semibold text-foreground">{cleanLabel(section.title)}</h3>
                {section.description && (
                  <p className="text-sm text-muted-foreground mt-1">{cleanLabel(section.description)}</p>
                )}
              </div>
            )}
            <div className="space-y-8">
              {visibleQuestions.map((q) => (
                <div key={q.id}>
                  {q.helpText && !q.description && (
                    <div className="mb-2 flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                      <Info className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{cleanLabel(q.helpText)}</span>
                    </div>
                  )}
                  {renderQuestion(q, data, updateData, uploadedDocuments, setUploadedDocuments)}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {showDataUsageCheckbox && (
        <div className="border-t pt-6 mt-8">
          <div className="flex items-start gap-3">
            <Checkbox
              id="data-usage-confirmed"
              checked={dataUsageConfirmed}
              onCheckedChange={(checked) => onDataUsageConfirmedChange?.(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="data-usage-confirmed" className="text-sm leading-relaxed cursor-pointer">
              Ich habe zur Kenntnis genommen, dass meine Antworten für die Bewertung von Verteilnetzbetreibern genutzt und als Excel-Daten an berechtigte Anliegenträger weitergegeben werden können.
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}
