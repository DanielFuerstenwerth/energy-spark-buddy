/**
 * SurveyRenderer - Dynamic question renderer driven by surveySchema.ts (SSOT)
 * 
 * Renders questions from any SurveySection by mapping question types
 * to the appropriate UI components. No hardcoded step logic.
 */

import { SurveyData } from "@/types/survey";
import { SurveyQuestion, SurveySection, cleanLabel, QUESTION_REGISTRY } from "@/data/surveySchema";
import { evaluateRule } from "@/lib/visibilityRules";
import { toast } from "@/hooks/use-toast";
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
import { InlineHint } from "./InlineHint";
import { InlineHintTrigger } from "./InlineHint";

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
  tooltipNode?: React.ReactNode,
): React.ReactNode {
  const qId = q.id as keyof SurveyData;
  const uiNumber = getUiNumber(q.id);
  let label = cleanLabel(q.label);

  // Dynamic label replacement for project-type-specific context
  const projectTypes = (data as unknown as Record<string, unknown>).projectTypes as string[] | undefined;
  const hasGgv = projectTypes?.some(t => t === 'ggv' || t === 'ggv_oder_mieterstrom') || false;
  const hasMs = projectTypes?.includes('mieterstrom') || false;
  if (hasGgv && !hasMs) {
    label = label.replace('GGV/Mieterstrom', 'GGV').replace('GGV / Mieterstrom', 'GGV');
  } else if (hasMs && !hasGgv) {
    label = label.replace('GGV/Mieterstrom', 'Mieterstrom').replace('GGV / Mieterstrom', 'Mieterstrom');
  }

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
          tooltipNode={tooltipNode}
        />
      );

    case 'multi-select':
      // Dynamic option labels for multi-select
      let dynamicMultiOptions = q.options || [];
      if (q.id === 'challenges') {
        if (hasGgv && !hasMs) {
          dynamicMultiOptions = dynamicMultiOptions.map(opt => ({
            ...opt,
            label: opt.label.replace('GGV / Mieterstrom', 'GGV').replace('GGV/Mieterstrom', 'GGV'),
          }));
        } else if (hasMs && !hasGgv) {
          dynamicMultiOptions = dynamicMultiOptions.map(opt => ({
            ...opt,
            label: opt.label.replace('GGV / Mieterstrom', 'Mieterstrom').replace('GGV/Mieterstrom', 'Mieterstrom'),
          }));
        }
      }
      return (
        <MultiSelectQuestion
          key={q.id}
          id={q.id}
          label={label}
          description={q.description}
          options={dynamicMultiOptions}
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
          tooltipNode={tooltipNode}
        />
      );

    case 'single-select': {
      // Fields that are stored as string[] (Legacy compat) but rendered as single-select
      const ARRAY_WRAPPED_FIELDS = ['planningStatus', 'mieterstromPlanningStatus', 'esStatus'];
      const isArrayWrapped = ARRAY_WRAPPED_FIELDS.includes(q.id);
      const currentValue = isArrayWrapped
        ? (getValue<string[]>(q.id)?.[0] || undefined)
        : getValue<string>(q.id);

      // Context-dependent label for planningStatus
      let dynamicLabel = label;
      const isUndecided = projectTypes?.includes('ggv_oder_mieterstrom') || false;
      if (q.id === 'planningStatus') {
        if (hasGgv && hasMs) {
          dynamicLabel = label.replace('mit dem Projekt', 'mit dem GGV-Projekt');
        } else if (hasGgv && !hasMs) {
          dynamicLabel = label.replace('mit dem Projekt', 'mit dem GGV-Projekt');
        } else if (hasMs && !hasGgv) {
          dynamicLabel = label.replace('mit dem Projekt', 'mit dem Mieterstrom-Projekt');
        }
      }

      // Dynamic option labels: replace 'GGV/Mieterstrom' based on project type context
      let dynamicOptions = q.options || [];
      if (q.id === 'planningStatus') {
        if (hasGgv && hasMs) {
          dynamicOptions = dynamicOptions.map(opt => ({
            ...opt,
            label: opt.label.replace('GGV/Mieterstrom', 'GGV'),
          }));
        } else if (hasGgv && !hasMs) {
          dynamicOptions = dynamicOptions.map(opt => ({
            ...opt,
            label: opt.label.replace('GGV/Mieterstrom', 'GGV'),
          }));
        } else if (hasMs && !hasGgv) {
          dynamicOptions = dynamicOptions.map(opt => ({
            ...opt,
            label: opt.label.replace('GGV/Mieterstrom', 'Mieterstrom'),
          }));
        }
      }

      // Validation: warn if ggv_oder_mieterstrom + Betriebsstatus
      const OPERATION_VALUES = ['pv_laeuft_ggv_laeuft', 'pv_laeuft_ggv_planung'];
      const handleChange = (v: string) => {
        // Allow deselection (empty string)
        if (!v) {
          if (isArrayWrapped) {
            setValue(q.id, []);
          } else {
            setValue(q.id, undefined);
          }
          return;
        }
        if (q.id === 'planningStatus' && isUndecided && OPERATION_VALUES.includes(v)) {
          toast({
            title: "Hinweis",
            description: "Wenn Ihr Projekt bereits im Betrieb ist, wählen Sie bitte oben bei Projektart 'GGV' und/oder 'Mieterstrom' statt 'GGV oder Mieterstrom (unentschieden)'.",
            duration: 8000,
          });
        }
        if (isArrayWrapped) {
          setValue(q.id, [v]);
        } else {
          setValue(q.id, v);
        }
      };

      const showUndecidedWarning = q.id === 'planningStatus' && isUndecided && OPERATION_VALUES.includes(currentValue || '');

      return (
        <div key={q.id} className={showUndecidedWarning ? "rounded-lg border-2 border-destructive/60 p-4 -m-4 transition-all" : ""}>
          <SingleSelectQuestion
            id={q.id}
            label={dynamicLabel}
            description={q.description || q.helpText}
            options={dynamicOptions}
            value={currentValue}
            otherValue={getValue<string>(`${q.id}Other`)}
            onChange={handleChange}
            onOtherChange={(v) => setValue(`${q.id}Other`, v)}
            optional={q.optional}
            questionNumber={uiNumber}
            tooltipNode={tooltipNode}
          />
          {showUndecidedWarning && (
            <p className="mt-3 text-sm text-destructive font-medium">
              ⚠️ Hinweis: Wenn Ihr Projekt bereits im Betrieb ist, wählen Sie bitte oben bei Projektart „GGV" und/oder „Mieterstrom" statt „GGV oder Mieterstrom (unentschieden)".
            </p>
          )}
        </div>
      );
    }

    case 'text':
      // Special case: projectLocations and mieterstromProjectLocations
      if (q.id === 'projectLocations' || q.id === 'mieterstromProjectLocations') {
        return (
          <ProjectLocationRows
            key={q.id}
            locations={getValue<ProjectLocation[]>(q.id) || [{}]}
            onChange={(locs) => setValue(q.id, locs)}
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
          tooltipNode={tooltipNode}
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
          tooltipNode={tooltipNode}
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
          tooltipNode={tooltipNode}
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
          tooltipNode={tooltipNode}
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
            tooltipNode={tooltipNode}
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
          tooltipNode={tooltipNode}
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
          tooltipNode={tooltipNode}
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
          tooltipNode={tooltipNode}
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
                  {renderQuestion(q, data, updateData, uploadedDocuments, setUploadedDocuments, q.tooltip ? <InlineHintTrigger text={q.tooltip} /> : undefined)}
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
