// Survey Validation - DERIVED from surveySchema.ts (SSOT)
// Zod schema is built programmatically from the survey schema definition.
// DO NOT manually add fields here - add them to surveySchema.ts instead.

import { z } from "zod";
import { surveyDefinition, QUESTION_REGISTRY } from "@/data/surveySchema";
import type { SurveyQuestion, SurveySection } from "@/data/surveySchema";

const MAX_SHORT_TEXT = 500;
const MAX_MEDIUM_TEXT = 10000;
const MAX_LONG_TEXT = 10000;
const MAX_ARRAY_ITEMS = 20;

export const sanitizeText = (text: string | undefined): string | undefined => {
  if (!text) return undefined;
  return text.trim().replace(/[\x00-\x1F\x7F]/g, "");
};

// Build a Zod field from a SurveyQuestion definition
function zodFieldForQuestion(q: SurveyQuestion): z.ZodTypeAny {
  switch (q.type) {
    case 'multi-select':
      return q.required
        ? z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).default([])
        : z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).optional().default([]);

    case 'single-select':
      return q.required
        ? z.string().max(MAX_MEDIUM_TEXT)
        : z.string().max(MAX_MEDIUM_TEXT).optional();

    case 'text':
      return z.string().max(MAX_MEDIUM_TEXT).optional();

    case 'textarea':
      return z.string().max(MAX_LONG_TEXT).optional();

    case 'email':
      return z.string().email("Ungültige E-Mail-Adresse").max(255).optional().or(z.literal(""));

    case 'number':
      return z.number().min(0).max(10000000).optional();

    case 'rating':
      return z.number().int().min(q.min ?? 0).max(q.max ?? 10).optional();

    case 'file':
      return z.any().optional(); // File uploads handled separately

    case 'vnb-select':
      return z.string().max(MAX_SHORT_TEXT).optional();

    case 'project-focus':
      return z.enum(["ggv", "mieterstrom", "energysharing"]).optional();

    default:
      return z.string().max(MAX_MEDIUM_TEXT).optional();
  }
}

// Programmatically build the Zod schema shape from all survey sections
// Fields rendered as single-select but stored as string[] for logic compatibility
const ARRAY_WRAPPED_FIELDS = new Set(['planningStatus', 'mieterstromPlanningStatus', 'esStatus', 'vnbResponse']);

function buildZodShape(): Record<string, z.ZodTypeAny> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const section of surveyDefinition.sections) {
    for (const q of section.questions) {
      // ARRAY_WRAPPED_FIELDS: single-select in UI but stored as string[] in SurveyData
      if (ARRAY_WRAPPED_FIELDS.has(q.id)) {
        shape[q.id] = q.required
          ? z.array(z.string().max(MAX_MEDIUM_TEXT)).default([])
          : z.array(z.string().max(MAX_MEDIUM_TEXT)).optional().default([]);
      } else {
        shape[q.id] = zodFieldForQuestion(q);
      }

      // Auto-generate "Other" text fields for multi-select/single-select with hasTextField options
      const hasTextFieldOptions = q.options?.some(o => o.hasTextField || o.value === 'sonstiges');
      if (hasTextFieldOptions && q.type === 'multi-select') {
        // For multi-select with text fields, add a details record
        if (!shape[`${q.id}Details`]) {
          shape[`${q.id}Details`] = z.record(z.string().max(MAX_LONG_TEXT)).default({});
        }
        // Also add individual "Other" field
        if (!shape[`${q.id}Other`]) {
          shape[`${q.id}Other`] = z.string().max(MAX_MEDIUM_TEXT).optional();
        }
      }
      if (hasTextFieldOptions && q.type === 'single-select') {
        if (!shape[`${q.id}Other`]) {
          shape[`${q.id}Other`] = z.string().max(MAX_MEDIUM_TEXT).optional();
        }
      }
    }
  }

  // Add fields that exist in SurveyData but are derived/computed, not direct questions
  // These are "companion" fields not directly in the schema questions
  const additionalFields: Record<string, z.ZodTypeAny> = {
    // Actor text fields (companion to actorTypes multi-select with hasTextField)
    actorTextFields: z.record(z.string().max(MAX_MEDIUM_TEXT)).default({}),
    actorOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
    // Project focus (derived)
    projectFocus: z.enum(["ggv", "mieterstrom", "energysharing"]).optional(),
    // Mieterstrom extras
    mieterstromProjectType: z.string().max(MAX_SHORT_TEXT).optional(),
    mieterstromBuildingCount: z.number().int().min(0).max(1000).optional(),
    // Project locations (JSONB array)
    projectLocations: z.array(z.object({
      plz: z.string().max(10).optional(),
      address: z.string().max(MAX_MEDIUM_TEXT).optional(),
      pvSizeKw: z.number().min(0).max(100000).optional(),
    })).optional(),
    projectAddress: z.string().max(MAX_MEDIUM_TEXT).optional(),
    projectPlz: z.string().max(10).optional(),
    // Service provider 2 comments
    serviceProvider2Comments: z.string().max(MAX_LONG_TEXT).optional(),
    // Challenges companion fields
    challengesDetails: z.record(z.string().max(MAX_LONG_TEXT)).default({}),
    // VNB companion fields
    vnbResponseReasons: z.string().max(MAX_LONG_TEXT).optional(),
    // Mieterstrom companion fields
    mieterstromVirtuellWandlermessungComment: z.string().max(MAX_LONG_TEXT).optional(),
    mieterstromVnbResponseReasons: z.string().max(MAX_LONG_TEXT).optional(),
    mieterstromMsbCostsOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
    mieterstromVnbDurationReasons: z.string().max(MAX_LONG_TEXT).optional(),
    mieterstromWandlermessungComment: z.string().max(MAX_LONG_TEXT).optional(),
    mieterstromOperationCostsOneTime: z.number().min(0).max(10000000).optional(),
    mieterstromOperationCostsYearly: z.number().min(0).max(10000000).optional(),
    mieterstromRejectionResponseOther: z.string().max(MAX_MEDIUM_TEXT).optional(),
    // ES companion fields
    esPlantTypeDetails: z.array(z.string().max(MAX_SHORT_TEXT)).max(MAX_ARRAY_ITEMS).optional(),
    esConsumerDetails: z.string().max(MAX_LONG_TEXT).optional(),
    esNetzentgelteDetails: z.string().max(MAX_LONG_TEXT).optional(),
    esInOperationDetails: z.string().max(MAX_LONG_TEXT).optional(),
    esOperatorDetails: z.string().max(MAX_LONG_TEXT).optional(),
    esProjectLocations: z.array(z.object({
      plz: z.string().max(10).optional(),
      address: z.string().max(MAX_MEDIUM_TEXT).optional(),
    })).optional(),
    // Multi-evaluation metadata
    evaluationLabel: z.string().max(MAX_SHORT_TEXT).optional(),
    sessionGroupId: z.string().uuid().optional(),
    // NPS
    npsScore: z.number().int().min(0).max(10).optional(),
  };

  for (const [key, val] of Object.entries(additionalFields)) {
    if (!shape[key]) {
      shape[key] = val;
    }
  }

  return shape;
}

export const surveySchema = z.object(buildZodShape());

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
