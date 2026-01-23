import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SurveyData, initialSurveyData } from "@/types/survey";
import { validateSurveyData } from "@/lib/surveyValidation";
import { useSurveyAutosave } from "@/hooks/useSurveyAutosave";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Send, Loader2, Zap } from "lucide-react";

import { SurveyHeader } from "@/components/survey/SurveyHeader";
import { SurveyProgress } from "@/components/survey/SurveyProgress";
import { DraftRestorationBanner } from "@/components/survey/DraftRestorationBanner";
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
import { StepEnergySharing } from "@/components/survey/steps/StepEnergySharing";
import { StepFinal } from "@/components/survey/steps/StepFinal";

export default function Survey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<SurveyData>(initialSurveyData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [savedDraftInfo, setSavedDraftInfo] = useState<{ savedAt: string; step: number } | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  const { getSavedDraft, restoreDraft, clearDraft, formatSavedTime } = useSurveyAutosave(data, currentStep, setData, setCurrentStep);

  useEffect(() => {
    const draft = getSavedDraft();
    if (draft) {
      setSavedDraftInfo({ savedAt: draft.savedAt, step: draft.currentStep });
      setShowDraftBanner(true);
    }
  }, [getSavedDraft]);

  const updateData = <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // Determine which steps to show based on project focus and status
  const isGgvInOperation = data.planningStatus.includes('pv_laeuft_ggv_laeuft');
  const isGgvOrMieterstrom = data.projectFocus === 'ggv' || data.projectFocus === 'mieterstrom' || 
    data.projectTypes.includes('ggv') || data.projectTypes.includes('mieterstrom') || data.projectTypes.includes('ggv_oder_mieterstrom');
  const isEnergySharing = data.projectFocus === 'energysharing' || data.projectTypes.includes('energysharing');
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

      if (data.projectFocus === 'ggv' || data.ggvOrMieterstromDecision === 'sicher_ggv') {
        baseSteps.push({ id: "vnb-planning", title: "VNB Planung", description: "Details zur GGV-Planung" });
        if (data.vnbMsbOffer) {
          baseSteps.push({ id: "vnb-msb", title: "MSB Details", description: "Messstellenbetreiber" });
        }
        if (isGgvInOperation) {
          baseSteps.push({ id: "ggv-operation", title: "GGV Betrieb", description: "Erfahrungen im Betrieb" });
        }
        baseSteps.push({ id: "service-provider", title: "Dienstleister", description: "Feedback & Reaktionen" });
      }
    }

    if (isEnergySharing) {
      baseSteps.push({ id: "energy-sharing", title: "Energy Sharing", description: "Details zu Energy Sharing" });
    }

    baseSteps.push({ id: "final", title: "Abschluss", description: "Letzte Informationen" });

    return baseSteps;
  }, [data.projectFocus, data.ggvOrMieterstromDecision, data.vnbMsbOffer, isGgvInOperation, isEnergySharing, onlyEnergySharing]);

  const handleRestoreDraft = () => {
    const draft = getSavedDraft();
    if (draft) { restoreDraft(draft); setShowDraftBanner(false); }
  };

  const handleDiscardDraft = () => { clearDraft(); setShowDraftBanner(false); };
  const handleNext = () => { if (currentStep < steps.length - 1) { setCurrentStep(currentStep + 1); window.scrollTo(0, 0); } };
  const handleBack = () => { if (currentStep > 0) { setCurrentStep(currentStep - 1); window.scrollTo(0, 0); } };

  const handleSubmit = async () => {
    const validation = validateSurveyData(data);
    if (!validation.success) {
      toast.warning("Einige Eingaben sind möglicherweise unvollständig - die Umfrage wird trotzdem abgeschickt");
    }

    setIsSubmitting(true);
    try {
      const dbData = {
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
        vnb_rejection_response: data.vnbRejectionResponse,
        es_status: data.esStatus,
        es_status_other: data.esStatusOther,
        es_in_operation_details: data.esInOperationDetails,
        es_operator_details: data.esOperatorDetails,
        es_plant_type: data.esPlantType,
        es_pv_size_kw: data.esPvSizeKw,
        es_wind_size_kw: data.esWindSizeKw,
        es_party_count: data.esPartyCount,
        es_consumer_types: data.esConsumerTypes,
        es_consumer_details: data.esConsumerDetails,
        es_vnb_contact: data.esVnbContact,
        es_vnb_response: data.esVnbResponse,
        es_vnb_response_other: data.esVnbResponseOther,
        es_info_sources: data.esInfoSources,
        helpful_info_sources: data.helpfulInfoSources,
        additional_experiences: data.additionalExperiences,
        survey_improvements: data.surveyImprovements,
        uploaded_documents: uploadedDocuments,
        nps_score: data.npsScore,
      };

      const { error } = await supabase.from('survey_responses').insert(dbData);
      if (error) throw error;

      clearDraft();
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

    switch (stepId) {
      case "about": return <StepAboutYou data={data} updateData={updateData} />;
      case "project": return <StepProjectDetails data={data} updateData={updateData} />;
      case "planning": return <StepPlanningStatus data={data} updateData={updateData} />;
      case "challenges": return <StepChallenges data={data} updateData={updateData} />;
      case "vnb-planning": return <StepVnbPlanningGgv data={data} updateData={updateData} uploadedDocuments={uploadedDocuments} setUploadedDocuments={setUploadedDocuments} />;
      case "vnb-msb": return <StepVnbMsbDetails data={data} updateData={updateData} />;
      case "ggv-operation": return <StepGgvOperation data={data} updateData={updateData} uploadedDocuments={uploadedDocuments} setUploadedDocuments={setUploadedDocuments} />;
      case "service-provider": return <StepServiceProvider data={data} updateData={updateData} />;
      case "energy-sharing": return <StepEnergySharing data={data} updateData={updateData} />;
      case "final": return <StepFinal data={data} updateData={updateData} uploadedDocuments={uploadedDocuments} setUploadedDocuments={setUploadedDocuments} />;
      default: return null;
    }
  };

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
                  <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    Ihre Antworten helfen uns, die Transparenz bei Verteilnetzbetreibern zu verbessern.
                  </p>
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
