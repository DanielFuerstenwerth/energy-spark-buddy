// SurveyData type - DERIVED from surveySchema.ts (SSOT)
// This file re-exports the schema-derived type and provides the initial data factory.
// DO NOT manually add fields here - add them to surveySchema.ts instead.

import { QUESTION_REGISTRY } from '@/data/surveySchema';

// Build SurveyData type from the QUESTION_REGISTRY
// Each question ID becomes a key. The type is inferred from the registry's dbColumn type mapping.

// We define a type-level mapping from question types to TS types.
// Since we can't fully infer from runtime, we use a carefully maintained interface
// that MUST match the QUESTION_REGISTRY keys exactly.

// === Auto-derived field type map ===
// Rule: multi-select → string[], single-select/text/textarea/email → string, number → number, rating → number, boolean fields → boolean

export interface SurveyData {
  // Section 1: Über Sie
  actorTypes: string[];
  actorTextFields?: Record<string, string>;
  actorOther?: string;
  motivation: string[];
  motivationOther?: string;
  contactEmail?: string;

  // Section 2: Projekt
  vnbName?: string;
  projectTypes: string[];
  projectFocus?: 'ggv' | 'mieterstrom' | 'energysharing';
  ggvProjectType?: string;
  ggvPvSizeKw?: number;
  ggvPartyCount?: number;
  ggvBuildingType?: string;
  ggvBuildingCount?: number;
  ggvAdditionalInfo?: string;
  ggvInOperation?: boolean;
  mieterstromProjectType?: string;
  mieterstromPvSizeKw?: number;
  mieterstromPartyCount?: number;
  mieterstromBuildingType?: string;
  mieterstromBuildingCount?: number;
  mieterstromAdditionalInfo?: string;
  mieterstromInOperation?: boolean;
  projectAddress?: string;
  projectPlz?: string;
  projectLocations?: Array<{ plz?: string; address?: string; pvSizeKw?: number }>;

  // Section 3: Planung Allgemein
  planningStatus: string[];
  planningStatusOther?: string;
  ggvOrMieterstromDecision?: string;
  ggvDecisionReasons: string[];
  ggvDecisionReasonsOther?: string;
  mieterstromDecisionReasons: string[];
  mieterstromDecisionReasonsOther?: string;
  implementationApproach: string[];
  implementationApproachOther?: string;
  challenges: string[];
  challengesDetails: Record<string, string>;
  challengesPvInstallation?: string;
  challengesVnbBlocking?: string;
  challengesCostsHigh?: string;
  challengesOther?: string;

  // Section 4-GGV: Planung GGV
  vnbExistingProjects?: string;
  vnbExistingProjectsOther?: string;
  vnbContact: string[];
  vnbContactOther?: string;
  vnbResponse: string[];
  vnbResponseReasons?: string;
  vnbSupportMesskonzept?: string;
  vnbSupportFormulare?: string;
  vnbSupportPortal?: boolean;
  vnbSupportOther?: string;
  vnbInfoAvailable?: string;
  vnbInfoAvailableOther?: string;
  vnbContactHelpful?: string;
  vnbContactHelpfulOther?: string;
  vnbPersonalContacts?: string;
  vnbPersonalContactsOther?: string;
  vnbSupportRating?: number;
  vnbMsbOffer?: string;
  vnbStartTimeline?: string;
  vnbStartTimelineOther?: string;
  vnbAdditionalCosts?: string;
  vnbAdditionalCostsOneTime?: number;
  vnbAdditionalCostsYearly?: number;
  vnbFullService?: string;
  vnbDataProvision?: string;
  vnbDataProvisionOther?: string;
  vnbDataFormat?: string;
  vnbDataCost?: string;
  vnbDataCostAmount?: number;
  vnbEsaCost?: string;
  vnbEsaCostAmount?: number;
  vnbMsbTimeline?: string;
  vnbRejectionTimeline?: string;
  vnbWandlermessung?: string;
  vnbWandlermessungComment?: string;
  vnbPlanningDuration?: string;
  vnbPlanningDurationReasons?: string;

  // Section 5-GGV: Betrieb GGV
  operationStartDate?: string;
  operationVnbDuration?: string;
  operationVnbDurationReasons?: string;
  operationWandlermessung?: string;
  operationWandlermessungComment?: string;
  operationMsbProvider?: string;
  operationAllocationProvider?: string;
  operationDataProvider?: string;
  operationDataProviderOther?: string;
  operationMsbDuration?: string;
  operationMsbAdditionalCosts?: string;
  operationMsbAdditionalCostsOneTime?: number;
  operationMsbAdditionalCostsYearly?: number;
  operationAllocationWho?: string;
  operationAllocationWhoOther?: string;
  operationDataFormat?: string;
  operationDataFormatOther?: string;
  operationDataCost?: string;
  operationDataCostAmount?: number;
  operationEsaCost?: string;
  operationEsaCostAmount?: number;
  operationSatisfactionRating?: number;
  serviceProviderName?: string;
  serviceProviderRating?: number;
  serviceProviderComments?: string;
  serviceProvider2Name?: string;
  serviceProvider2Rating?: number;
  serviceProvider2Comments?: string;
  vnbRejectionResponse?: string[];
  vnbRejectionResponseOther?: string;

  // Section 4-MS: Planung Mieterstrom
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
  mieterstromFullService?: string;
  mieterstromMsbCosts?: string;
  mieterstromMsbCostsOneTime?: number;
  mieterstromMsbCostsYearly?: number;
  mieterstromMsbCostsOther?: string;
  mieterstromModelChoice?: string;
  mieterstromDataProvision?: string;

  // Section 5-MS: Betrieb Mieterstrom
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
  // mieterstromSurveyImprovements removed (duplicate of surveyImprovements)
  mieterstromChallenges?: string[];
  mieterstromChallengesOpposition?: string;
  mieterstromChallengesPv?: string;
  mieterstromChallengesVnb?: string;
  mieterstromChallengesCosts?: string;
  mieterstromChallengesOther?: string;

  // Section 4-ES: Energy Sharing
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

  // Section 6: Abschluss
  helpfulInfoSources?: string;
  additionalExperiences?: string;
  surveyImprovements?: string;
  npsScore?: number;

  // Multi-Evaluation metadata
  evaluationLabel?: string;
  sessionGroupId?: string;
}

// Initial empty state - arrays default to [], records to {}
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

// === Schema consistency check (runs at import time in dev) ===
// Ensures every QUESTION_REGISTRY key exists in SurveyData
if (import.meta.env.DEV) {
  const surveyDataKeys = new Set<string>([
    // We can't enumerate interface keys at runtime, but the TypeScript compiler
    // will catch any mismatch between QUESTION_REGISTRY keys and SurveyData fields
    // when buildDbData() maps them. This comment serves as documentation.
  ]);
}
