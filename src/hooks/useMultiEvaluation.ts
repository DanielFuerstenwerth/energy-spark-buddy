import { useState, useCallback } from "react";
import { SurveyData, initialSurveyData } from "@/types/survey";

/**
 * Manages multiple VNB evaluations within a single survey session.
 * 
 * Architecture:
 * - `globalData`: Shared "Über Sie" (A1-A3) + Energy Sharing + Abschluss fields
 * - `evaluations`: Array of per-VNB/project-type data sets
 * - Each evaluation becomes a separate row in survey_responses on submit
 */

export interface Evaluation {
  id: string;
  label: string;
  data: SurveyData;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function createDefaultEvaluation(index: number): Evaluation {
  return {
    id: generateId(),
    label: `Bewertung ${index + 1}`,
    data: { ...initialSurveyData },
  };
}

// Fields that belong to "Über Sie" (global, filled once)
const GLOBAL_FIELDS: (keyof SurveyData)[] = [
  'actorTypes', 'actorTextFields', 'actorOther',
  'motivation', 'motivationOther',
  'contactEmail',
];

// Fields that belong to Energy Sharing (global)
const ES_FIELDS: (keyof SurveyData)[] = [
  'esStatus', 'esStatusOther', 'esInOperationDetails', 'esOperatorDetails',
  'esPlantType', 'esPlantTypeDetails', 'esPvSizeKw', 'esWindSizeKw',
  'esProjectScope', 'esTotalPvSizeKw', 'esTotalWindSizeKw',
  'esPartyCount', 'esConsumerTypes', 'esConsumerDetails',
  'esConsumerScope', 'esConsumerScopeOther', 'esMaxDistance',
  'esVnbContact', 'esVnbResponse', 'esVnbResponseOther',
  'esVnbResponseDetails', 'esNetzentgelteDiscussion', 'esNetzentgelteDetails',
  'esInfoSources',
];

// Fields that belong to "Abschluss" (global)
const FINAL_FIELDS: (keyof SurveyData)[] = [
  'helpfulInfoSources', 'additionalExperiences', 'surveyImprovements', 'npsScore',
];

export const GLOBAL_STEP_IDS = new Set(['about', 'energy-sharing', 'final']);

export function isGlobalStep(stepId: string): boolean {
  return GLOBAL_STEP_IDS.has(stepId);
}

export function useMultiEvaluation() {
  const [globalData, setGlobalData] = useState<SurveyData>({ ...initialSurveyData });
  const [evaluations, setEvaluations] = useState<Evaluation[]>([createDefaultEvaluation(0)]);
  const [activeEvaluationIndex, setActiveEvaluationIndex] = useState(0);
  const [sessionGroupId] = useState(() => generateId());

  const activeEvaluation = evaluations[activeEvaluationIndex] ?? evaluations[0];

  const updateGlobalData = useCallback(<K extends keyof SurveyData>(field: K, value: SurveyData[K]) => {
    setGlobalData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateEvaluationData = useCallback(<K extends keyof SurveyData>(field: K, value: SurveyData[K]) => {
    setEvaluations(prev => prev.map((ev, i) => 
      i === activeEvaluationIndex ? { ...ev, data: { ...ev.data, [field]: value } } : ev
    ));
  }, [activeEvaluationIndex]);

  const addEvaluation = useCallback(() => {
    const newEval = createDefaultEvaluation(evaluations.length);
    setEvaluations(prev => [...prev, newEval]);
    setActiveEvaluationIndex(evaluations.length);
  }, [evaluations.length]);

  const removeEvaluation = useCallback((index: number) => {
    if (evaluations.length <= 1) return;
    setEvaluations(prev => prev.filter((_, i) => i !== index));
    setActiveEvaluationIndex(prev => 
      prev >= index ? Math.max(0, prev - 1) : prev
    );
  }, [evaluations.length]);

  const renameEvaluation = useCallback((index: number, label: string) => {
    setEvaluations(prev => prev.map((ev, i) => 
      i === index ? { ...ev, label } : ev
    ));
  }, []);

  /**
   * Merge global data with each evaluation's data for submission.
   * Returns array of complete SurveyData objects ready for DB insert.
   */
  const getMergedSubmissions = useCallback((): SurveyData[] => {
    return evaluations.map(ev => ({
      ...initialSurveyData,
      // Global fields
      ...Object.fromEntries(
        [...GLOBAL_FIELDS, ...ES_FIELDS, ...FINAL_FIELDS].map(f => [f, globalData[f]])
      ),
      // Evaluation-specific fields (overrides)
      ...ev.data,
      // Meta
      evaluationLabel: ev.label,
      sessionGroupId,
    }));
  }, [evaluations, globalData, sessionGroupId]);

  /**
   * Get the appropriate data and updater for a given step.
   */
  const getDataForStep = useCallback((stepId: string) => {
    if (isGlobalStep(stepId)) {
      return { data: globalData, updateData: updateGlobalData };
    }
    return { data: activeEvaluation.data, updateData: updateEvaluationData };
  }, [globalData, updateGlobalData, activeEvaluation, updateEvaluationData]);

  /**
   * Restore all state from autosave
   */
  const restoreState = useCallback((state: {
    globalData: SurveyData;
    evaluations: Evaluation[];
    activeEvaluationIndex: number;
  }) => {
    setGlobalData(state.globalData);
    setEvaluations(state.evaluations);
    setActiveEvaluationIndex(state.activeEvaluationIndex);
  }, []);

  return {
    globalData,
    evaluations,
    activeEvaluationIndex,
    activeEvaluation,
    sessionGroupId,
    setActiveEvaluationIndex,
    updateGlobalData,
    updateEvaluationData,
    addEvaluation,
    removeEvaluation,
    renameEvaluation,
    getMergedSubmissions,
    getDataForStep,
    restoreState,
  };
}
