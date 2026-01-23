import { z } from "zod";

const MAX_SHORT_TEXT = 200;
const MAX_MEDIUM_TEXT = 500;
const MAX_LONG_TEXT = 2000;
const MAX_ARRAY_ITEMS = 20;

export const sanitizeText = (text: string | undefined): string | undefined => {
  if (!text) return undefined;
  return text.trim().replace(/[\x00-\x1F\x7F]/g, "");
};

export const surveySchema = z.object({
  // A1: Akteursgruppe
  actorTypes: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  actorTextFields: z.record(z.string().max(MAX_MEDIUM_TEXT)).default({}),
  actorOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  
  // A2: Motivation
  motivation: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  motivationOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  
  // A3: Projektart
  projectTypes: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  
  // Kontakt
  contactEmail: z.string().email("Ungültige E-Mail-Adresse").max(255).optional().or(z.literal("")),
  vnbName: z.string().max(MAX_SHORT_TEXT).optional(),
  projectFocus: z.enum(["ggv", "mieterstrom", "energysharing"]).optional(),
  
  // GGV Projektdimensionen
  ggvProjectType: z.enum(["single", "multiple"]).optional(),
  ggvPvSizeKw: z.number().min(0).max(100000).optional(),
  ggvPartyCount: z.number().int().min(0).max(10000).optional(),
  ggvBuildingType: z.string().max(MAX_SHORT_TEXT).optional(),
  ggvBuildingCount: z.number().int().min(0).max(1000).optional(),
  ggvAdditionalInfo: z.string().max(MAX_LONG_TEXT).optional(),
  ggvInOperation: z.boolean().optional(),
  
  // Mieterstrom Projektdimensionen
  mieterstromProjectType: z.string().max(MAX_SHORT_TEXT).optional(),
  mieterstromPvSizeKw: z.number().min(0).max(100000).optional(),
  mieterstromPartyCount: z.number().int().min(0).max(10000).optional(),
  mieterstromBuildingType: z.string().max(MAX_SHORT_TEXT).optional(),
  mieterstromBuildingCount: z.number().int().min(0).max(1000).optional(),
  mieterstromAdditionalInfo: z.string().max(MAX_LONG_TEXT).optional(),
  mieterstromInOperation: z.boolean().optional(),
  
  // B1-B6
  planningStatus: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  planningStatusOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  ggvOrMieterstromDecision: z.string().max(MAX_MEDIUM_TEXT).optional(),
  ggvDecisionReasons: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  ggvDecisionReasonsOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromDecisionReasons: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  mieterstromDecisionReasonsOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  implementationApproach: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  implementationApproachOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  challenges: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  challengesDetails: z.record(z.string().max(MAX_LONG_TEXT)).default({}),
  challengesPvInstallation: z.string().max(MAX_LONG_TEXT).optional(),
  challengesVnbBlocking: z.string().max(MAX_LONG_TEXT).optional(),
  challengesCostsHigh: z.string().max(MAX_LONG_TEXT).optional(),
  challengesOther: z.string().max(MAX_LONG_TEXT).optional(),
  
  // C1-C10: VNB Planung
  vnbExistingProjects: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbExistingProjectsOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbContact: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  vnbContactOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbResponse: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  vnbResponseReasons: z.string().max(MAX_LONG_TEXT).optional(),
  vnbSupportMesskonzept: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbSupportFormulare: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbSupportPortal: z.boolean().optional(),
  vnbSupportOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbInfoAvailable: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbInfoAvailableOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbContactHelpful: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbContactHelpfulOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbPersonalContacts: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbPersonalContactsOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbSupportRating: z.number().int().min(1).max(10).optional(),
  vnbMsbOffer: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbStartTimeline: z.string().max(MAX_SHORT_TEXT).optional(),
  vnbStartTimelineOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbAdditionalCosts: z.string().max(MAX_SHORT_TEXT).optional(),
  vnbAdditionalCostsOneTime: z.number().min(0).max(10000000).optional(),
  vnbAdditionalCostsYearly: z.number().min(0).max(10000000).optional(),
  vnbFullService: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbDataProvision: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbDataProvisionOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbDataFormat: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbDataCost: z.string().max(MAX_SHORT_TEXT).optional(),
  vnbDataCostAmount: z.number().min(0).max(10000000).optional(),
  vnbEsaCost: z.string().max(MAX_SHORT_TEXT).optional(),
  vnbEsaCostAmount: z.number().min(0).max(10000000).optional(),
  vnbMsbTimeline: z.string().max(MAX_SHORT_TEXT).optional(),
  vnbRejectionTimeline: z.string().max(MAX_SHORT_TEXT).optional(),
  vnbWandlermessung: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbWandlermessungComment: z.string().max(MAX_LONG_TEXT).optional(),
  vnbPlanningDuration: z.string().max(MAX_SHORT_TEXT).optional(),
  vnbPlanningDurationReasons: z.string().max(MAX_LONG_TEXT).optional(),
  
  // D: GGV in Betrieb
  operationStartDate: z.string().max(MAX_SHORT_TEXT).optional(),
  operationVnbDuration: z.string().max(MAX_SHORT_TEXT).optional(),
  operationVnbDurationReasons: z.string().max(MAX_LONG_TEXT).optional(),
  operationWandlermessung: z.string().max(MAX_MEDIUM_TEXT).optional(),
  operationWandlermessungComment: z.string().max(MAX_LONG_TEXT).optional(),
  operationMsbProvider: z.string().max(MAX_SHORT_TEXT).optional(),
  operationAllocationProvider: z.string().max(MAX_SHORT_TEXT).optional(),
  operationDataProvider: z.string().max(MAX_SHORT_TEXT).optional(),
  operationDataProviderOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  operationMsbDuration: z.string().max(MAX_SHORT_TEXT).optional(),
  operationMsbAdditionalCosts: z.string().max(MAX_SHORT_TEXT).optional(),
  operationMsbAdditionalCostsOneTime: z.number().min(0).max(10000000).optional(),
  operationMsbAdditionalCostsYearly: z.number().min(0).max(10000000).optional(),
  operationAllocationWho: z.string().max(MAX_SHORT_TEXT).optional(),
  operationAllocationWhoOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  operationDataFormat: z.string().max(MAX_SHORT_TEXT).optional(),
  operationDataFormatOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  operationDataCost: z.string().max(MAX_SHORT_TEXT).optional(),
  operationDataCostAmount: z.number().min(0).max(10000000).optional(),
  operationEsaCost: z.string().max(MAX_SHORT_TEXT).optional(),
  operationEsaCostAmount: z.number().min(0).max(10000000).optional(),
  operationSatisfactionRating: z.number().int().min(1).max(10).optional(),
  
  // Dienstleister
  serviceProviderName: z.string().max(MAX_SHORT_TEXT).optional(),
  serviceProviderRating: z.number().int().min(1).max(10).optional(),
  serviceProviderComments: z.string().max(MAX_LONG_TEXT).optional(),
  serviceProvider2Name: z.string().max(MAX_SHORT_TEXT).optional(),
  serviceProvider2Rating: z.number().int().min(1).max(10).optional(),
  serviceProvider2Comments: z.string().max(MAX_LONG_TEXT).optional(),
  
  // D9: VNB Reaktion
  vnbRejectionResponse: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).optional(),
  vnbRejectionResponseOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  
  // Mieterstrom spezifisch
  mieterstromSummenzaehler: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromExistingProjects: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromExistingProjectsVirtuell: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromVnbContact: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromVnbContactOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromVirtuellAllowed: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromVirtuellWandlermessung: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromVirtuellWandlermessungComment: z.string().max(MAX_LONG_TEXT).optional(),
  mieterstromVnbResponse: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).optional(),
  mieterstromVnbResponseReasons: z.string().max(MAX_LONG_TEXT).optional(),
  mieterstromVnbSupport: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).optional(),
  mieterstromVnbSupportOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromVnbHelpful: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromVnbHelpfulOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromPersonalContacts: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromPersonalContactsOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromSupportRating: z.number().int().min(1).max(10).optional(),
  mieterstromFullService: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromMsbCosts: z.string().max(MAX_SHORT_TEXT).optional(),
  mieterstromMsbCostsOneTime: z.number().min(0).max(10000000).optional(),
  mieterstromMsbCostsYearly: z.number().min(0).max(10000000).optional(),
  mieterstromMsbCostsOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromModelChoice: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromDataProvision: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromVnbRole: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromVnbDuration: z.string().max(MAX_SHORT_TEXT).optional(),
  mieterstromVnbDurationReasons: z.string().max(MAX_LONG_TEXT).optional(),
  mieterstromWandlermessung: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromWandlermessungComment: z.string().max(MAX_LONG_TEXT).optional(),
  mieterstromMsbProvider: z.string().max(MAX_SHORT_TEXT).optional(),
  mieterstromDataProvider: z.string().max(MAX_SHORT_TEXT).optional(),
  mieterstromDataProviderOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromMsbInstallDuration: z.string().max(MAX_SHORT_TEXT).optional(),
  mieterstromOperationCosts: z.string().max(MAX_SHORT_TEXT).optional(),
  mieterstromOperationCostsOneTime: z.number().min(0).max(10000000).optional(),
  mieterstromOperationCostsYearly: z.number().min(0).max(10000000).optional(),
  mieterstromOperationSatisfaction: z.number().int().min(1).max(10).optional(),
  mieterstromRejectionResponse: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).optional(),
  mieterstromRejectionResponseOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromInfoSources: z.string().max(MAX_LONG_TEXT).optional(),
  mieterstromExperiences: z.string().max(MAX_LONG_TEXT).optional(),
  mieterstromSurveyImprovements: z.string().max(MAX_LONG_TEXT).optional(),
  mieterstromChallenges: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).optional(),
  mieterstromChallengesOpposition: z.string().max(MAX_LONG_TEXT).optional(),
  mieterstromChallengesPv: z.string().max(MAX_LONG_TEXT).optional(),
  mieterstromChallengesVnb: z.string().max(MAX_LONG_TEXT).optional(),
  mieterstromChallengesCosts: z.string().max(MAX_LONG_TEXT).optional(),
  mieterstromChallengesOther: z.string().max(MAX_LONG_TEXT).optional(),
  
  // Energy Sharing
  esStatus: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  esStatusOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  esInOperationDetails: z.string().max(MAX_LONG_TEXT).optional(),
  esOperatorDetails: z.string().max(MAX_LONG_TEXT).optional(),
  esPlantType: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  esPlantTypeDetails: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).optional(),
  esPvSizeKw: z.number().min(0).max(100000).optional(),
  esWindSizeKw: z.number().min(0).max(100000).optional(),
  esProjectScope: z.string().max(MAX_SHORT_TEXT).optional(),
  esTotalPvSizeKw: z.number().min(0).max(100000).optional(),
  esTotalWindSizeKw: z.number().min(0).max(100000).optional(),
  esPartyCount: z.number().int().min(0).max(10000).optional(),
  esConsumerTypes: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  esConsumerDetails: z.string().max(MAX_LONG_TEXT).optional(),
  esConsumerScope: z.string().max(MAX_MEDIUM_TEXT).optional(),
  esConsumerScopeOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  esMaxDistance: z.string().max(MAX_MEDIUM_TEXT).optional(),
  esVnbContact: z.boolean().optional(),
  esVnbResponse: z.string().max(MAX_MEDIUM_TEXT).optional(),
  esVnbResponseOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  esVnbResponseDetails: z.string().max(MAX_LONG_TEXT).optional(),
  esNetzentgelteDiscussion: z.string().max(MAX_MEDIUM_TEXT).optional(),
  esNetzentgelteDetails: z.string().max(MAX_LONG_TEXT).optional(),
  esInfoSources: z.string().max(MAX_LONG_TEXT).optional(),
  
  // Abschluss
  helpfulInfoSources: z.string().max(MAX_LONG_TEXT).optional(),
  additionalExperiences: z.string().max(MAX_LONG_TEXT).optional(),
  surveyImprovements: z.string().max(MAX_LONG_TEXT).optional(),
  npsScore: z.number().int().min(0).max(10).optional(),
});

export type ValidatedSurveyData = z.infer<typeof surveySchema>;

export const validateSurveyData = (data: unknown) => {
  const result = surveySchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return { success: false as const, errors };
  }
  const sanitized = { ...result.data };
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === "string") {
      (sanitized as Record<string, unknown>)[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = value.map((item) =>
        typeof item === "string" ? sanitizeText(item) || item : item
      );
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      const sanitizedObj: Record<string, string> = {};
      for (const [k, v] of Object.entries(value as Record<string, string>)) {
        if (typeof v === "string") {
          sanitizedObj[k] = sanitizeText(v) || v;
        }
      }
      (sanitized as Record<string, unknown>)[key] = sanitizedObj;
    }
  }
  return { success: true as const, data: sanitized };
};
