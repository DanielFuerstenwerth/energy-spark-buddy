import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SurveyData } from "@/types/survey";
import { validateSurveyData } from "@/lib/surveyValidation";
import { buildDbData, expandToLocationRows, surveyDefinition, getHumanLabel, QUESTION_REGISTRY } from "@/data/surveySchema";
import { getVisibleSteps, isGlobalStep } from "@/data/surveySteps";
import { SurveyRenderer, isSectionVisible } from "@/components/survey/SurveyRenderer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Send, Loader2, Zap, AlertTriangle } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { SurveyHeader } from "@/components/survey/SurveyHeader";
import { SurveyMotivation } from "@/components/survey/SurveyMotivation";
import { SurveyProgress } from "@/components/survey/SurveyProgress";
import { EvaluationTabs } from "@/components/survey/EvaluationTabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { useMultiEvaluation } from "@/hooks/useMultiEvaluation";
import { useSurveyDraftSync } from "@/hooks/useSurveyDraftSync";
import { parsePrefillParams } from "@/utils/surveyPrefill";
import { useLocation } from "react-router-dom";
import { track } from "@/utils/plausibleTrack";
import { telemetry } from "@/utils/telemetry";

const LEGACY_DRAFT_KEY = "vnb-survey-draft-v2";
const LEGACY_DRAFT_TOKEN_KEY = "vnb-survey-draft"; // old localStorage key


export default function Survey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // removed: showDraftBanner, savedDraftInfo (no longer needed)
  // uploadedDocuments now lives per-evaluation in useMultiEvaluation
  const [dataUsageConfirmed, setDataUsageConfirmed] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // Maßnahme 11: Honeypot
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  const {
    globalData,
    evaluations,
    activeEvaluationIndex,
    activeEvaluation,
    sessionGroupId,
    setActiveEvaluationIndex,
    updateGlobalData,
    updateEvaluationData,
    updateEvaluationDocuments,
    addEvaluation,
    removeEvaluation,
    renameEvaluation,
    getMergedSubmissions,
    restoreState,
  } = useMultiEvaluation();

  // DB-based draft persistence
  const { saveNow, clearDraftToken, getDraftToken } = useSurveyDraftSync(
    globalData,
    evaluations,
    sessionGroupId,
  );

  // Prefill from query params (ggv-transparenz.de redirect)
  const location = useLocation();
  const [prefillApplied, setPrefillApplied] = useState(false);

  useEffect(() => {
    if (prefillApplied) return;
    const { evalData, hasPrefill } = parsePrefillParams(location.search);
    if (hasPrefill) {
      Object.entries(evalData).forEach(([key, value]) => {
        updateEvaluationData(key as keyof SurveyData, value as SurveyData[keyof SurveyData]);
      });
      setPrefillApplied(true);
      toast.success("Projektdaten von ggv-transparenz.de wurden vorausgefüllt.", { duration: 5000 });
    }
  }, [location.search, prefillApplied, updateEvaluationData]);

  // Autosave to localStorage (backup — primary save is DB-based via useSurveyDraftSync)
  useEffect(() => {
    try {
      const toStore = {
        globalData,
        evaluations,
        activeEvaluationIndex,
        currentStep,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(LEGACY_DRAFT_KEY, JSON.stringify(toStore));
    } catch {
      // Safari Private Browsing: localStorage quota is 0 bytes — silently ignore
    }
  }, [globalData, evaluations, activeEvaluationIndex, currentStep]);

  // One-time cleanup of old localStorage keys from previous implementations
  useEffect(() => {
    localStorage.removeItem(LEGACY_DRAFT_TOKEN_KEY);
  }, []);

  // Use the active evaluation's data for determining step visibility
  const evalData = activeEvaluation.data;

  // Get visible steps based on evaluation data
  const steps = useMemo(() => getVisibleSteps(evalData), [evalData]);

  const hasVnbOrLocation = useMemo(() => {
    const vnb = evalData.vnbName as string | undefined;
    const locations = (evalData as unknown as Record<string, unknown>).projectLocations as Array<{plz?: string; address?: string}> | undefined;
    const hasLoc = locations?.some(l => l.plz?.trim() || l.address?.trim()) || false;
    return !!(vnb?.trim()) || hasLoc;
  }, [evalData]);

  const [showVnbWarning, setShowVnbWarning] = useState(false);

  // ── Plausible: Survey Start (once) ─────────────────────────────────
  const hasFiredStart = useRef(false);
  useEffect(() => {
    const hasStarted =
      (globalData.actorTypes && globalData.actorTypes.length > 0) ||
      evaluations.some(ev => !!ev.data.vnbName || (ev.data.projectTypes && ev.data.projectTypes.length > 0));
    if (hasStarted && !hasFiredStart.current) {
      hasFiredStart.current = true;
      track("Survey Start");
    }
  }, [globalData.actorTypes, evaluations]);

  // ── Plausible: Step View + Question View ──────────────────────────
  useEffect(() => {
    const stepDef = steps[currentStep];
    if (!stepDef) return;
    const stepIndex = String(currentStep + 1);
    track("Survey Step View", { step: stepIndex });

    // Track visible question IDs for this step
    const visibleSections = surveyDefinition.sections
      .filter(s => stepDef.sectionIds.includes(s.id))
      .filter(s => isSectionVisible(s, evalData));
    for (const section of visibleSections) {
      for (const q of section.questions) {
        const reg = QUESTION_REGISTRY[q.id];
        const qid = reg?.uiNumber || q.id;
        track("Survey Question View", { step: stepIndex, qid });
      }
    }
  }, [currentStep, activeEvaluationIndex, steps, evalData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Show warning when leaving "project" step without VNB or location
      if (currentStepDef?.id === 'project' && !hasVnbOrLocation) {
        setShowVnbWarning(true);
      }
      const stepIndex = String(steps.indexOf(currentStepDef!) + 1);
      track("Survey Next", { step: stepIndex });
      setCurrentStep(currentStep + 1);
      saveNow(); // Persist draft to DB on step change
      window.scrollTo(0, 0);
    }
  };
  const handleBack = () => {
    if (currentStep > 0) {
      const stepIndex = String(steps.indexOf(currentStepDef!) + 1);
      track("Survey Back", { step: stepIndex });
      setCurrentStep(currentStep - 1);
      saveNow();
      window.scrollTo(0, 0);
    }
  };
  // Phase 1: Validate and show warnings if any (does NOT submit yet)
  const handleSubmit = () => {
    if (isSubmitting) return;

    const traceId = telemetry.newTraceId();
    traceIdRef.current = traceId;
    clientSubmissionIdRef.current = telemetry.newSubmissionId();

    telemetry.info("handleSubmit_start", {
      component: "Survey/handleSubmit",
      trace_id: traceId,
      client_submission_id: clientSubmissionIdRef.current,
      step_id: String(currentStep),
    });

    const mergedSubmissions = getMergedSubmissions();
    const warnings: string[] = [];
    
    // Maßnahme 8: Validierung blockiert Submit bei kritischen Fehlern
    for (let i = 0; i < mergedSubmissions.length; i++) {
      const submission = mergedSubmissions[i];
      const validation = validateSurveyData(submission);
      if (!validation.success) {
        const requiredErrors = validation.errors.filter(e => 
          e.message.includes('Required') || e.message.includes('invalid_type')
        );
        if (requiredErrors.length > 0) {
          const evalIndex = i;
          const fieldLabels = requiredErrors.map(e => getHumanLabel(e.field));
          // Track validation errors (no PII — only field IDs)
          for (const e of requiredErrors) {
            const reg = QUESTION_REGISTRY[e.field];
            track("Survey Validation Error", {
              step: String(steps.length),
              qid: reg?.uiNumber || e.field,
              error_code: "required",
            });
          }
          toast.error(`Pflichtfelder in „${submission.evaluationLabel}" fehlen: ${fieldLabels.join(', ')}`, {
            duration: Infinity,
            action: {
              label: 'Zur Bewertung springen',
              onClick: () => {
                setActiveEvaluationIndex(evalIndex);
                const projectStepIndex = steps.findIndex(s => s.id === 'project');
                if (projectStepIndex >= 0) {
                  setCurrentStep(projectStepIndex);
                  window.scrollTo(0, 0);
                }
              },
            },
          });
          return; // Block submit
        }
        // Collect non-critical warnings as human-readable list
        const SUPPRESS_WARNING_FIELDS = new Set(['projectLocations', 'mieterstromProjectLocations', 'esProjectLocations']);
        const filteredErrors = validation.errors.filter(e => !SUPPRESS_WARNING_FIELDS.has(e.field));
        if (filteredErrors.length > 0) {
          const fieldLabels = filteredErrors.map(e => getHumanLabel(e.field));
          warnings.push(`„${submission.evaluationLabel}":\n${fieldLabels.map(l => `• ${l}`).join('\n')}`);
        }
      }
    }

    telemetry.info("validation_done", {
      component: "Survey/handleSubmit",
      trace_id: traceId,
      client_submission_id: clientSubmissionIdRef.current,
      extra: { warning_count: warnings.length },
    });

    if (warnings.length > 0) {
      // Show blocking confirmation dialog instead of a fleeting toast
      setValidationWarnings(warnings);
      setShowWarningDialog(true);
      return;
    }

    // No warnings — submit directly
    doSubmit();
  };

  // Phase 2: Actually send the data
  const retryCountRef = useRef(0);
  const traceIdRef = useRef<string>(telemetry.newTraceId());
  const clientSubmissionIdRef = useRef<string>(telemetry.newSubmissionId());

  const doSubmit = useCallback(async () => {
    if (isSubmitting) return;

    const traceId = traceIdRef.current;
    const clientSubmissionId = clientSubmissionIdRef.current;

    telemetry.info("doSubmit_start", {
      component: "Survey/doSubmit",
      trace_id: traceId,
      client_submission_id: clientSubmissionId,
      retry_count: retryCountRef.current,
    });

    setIsSubmitting(true);
    setShowWarningDialog(false);
    setValidationWarnings([]);

    const invokeStart = performance.now();

    try {
      const mergedSubmissions = getMergedSubmissions();
      const dbRows = mergedSubmissions.flatMap((sub, i) => {
        const evalDocs = evaluations[i]?.uploadedDocuments ?? [];
        const baseRow = buildDbData(sub, sessionGroupId, evalDocs);
        return expandToLocationRows(baseRow, sub);
      });

      const payloadBody = {
        submissions: dbRows,
        website: honeypot,
        draft_token: getDraftToken(),
        client_submission_id: clientSubmissionId,
      };
      const payloadBytes = new Blob([JSON.stringify(payloadBody)]).size;

      telemetry.info("doSubmit_preInvoke", {
        component: "Survey/doSubmit",
        trace_id: traceId,
        client_submission_id: clientSubmissionId,
        row_count: dbRows.length,
        payload_bytes: payloadBytes,
        retry_count: retryCountRef.current,
      });

      const response = await supabase.functions.invoke('submit-survey', {
        body: payloadBody,
      });

      const latencyMs = Math.round(performance.now() - invokeStart);

      if (response.error) {
        console.error('Edge function error:', response.error);
        telemetry.error("doSubmit_failure", {
          component: "Survey/doSubmit",
          trace_id: traceId,
          client_submission_id: clientSubmissionId,
          latency_ms: latencyMs,
          error_name: "EdgeFunctionError",
          error_message: response.error.message,
          stack: JSON.stringify(response.error).slice(0, 5000),
          retry_count: retryCountRef.current,
          extra: { retry_decision: "user_prompted" },
        });
        const errorContext = (response.error as unknown as Record<string, unknown>)?.context;
        const errorBody = typeof errorContext === 'object' && errorContext !== null
          ? (errorContext as Record<string, unknown>)
          : null;
        const details = errorBody?.details || errorBody?.error || response.error.message;
        throw new Error(typeof details === 'string' ? details : JSON.stringify(details) || 'Submission failed');
      }

      const result = response.data;

      // Post-invoke telemetry (success path through edge function)
      telemetry.info("doSubmit_postInvoke", {
        component: "Survey/doSubmit",
        trace_id: traceId,
        client_submission_id: clientSubmissionId,
        status_code: 200,
        latency_ms: latencyMs,
        extra: { response_has_error: !!result?.error, server_count: result?.count },
      });

      if (result?.error) {
        console.error('Server validation error:', result.error, result.details);

        telemetry.warn("doSubmit_serverError", {
          component: "Survey/doSubmit",
          trace_id: traceId,
          client_submission_id: clientSubmissionId,
          error_message: result.error,
          latency_ms: latencyMs,
        });

        if (result.error === 'Rate limit exceeded. Please try again later.') {
          toast.error('Zu viele Einsendungen. Bitte versuchen Sie es in einer Stunde erneut.', { duration: Infinity });
        } else if (result.error === 'Validation failed') {
          toast.error(`Validierungsfehler: ${result.details?.join('; ') || 'Unbekannt'}`, { duration: Infinity });
        } else if (result.error === 'Failed to save survey responses') {
          toast.error(`Speicherfehler: ${result.details || 'Unbekannt'}. Ihre Daten sind lokal gesichert.`, {
            duration: Infinity,
            action: {
              label: 'Erneut versuchen',
              onClick: () => {
                retryCountRef.current++;
                const delay = Math.min(2000 * Math.pow(2, retryCountRef.current - 1), 30000);
                setTimeout(() => doSubmit(), delay);
              },
            },
          });
        } else {
          throw new Error(result.error);
        }
        setIsSubmitting(false);
        return;
      }

      // Success
      retryCountRef.current = 0;

      telemetry.info("doSubmit_success", {
        component: "Survey/doSubmit",
        trace_id: traceId,
        client_submission_id: clientSubmissionId,
        latency_ms: latencyMs,
        extra: {
          server_count: result?.count,
          server_ids: result?.ids,
          was_deduplicated: result?.deduplicated === true,
        },
      });

      track("Survey Complete");
      try { localStorage.removeItem(LEGACY_DRAFT_KEY); } catch { /* Safari private mode */ }
      clearDraftToken();
      toast.success("Vielen Dank für Ihre Teilnahme!");
      setCurrentStep(steps.length);
    } catch (error) {
      console.error('Error submitting survey:', error);
      const latencyMs = Math.round(performance.now() - invokeStart);
      const errorMsg = error instanceof Error ? error.message : 'Unbekannter Fehler';
      const errorStack = error instanceof Error ? error.stack : undefined;

      telemetry.error("doSubmit_failure", {
        component: "Survey/doSubmit",
        trace_id: traceId,
        client_submission_id: clientSubmissionId,
        error_name: error instanceof Error ? error.name : "Unknown",
        error_message: errorMsg,
        stack: errorStack,
        latency_ms: latencyMs,
        retry_count: retryCountRef.current,
        extra: { retry_decision: "user_prompted" },
      });

      toast.error(`Fehler beim Absenden: ${errorMsg}. Ihre Daten sind lokal gesichert.`, {
        duration: Infinity,
        action: {
          label: 'Erneut versuchen',
          onClick: () => {
            retryCountRef.current++;
            const delay = Math.min(2000 * Math.pow(2, retryCountRef.current - 1), 30000);
            setTimeout(() => doSubmit(), delay);
          },
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [getMergedSubmissions, sessionGroupId, evaluations, honeypot, steps.length]);

  const currentStepDef = steps[currentStep];
  const currentSections = useMemo(() => {
    if (!currentStepDef) return [];
    return surveyDefinition.sections
      .filter(s => currentStepDef.sectionIds.includes(s.id))
      .filter(s => isSectionVisible(s, evalData));
  }, [currentStepDef, evalData]);

  const isGlobal = currentStepDef ? isGlobalStep(currentStepDef.id) : false;
  const stepData = isGlobal ? globalData : evalData;
  const stepUpdateData = isGlobal ? updateGlobalData : updateEvaluationData;

  const showEvaluationTabs = currentStepDef && !isGlobal && currentStepDef.id !== 'about';

  if (currentStep >= steps.length) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
                    <Zap className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Vielen Dank!</h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    Ihre Antworten helfen uns, die Transparenz bei Verteilnetzbetreibern zu verbessern.
                  </p>
                  {evaluations.length > 1 && (
                    <p className="text-sm text-muted-foreground mb-8">
                      {evaluations.length} VNB-Bewertungen wurden erfolgreich übermittelt.
                    </p>
                  )}
                  <Button onClick={() => window.location.href = '/'}>Zurück zur Startseite</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <SurveyHeader />
      
      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <SurveyTracker />
          {/* Draft banner removed — drafts are now saved directly to DB */}
          <SurveyProgress currentStep={currentStep} totalSteps={steps.length} steps={steps} onStepClick={(step) => { setCurrentStep(step); window.scrollTo(0, 0); }} />
          
          {showEvaluationTabs && (
            <EvaluationTabs
              evaluations={evaluations}
              activeIndex={activeEvaluationIndex}
              onSelect={setActiveEvaluationIndex}
              onAdd={addEvaluation}
              onRemove={removeEvaluation}
              onRename={renameEvaluation}
            />
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>{currentStepDef?.title}</CardTitle>
              <CardDescription>{currentStepDef?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <SurveyRenderer
                sections={currentSections}
                data={stepData}
                updateData={stepUpdateData}
                uploadedDocuments={activeEvaluation.uploadedDocuments}
                setUploadedDocuments={updateEvaluationDocuments}
                showPrivacyNotice={currentStepDef?.id === 'about'}
                showDataUsageCheckbox={currentStepDef?.id === 'final'}
                dataUsageConfirmed={dataUsageConfirmed}
                onDataUsageConfirmedChange={setDataUsageConfirmed}
              />
              {currentStepDef?.id === 'project' && (!stepData.projectTypes || stepData.projectTypes.length === 0) && (
                <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">💡 Hinweis</p>
                  <p>Sobald Sie oben eine Projektart auswählen (Frage 2.2), erscheinen weitere Abschnitte wie Planung, Modelldetails und ggf. Betrieb.</p>
                </div>
              )}
              {showVnbWarning && !hasVnbOrLocation && (currentStepDef?.id === 'project' || currentStepDef?.id === 'final') && (
                <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-3 text-sm text-amber-700 dark:text-amber-400">
                  ⚠ Ohne Angabe von VNB oder des Projektstandortes kann Ihre Bewertung nicht vollständig genutzt werden.{' '}
                  {currentStepDef?.id === 'final' && (
                    <button
                      type="button"
                      className="underline font-medium hover:text-amber-900 dark:hover:text-amber-300"
                      onClick={() => {
                        const projectStepIndex = steps.findIndex(s => s.id === 'project');
                        if (projectStepIndex >= 0) {
                          setCurrentStep(projectStepIndex);
                          window.scrollTo(0, 0);
                        }
                      }}
                    >
                      Zum Abschnitt „Projekt" springen
                    </button>
                  )}
                </div>
              )}
              {/* Maßnahme 11: Honeypot - unsichtbar für echte Nutzer */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  autoComplete="off"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
                  <ChevronLeft className="w-4 h-4 mr-2" />Zurück
                </Button>
                {currentStep === steps.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={isSubmitting || !dataUsageConfirmed} title={!dataUsageConfirmed ? "Bitte bestätigen Sie die Datennutzung" : undefined}>
                    {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Wird gesendet...</>) : (<>Absenden<Send className="w-4 h-4 ml-2" /></>)}
                  </Button>
                ) : (
                  <Button onClick={handleNext}>Weiter<ChevronRight className="w-4 h-4 ml-2" /></Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Bestätigungsdialog bei Validierungswarnungen */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Einige Angaben scheinen unvollständig
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Folgende Bereiche sind möglicherweise unvollständig:
                </p>
                <ul className="list-none space-y-3 text-sm">
                  {validationWarnings.map((w, i) => {
                    const [title, ...items] = w.split('\n');
                    return (
                      <li key={i}>
                        <span className="font-medium">{title}</span>
                        {items.length > 0 && (
                          <ul className="list-none pl-2 mt-1 space-y-0.5 text-muted-foreground">
                            {items.map((item, j) => (
                              <li key={j}>{item}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <p className="text-sm">
                  Sie können Ihre Eingaben überprüfen und ergänzen, oder die Umfrage so absenden wie sie ist.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setShowWarningDialog(false)}>
              Zurück zur Eingabe
            </AlertDialogCancel>
            <AlertDialogAction onClick={doSubmit}>
              Trotzdem absenden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
