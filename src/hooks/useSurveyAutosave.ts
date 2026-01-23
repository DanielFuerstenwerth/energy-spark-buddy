import { useEffect, useCallback } from "react";
import { SurveyData, initialSurveyData } from "@/types/survey";

const STORAGE_KEY = "vnb-survey-draft";
const MAX_AGE_DAYS = 7;

interface StoredSurveyData {
  data: SurveyData;
  currentStep: number;
  savedAt: string;
}

export function useSurveyAutosave(
  data: SurveyData,
  currentStep: number,
  setData: (data: SurveyData) => void,
  setCurrentStep: (step: number) => void
) {
  useEffect(() => {
    const toStore: StoredSurveyData = { data, currentStep, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }, [data, currentStep]);

  const getSavedDraft = useCallback((): StoredSurveyData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed: StoredSurveyData = JSON.parse(stored);
      const savedDate = new Date(parsed.savedAt);
      const now = new Date();
      const daysDiff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > MAX_AGE_DAYS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      const hasContent = parsed.data.actorTypes.length > 0 || parsed.data.motivation.length > 0 ||
        parsed.data.projectTypes.length > 0 || parsed.data.vnbName || parsed.data.projectFocus;
      if (!hasContent) return null;
      return parsed;
    } catch { return null; }
  }, []);

  const restoreDraft = useCallback((draft: StoredSurveyData) => {
    setData(draft.data);
    setCurrentStep(draft.currentStep);
  }, [setData, setCurrentStep]);

  const clearDraft = useCallback(() => { localStorage.removeItem(STORAGE_KEY); }, []);

  const formatSavedTime = useCallback((isoString: string): string => {
    const saved = new Date(isoString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - saved.getTime()) / (1000 * 60));
    if (diffMinutes < 1) return "gerade eben";
    if (diffMinutes < 60) return `vor ${diffMinutes} Minuten`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `vor ${diffHours} Stunden`;
    const diffDays = Math.floor(diffHours / 24);
    return `vor ${diffDays} Tagen`;
  }, []);

  return { getSavedDraft, restoreDraft, clearDraft, formatSavedTime };
}
