export interface SurveyData {
  // A1: Akteursgruppe
  actorTypes: string[];
  actorTextFields?: Record<string, string>;
  actorOther?: string;
  
  // A2: Motivation
  motivation: string[];
  motivationOther?: string;
  
  // A3: Projektart
  projectTypes: string[];
  
  // Kontakt Email
  contactEmail?: string;
  
  // VNB Name
  vnbName?: string;
  
  // Projekt-Fokus (wird aus projectTypes abgeleitet)
  projectFocus?: 'ggv' | 'mieterstrom' | 'energysharing';
  
  // === Projektdimensionen GGV ===
  ggvProjectType?: 'single' | 'multiple';
  ggvPvSizeKw?: number;
  ggvPartyCount?: number;
  ggvBuildingType?: string;
  ggvBuildingCount?: number;
  ggvAdditionalInfo?: string;
  ggvInOperation?: boolean;
  
  // === Projektdimensionen Mieterstrom ===
  mieterstromProjectType?: string;
  mieterstromPvSizeKw?: number;
  mieterstromPartyCount?: number;
  mieterstromBuildingType?: string;
  mieterstromBuildingCount?: number;
  mieterstromAdditionalInfo?: string;
  mieterstromInOperation?: boolean;
  
  // === B1: Planungsstatus ===
  planningStatus: string[];
  planningStatusOther?: string;
  
  // === B2: GGV oder Mieterstrom Entscheidung ===
  ggvOrMieterstromDecision?: string;
  
  // === B3: Gründe für GGV ===
  ggvDecisionReasons: string[];
  ggvDecisionReasonsOther?: string;
  
  // === B4: Gründe für Mieterstrom ===
  mieterstromDecisionReasons: string[];
  mieterstromDecisionReasonsOther?: string;
  
  // === B5: Umsetzungsansatz ===
  implementationApproach: string[];
  implementationApproachOther?: string;
  
  // === B6: Herausforderungen ===
  challenges: string[];
  challengesDetails: Record<string, string>;
  challengesPvInstallation?: string;
  challengesVnbBlocking?: string;
  challengesCostsHigh?: string;
  challengesOther?: string;
  
  // === C1: Bestehende GGV-Projekte im Netzgebiet ===
  vnbExistingProjects?: string;
  vnbExistingProjectsOther?: string;
  
  // === C2: VNB Kontakt ===
  vnbContact: string[];
  vnbContactOther?: string;
  
  // === C3: VNB Rückmeldung zur GGV ===
  vnbResponse: string[];
  vnbResponseReasons?: string;
  
  // === C4: VNB Unterstützung online ===
  vnbSupportMesskonzept?: string;
  vnbSupportFormulare?: string;
  vnbSupportPortal?: boolean;
  vnbSupportOther?: string;
  
  // === C5: VNB Kontaktmöglichkeit hilfreich ===
  vnbInfoAvailable?: string;
  vnbInfoAvailableOther?: string;
  vnbContactHelpful?: string;
  vnbContactHelpfulOther?: string;
  
  // === C6: Persönliche Kontakte ===
  vnbPersonalContacts?: string;
  vnbPersonalContactsOther?: string;
  
  // === C7: Unterstützungsbewertung ===
  vnbSupportRating?: number;
  
  // === C8: MSB-Angebot des VNB ===
  vnbMsbOffer?: string;
  
  // === C8.1a: Start-Timeline wenn VNB MSB macht ===
  vnbStartTimeline?: string;
  vnbStartTimelineOther?: string;
  
  // === C8.1b: Zusätzliche Kosten VNB/gMSB ===
  vnbAdditionalCosts?: string;
  vnbAdditionalCostsOneTime?: number;
  vnbAdditionalCostsYearly?: number;
  
  // === C8.1c: Full-Service Bedingung ===
  vnbFullService?: string;
  
  // === C8.1d: Datenbereitstellung ===
  vnbDataProvision?: string;
  vnbDataProvisionOther?: string;
  
  // === C8.1e: Kosten für Datenbereitstellung ===
  vnbDataFormat?: string;
  vnbDataCost?: string;
  vnbDataCostAmount?: number;
  
  // === C8.1f: ESA-Marktrolle Kosten ===
  vnbEsaCost?: string;
  vnbEsaCostAmount?: number;
  
  // === C8.2a: Wenn VNB kein MSB macht - Timeline ===
  vnbMsbTimeline?: string;
  
  // === C8.2b: Wenn VNB ablehnt - Timeline ===
  vnbRejectionTimeline?: string;
  
  // === C9: Wandlermessung ===
  vnbWandlermessung?: string;
  vnbWandlermessungComment?: string;
  
  // === C10: Diskussionsdauer ===
  vnbPlanningDuration?: string;
  vnbPlanningDurationReasons?: string;
  
  // === D: GGV in Betrieb ===
  operationStartDate?: string;
  operationVnbDuration?: string;
  operationVnbDurationReasons?: string;
  operationWandlermessung?: string;
  operationWandlermessungComment?: string;
  
  // === D2: Messstellenbetreiber ===
  operationMsbProvider?: string;
  operationAllocationProvider?: string;
  operationDataProvider?: string;
  operationDataProviderOther?: string;
  
  // === D3: MSB-Installation ===
  operationMsbDuration?: string;
  operationMsbAdditionalCosts?: string;
  operationMsbAdditionalCostsOneTime?: number;
  operationMsbAdditionalCostsYearly?: number;
  
  // === D4: Aufteilung durch andere ===
  operationAllocationWho?: string;
  operationAllocationWhoOther?: string;
  
  // === D5: Datenübermittlung ===
  operationDataFormat?: string;
  operationDataFormatOther?: string;
  operationDataCost?: string;
  operationDataCostAmount?: number;
  operationEsaCost?: string;
  operationEsaCostAmount?: number;
  
  // === D7: Zufriedenheit ===
  operationSatisfactionRating?: number;
  
  // === D8: Dienstleister ===
  serviceProviderName?: string;
  serviceProviderRating?: number;
  serviceProviderComments?: string;
  serviceProvider2Name?: string;
  serviceProvider2Rating?: number;
  serviceProvider2Comments?: string;
  
  // === D9: Reaktion auf VNB-Verweigerung ===
  vnbRejectionResponse?: string[];
  vnbRejectionResponseOther?: string;
  
  // === Mieterstrom spezifische Felder ===
  mieterstromSummenzaehler?: string;
  mieterstromExistingProjects?: string;
  mieterstromExistingProjectsVirtuell?: string;
  mieterstromVnbContact?: string;
  mieterstromVnbContactOther?: string;
  mieterstromVirtuellAllowed?: string;
  mieterstromVirtuellWandlermessung?: string;
  mieterstromVirtuellWandlermessungComment?: string;
  mieterstromVnbResponse?: string[];
  mieterstromVnbResponseReasons?: string;
  mieterstromVnbSupport?: string[];
  mieterstromVnbSupportOther?: string;
  mieterstromVnbHelpful?: string;
  mieterstromVnbHelpfulOther?: string;
  mieterstromPersonalContacts?: string;
  mieterstromPersonalContactsOther?: string;
  mieterstromSupportRating?: number;
  
  // Mieterstrom Planung
  mieterstromFullService?: string;
  mieterstromMsbCosts?: string;
  mieterstromMsbCostsOneTime?: number;
  mieterstromMsbCostsYearly?: number;
  mieterstromMsbCostsOther?: string;
  mieterstromModelChoice?: string;
  mieterstromDataProvision?: string;
  
  // Mieterstrom in Betrieb
  mieterstromVnbRole?: string;
  mieterstromVnbDuration?: string;
  mieterstromVnbDurationReasons?: string;
  mieterstromWandlermessung?: string;
  mieterstromWandlermessungComment?: string;
  mieterstromMsbProvider?: string;
  mieterstromDataProvider?: string;
  mieterstromDataProviderOther?: string;
  mieterstromMsbInstallDuration?: string;
  mieterstromOperationCosts?: string;
  mieterstromOperationCostsOneTime?: number;
  mieterstromOperationCostsYearly?: number;
  mieterstromOperationSatisfaction?: number;
  mieterstromRejectionResponse?: string[];
  mieterstromRejectionResponseOther?: string;
  mieterstromInfoSources?: string;
  mieterstromExperiences?: string;
  mieterstromSurveyImprovements?: string;
  
  // Mieterstrom Challenges
  mieterstromChallenges?: string[];
  mieterstromChallengesOpposition?: string;
  mieterstromChallengesPv?: string;
  mieterstromChallengesVnb?: string;
  mieterstromChallengesCosts?: string;
  mieterstromChallengesOther?: string;
  
  // === Energy Sharing ===
  esStatus: string[];
  esStatusOther?: string;
  esInOperationDetails?: string;
  esOperatorDetails?: string;
  esPlantType: string[];
  esPlantTypeDetails?: string[];
  esPvSizeKw?: number;
  esWindSizeKw?: number;
  esProjectScope?: string;
  esTotalPvSizeKw?: number;
  esTotalWindSizeKw?: number;
  esPartyCount?: number;
  esConsumerTypes: string[];
  esConsumerDetails?: string;
  esConsumerScope?: string;
  esConsumerScopeOther?: string;
  esMaxDistance?: string;
  esVnbContact?: boolean;
  esVnbResponse?: string;
  esVnbResponseOther?: string;
  esVnbResponseDetails?: string;
  esNetzentgelteDiscussion?: string;
  esNetzentgelteDetails?: string;
  esInfoSources?: string;
  
  // === Adresse ===
  projectAddress?: string;
  projectPlz?: string;
  
  // === Multi-Evaluation ===
  evaluationLabel?: string;
  sessionGroupId?: string;
  
  // === Abschluss ===
  helpfulInfoSources?: string;
  additionalExperiences?: string;
  surveyImprovements?: string;
  npsScore?: number;
}

export const initialSurveyData: SurveyData = {
  actorTypes: [],
  actorTextFields: {},
  motivation: [],
  projectTypes: [],
  planningStatus: [],
  ggvDecisionReasons: [],
  mieterstromDecisionReasons: [],
  implementationApproach: [],
  challenges: [],
  challengesDetails: {},
  vnbContact: [],
  vnbResponse: [],
  esStatus: [],
  esPlantType: [],
  esConsumerTypes: [],
};
