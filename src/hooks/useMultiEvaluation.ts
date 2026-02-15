import { useState, useCallback } from "react";
import { SurveyData, initialSurveyData } from "@/types/survey";

/**
 * Manages multiple VNB evaluations within a single survey session.
 * 
 * Architecture:
 * - `globalData`: Shared "Über Sie" + "Abschluss" fields
 * - `evaluations`: Array of per-VNB/project-type data sets (incl. Energy Sharing)
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
    label: index === 0 ? 'Ihre VNB-Bewertung' : `VNB-Bewertung ${index + 1}`,
    data: { ...initialSurveyData },
  };
}

// Fields that belong to "Über Sie" (global, filled once)
const GLOBAL_FIELDS: (keyof SurveyData)[] = [
  'actorTypes', 'actorTextFields', 'actorOther',
  'motivation', 'motivationOther',
  'contactEmail', 'confirmationForUpdate',
];

// Fields that belong to "Abschluss" (global)
const FINAL_FIELDS: (keyof SurveyData)[] = [
  'additionalExperiences', 'surveyImprovements', 'npsScore',
];

// Energy Sharing is now PER EVALUATION (not global)

export function useMultiEvaluation() {
  const [globalData, setGlobalData] = useState<SurveyData>({ ...initialSurveyData });
  const [evaluations, setEvaluations] = useState<Evaluation[]>([createDefaultEvaluation(0)]);
  const [activeEvaluationIndex, setActiveEvaluationIndex] = useState(0);
  const [sessionGroupId] = useState(() => crypto.randomUUID());

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
    return evaluations.map((ev, i) => {
      // Use VNB name as label if available, otherwise fallback
      const dynamicLabel = ev.data.vnbName || ev.label;
      return {
        ...initialSurveyData,
        // Global fields
        ...Object.fromEntries(
          [...GLOBAL_FIELDS, ...FINAL_FIELDS].map(f => [f, globalData[f]])
        ),
        // Evaluation-specific fields (overrides) — includes ES data now
        ...ev.data,
        // Meta
        evaluationLabel: dynamicLabel,
        sessionGroupId,
      };
    });
  }, [evaluations, globalData, sessionGroupId]);

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
    restoreState,
  };
}
