

## Bug: Uploaded documents duplicated across all VNB evaluation rows

### Problem
`uploadedDocuments` is managed as a single `useState` in `Survey.tsx` (line 39). When multiple VNBs are evaluated, `buildDbData` (line 284) passes this same array to every merged submission. Result: every DB row gets all documents, even though they may belong to only one evaluation.

**Confirmed with session `b7be3007-...`:** All 5 rows (Hamburger Energienetze, SH Netz, Avacon, Stromnetz Berlin, Stadtwerke Kaltenkirchen) contain the same 2 files.

### Analysis of upload contexts

There are two distinct upload contexts:
1. **Per-evaluation uploads** (e.g. rejection docs in step 4/6) — these are embedded in specific legacy steps like `StepVnbPlanningGgv` and `StepMieterstromPlanning`, and should belong to that specific VNB evaluation only.
2. **Global uploads** (question 8.2 "documentUpload" in Abschluss section) — these are in the final step shared across all evaluations.

Currently both contexts write to the same `uploadedDocuments` state, causing cross-contamination.

### Proposed fix

**Move `uploadedDocuments` into per-evaluation state:**

1. **`useMultiEvaluation.ts`**: Add `uploadedDocuments: string[]` to the `Evaluation` interface, initialized as `[]`.

2. **`Survey.tsx`**: 
   - Remove the global `uploadedDocuments` state.
   - Add `uploadedDocuments` and `setUploadedDocuments` as per-evaluation accessors (similar to how `updateEvaluationData` works).
   - In `doSubmit`, pass each evaluation's own `uploadedDocuments` to `buildDbData`.

3. **`SurveyRenderer.tsx`**: The `uploadedDocuments`/`setUploadedDocuments` props already flow through — no structural change needed, just the source changes from global to per-evaluation.

4. **`buildDbData` in `surveySchema.ts`**: No change needed — it already receives `uploadedDocuments` as a parameter.

5. **`useSurveyDraftSync.ts`**: Ensure per-evaluation documents are included in draft persistence so they survive page reloads.

### Data repair

For the existing session `b7be3007-...`: Since we can't determine which VNB the files actually belong to without user confirmation, we leave the data as-is. Going forward, new submissions will correctly scope documents to their evaluation.

### Files to modify
- `src/hooks/useMultiEvaluation.ts` — add `uploadedDocuments` to Evaluation
- `src/pages/Survey.tsx` — remove global state, wire per-evaluation docs
- `src/hooks/useSurveyDraftSync.ts` — include per-eval docs in sync

