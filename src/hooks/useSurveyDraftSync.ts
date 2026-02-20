import { useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SurveyData } from "@/types/survey";
import { buildDbData, expandToLocationRows } from "@/data/surveySchema";
import { Evaluation } from "@/hooks/useMultiEvaluation";

const DRAFT_TOKEN_KEY = "vnb-survey-draft-token";
const DEBOUNCE_MS = 3000;
const MAX_CONSECUTIVE_ERRORS = 3;

/**
 * Manages server-side draft persistence for the survey.
 * 
 * - Generates/stores a `draft_token` UUID in localStorage
 * - Debounced upsert to `survey_responses` on data changes
 * - Immediate save on step changes, beforeunload, and visibilitychange
 * - Load existing draft from DB on mount (fallback if localStorage is empty)
 */
export function useSurveyDraftSync(
  globalData: SurveyData,
  evaluations: Evaluation[],
  sessionGroupId: string,
  uploadedDocuments: string[],
) {
  const draftToken = useRef<string>(getOrCreateDraftToken());
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSaving = useRef(false);
  const lastSavedHash = useRef<string>("");
  const consecutiveErrors = useRef(0);

  // Keep refs to latest data for beforeunload/visibilitychange
  const latestDataRef = useRef({ globalData, evaluations, sessionGroupId, uploadedDocuments });
  useEffect(() => {
    latestDataRef.current = { globalData, evaluations, sessionGroupId, uploadedDocuments };
  }, [globalData, evaluations, sessionGroupId, uploadedDocuments]);

  /**
   * Build DB rows from current state (mirrors submit logic but keeps status='draft')
   */
  const buildDraftRows = useCallback(() => {
    const GLOBAL_FIELDS: (keyof SurveyData)[] = [
      'actorTypes', 'actorTextFields', 'actorOther',
      'motivation', 'motivationOther',
      'contactEmail', 'confirmationForUpdate',
    ];
    const FINAL_FIELDS: (keyof SurveyData)[] = [
      'additionalExperiences', 'surveyImprovements', 'npsScore',
    ];
    const globalFieldSet = new Set<keyof SurveyData>([...GLOBAL_FIELDS, ...FINAL_FIELDS]);

    const mergedSubmissions: SurveyData[] = evaluations.map((ev) => {
      const dynamicLabel = ev.data.vnbName || ev.label;
      const evalOnly = Object.fromEntries(
        Object.entries(ev.data).filter(([key]) => !globalFieldSet.has(key as keyof SurveyData))
      );
      return {
        ...({} as SurveyData),
        ...Object.fromEntries(
          [...GLOBAL_FIELDS, ...FINAL_FIELDS].map(f => [f, globalData[f]])
        ),
        ...evalOnly,
        evaluationLabel: dynamicLabel,
        sessionGroupId,
      } as SurveyData;
    });

    return mergedSubmissions.flatMap(sub => {
      const baseRow = buildDbData(sub, sessionGroupId, uploadedDocuments);
      return expandToLocationRows(baseRow, sub);
    });
  }, [globalData, evaluations, sessionGroupId, uploadedDocuments]);

  /**
   * Save current state to DB as draft rows.
   */
  const saveDraftToDb = useCallback(async () => {
    if (isSaving.current) return;
    if (consecutiveErrors.current >= MAX_CONSECUTIVE_ERRORS) {
      console.warn("[DraftSync] Too many consecutive errors, pausing saves");
      return;
    }

    const rows = buildDraftRows();
    if (rows.length === 0) return;

    const hash = JSON.stringify(rows);
    if (hash === lastSavedHash.current) return;

    isSaving.current = true;
    try {
      const token = draftToken.current;

      const { error: deleteError } = await supabase
        .from("survey_responses")
        .delete()
        .eq("draft_token", token)
        .eq("status", "draft");

      if (deleteError) {
        console.warn("[DraftSync] Delete failed:", deleteError.message);
      }

      const draftRows = rows.map(row => ({
        ...row,
        draft_token: token,
        status: "draft",
      }));

      const { error: insertError } = await supabase
        .from("survey_responses")
        .insert(draftRows);

      if (insertError) {
        consecutiveErrors.current++;
        console.warn("[DraftSync] Insert failed:", insertError.message);
      } else {
        consecutiveErrors.current = 0;
        lastSavedHash.current = hash;
        console.log(`[DraftSync] Saved ${draftRows.length} draft rows`);
      }
    } catch (err) {
      consecutiveErrors.current++;
      console.warn("[DraftSync] Unexpected error:", err);
    } finally {
      isSaving.current = false;
    }
  }, [buildDraftRows]);

  /**
   * Debounced save — called on data changes
   */
  const scheduleSave = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => saveDraftToDb(), DEBOUNCE_MS);
  }, [saveDraftToDb]);

  /**
   * Immediate save — called on step changes
   */
  const saveNow = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    saveDraftToDb();
  }, [saveDraftToDb]);

  /**
   * Load existing draft from DB by draft_token.
   */
  const loadDraftFromDb = useCallback(async () => {
    const token = draftToken.current;
    try {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("*")
        .eq("draft_token", token)
        .eq("status", "draft");

      if (error) {
        console.warn("[DraftSync] Load failed:", error.message);
        return null;
      }

      if (data && data.length > 0) {
        console.log(`[DraftSync] Found ${data.length} draft rows in DB`);
        return data;
      }
      return null;
    } catch (err) {
      console.warn("[DraftSync] Load error:", err);
      return null;
    }
  }, []);

  /**
   * Clear the draft token (called after successful submit)
   */
  const clearDraftToken = useCallback(() => {
    localStorage.removeItem(DRAFT_TOKEN_KEY);
    lastSavedHash.current = "";
  }, []);

  /**
   * Get the current draft token value
   */
  const getDraftToken = useCallback(() => draftToken.current, []);

  // Trigger debounced save whenever data changes
  useEffect(() => {
    const hasContent = globalData.actorTypes?.length > 0 || 
      globalData.motivation?.length > 0 ||
      evaluations.some(e => e.data.vnbName || e.data.projectTypes?.length > 0);
    
    if (hasContent) {
      scheduleSave();
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [globalData, evaluations, scheduleSave]);

  // Save on beforeunload (tab/browser close) and visibilitychange (tab switch)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use sendBeacon pattern: trigger synchronous-ish save
      // We can't await here, but we fire the save attempt
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      saveDraftToDb();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        saveDraftToDb();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveDraftToDb]);

  return {
    saveNow,
    loadDraftFromDb,
    clearDraftToken,
    getDraftToken,
  };
}

function getOrCreateDraftToken(): string {
  const existing = localStorage.getItem(DRAFT_TOKEN_KEY);
  if (existing) return existing;
  const token = crypto.randomUUID();
  localStorage.setItem(DRAFT_TOKEN_KEY, token);
  return token;
}
