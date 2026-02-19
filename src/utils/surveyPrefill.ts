import { SurveyData } from "@/types/survey";

/**
 * Maps URL query parameters (from ggv-transparenz.de redirect) to SurveyData fields.
 * Returns partial evaluation data to merge into the first evaluation.
 */

const PARAM_MAP: Record<string, { field: keyof SurveyData; transform?: (v: string) => unknown }> = {
  plz: { field: "projectPlz" },
  city: { field: "ggvProjectCity" },
  address: { field: "projectAddress" },
  pvKwp: { field: "ggvPvSizeKw", transform: (v) => parseFloat(v) || undefined },
  units: { field: "ggvPartyCount", transform: (v) => parseInt(v, 10) || undefined },
  buildingType: { field: "ggvBuildingType" },
  status: { field: "planningStatus", transform: (v) => [v] },
  providerName: { field: "serviceProviderName" },
  website: { field: "ggvProjectWebsite" },
};

export function parsePrefillParams(search: string): {
  evalData: Partial<SurveyData>;
  hasPrefill: boolean;
} {
  const params = new URLSearchParams(search);

  if (!params.has("prefill")) {
    return { evalData: {}, hasPrefill: false };
  }

  const evalData: Partial<SurveyData> = {};
  let filled = false;

  for (const [param, { field, transform }] of Object.entries(PARAM_MAP)) {
    const raw = params.get(param);
    if (raw) {
      const value = transform ? transform(raw) : raw;
      if (value !== undefined) {
        (evalData as Record<string, unknown>)[field] = value;
        filled = true;
      }
    }
  }

  // Auto-set projectTypes to include 'ggv' when prefilled from ggv-transparenz.de
  if (filled && !evalData.projectTypes) {
    evalData.projectTypes = ["ggv"];
  }

  // Build projectLocations from plz + address
  if (evalData.projectPlz || evalData.projectAddress) {
    evalData.projectLocations = [{
      plz: evalData.projectPlz,
      address: evalData.projectAddress,
    }];
  }

  return { evalData, hasPrefill: filled };
}
