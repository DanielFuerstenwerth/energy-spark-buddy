import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SurveyData, initialSurveyData } from "@/types/survey";
import { validateSurveyData } from "@/lib/surveyValidation";
import { useSurveyAutosave } from "@/hooks/useSurveyAutosave";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Send, Loader2, Zap, Home, Building2, Users } from "lucide-react";

import { SurveyHeader } from "@/components/survey/SurveyHeader";
import { SurveyProgress } from "@/components/survey/SurveyProgress";
import { DraftRestorationBanner } from "@/components/survey/DraftRestorationBanner";
import { MultiSelectQuestion } from "@/components/survey/questions/MultiSelectQuestion";
import { SingleSelectQuestion } from "@/components/survey/questions/SingleSelectQuestion";
import { TextQuestion } from "@/components/survey/questions/TextQuestion";
import { RatingQuestion } from "@/components/survey/questions/RatingQuestion";
import { NpsQuestion } from "@/components/survey/questions/NpsQuestion";
import { FileUpload } from "@/components/survey/questions/FileUpload";
import { SurveyVnbCombobox } from "@/components/survey/questions/SurveyVnbCombobox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ACTOR_OPTIONS = [
  { value: "buergerenergie", label: "Bürgerenergiegenossenschaft", hasTextField: true, textFieldLabel: "Name der Genossenschaft" },
  { value: "weg", label: "Wohnungseigentümergemeinschaft" },
  { value: "vermieter_privat", label: "Vermieter/in - Privatperson" },
  { value: "vermieter_prof_klein", label: "Vermieter/in - Professionell (<100 Einheiten)" },
  { value: "vermieter_wohnungsunternehmen", label: "Vermieter/in - Wohnungsunternehmen (>100 Einheiten)" },
  { value: "kommune", label: "Kommune / kommunales Unternehmen" },
  { value: "kmu", label: "Kleine und Mittelständische Unternehmen (KMU)" },
  { value: "dienstleister", label: "Dienstleister für GGV/Mieterstrom/Energy Sharing", hasTextField: true, textFieldLabel: "Art des Dienstleisters" },
  { value: "installateur", label: "Installateur von PV-Anlagen" },
  { value: "msb", label: "Wettbewerblicher Messstellenbetreiber" },
  { value: "stadtwerk", label: "Stadtwerk/EVU" },
  { value: "andere", label: "Andere", hasTextField: true },
];

const MOTIVATION_OPTIONS = [
  { value: "pv_nutzung", label: "Wir werden auf jeden Fall eine PV-Anlage bauen und möchten den Strom vor Ort nutzen" },
  { value: "energiewende", label: "Wir möchten gerne Energiewende vor Ort umsetzen - sobald das mit der Nutzung geklärt ist, kommt die PV-Anlage" },
  { value: "geschaeft", label: "Der Bau & Betrieb von PV-Anlagen ist ein wesentliches Anliegen von mir/unserem Unternehmen" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const PROJECT_TYPE_OPTIONS = [
  { value: "ggv", label: "Gemeinschaftliche Gebäudeversorgung (GGV)" },
  { value: "mieterstrom", label: "Mieterstrom" },
  { value: "ggv_oder_mieterstrom", label: "Entweder GGV oder Mieterstrom" },
  { value: "energysharing", label: "Energy Sharing (in Zukunft möglich)" },
];

const CHALLENGE_OPTIONS = [
  { value: "regulatorik", label: "Komplexität der regulatorischen Anforderungen", hasTextField: true, textFieldPlaceholder: "Was genau war schwierig?" },
  { value: "abrechnung", label: "Unklarheiten bei der Abrechnung", hasTextField: true },
  { value: "messtechnik", label: "Technische Herausforderungen bei der Messtechnik", hasTextField: true },
  { value: "vnb_kommunikation", label: "Kommunikation mit dem VNB", hasTextField: true },
  { value: "dienstleister", label: "Suche nach geeigneten Dienstleistern", hasTextField: true },
  { value: "wirtschaftlichkeit", label: "Wirtschaftlichkeit des Projekts", hasTextField: true },
  { value: "akzeptanz", label: "Akzeptanz bei Mietern/Eigentümern", hasTextField: true },
  { value: "finanzierung", label: "Finanzierung", hasTextField: true },
  { value: "zeitaufwand", label: "Zeitaufwand für Planung und Umsetzung", hasTextField: true },
  { value: "sonstige", label: "Sonstige Herausforderungen", hasTextField: true },
];

const VNB_CONTACT_OPTIONS = [
  { value: "email", label: "E-Mail" },
  { value: "telefon", label: "Telefon" },
  { value: "portal", label: "Online-Portal" },
  { value: "persoenlich", label: "Persönlicher Kontakt" },
  { value: "keine", label: "Noch kein Kontakt" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const VNB_RESPONSE_OPTIONS = [
  { value: "schnell_hilfreich", label: "Schnell und hilfreich" },
  { value: "langsam_hilfreich", label: "Langsam aber hilfreich" },
  { value: "schnell_nicht_hilfreich", label: "Schnell aber nicht hilfreich" },
  { value: "langsam_nicht_hilfreich", label: "Langsam und nicht hilfreich" },
  { value: "keine_antwort", label: "Keine Antwort erhalten" },
  { value: "noch_offen", label: "Noch offen/wartend" },
];

export default function Survey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<SurveyData>(initialSurveyData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [savedDraftInfo, setSavedDraftInfo] = useState<{ savedAt: string; step: number } | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  const { getSavedDraft, restoreDraft, clearDraft, formatSavedTime } = useSurveyAutosave(
    data,
    currentStep,
    setData,
    setCurrentStep
  );

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

  const steps = useMemo(() => {
    const baseSteps = [
      { title: "Über Sie", description: "Wer sind Sie und was ist Ihre Motivation?" },
      { title: "Projekt", description: "Wählen Sie Ihren Projektschwerpunkt" },
    ];

    // Add focus-specific step
    if (data.projectFocus === 'ggv') {
      baseSteps.push({ title: "GGV Details", description: "Details zu Ihrem GGV-Projekt" });
    } else if (data.projectFocus === 'mieterstrom') {
      baseSteps.push({ title: "Mieterstrom", description: "Details zu Ihrem Mieterstrom-Projekt" });
    } else if (data.projectFocus === 'energysharing') {
      baseSteps.push({ title: "Energy Sharing", description: "Details zu Energy Sharing" });
    }

    baseSteps.push(
      { title: "Herausforderungen", description: "Welche Herausforderungen haben Sie erlebt?" },
      { title: "VNB Erfahrung", description: "Ihre Erfahrungen mit dem Verteilnetzbetreiber" },
      { title: "Abschluss", description: "Weitere Informationen und Feedback" }
    );

    return baseSteps;
  }, [data.projectFocus]);

  const handleRestoreDraft = () => {
    const draft = getSavedDraft();
    if (draft) {
      restoreDraft(draft);
      setShowDraftBanner(false);
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftBanner(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    const validation = validateSurveyData(data);
    if (!validation.success) {
      toast.error("Bitte überprüfen Sie Ihre Eingaben");
      return;
    }

    setIsSubmitting(true);
    try {
      const dbData = {
        actor_types: data.actorTypes,
        actor_other: data.actorOther,
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
        challenges: data.challenges,
        challenges_details: data.challengesDetails,
        vnb_contact: data.vnbContact,
        vnb_contact_other: data.vnbContactOther,
        vnb_response: data.vnbResponse,
        vnb_response_reasons: data.vnbResponseReasons,
        vnb_support_rating: data.vnbSupportRating,
        mieterstrom_project_type: data.mieterstromProjectType,
        mieterstrom_pv_size_kw: data.mieterstromPvSizeKw,
        mieterstrom_party_count: data.mieterstromPartyCount,
        mieterstrom_building_type: data.mieterstromBuildingType,
        mieterstrom_in_operation: data.mieterstromInOperation,
        es_status: data.esStatus,
        es_plant_type: data.esPlantType,
        es_pv_size_kw: data.esPvSizeKw,
        es_party_count: data.esPartyCount,
        es_vnb_contact: data.esVnbContact,
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
      setCurrentStep(steps.length); // Show success screen
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error("Fehler beim Absenden. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    // Step 0: About You
    if (currentStep === 0) {
      return (
        <div className="space-y-8">
          <MultiSelectQuestion
            id="actor-types"
            label="Welche Rolle(n) treffen auf Sie zu?"
            description="Wählen Sie alle zutreffenden Optionen"
            options={ACTOR_OPTIONS}
            value={data.actorTypes}
            optionTextValues={data.actorTextFields}
            onChange={(val) => updateData("actorTypes", val)}
            onOptionTextChange={(optVal, text) => updateData("actorTextFields", { ...data.actorTextFields, [optVal]: text })}
          />

          <MultiSelectQuestion
            id="motivation"
            label="Was ist Ihre Motivation?"
            options={MOTIVATION_OPTIONS}
            value={data.motivation}
            otherValue={data.motivationOther}
            onChange={(val) => updateData("motivation", val)}
            onOtherChange={(val) => updateData("motivationOther", val)}
          />

          <MultiSelectQuestion
            id="project-types"
            label="Welche Projektart(en) interessieren Sie?"
            options={PROJECT_TYPE_OPTIONS}
            value={data.projectTypes}
            onChange={(val) => updateData("projectTypes", val)}
          />

          <TextQuestion
            id="contact-email"
            label="Kontakt E-Mail"
            description="Falls wir Rückfragen haben oder Ergebnisse teilen möchten"
            type="email"
            value={data.contactEmail}
            onChange={(val) => updateData("contactEmail", val)}
            placeholder="ihre@email.de"
            optional
          />
        </div>
      );
    }

    // Step 1: Project Focus Selection
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <p className="text-muted-foreground">Wählen Sie den Schwerpunkt, zu dem Sie Erfahrungen teilen möchten:</p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { id: 'ggv', title: 'GGV', desc: 'Gemeinschaftliche Gebäudeversorgung', icon: Building2 },
              { id: 'mieterstrom', title: 'Mieterstrom', desc: 'Mieterstrom-Modelle', icon: Home },
              { id: 'energysharing', title: 'Energy Sharing', desc: 'Gemeinschaftliche Nutzung', icon: Users },
            ].map((option) => (
              <Card 
                key={option.id}
                className={`cursor-pointer transition-all hover:shadow-md ${data.projectFocus === option.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                onClick={() => updateData("projectFocus", option.id as 'ggv' | 'mieterstrom' | 'energysharing')}
              >
                <CardHeader className="text-center pb-2">
                  <option.icon className="w-10 h-10 mx-auto text-primary mb-2" />
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{option.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <SurveyVnbCombobox
            id="vnb-name"
            label="Welcher Verteilnetzbetreiber ist für Ihr Projekt zuständig?"
            description="Suchen oder geben Sie den Namen Ihres VNB ein"
            value={data.vnbName}
            onChange={(val) => updateData("vnbName", val)}
            optional
          />
        </div>
      );
    }

    // Step 2: Focus-specific details
    if (currentStep === 2 && data.projectFocus) {
      if (data.projectFocus === 'ggv') {
        return (
          <div className="space-y-8">
            <SingleSelectQuestion
              id="ggv-type"
              label="Wie viele Gebäude umfasst Ihr GGV-Projekt?"
              options={[
                { value: 'single', label: 'Ein Gebäude' },
                { value: 'multiple', label: 'Mehrere Gebäude' },
              ]}
              value={data.ggvProjectType}
              onChange={(val) => updateData("ggvProjectType", val as 'single' | 'multiple')}
            />

            <TextQuestion
              id="ggv-pv-size"
              label="Geplante PV-Anlagengröße (kWp)"
              type="number"
              value={data.ggvPvSizeKw}
              onChange={(val) => updateData("ggvPvSizeKw", val ? parseFloat(val) : undefined)}
              placeholder="z.B. 30"
              optional
            />

            <TextQuestion
              id="ggv-party-count"
              label="Anzahl der teilnehmenden Parteien"
              type="number"
              value={data.ggvPartyCount}
              onChange={(val) => updateData("ggvPartyCount", val ? parseInt(val) : undefined)}
              placeholder="z.B. 12"
              optional
            />

            <SingleSelectQuestion
              id="ggv-in-operation"
              label="Ist Ihr GGV-Projekt bereits in Betrieb?"
              options={[
                { value: 'yes', label: 'Ja, bereits in Betrieb' },
                { value: 'no', label: 'Nein, noch in Planung' },
              ]}
              value={data.ggvInOperation === true ? 'yes' : data.ggvInOperation === false ? 'no' : undefined}
              onChange={(val) => updateData("ggvInOperation", val === 'yes')}
            />

            <TextQuestion
              id="ggv-additional"
              label="Weitere Informationen zu Ihrem Projekt"
              type="textarea"
              value={data.ggvAdditionalInfo}
              onChange={(val) => updateData("ggvAdditionalInfo", val)}
              placeholder="Beschreiben Sie Ihr Projekt..."
              optional
            />
          </div>
        );
      }

      if (data.projectFocus === 'mieterstrom') {
        return (
          <div className="space-y-8">
            <TextQuestion
              id="mieterstrom-pv-size"
              label="Geplante PV-Anlagengröße (kWp)"
              type="number"
              value={data.mieterstromPvSizeKw}
              onChange={(val) => updateData("mieterstromPvSizeKw", val ? parseFloat(val) : undefined)}
              placeholder="z.B. 50"
              optional
            />

            <TextQuestion
              id="mieterstrom-party-count"
              label="Anzahl der Mietparteien"
              type="number"
              value={data.mieterstromPartyCount}
              onChange={(val) => updateData("mieterstromPartyCount", val ? parseInt(val) : undefined)}
              placeholder="z.B. 24"
              optional
            />

            <SingleSelectQuestion
              id="mieterstrom-in-operation"
              label="Ist Ihr Mieterstrom-Projekt bereits in Betrieb?"
              options={[
                { value: 'yes', label: 'Ja, bereits in Betrieb' },
                { value: 'no', label: 'Nein, noch in Planung' },
              ]}
              value={data.mieterstromInOperation === true ? 'yes' : data.mieterstromInOperation === false ? 'no' : undefined}
              onChange={(val) => updateData("mieterstromInOperation", val === 'yes')}
            />

            <TextQuestion
              id="mieterstrom-additional"
              label="Weitere Informationen zu Ihrem Projekt"
              type="textarea"
              value={data.mieterstromAdditionalInfo}
              onChange={(val) => updateData("mieterstromAdditionalInfo", val)}
              placeholder="Beschreiben Sie Ihr Projekt..."
              optional
            />
          </div>
        );
      }

      if (data.projectFocus === 'energysharing') {
        return (
          <div className="space-y-8">
            <MultiSelectQuestion
              id="es-status"
              label="Wie ist der Status Ihres Energy Sharing Interesses?"
              options={[
                { value: 'informieren', label: 'Ich informiere mich erst' },
                { value: 'planung', label: 'Konkrete Planungen laufen' },
                { value: 'warten', label: 'Warte auf rechtliche Rahmenbedingungen' },
                { value: 'betrieb', label: 'Bereits in Betrieb (Pilotprojekt)' },
              ]}
              value={data.esStatus}
              onChange={(val) => updateData("esStatus", val)}
            />

            <MultiSelectQuestion
              id="es-plant-type"
              label="Welche Anlagentypen sind geplant?"
              options={[
                { value: 'pv', label: 'Photovoltaik' },
                { value: 'wind', label: 'Windkraft' },
                { value: 'biogas', label: 'Biogas' },
                { value: 'andere', label: 'Andere' },
              ]}
              value={data.esPlantType}
              onChange={(val) => updateData("esPlantType", val)}
            />

            <TextQuestion
              id="es-pv-size"
              label="Geplante PV-Anlagengröße (kWp)"
              type="number"
              value={data.esPvSizeKw}
              onChange={(val) => updateData("esPvSizeKw", val ? parseFloat(val) : undefined)}
              placeholder="z.B. 100"
              optional
            />

            <SingleSelectQuestion
              id="es-vnb-contact"
              label="Hatten Sie bereits Kontakt mit Ihrem VNB bezüglich Energy Sharing?"
              options={[
                { value: 'yes', label: 'Ja' },
                { value: 'no', label: 'Nein' },
              ]}
              value={data.esVnbContact === true ? 'yes' : data.esVnbContact === false ? 'no' : undefined}
              onChange={(val) => updateData("esVnbContact", val === 'yes')}
            />
          </div>
        );
      }
    }

    // Step 3: Challenges
    const challengesStepIndex = data.projectFocus ? 3 : 2;
    if (currentStep === challengesStepIndex) {
      return (
        <div className="space-y-8">
          <MultiSelectQuestion
            id="challenges"
            label="Welche Herausforderungen haben Sie erlebt oder erwarten Sie?"
            description="Wählen Sie alle zutreffenden und ergänzen Sie Details"
            options={CHALLENGE_OPTIONS}
            value={data.challenges}
            optionTextValues={data.challengesDetails}
            onChange={(val) => updateData("challenges", val)}
            onOptionTextChange={(optVal, text) => updateData("challengesDetails", { ...data.challengesDetails, [optVal]: text })}
          />
        </div>
      );
    }

    // Step 4: VNB Experience
    const vnbStepIndex = data.projectFocus ? 4 : 3;
    if (currentStep === vnbStepIndex) {
      return (
        <div className="space-y-8">
          <MultiSelectQuestion
            id="vnb-contact"
            label="Wie haben Sie Kontakt zum VNB aufgenommen?"
            options={VNB_CONTACT_OPTIONS}
            value={data.vnbContact}
            otherValue={data.vnbContactOther}
            onChange={(val) => updateData("vnbContact", val)}
            onOtherChange={(val) => updateData("vnbContactOther", val)}
          />

          <MultiSelectQuestion
            id="vnb-response"
            label="Wie war die Reaktion des VNB?"
            options={VNB_RESPONSE_OPTIONS}
            value={data.vnbResponse}
            onChange={(val) => updateData("vnbResponse", val)}
          />

          <TextQuestion
            id="vnb-response-reasons"
            label="Können Sie Ihre Erfahrung mit dem VNB näher beschreiben?"
            type="textarea"
            value={data.vnbResponseReasons}
            onChange={(val) => updateData("vnbResponseReasons", val)}
            placeholder="z.B. Wartezeiten, Informationsqualität, Unterstützung..."
            optional
          />

          <RatingQuestion
            id="vnb-support-rating"
            label="Wie bewerten Sie die Unterstützung durch Ihren VNB insgesamt?"
            description="1 = sehr schlecht, 10 = sehr gut"
            value={data.vnbSupportRating}
            onChange={(val) => updateData("vnbSupportRating", val)}
            minLabel="Sehr schlecht"
            maxLabel="Sehr gut"
            optional
          />
        </div>
      );
    }

    // Step 5: Final
    const finalStepIndex = data.projectFocus ? 5 : 4;
    if (currentStep === finalStepIndex) {
      return (
        <div className="space-y-8">
          <TextQuestion
            id="helpful-sources"
            label="Welche Informationsquellen waren für Sie hilfreich?"
            type="textarea"
            value={data.helpfulInfoSources}
            onChange={(val) => updateData("helpfulInfoSources", val)}
            placeholder="z.B. Webseiten, Beratungsstellen, Netzwerke..."
            optional
          />

          <TextQuestion
            id="additional-experiences"
            label="Haben Sie weitere Erfahrungen, die Sie teilen möchten?"
            type="textarea"
            value={data.additionalExperiences}
            onChange={(val) => updateData("additionalExperiences", val)}
            placeholder="Ihre Erfahrungen..."
            optional
          />

          <FileUpload
            id="documents"
            label="Möchten Sie relevante Dokumente hochladen?"
            description="z.B. Korrespondenz mit VNB, Messkonzepte (max. 5 Dateien)"
            value={uploadedDocuments}
            onChange={setUploadedDocuments}
          />

          <NpsQuestion
            id="nps"
            label="Wie wahrscheinlich ist es, dass Sie vnb-transparenz.de weiterempfehlen?"
            value={data.npsScore}
            onChange={(val) => updateData("npsScore", val)}
            optional
          />

          <TextQuestion
            id="survey-improvements"
            label="Wie können wir diese Umfrage verbessern?"
            type="textarea"
            value={data.surveyImprovements}
            onChange={(val) => updateData("surveyImprovements", val)}
            placeholder="Ihr Feedback zur Umfrage..."
            optional
          />
        </div>
      );
    }

    // Success screen
    if (currentStep >= steps.length) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
            <Zap className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Vielen Dank!</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Ihre Antworten helfen uns, die Transparenz bei Verteilnetzbetreibern zu verbessern.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Zurück zur Startseite
          </Button>
        </div>
      );
    }

    return null;
  };

  const isLastStep = currentStep === steps.length - 1;
  const isSubmitStep = currentStep >= steps.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <SurveyHeader />
      
      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {showDraftBanner && savedDraftInfo && (
            <DraftRestorationBanner
              savedTime={formatSavedTime(savedDraftInfo.savedAt)}
              stepTitle={steps[savedDraftInfo.step]?.title || "Unbekannt"}
              onRestore={handleRestoreDraft}
              onDiscard={handleDiscardDraft}
            />
          )}

          {!isSubmitStep && (
            <SurveyProgress
              currentStep={currentStep}
              totalSteps={steps.length}
              steps={steps}
            />
          )}

          <Card>
            <CardHeader>
              {!isSubmitStep && (
                <>
                  <CardTitle>{steps[currentStep]?.title}</CardTitle>
                  <CardDescription>{steps[currentStep]?.description}</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {renderStep()}

              {!isSubmitStep && (
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Zurück
                  </Button>

                  {isLastStep ? (
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Wird gesendet...
                        </>
                      ) : (
                        <>
                          Absenden
                          <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={handleNext}>
                      Weiter
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
