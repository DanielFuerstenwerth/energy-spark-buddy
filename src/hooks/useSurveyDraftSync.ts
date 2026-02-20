import { useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SurveyData } from "@/types/survey";
import { buildDbData, expandToLocationRows } from "@/data/surveySchema";
import { Evaluation } from "@/hooks/useMultiEvaluation";

// ── Config ──────────────────────────────────────────────────────────
const DRAFT_TOKEN_KEY = "vnb-survey-draft-token";
const DEBOUNCE_MS = 1500;
const MAX_ERRORS = 5;

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

/** Build DB-ready draft rows from current survey state.
 *  Uses skipVisibilityCheck so ALL entered data is preserved in drafts.
 */
function buildDraftPayload(
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
    const baseRow = buildDbData(sub, sessionGroupId, uploadedDocuments, { skipVisibilityCheck: true });
    return expandToLocationRows(baseRow, sub);
  });
}

// ── Hook ────────────────────────────────────────────────────────────

/**
 * Server-side draft persistence using atomic UPSERT.
 *
 * Architecture:
 * - Stores drafts in `survey_drafts` table (JSONB payload, single row per token)
 * - Uses UPSERT (INSERT ON CONFLICT UPDATE) — no DELETE needed, no data loss possible
 * - draft_token UUID stored in localStorage
 * - Debounced save (1.5s) on data changes
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
  latest.current = { globalData, evaluations, sessionGroupId, uploadedDocuments };

  // ── Core save: atomic UPSERT ─────────────────────────────────────
  const saveDraftToDb = useCallback(async () => {
    if (isSaving.current || errorCount.current >= MAX_ERRORS) return;

    const { globalData: gd, evaluations: evs, sessionGroupId: sgid, uploadedDocuments: docs } = latest.current;

    const rows = buildDraftPayload(gd, evs, sgid, docs);
    const payload = JSON.stringify(rows);
    if (payload === lastSavedHash.current) return;

    isSaving.current = true;
    const token = draftToken.current;

    try {
      // Single atomic UPSERT — no DELETE needed, no data loss possible
      const { error } = await (supabase as any)
        .from("survey_drafts")
        .upsert(
          {
            draft_token: token,
            payload: rows,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "draft_token" },
        );

      if (error) {
        errorCount.current++;
        console.warn("[DraftSync] upsert error:", error.message);
      } else {
        errorCount.current = 0;
        lastSavedHash.current = payload;
        console.log(`[DraftSync] Saved draft (${rows.length} row(s) in payload)`);
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

    const rows = buildDraftPayload(gd, evs, sgid, docs);
    const payload = JSON.stringify(rows);
    if (payload === lastSavedHash.current) return;

    const token = draftToken.current;
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const headers: Record<string, string> = {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    };

    // Single UPSERT fetch — atomic, no DELETE needed
    fetch(`${baseUrl}/rest/v1/survey_drafts`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        draft_token: token,
        payload: rows,
        updated_at: new Date().toISOString(),
      }),
      keepalive: true,
    })
      .then(() => {
        lastSavedHash.current = payload;
      })
      .catch((err) => {
        console.warn("[DraftSync] keepalive error:", err);
      });
  }, []); // stable — reads from refs only

  // ── Public API ────────────────────────────────────────────────────

  const scheduleSave = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(saveDraftToDb, DEBOUNCE_MS);
  }, [saveDraftToDb]);

  /** Immediate save (e.g. on step change). */
  const saveNow = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    saveDraftToDb();
  }, [saveDraftToDb]);

  const clearDraftToken = useCallback(() => {
    // Delete draft from DB, then clear localStorage
    const token = draftToken.current;
    (supabase as any).from("survey_drafts").delete().eq("draft_token", token).then(() => {
      localStorage.removeItem(DRAFT_TOKEN_KEY);
      lastSavedHash.current = "";
    });
  }, []);

  const getDraftToken = useCallback(() => draftToken.current, []);

  // ── Effects ───────────────────────────────────────────────────────

  // Debounced save on any data change (no hasContent gate — save everything)
  useEffect(() => {
    scheduleSave();
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
