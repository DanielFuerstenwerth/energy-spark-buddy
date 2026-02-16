import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SurveyData } from "@/types/survey";
import { validateSurveyData } from "@/lib/surveyValidation";
import { buildDbData, surveyDefinition } from "@/data/surveySchema";
import { getVisibleSteps, isGlobalStep } from "@/data/surveySteps";
import { SurveyRenderer, isSectionVisible } from "@/components/survey/SurveyRenderer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Send, Loader2, Zap } from "lucide-react";

import { SurveyHeader } from "@/components/survey/SurveyHeader";
import { SurveyProgress } from "@/components/survey/SurveyProgress";
import { DraftRestorationBanner } from "@/components/survey/DraftRestorationBanner";
import { EvaluationTabs } from "@/components/survey/EvaluationTabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { useMultiEvaluation } from "@/hooks/useMultiEvaluation";

const DRAFT_KEY = "vnb-survey-draft-v2";
const MAX_AGE_DAYS = 7;

export default function Survey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [savedDraftInfo, setSavedDraftInfo] = useState<{ savedAt: string; step: number } | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [dataUsageConfirmed, setDataUsageConfirmed] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // Maßnahme 11: Honeypot

  const {
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
  } = useMultiEvaluation();

  // Autosave
  useEffect(() => {
    const toStore = {
      globalData,
      evaluations,
      activeEvaluationIndex,
      currentStep,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(toStore));
  }, [globalData, evaluations, activeEvaluationIndex, currentStep]);

  // Draft restoration check on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const savedDate = new Date(parsed.savedAt);
      const daysDiff = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > MAX_AGE_DAYS) { localStorage.removeItem(DRAFT_KEY); return; }
      const gd = parsed.globalData;
      const hasContent = gd?.actorTypes?.length > 0 || gd?.motivation?.length > 0 || gd?.projectTypes?.length > 0;
      if (!hasContent) return;
      setSavedDraftInfo({ savedAt: parsed.savedAt, step: parsed.currentStep });
      setShowDraftBanner(true);
    } catch { /* ignore */ }
  }, []);

  const handleRestoreDraft = () => {
    try {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      restoreState({
        globalData: parsed.globalData,
        evaluations: parsed.evaluations,
        activeEvaluationIndex: parsed.activeEvaluationIndex,
      });
      setCurrentStep(parsed.currentStep);
      setShowDraftBanner(false);
    } catch { /* ignore */ }
  };

  const handleDiscardDraft = () => { localStorage.removeItem(DRAFT_KEY); setShowDraftBanner(false); };

  const formatSavedTime = (isoString: string): string => {
    const diffMinutes = Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60));
    if (diffMinutes < 1) return "gerade eben";
    if (diffMinutes < 60) return `vor ${diffMinutes} Minuten`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `vor ${diffHours} Stunden`;
    return `vor ${Math.floor(diffHours / 24)} Tagen`;
  };

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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Show warning when leaving "project" step without VNB or location
      if (currentStepDef?.id === 'project' && !hasVnbOrLocation) {
        setShowVnbWarning(true);
      }
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  const handleBack = () => { if (currentStep > 0) { setCurrentStep(currentStep - 1); window.scrollTo(0, 0); } };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Maßnahme 1: Doppel-Submit-Guard
    setIsSubmitting(true);
    try {
      const mergedSubmissions = getMergedSubmissions();
      
      // Maßnahme 8: Validierung blockiert Submit bei kritischen Fehlern
      for (const submission of mergedSubmissions) {
        const validation = validateSurveyData(submission);
        if (!validation.success) {
          const requiredErrors = validation.errors.filter(e => 
            e.message.includes('Required') || e.message.includes('invalid_type')
          );
          if (requiredErrors.length > 0) {
            toast.error(`Pflichtfelder in „${submission.evaluationLabel}" fehlen: ${requiredErrors.map(e => e.field).join(', ')}`);
            setIsSubmitting(false);
            return; // Block submit
          }
          toast.warning(`Einige Eingaben in „${submission.evaluationLabel}" sind möglicherweise unvollständig - wird trotzdem abgeschickt`);
        }
      }

      // Maßnahme 5+6: Serverseitige Validierung + atomare Transaktion via Edge Function
      const dbRows = mergedSubmissions.map(sub => 
        buildDbData(sub, sessionGroupId, uploadedDocuments)
      );

      const response = await supabase.functions.invoke('submit-survey', {
        body: { submissions: dbRows, website: honeypot }, // honeypot field
      });

      if (response.error) {
        console.error('Edge function error:', response.error);
        throw new Error(response.error.message || 'Submission failed');
      }

      const result = response.data;
      if (result?.error) {
        console.error('Server validation error:', result.error, result.details);
        if (result.error === 'Rate limit exceeded. Please try again later.') {
          toast.error('Zu viele Einsendungen. Bitte versuchen Sie es später erneut.');
        } else if (result.error === 'Validation failed') {
          toast.error(`Validierungsfehler: ${result.details?.join('; ') || 'Unbekannt'}`);
        } else {
          throw new Error(result.error);
        }
        setIsSubmitting(false);
        return;
      }

      localStorage.removeItem(DRAFT_KEY);
      toast.success("Vielen Dank für Ihre Teilnahme!");
      setCurrentStep(steps.length);
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error("Fehler beim Absenden. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get sections for current step, filtered by visibility
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
          {showDraftBanner && savedDraftInfo && (
            <DraftRestorationBanner savedTime={formatSavedTime(savedDraftInfo.savedAt)} stepTitle={steps[savedDraftInfo.step]?.title || "Unbekannt"} onRestore={handleRestoreDraft} onDiscard={handleDiscardDraft} />
          )}
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
                uploadedDocuments={uploadedDocuments}
                setUploadedDocuments={setUploadedDocuments}
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
                  ⚠ Ohne Angabe von VNB oder des Projektstandortes kann Ihre Bewertung nicht vollständig genutzt werden.
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
    </div>
  );
}
