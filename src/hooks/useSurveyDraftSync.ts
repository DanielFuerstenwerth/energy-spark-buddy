import { useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SurveyData } from "@/types/survey";
import { buildDbData, expandToLocationRows } from "@/data/surveySchema";
import { Evaluation } from "@/hooks/useMultiEvaluation";

// ── Config ──────────────────────────────────────────────────────────
const DRAFT_TOKEN_KEY = "vnb-survey-draft-token";
const SAVE_INTERVAL_MS = 3000;
const MAX_CONSECUTIVE_ERRORS = 5;

// Fields that live in globalData (not per-evaluation)
const GLOBAL_FIELDS: (keyof SurveyData)[] = [
  "actorTypes", "actorTextFields", "actorOther",
  "actorDienstleisterCategory", "actorDienstleisterCategoryOther", "actorDienstleisterCategoryDetails",
  "motivation", "motivationOther", "motivationDetails",
  "contactEmail", "confirmationForUpdate",
];
const FINAL_FIELDS: (keyof SurveyData)[] = [
  "additionalExperiences", "surveyImprovements", "npsScore",
];
const GLOBAL_SET = new Set<keyof SurveyData>([...GLOBAL_FIELDS, ...FINAL_FIELDS]);

// ── Pure helpers ────────────────────────────────────────────────────

function getOrCreateDraftToken(): string {
  const existing = localStorage.getItem(DRAFT_TOKEN_KEY);
  if (existing) return existing;
  const token = crypto.randomUUID();
  localStorage.setItem(DRAFT_TOKEN_KEY, token);
  return token;
}

/**
 * Build DB-ready draft rows from current survey state.
 * Uses skipVisibilityCheck so ALL entered data is preserved in drafts.
 */
function buildDraftRows(
  globalData: SurveyData,
  evaluations: Evaluation[],
  sessionGroupId: string,
  uploadedDocuments: string[],
  draftToken: string,
): Record<string, unknown>[] {
  const mergedSubmissions: SurveyData[] = evaluations.map((ev) => {
    const evalOnly = Object.fromEntries(
      Object.entries(ev.data).filter(([key]) => !GLOBAL_SET.has(key as keyof SurveyData)),
    );
    return {
      ...({} as SurveyData),
      ...Object.fromEntries(
        [...GLOBAL_FIELDS, ...FINAL_FIELDS].map(f => [f, globalData[f]]),
      ),
      ...evalOnly,
      evaluationLabel: ev.data.vnbName || ev.label,
      sessionGroupId,
    } as SurveyData;
  });

  return mergedSubmissions.flatMap(sub => {
    const baseRow = buildDbData(sub, sessionGroupId, uploadedDocuments, { skipVisibilityCheck: true });
    const rows = expandToLocationRows(baseRow, sub);
    return rows.map(row => ({
      ...row,
      draft_token: draftToken,
      status: "draft",
    }));
  });
}

// ── Hook ────────────────────────────────────────────────────────────

/**
 * Writes draft data directly into `survey_responses` every 3 seconds.
 *
 * Architecture:
 * - DELETE old draft rows + INSERT new ones (same draft_token)
 * - Starts saving once user answers Q1.1 (actorTypes) or selects a VNB
 * - Hash check avoids no-op writes
 * - On tab close / visibilitychange: triggers immediate save
 * - On submit: edge function deletes drafts and inserts final submitted rows
 */
export function useSurveyDraftSync(
  globalData: SurveyData,
  evaluations: Evaluation[],
  sessionGroupId: string,
  uploadedDocuments: string[],
) {
  const draftToken = useRef(getOrCreateDraftToken());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSaving = useRef(false);
  const lastSavedHash = useRef("");
  const errorCount = useRef(0);
  const isStarted = useRef(false);

  // Always keep latest data in a ref so callbacks never read stale closures
  const latest = useRef({ globalData, evaluations, sessionGroupId, uploadedDocuments });
  latest.current = { globalData, evaluations, sessionGroupId, uploadedDocuments };

  // ── Core save: atomic RPC (DELETE+INSERT in one transaction) ───────
  const saveDraft = useCallback(async () => {
    if (isSaving.current || errorCount.current >= MAX_CONSECUTIVE_ERRORS) return;

    const { globalData: gd, evaluations: evs, sessionGroupId: sgid, uploadedDocuments: docs } = latest.current;

    const rows = buildDraftRows(gd, evs, sgid, docs, draftToken.current);
    const hash = JSON.stringify(rows);
    if (hash === lastSavedHash.current) return; // No change since last save

    isSaving.current = true;
    try {
      const { error } = await (supabase as any).rpc("upsert_survey_drafts", {
        p_draft_token: draftToken.current,
        p_rows: rows,
      });

      if (error) {
        errorCount.current++;
        console.warn("[DraftSync] RPC error:", error.message);
        return;
      }

      errorCount.current = 0;
      lastSavedHash.current = hash;
      console.log(`[DraftSync] Saved ${rows.length} draft row(s) (atomic)`);
    } catch (err) {
      errorCount.current++;
      console.warn("[DraftSync] unexpected error:", err);
    } finally {
      isSaving.current = false;
    }
  }, []); // stable — reads from refs only

  // ── Start/stop logic ─────────────────────────────────────────────

  // Survey is "started" when user has answered Q1.1 or selected a VNB
  const hasStarted =
    (globalData.actorTypes && globalData.actorTypes.length > 0) ||
    evaluations.some(ev => !!ev.data.vnbName || (ev.data.projectTypes && ev.data.projectTypes.length > 0));

  useEffect(() => {
    if (hasStarted && !isStarted.current) {
      isStarted.current = true;
      // Save immediately
      saveDraft();
      // Then every 3 seconds
      intervalRef.current = setInterval(saveDraft, SAVE_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hasStarted, saveDraft]);

  // ── Save on tab close / hide ──────────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isStarted.current) {
        saveDraft();
      }
    };
    const handleBeforeUnload = () => {
      if (isStarted.current) {
        saveDraft();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveDraft]);

  // ── Public API ────────────────────────────────────────────────────

  /** Trigger an immediate save (e.g. on step change). */
  const saveNow = useCallback(() => {
    saveDraft();
  }, [saveDraft]);

  /** Clear draft token from localStorage after successful submission. */
  const clearDraftToken = useCallback(() => {
    localStorage.removeItem(DRAFT_TOKEN_KEY);
    lastSavedHash.current = "";
    isStarted.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const getDraftToken = useCallback(() => draftToken.current, []);

  return { saveNow, clearDraftToken, getDraftToken };
}
