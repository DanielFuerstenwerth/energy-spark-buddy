/**
 * SurveyRenderer - Dynamic question renderer driven by surveySchema.ts (SSOT)
 * 
 * Renders questions from any SurveySection by mapping question types
 * to the appropriate UI components. No hardcoded step logic.
 */

import { SurveyData } from "@/types/survey";
import { SurveyQuestion, SurveySection, cleanLabel, QUESTION_REGISTRY } from "@/data/surveySchema";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info } from "lucide-react";

interface SurveyRendererProps {
  sections: SurveySection[];
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
}

/**
 * Evaluate whether a question should be visible based on its visibilityLogic.
 * This is a simple rule engine that checks data state.
 */
function getFieldValue(data: SurveyData, field: string): unknown {
  return (data as unknown as Record<string, unknown>)[field];
}

function isQuestionVisible(q: SurveyQuestion, data: SurveyData): boolean {
  if (!q.visibilityLogic) return true;
  const logic = q.visibilityLogic;
  
  // Simple pattern matching for common visibility rules
  const projectTypes = data.projectTypes || [];
  const isGgv = projectTypes.includes('ggv') || projectTypes.includes('ggv_oder_mieterstrom');
  const isMieterstrom = projectTypes.includes('mieterstrom');
  const isES = projectTypes.includes('energysharing');
  
  // Pattern: "Nur wenn in #6 'GGV'..." or similar projectTypes references
  if (logic.includes("'GGV'") || logic.includes("'ggv'") || logic.includes("GGV oder Mieterstrom")) {
    if (logic.includes("Mieterstrom") && !logic.includes("nicht")) {
      return isGgv || isMieterstrom;
    }
    return isGgv;
  }
  if (logic.includes("Mieterstrom ausgewählt") && !logic.includes("GGV")) {
    return isMieterstrom;
  }
  if (logic.includes("Energy Sharing")) {
    return isES;
  }
  
  // Pattern: "Wenn fieldName = 'value'"
  const equalsMatch = logic.match(/Wenn\s+(\w+)\s*=\s*'(\w+)'/i) || logic.match(/Nur wenn #\d+\s*=\s*'(\w+)'/i);
  if (equalsMatch) {
    const fieldName = equalsMatch.length === 3 ? equalsMatch[1] : null;
    const expectedValue = equalsMatch.length === 3 ? equalsMatch[2] : equalsMatch[1];
    
    if (fieldName) {
      const fieldValue = getFieldValue(data, fieldName);
      if (typeof fieldValue === 'string') return fieldValue === expectedValue;
      if (Array.isArray(fieldValue)) return fieldValue.includes(expectedValue);
      return false;
    }
  }

  // Pattern: "Wenn fieldName = 'value1' oder 'value2'"
  const orMatch = logic.match(/Wenn\s+(\w+)\s*=\s*'(\w+)'\s+oder\s+'(\w+)'/i);
  if (orMatch) {
    const fieldValue = getFieldValue(data, orMatch[1]);
    if (typeof fieldValue === 'string') return fieldValue === orMatch[2] || fieldValue === orMatch[3];
    return false;
  }

  // Pattern: "Wenn fieldName ausgefüllt"
  const filledMatch = logic.match(/Wenn\s+(\w+)\s+ausgefüllt/i);
  if (filledMatch) {
    const val = getFieldValue(data, filledMatch[1]);
    return !!val && val !== '';
  }

  // Pattern: specific vnbMsbOffer conditions
  if (logic.includes("vnbMsbOffer")) {
    const msbOffer = data.vnbMsbOffer;
    if (logic.includes("'ja'")) return msbOffer === 'ja';
    if (logic.includes("'nein_wmsb'")) return msbOffer === 'nein_wmsb';
    if (logic.includes("'nein_gar_nicht'")) return msbOffer === 'nein_gar_nicht';
  }

  // Pattern: specific cost visibility
  if (logic.includes("vnbAdditionalCosts = 'ja'")) return data.vnbAdditionalCosts === 'ja';
  if (logic.includes("operationMsbAdditionalCosts = 'ja'")) return getFieldValue(data, 'operationMsbAdditionalCosts') === 'ja';
  if (logic.includes("mieterstromMsbCosts = 'ja'")) return data.mieterstromMsbCosts === 'ja';
  if (logic.includes("mieterstromOperationCosts = 'ja'")) return data.mieterstromOperationCosts === 'ja';
  if (logic.includes("vnbDataCost = 'mehr_3_eur'")) return data.vnbDataCost === 'mehr_3_eur';
  if (logic.includes("vnbEsaCost = 'mehr_3_eur'")) return data.vnbEsaCost === 'mehr_3_eur';
  if (logic.includes("operationDataCost = 'mehr_3_eur'")) return data.operationDataCost === 'mehr_3_eur';
  if (logic.includes("operationEsaCost = 'mehr_3_eur'")) return data.operationEsaCost === 'mehr_3_eur';

  // Pattern: Mieterstrom specific
  if (logic.includes("mieterstromVirtuellAllowed = 'ja'")) return data.mieterstromVirtuellAllowed === 'ja';
  if (logic.includes("mieterstromVirtuellAllowed = 'nein'")) return data.mieterstromVirtuellAllowed === 'nein';
  if (logic.includes("mieterstromVirtuellWandlermessung = 'ja'")) return data.mieterstromVirtuellWandlermessung === 'ja';
  if (logic.includes("vnbWandlermessung = 'ja'")) return data.vnbWandlermessung === 'ja' || data.vnbWandlermessung === 'wissen_nicht';
  if (logic.includes("operationWandlermessung = 'ja'")) return data.operationWandlermessung === 'ja';

  // ES VNB contact
  if (logic.includes("esVnbContact = 'yes'")) return data.esVnbContact === true || getFieldValue(data, 'esVnbContact') === 'yes';
  if (logic.includes("esStatus = 'in_betrieb")) {
    const status = data.esStatus;
    if (Array.isArray(status)) return status.some(s => s.startsWith('in_betrieb'));
    return false;
  }

  // Pattern: Mieterstrom + GGV gleichzeitig
  if (logic.includes("Mieterstrom") && logic.includes("gleichzeitig") && logic.includes("GGV")) {
    return isMieterstrom && isGgv;
  }

  // operationDataProvider
  if (logic.includes("operationDataProvider = 'gmsb'")) return data.operationDataProvider === 'gmsb';
  
  // Default: show
  return true;
}

/**
 * Check if a section should be visible based on data state.
 */
export function isSectionVisible(section: SurveySection, data: SurveyData): boolean {
  if (!section.visibilityLogic) return true;
  const logic = section.visibilityLogic;
  
  const projectTypes = data.projectTypes || [];
  const isGgv = projectTypes.includes('ggv') || projectTypes.includes('ggv_oder_mieterstrom');
  const isMieterstrom = projectTypes.includes('mieterstrom');
  const isES = projectTypes.includes('energysharing');
  const isGgvOrMieterstrom = isGgv || isMieterstrom;
  const onlyEnergySharing = isES && !isGgvOrMieterstrom;
  
  const isGgvInOperation = data.planningStatus?.includes?.('pv_laeuft_ggv_laeuft') || false;
  const isMieterstromInOperation = isMieterstrom && (
    isGgv
      ? data.mieterstromPlanningStatus?.includes?.('pv_laeuft_ggv_laeuft') || false
      : data.planningStatus?.includes?.('pv_laeuft_ggv_laeuft') || false
  );

  // Section-level rules
  if (logic.includes("nicht nur Energy Sharing") || logic.includes("nicht nur Energy")) {
    return !onlyEnergySharing;
  }
  if (logic.includes("GGV', 'Mieterstrom'") || logic.includes("GGV oder Mieterstrom")) {
    return isGgvOrMieterstrom;
  }
  if (logic.includes("'GGV'") && !logic.includes("Mieterstrom")) {
    return isGgv;
  }
  if (logic.includes("Mieterstrom ausgewählt") || (logic.includes("Mieterstrom") && !logic.includes("GGV") && !logic.includes("Betrieb"))) {
    return isMieterstrom;
  }
  if (logic.includes("Energy Sharing")) {
    return isES;
  }
  if (logic.includes("#18 = 'pv_laeuft_ggv_laeuft'") || logic.includes("GGV in Betrieb") || logic.includes("pv_laeuft_ggv_laeuft")) {
    if (logic.includes("Mieterstrom")) {
      return isMieterstromInOperation;
    }
    return isGgvInOperation;
  }
  if (logic.includes("moeglich_gmsb")) {
    const response = data.mieterstromVnbResponse;
    if (Array.isArray(response)) return response.includes('moeglich_gmsb');
    return false;
  }
  if (logic.includes("#28 = 'ja'") || logic.includes("vnbMsbOffer = 'ja'")) {
    return data.vnbMsbOffer === 'ja';
  }

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

export function SurveyRenderer({ sections, data, updateData, uploadedDocuments, setUploadedDocuments }: SurveyRendererProps) {
  return (
    <div className="space-y-8">
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
    </div>
  );
}
