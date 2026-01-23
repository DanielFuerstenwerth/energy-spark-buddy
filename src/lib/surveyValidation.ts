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
  actorTypes: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  actorTextFields: z.record(z.string().max(MAX_MEDIUM_TEXT)).default({}),
  actorOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  motivation: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  motivationOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  projectTypes: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  contactEmail: z.string().email("Ungültige E-Mail-Adresse").max(255).optional().or(z.literal("")),
  vnbName: z.string().max(MAX_SHORT_TEXT).optional(),
  projectFocus: z.enum(["ggv", "mieterstrom", "energysharing"]).optional(),
  ggvProjectType: z.enum(["single", "multiple"]).optional(),
  ggvPvSizeKw: z.number().min(0).max(100000).optional(),
  ggvPartyCount: z.number().int().min(0).max(10000).optional(),
  ggvBuildingType: z.string().max(MAX_SHORT_TEXT).optional(),
  ggvBuildingCount: z.number().int().min(0).max(1000).optional(),
  ggvAdditionalInfo: z.string().max(MAX_LONG_TEXT).optional(),
  ggvInOperation: z.boolean().optional(),
  planningStatus: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  planningStatusOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  ggvOrMieterstromDecision: z.string().max(MAX_MEDIUM_TEXT).optional(),
  ggvDecisionReasons: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  ggvDecisionReasonsOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  mieterstromDecisionReasons: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  mieterstromDecisionReasonsOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  implementationApproach: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  challenges: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  challengesDetails: z.record(z.string().max(MAX_LONG_TEXT)).default({}),
  vnbExistingProjects: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbExistingProjectsOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbContact: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  vnbContactOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbResponse: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  vnbResponseReasons: z.string().max(MAX_LONG_TEXT).optional(),
  vnbStartTimeline: z.string().max(MAX_SHORT_TEXT).optional(),
  vnbStartTimelineOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbAdditionalCosts: z.string().max(MAX_SHORT_TEXT).optional(),
  vnbAdditionalCostsOneTime: z.number().min(0).max(10000000).optional(),
  vnbAdditionalCostsYearly: z.number().min(0).max(10000000).optional(),
  vnbFullService: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbDataProvision: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbDataFormat: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbDataCost: z.string().max(MAX_SHORT_TEXT).optional(),
  vnbDataCostAmount: z.number().min(0).max(10000000).optional(),
  vnbEsaCost: z.string().max(MAX_SHORT_TEXT).optional(),
  vnbEsaCostAmount: z.number().min(0).max(10000000).optional(),
  vnbMsbTimeline: z.string().max(MAX_SHORT_TEXT).optional(),
  vnbRejectionTimeline: z.string().max(MAX_SHORT_TEXT).optional(),
  vnbWandlermessung: z.string().max(MAX_MEDIUM_TEXT).optional(),
  vnbWandlermessungComment: z.string().max(MAX_LONG_TEXT).optional(),
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
  operationStartDate: z.string().max(MAX_SHORT_TEXT).optional(),
  operationVnbDuration: z.string().max(MAX_SHORT_TEXT).optional(),
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
  serviceProviderName: z.string().max(MAX_SHORT_TEXT).optional(),
  serviceProviderRating: z.number().int().min(1).max(10).optional(),
  serviceProviderComments: z.string().max(MAX_LONG_TEXT).optional(),
  mieterstromProjectType: z.string().max(MAX_SHORT_TEXT).optional(),
  mieterstromPvSizeKw: z.number().min(0).max(100000).optional(),
  mieterstromPartyCount: z.number().int().min(0).max(10000).optional(),
  mieterstromBuildingType: z.string().max(MAX_SHORT_TEXT).optional(),
  mieterstromBuildingCount: z.number().int().min(0).max(1000).optional(),
  mieterstromAdditionalInfo: z.string().max(MAX_LONG_TEXT).optional(),
  mieterstromInOperation: z.boolean().optional(),
  mieterstromSummenzaehler: z.string().max(MAX_MEDIUM_TEXT).optional(),
  esStatus: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  esStatusOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  esInOperationDetails: z.string().max(MAX_LONG_TEXT).optional(),
  esOperatorDetails: z.string().max(MAX_LONG_TEXT).optional(),
  esPlantType: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  esPvSizeKw: z.number().min(0).max(100000).optional(),
  esWindSizeKw: z.number().min(0).max(100000).optional(),
  esPartyCount: z.number().int().min(0).max(10000).optional(),
  esConsumerTypes: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([]),
  esConsumerDetails: z.string().max(MAX_LONG_TEXT).optional(),
  esVnbContact: z.boolean().optional(),
  esVnbResponse: z.string().max(MAX_MEDIUM_TEXT).optional(),
  esVnbResponseOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
  esInfoSources: z.string().max(MAX_LONG_TEXT).optional(),
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
