import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SurveyData } from "@/types/survey";
import { validateSurveyData } from "@/lib/surveyValidation";
import { buildDbData } from "@/data/surveySchema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Send, Loader2, Zap } from "lucide-react";

import { SurveyHeader } from "@/components/survey/SurveyHeader";
import { SurveyProgress } from "@/components/survey/SurveyProgress";
import { DraftRestorationBanner } from "@/components/survey/DraftRestorationBanner";
import { EvaluationTabs } from "@/components/survey/EvaluationTabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { StepAboutYou } from "@/components/survey/steps/StepAboutYou";
import { StepProjectDetails } from "@/components/survey/steps/StepProjectDetails";
import { StepPlanningGeneral } from "@/components/survey/steps/StepPlanningGeneral";
import { StepPlanningModel } from "@/components/survey/steps/StepPlanningModel";
import { StepOperationModel } from "@/components/survey/steps/StepOperationModel";
import { StepFinal } from "@/components/survey/steps/StepFinal";

import { useMultiEvaluation, isGlobalStep } from "@/hooks/useMultiEvaluation";

const DRAFT_KEY = "vnb-survey-draft-v2";
const MAX_AGE_DAYS = 7;

export default function Survey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [savedDraftInfo, setSavedDraftInfo] = useState<{ savedAt: string; step: number } | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

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
    getDataForStep,
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
  
  // For step logic, merge global projectTypes into evaluation context
  const effectiveProjectTypes = evalData.projectTypes;
  const isGgvInOperation = evalData.planningStatus?.includes('pv_laeuft_ggv_laeuft');
  const isMieterstromInOperation = evalData.mieterstromInOperation === true;
  const isGgv = effectiveProjectTypes.includes('ggv') || effectiveProjectTypes.includes('ggv_oder_mieterstrom');
  const isMieterstrom = effectiveProjectTypes.includes('mieterstrom') || effectiveProjectTypes.includes('ggv_oder_mieterstrom');
  const isGgvOrMieterstrom = isGgv || isMieterstrom;
  const isEnergySharing = effectiveProjectTypes.includes('energysharing');
  const onlyEnergySharing = isEnergySharing && !isGgvOrMieterstrom;
  const hasAnyModel = isGgvOrMieterstrom || isEnergySharing;

  const steps = useMemo(() => {
    const baseSteps = [
      { id: "about", title: "Über Sie", description: "Einordnung & Motivation" },
      { id: "project", title: "Projekt", description: "Projektdetails & VNB" },
      { id: "planning-general", title: "Planung: Allgemeines", description: "Planungsstand & Herausforderungen" },
      { id: "planning-model", title: "Planung: Modellspezifisch", description: "Details zum gewählten Modell" },
    ];

    if (!onlyEnergySharing) {
      baseSteps.push({ id: "operation-model", title: "Betrieb: Modellspezifisch", description: "Erfahrungen im Betrieb" });
    }

    baseSteps.push({ id: "final", title: "Abschluss", description: "Letzte Informationen" });

    return baseSteps;
  }, [onlyEnergySharing]);

  const handleNext = () => { if (currentStep < steps.length - 1) { setCurrentStep(currentStep + 1); window.scrollTo(0, 0); } };
  const handleBack = () => { if (currentStep > 0) { setCurrentStep(currentStep - 1); window.scrollTo(0, 0); } };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const mergedSubmissions = getMergedSubmissions();
      
      for (const submission of mergedSubmissions) {
        const validation = validateSurveyData(submission);
        if (!validation.success) {
          toast.warning(`Einige Eingaben in „${submission.evaluationLabel}" sind möglicherweise unvollständig - wird trotzdem abgeschickt`);
        }
      }

      for (const sub of mergedSubmissions) {
        const dbData = buildDbData(sub, sessionGroupId, uploadedDocuments);
        const { error } = await supabase.from('survey_responses').insert(dbData);
        if (error) throw error;
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

  const renderStep = () => {
    const stepId = steps[currentStep]?.id;
    const isGlobal = isGlobalStep(stepId);
    const stepData = isGlobal ? globalData : evalData;
    const stepUpdateData = isGlobal ? updateGlobalData : updateEvaluationData;

    switch (stepId) {
      case "about": return <StepAboutYou data={stepData} updateData={stepUpdateData} />;
      case "project": return <StepProjectDetails data={evalData} updateData={updateEvaluationData} />;
      case "planning-general": return <StepPlanningGeneral data={evalData} updateData={updateEvaluationData} />;
      case "planning-model": return (
        <StepPlanningModel
          data={evalData}
          updateData={updateEvaluationData}
          uploadedDocuments={uploadedDocuments}
          setUploadedDocuments={setUploadedDocuments}
          showGgv={isGgv}
          showMieterstrom={isMieterstrom}
          showEnergySharing={isEnergySharing}
        />
      );
      case "operation-model": return (
        <StepOperationModel
          data={evalData}
          updateData={updateEvaluationData}
          uploadedDocuments={uploadedDocuments}
          setUploadedDocuments={setUploadedDocuments}
          showGgv={isGgv}
          showGgvInOperation={isGgvInOperation}
          showMieterstrom={isMieterstrom}
          showMieterstromInOperation={isMieterstromInOperation}
        />
      );
      case "final": return <StepFinal data={stepData} updateData={stepUpdateData} uploadedDocuments={uploadedDocuments} setUploadedDocuments={setUploadedDocuments} />;
      default: return null;
    }
  };

  const currentStepId = steps[currentStep]?.id;
  const showEvaluationTabs = currentStepId && !isGlobalStep(currentStepId) && currentStepId !== 'about';

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
          <SurveyProgress currentStep={currentStep} totalSteps={steps.length} steps={steps} />
          
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
              <CardTitle>{steps[currentStep]?.title}</CardTitle>
              <CardDescription>{steps[currentStep]?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {renderStep()}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
                  <ChevronLeft className="w-4 h-4 mr-2" />Zurück
                </Button>
                {currentStep === steps.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
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

