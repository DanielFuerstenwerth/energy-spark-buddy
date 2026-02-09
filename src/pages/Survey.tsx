import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SurveyData, initialSurveyData } from "@/types/survey";
import { validateSurveyData } from "@/lib/surveyValidation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Send, Loader2, Zap, FileText, Download } from "lucide-react";

import { SurveyHeader } from "@/components/survey/SurveyHeader";
import { SurveyProgress } from "@/components/survey/SurveyProgress";
import { DraftRestorationBanner } from "@/components/survey/DraftRestorationBanner";
import { EvaluationTabs } from "@/components/survey/EvaluationTabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { StepAboutYou } from "@/components/survey/steps/StepAboutYou";
import { StepProjectDetails } from "@/components/survey/steps/StepProjectDetails";
import { StepPlanningStatus } from "@/components/survey/steps/StepPlanningStatus";
import { StepChallenges } from "@/components/survey/steps/StepChallenges";
import { StepVnbPlanningGgv } from "@/components/survey/steps/StepVnbPlanningGgv";
import { StepVnbMsbDetails } from "@/components/survey/steps/StepVnbMsbDetails";
import { StepGgvOperation } from "@/components/survey/steps/StepGgvOperation";
import { StepServiceProvider } from "@/components/survey/steps/StepServiceProvider";
import { StepMieterstromPlanning } from "@/components/survey/steps/StepMieterstromPlanning";
import { StepMieterstromVnbOffer } from "@/components/survey/steps/StepMieterstromVnbOffer";
import { StepMieterstromOperation } from "@/components/survey/steps/StepMieterstromOperation";
import { StepEnergySharing } from "@/components/survey/steps/StepEnergySharing";
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
  const effectiveProjectTypes = globalData.projectTypes;
  const isGgvInOperation = evalData.planningStatus?.includes('pv_laeuft_ggv_laeuft');
  const isMieterstromInOperation = evalData.mieterstromInOperation === true;
  const isGgv = effectiveProjectTypes.includes('ggv') || evalData.ggvOrMieterstromDecision === 'sicher_ggv';
  const isMieterstrom = effectiveProjectTypes.includes('mieterstrom') || evalData.ggvOrMieterstromDecision === 'sicher_mieterstrom';
  const isGgvOrMieterstrom = effectiveProjectTypes.includes('ggv') || effectiveProjectTypes.includes('mieterstrom') || 
    effectiveProjectTypes.includes('ggv_oder_mieterstrom');
  const isEnergySharing = effectiveProjectTypes.includes('energysharing');
  const onlyEnergySharing = isEnergySharing && !isGgvOrMieterstrom;

  const steps = useMemo(() => {
    const baseSteps = [
      { id: "about", title: "Über Sie", description: "Einordnung & Motivation" },
      { id: "project", title: "Projekt", description: "Projektdetails & VNB" },
    ];

    if (!onlyEnergySharing) {
      baseSteps.push(
        { id: "planning", title: "Planungsstand", description: "Aktueller Status" },
        { id: "challenges", title: "Herausforderungen", description: "Erlebte Schwierigkeiten" }
      );

      if (isGgv || evalData.ggvOrMieterstromDecision === 'sicher_ggv' || effectiveProjectTypes.includes('ggv_oder_mieterstrom')) {
        baseSteps.push({ id: "vnb-planning", title: "VNB Planung (GGV)", description: "Details zur GGV-Planung" });
        if (evalData.vnbMsbOffer) {
          baseSteps.push({ id: "vnb-msb", title: "MSB Details", description: "Messstellenbetreiber" });
        }
        if (isGgvInOperation) {
          baseSteps.push({ id: "ggv-operation", title: "GGV Betrieb", description: "Erfahrungen im Betrieb" });
        }
        baseSteps.push({ id: "service-provider", title: "Dienstleister", description: "Feedback & Reaktionen" });
      }

      if (isMieterstrom || evalData.ggvOrMieterstromDecision === 'sicher_mieterstrom' || effectiveProjectTypes.includes('ggv_oder_mieterstrom')) {
        baseSteps.push({ id: "mieterstrom-planning", title: "Mieterstrom Planung", description: "Details zu Mieterstrom" });
        if (!isMieterstromInOperation) {
          baseSteps.push({ id: "mieterstrom-vnb-offer", title: "VNB Angebot", description: "MSB-Angebot für Mieterstrom" });
        }
        if (isMieterstromInOperation) {
          baseSteps.push({ id: "mieterstrom-operation", title: "Mieterstrom Betrieb", description: "Erfahrungen im Betrieb" });
        }
      }
    }

    if (isEnergySharing) {
      baseSteps.push({ id: "energy-sharing", title: "Energy Sharing", description: "Details zu Energy Sharing" });
    }

    baseSteps.push({ id: "final", title: "Abschluss", description: "Letzte Informationen" });

    return baseSteps;
  }, [effectiveProjectTypes, evalData.ggvOrMieterstromDecision, evalData.vnbMsbOffer, isGgvInOperation, isMieterstromInOperation, isGgv, isMieterstrom, isEnergySharing, onlyEnergySharing]);

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
      case "project": return <StepProjectDetails data={evalData} updateData={updateEvaluationData} globalData={globalData} />;
      case "planning": return <StepPlanningStatus data={evalData} updateData={updateEvaluationData} />;
      case "challenges": return <StepChallenges data={evalData} updateData={updateEvaluationData} />;
      case "vnb-planning": return <StepVnbPlanningGgv data={evalData} updateData={updateEvaluationData} uploadedDocuments={uploadedDocuments} setUploadedDocuments={setUploadedDocuments} />;
      case "vnb-msb": return <StepVnbMsbDetails data={evalData} updateData={updateEvaluationData} />;
      case "ggv-operation": return <StepGgvOperation data={evalData} updateData={updateEvaluationData} uploadedDocuments={uploadedDocuments} setUploadedDocuments={setUploadedDocuments} />;
      case "service-provider": return <StepServiceProvider data={evalData} updateData={updateEvaluationData} />;
      case "mieterstrom-planning": return <StepMieterstromPlanning data={evalData} updateData={updateEvaluationData} uploadedDocuments={uploadedDocuments} setUploadedDocuments={setUploadedDocuments} />;
      case "mieterstrom-vnb-offer": return <StepMieterstromVnbOffer data={evalData} updateData={updateEvaluationData} />;
      case "mieterstrom-operation": return <StepMieterstromOperation data={evalData} updateData={updateEvaluationData} uploadedDocuments={uploadedDocuments} setUploadedDocuments={setUploadedDocuments} />;
      case "energy-sharing": return <StepEnergySharing data={stepData} updateData={stepUpdateData} />;
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
      
      {/* Audit/Export Links */}
      <div className="max-w-3xl mx-auto w-full px-4 pt-4">
        <div className="flex flex-wrap gap-3 justify-end text-sm">
          <a href="/umfrage/audit/" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <FileText className="w-4 h-4" />Audit/Druckansicht
          </a>
          <a href="/audit.html" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <FileText className="w-4 h-4" />Audit (Direktlink)
          </a>
          <a href="/data/umfrage.full.json" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <Download className="w-4 h-4" />Full JSON
          </a>
        </div>
      </div>
      
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

/** Map SurveyData to DB columns */
function buildDbData(data: SurveyData, sessionGroupId: string, uploadedDocuments: string[]) {
  return {
    session_group_id: sessionGroupId,
    evaluation_label: data.evaluationLabel,
    project_address: data.projectAddress,
    project_plz: data.projectPlz,
    actor_types: data.actorTypes,
    actor_other: data.actorOther,
    actor_text_fields: data.actorTextFields,
    motivation: data.motivation,
    motivation_other: data.motivationOther,
    project_types: data.projectTypes,
    contact_email: data.contactEmail || null,
    vnb_name: data.vnbName,
    project_focus: data.projectFocus,
    ggv_project_type: data.ggvProjectType,
    ggv_pv_size_kw: data.ggvPvSizeKw,
    ggv_party_count: data.ggvPartyCount,
    ggv_building_type: data.ggvBuildingType,
    ggv_building_count: data.ggvBuildingCount,
    ggv_additional_info: data.ggvAdditionalInfo,
    ggv_in_operation: data.ggvInOperation,
    mieterstrom_project_type: data.mieterstromProjectType,
    mieterstrom_pv_size_kw: data.mieterstromPvSizeKw,
    mieterstrom_party_count: data.mieterstromPartyCount,
    mieterstrom_building_type: data.mieterstromBuildingType,
    mieterstrom_building_count: data.mieterstromBuildingCount,
    mieterstrom_additional_info: data.mieterstromAdditionalInfo,
    mieterstrom_in_operation: data.mieterstromInOperation,
    planning_status: data.planningStatus,
    planning_status_other: data.planningStatusOther,
    ggv_or_mieterstrom_decision: data.ggvOrMieterstromDecision,
    ggv_decision_reasons: data.ggvDecisionReasons,
    ggv_decision_reasons_other: data.ggvDecisionReasonsOther,
    mieterstrom_decision_reasons: data.mieterstromDecisionReasons,
    mieterstrom_decision_reasons_other: data.mieterstromDecisionReasonsOther,
    implementation_approach: data.implementationApproach,
    challenges: data.challenges,
    challenges_details: data.challengesDetails,
    vnb_existing_projects: data.vnbExistingProjects,
    vnb_existing_projects_other: data.vnbExistingProjectsOther,
    vnb_contact: data.vnbContact,
    vnb_contact_other: data.vnbContactOther,
    vnb_response: data.vnbResponse,
    vnb_response_reasons: data.vnbResponseReasons,
    vnb_support_messkonzept: data.vnbSupportMesskonzept,
    vnb_support_formulare: data.vnbSupportFormulare,
    vnb_support_portal: data.vnbSupportPortal,
    vnb_support_other: data.vnbSupportOther,
    vnb_contact_helpful: data.vnbContactHelpful,
    vnb_contact_helpful_other: data.vnbContactHelpfulOther,
    vnb_personal_contacts: data.vnbPersonalContacts,
    vnb_personal_contacts_other: data.vnbPersonalContactsOther,
    vnb_support_rating: data.vnbSupportRating,
    vnb_msb_offer: data.vnbMsbOffer,
    vnb_start_timeline: data.vnbStartTimeline,
    vnb_start_timeline_other: data.vnbStartTimelineOther,
    vnb_additional_costs: data.vnbAdditionalCosts,
    vnb_additional_costs_one_time: data.vnbAdditionalCostsOneTime,
    vnb_additional_costs_yearly: data.vnbAdditionalCostsYearly,
    vnb_full_service: data.vnbFullService,
    vnb_data_provision: data.vnbDataProvision,
    vnb_data_cost: data.vnbDataCost,
    vnb_data_cost_amount: data.vnbDataCostAmount,
    vnb_esa_cost: data.vnbEsaCost,
    vnb_esa_cost_amount: data.vnbEsaCostAmount,
    vnb_msb_timeline: data.vnbMsbTimeline,
    vnb_rejection_timeline: data.vnbRejectionTimeline,
    vnb_wandlermessung: data.vnbWandlermessung,
    vnb_wandlermessung_comment: data.vnbWandlermessungComment,
    vnb_planning_duration: data.vnbPlanningDuration,
    operation_vnb_duration: data.operationVnbDuration,
    operation_wandlermessung: data.operationWandlermessung,
    operation_wandlermessung_comment: data.operationWandlermessungComment,
    operation_msb_provider: data.operationMsbProvider,
    operation_allocation_provider: data.operationAllocationProvider,
    operation_data_provider: data.operationDataProvider,
    operation_data_provider_other: data.operationDataProviderOther,
    operation_msb_duration: data.operationMsbDuration,
    operation_msb_additional_costs: data.operationMsbAdditionalCosts,
    operation_msb_additional_costs_one_time: data.operationMsbAdditionalCostsOneTime,
    operation_msb_additional_costs_yearly: data.operationMsbAdditionalCostsYearly,
    operation_allocation_who: data.operationAllocationWho,
    operation_allocation_who_other: data.operationAllocationWhoOther,
    operation_data_format: data.operationDataFormat,
    operation_data_format_other: data.operationDataFormatOther,
    operation_data_cost: data.operationDataCost,
    operation_data_cost_amount: data.operationDataCostAmount,
    operation_esa_cost: data.operationEsaCost,
    operation_esa_cost_amount: data.operationEsaCostAmount,
    operation_satisfaction_rating: data.operationSatisfactionRating,
    service_provider_name: data.serviceProviderName,
    service_provider_rating: data.serviceProviderRating,
    service_provider_comments: data.serviceProviderComments,
    service_provider_2_name: data.serviceProvider2Name,
    service_provider_2_rating: data.serviceProvider2Rating,
    service_provider_2_comments: data.serviceProvider2Comments,
    vnb_rejection_response: data.vnbRejectionResponse,
    vnb_rejection_response_other: data.vnbRejectionResponseOther,
    mieterstrom_summenzaehler: data.mieterstromSummenzaehler,
    mieterstrom_existing_projects: data.mieterstromExistingProjects,
    mieterstrom_existing_projects_virtuell: data.mieterstromExistingProjectsVirtuell,
    mieterstrom_vnb_contact: data.mieterstromVnbContact,
    mieterstrom_vnb_contact_other: data.mieterstromVnbContactOther,
    mieterstrom_virtuell_allowed: data.mieterstromVirtuellAllowed,
    mieterstrom_virtuell_wandlermessung: data.mieterstromVirtuellWandlermessung,
    mieterstrom_virtuell_wandlermessung_comment: data.mieterstromVirtuellWandlermessungComment,
    mieterstrom_vnb_response: data.mieterstromVnbResponse,
    mieterstrom_vnb_response_reasons: data.mieterstromVnbResponseReasons,
    mieterstrom_vnb_support: data.mieterstromVnbSupport,
    mieterstrom_vnb_support_other: data.mieterstromVnbSupportOther,
    mieterstrom_vnb_helpful: data.mieterstromVnbHelpful,
    mieterstrom_vnb_helpful_other: data.mieterstromVnbHelpfulOther,
    mieterstrom_personal_contacts: data.mieterstromPersonalContacts,
    mieterstrom_personal_contacts_other: data.mieterstromPersonalContactsOther,
    mieterstrom_support_rating: data.mieterstromSupportRating,
    mieterstrom_full_service: data.mieterstromFullService,
    mieterstrom_msb_costs: data.mieterstromMsbCosts,
    mieterstrom_msb_costs_one_time: data.mieterstromMsbCostsOneTime,
    mieterstrom_msb_costs_yearly: data.mieterstromMsbCostsYearly,
    mieterstrom_msb_costs_other: data.mieterstromMsbCostsOther,
    mieterstrom_model_choice: data.mieterstromModelChoice,
    mieterstrom_data_provision: data.mieterstromDataProvision,
    mieterstrom_vnb_role: data.mieterstromVnbRole,
    mieterstrom_vnb_duration: data.mieterstromVnbDuration,
    mieterstrom_vnb_duration_reasons: data.mieterstromVnbDurationReasons,
    mieterstrom_wandlermessung: data.mieterstromWandlermessung,
    mieterstrom_wandlermessung_comment: data.mieterstromWandlermessungComment,
    mieterstrom_msb_provider: data.mieterstromMsbProvider,
    mieterstrom_data_provider: data.mieterstromDataProvider,
    mieterstrom_data_provider_other: data.mieterstromDataProviderOther,
    mieterstrom_msb_install_duration: data.mieterstromMsbInstallDuration,
    mieterstrom_operation_costs: data.mieterstromOperationCosts,
    mieterstrom_operation_costs_one_time: data.mieterstromOperationCostsOneTime,
    mieterstrom_operation_costs_yearly: data.mieterstromOperationCostsYearly,
    mieterstrom_operation_satisfaction: data.mieterstromOperationSatisfaction,
    mieterstrom_rejection_response: data.mieterstromRejectionResponse,
    mieterstrom_rejection_response_other: data.mieterstromRejectionResponseOther,
    mieterstrom_info_sources: data.mieterstromInfoSources,
    mieterstrom_experiences: data.mieterstromExperiences,
    mieterstrom_survey_improvements: data.mieterstromSurveyImprovements,
    mieterstrom_challenges: data.mieterstromChallenges,
    mieterstrom_challenges_opposition: data.mieterstromChallengesOpposition,
    mieterstrom_challenges_pv: data.mieterstromChallengesPv,
    mieterstrom_challenges_vnb: data.mieterstromChallengesVnb,
    mieterstrom_challenges_costs: data.mieterstromChallengesCosts,
    mieterstrom_challenges_other: data.mieterstromChallengesOther,
    es_status: data.esStatus,
    es_status_other: data.esStatusOther,
    es_in_operation_details: data.esInOperationDetails,
    es_operator_details: data.esOperatorDetails,
    es_plant_type: data.esPlantType,
    es_plant_type_details: data.esPlantTypeDetails,
    es_project_scope: data.esProjectScope,
    es_pv_size_kw: data.esPvSizeKw,
    es_wind_size_kw: data.esWindSizeKw,
    es_total_pv_size_kw: data.esTotalPvSizeKw,
    es_total_wind_size_kw: data.esTotalWindSizeKw,
    es_party_count: data.esPartyCount,
    es_consumer_types: data.esConsumerTypes,
    es_consumer_details: data.esConsumerDetails,
    es_consumer_scope: data.esConsumerScope,
    es_consumer_scope_other: data.esConsumerScopeOther,
    es_max_distance: data.esMaxDistance,
    es_vnb_contact: data.esVnbContact,
    es_vnb_response: data.esVnbResponse,
    es_vnb_response_other: data.esVnbResponseOther,
    es_vnb_response_details: data.esVnbResponseDetails,
    es_netzentgelte_discussion: data.esNetzentgelteDiscussion,
    es_netzentgelte_details: data.esNetzentgelteDetails,
    es_info_sources: data.esInfoSources,
    helpful_info_sources: data.helpfulInfoSources,
    additional_experiences: data.additionalExperiences,
    survey_improvements: data.surveyImprovements,
    uploaded_documents: uploadedDocuments,
    nps_score: data.npsScore,
  };
}
