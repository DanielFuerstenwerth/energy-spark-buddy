import { useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SurveyData } from "@/types/survey";
import { buildDbData, expandToLocationRows } from "@/data/surveySchema";
import { Evaluation } from "@/hooks/useMultiEvaluation";

// ── Config ──────────────────────────────────────────────────────────
const DRAFT_TOKEN_KEY = "vnb-survey-draft-token";
const DEBOUNCE_MS = 1500; // Save quickly after changes
const MAX_ERRORS = 3;

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

/** True if the user has entered anything worth persisting. */
function hasContent(gd: SurveyData, evs: Evaluation[]): boolean {
  return (
    (gd.actorTypes?.length ?? 0) > 0 ||
    (gd.motivation?.length ?? 0) > 0 ||
    evs.some(e => !!e.data.vnbName || (e.data.projectTypes?.length ?? 0) > 0)
  );
}

/** Build DB-ready draft rows from current survey state. */
function buildDraftRows(
  globalData: SurveyData,
  evaluations: Evaluation[],
  sessionGroupId: string,
  uploadedDocuments: string[],
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
    const baseRow = buildDbData(sub, sessionGroupId, uploadedDocuments);
    return expandToLocationRows(baseRow, sub);
  });
}

// ── Hook ────────────────────────────────────────────────────────────

/**
 * Server-side draft persistence for the survey.
 *
 * - Stores a `draft_token` UUID in localStorage
 * - Debounced save (1.5 s) on data changes
 * - Immediate save on step changes via `saveNow()`
 * - Reliable save on tab close / hide using `fetch` with `keepalive`
 */
export function useSurveyDraftSync(
  globalData: SurveyData,
  evaluations: Evaluation[],
  sessionGroupId: string,
  uploadedDocuments: string[],
) {
  const draftToken = useRef(getOrCreateDraftToken());
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSaving = useRef(false);
  const lastSavedHash = useRef("");
  const errorCount = useRef(0);

  // Always keep latest data in a ref so unload handlers never read stale closures
  const latest = useRef({ globalData, evaluations, sessionGroupId, uploadedDocuments });
  useEffect(() => {
    latest.current = { globalData, evaluations, sessionGroupId, uploadedDocuments };
  }, [globalData, evaluations, sessionGroupId, uploadedDocuments]);

  // ── Core save (used for normal in-page saves) ────────────────────
  const saveDraftToDb = useCallback(async () => {
    if (isSaving.current || errorCount.current >= MAX_ERRORS) return;

    const { globalData: gd, evaluations: evs, sessionGroupId: sgid, uploadedDocuments: docs } = latest.current;
    if (!hasContent(gd, evs)) return;

    const rows = buildDraftRows(gd, evs, sgid, docs);
    if (rows.length === 0) return;

    const hash = JSON.stringify(rows);
    if (hash === lastSavedHash.current) return;

    isSaving.current = true;
    const token = draftToken.current;

    try {
      // 1) Delete old drafts for this token
      const { error: delErr } = await supabase
        .from("survey_responses")
        .delete()
        .eq("draft_token", token)
        .eq("status", "draft");

      if (delErr) console.warn("[DraftSync] delete:", delErr.message);

      // 2) Insert new draft rows
      const draftRows = rows.map(r => ({ ...r, draft_token: token, status: "draft" }));
      const { error: insErr } = await supabase
        .from("survey_responses")
        .insert(draftRows);

      if (insErr) {
        errorCount.current++;
        console.warn("[DraftSync] insert:", insErr.message);
      } else {
        errorCount.current = 0;
        lastSavedHash.current = hash;
        console.log(`[DraftSync] Saved ${draftRows.length} draft row(s)`);
      }
    } catch (err) {
      errorCount.current++;
      console.warn("[DraftSync] error:", err);
    } finally {
      isSaving.current = false;
    }
  }, []); // stable — reads from refs only

  // ── Keepalive save (survives page unload) ─────────────────────────
  const saveWithKeepalive = useCallback(() => {
    const { globalData: gd, evaluations: evs, sessionGroupId: sgid, uploadedDocuments: docs } = latest.current;
    if (!hasContent(gd, evs)) return;

    const rows = buildDraftRows(gd, evs, sgid, docs);
    if (rows.length === 0) return;

    const hash = JSON.stringify(rows);
    if (hash === lastSavedHash.current) return;

    const token = draftToken.current;
    const draftRows = rows.map(r => ({ ...r, draft_token: token, status: "draft" }));

    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const headers: Record<string, string> = {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    };

    // DELETE old drafts then INSERT new ones, both with keepalive
    // Chain via .then so INSERT waits for DELETE, but both survive unload
    fetch(
      `${baseUrl}/rest/v1/survey_responses?draft_token=eq.${token}&status=eq.draft`,
      { method: "DELETE", headers, keepalive: true },
    )
      .then(() =>
        fetch(`${baseUrl}/rest/v1/survey_responses`, {
          method: "POST",
          headers,
          body: JSON.stringify(draftRows),
          keepalive: true,
        }),
      )
      .then(() => {
        lastSavedHash.current = hash;
      })
      .catch(() => {
        // Best-effort: if DELETE failed, try INSERT anyway (duplicates are harmless)
        fetch(`${baseUrl}/rest/v1/survey_responses`, {
          method: "POST",
          headers,
          body: JSON.stringify(draftRows),
          keepalive: true,
        }).catch(() => { /* truly best-effort */ });
      });
  }, []); // stable — reads from refs only

  // ── Public API ────────────────────────────────────────────────────

  const scheduleSave = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(saveDraftToDb, DEBOUNCE_MS);
  }, [saveDraftToDb]);

  /** Immediate save (e.g. on step change). Still checks hasContent. */
  const saveNow = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    saveDraftToDb();
  }, [saveDraftToDb]);

  const clearDraftToken = useCallback(() => {
    localStorage.removeItem(DRAFT_TOKEN_KEY);
    lastSavedHash.current = "";
  }, []);

  const getDraftToken = useCallback(() => draftToken.current, []);

  // ── Effects ───────────────────────────────────────────────────────

  // Debounced save on data changes
  useEffect(() => {
    if (hasContent(globalData, evaluations)) {
      scheduleSave();
    }
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [globalData, evaluations, scheduleSave]);

  // Reliable save on tab close / hide
  useEffect(() => {
    const onBeforeUnload = () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      saveWithKeepalive();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        saveWithKeepalive();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [saveWithKeepalive]);

  return { saveNow, clearDraftToken, getDraftToken };
}
