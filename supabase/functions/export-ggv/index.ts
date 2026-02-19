import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Status mapping: planningStatus values → ggv-transparenz project_status
const STATUS_MAP: Record<string, string> = {
  info_sammeln: "interested",
  planung_stockt_ggv: "planning_no_provider",
  planung_stockt_pv: "planning_no_provider",
  planung_fast_fertig: "implementing",
  pv_laeuft_ggv_planung: "implementing",
  pv_laeuft_ggv_laeuft: "active",
  sonstiges: "interested",
};

const BUILDING_TYPE_MAP: Record<string, string> = {
  wohngebaeude: "wohngebaeude",
  gewerbe: "gewerbe",
  gemischt: "wohngebaeude",
};

interface SurveyRow {
  ggv_transparenz_opt_in?: string;
  ggv_project_name?: string;
  vnb_name?: string;
  ggv_pv_size_kw?: number;
  ggv_party_count?: number;
  ggv_building_type?: string;
  planning_status?: string[];
  project_locations?: Array<{ plz?: string; address?: string }> | unknown;
  ggv_project_city?: string;
  ggv_project_website?: string;
  ggv_project_links?: string[];
  ggv_experience_notes?: string;
  service_provider_name?: string;
  service_provider_services?: string[];
  service_provider_comments?: string;
  contact_email?: string;
}

// Valid service IDs on ggv-transparenz.de
const VALID_SERVICE_IDS = new Set([
  "data_provision", "invoicing_prep", "full_settlement",
  "metering_full", "metering_invoicing_prep", "metering_full_settlement",
]);

function buildProjectPayload(row: SurveyRow) {
  let plz: string | undefined;
  let address: string | undefined;

  if (Array.isArray(row.project_locations) && row.project_locations.length > 0) {
    const loc = row.project_locations[0] as { plz?: string; address?: string };
    plz = loc.plz;
    address = loc.address;
  }

  // Use explicit project name if provided, otherwise build from address/city
  let name: string;
  if (row.ggv_project_name?.trim()) {
    name = row.ggv_project_name.trim();
  } else {
    const nameParts = ["GGV"];
    if (address) nameParts.push(address);
    if (row.ggv_project_city) nameParts.push(row.ggv_project_city);
    name = nameParts.length > 1 ? nameParts.join(", ") : "GGV-Projekt";
  }

  const planningStatus = Array.isArray(row.planning_status) ? row.planning_status[0] : undefined;
  const status = planningStatus ? STATUS_MAP[planningStatus] || "interested" : undefined;

  const project: Record<string, unknown> = { name };
  if (plz) project.plz = plz;
  if (row.ggv_project_city) project.city = row.ggv_project_city;
  if (address) project.address = address;
  if (row.ggv_pv_size_kw) project.pv_size_kwp = row.ggv_pv_size_kw;
  if (row.ggv_party_count) project.units_count = row.ggv_party_count;
  if (row.ggv_building_type) project.building_type = BUILDING_TYPE_MAP[row.ggv_building_type] || "wohngebaeude";
  if (status) project.status = status;
  if (row.vnb_name) project.dso_name = row.vnb_name;
  if (row.ggv_project_website) project.website = row.ggv_project_website;
  if (row.ggv_project_links && row.ggv_project_links.length > 0) project.links = row.ggv_project_links.slice(0, 2);
  if (row.ggv_experience_notes) project.experience_notes = row.ggv_experience_notes;
  if (row.service_provider_name) project.provider_name = row.service_provider_name;
  if (row.service_provider_comments) project.provider_experience = row.service_provider_comments.slice(0, 2000);

  // Provider services – filter to valid IDs
  const services = (row.service_provider_services || []).filter(s => VALID_SERVICE_IDS.has(s));
  if (services.length > 0) project.provider_services = services;

  project.country = "DE";
  return project;
}

function buildProviderFeedback(row: SurveyRow) {
  if (!row.service_provider_name) return null;

  const feedback: Record<string, unknown> = {
    provider_name: row.service_provider_name,
  };

  const services = (row.service_provider_services || []).filter(s => VALID_SERVICE_IDS.has(s));
  if (services.length > 0) feedback.provider_services = services;

  if (row.service_provider_comments) {
    feedback.provider_experience = row.service_provider_comments.slice(0, 2000);
  }

  return feedback;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { survey_id } = await req.json();

    if (!survey_id) {
      return new Response(JSON.stringify({ error: "survey_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: row, error: fetchError } = await supabase
      .from("survey_responses")
      .select("*")
      .eq("id", survey_id)
      .single();

    if (fetchError || !row) {
      return new Response(JSON.stringify({ error: "Survey not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hasOptIn = row.ggv_transparenz_opt_in === "ja";
    const hasProvider = !!row.service_provider_name;

    // Nothing to send
    if (!hasOptIn && !hasProvider) {
      return new Response(JSON.stringify({ skipped: true, reason: "no opt-in and no provider data" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build payload per API spec
    const payload: Record<string, unknown> = {
      source: "vnb-transparenz-survey",
    };

    if (hasOptIn) {
      // Full project data including provider info
      payload.project = buildProjectPayload(row as SurveyRow);
    } else if (hasProvider) {
      // Only provider feedback, no project data
      payload.provider_feedback = buildProviderFeedback(row as SurveyRow);
    }

    if (row.contact_email) {
      payload.submitter_email = row.contact_email;
    }

    // POST to ggv-transparenz.de API
    const GGV_API_URL = Deno.env.get("GGV_TRANSPARENZ_API_URL");
    const GGV_API_KEY = Deno.env.get("GGV_TRANSPARENZ_API_KEY");

    if (!GGV_API_URL || !GGV_API_KEY) {
      console.warn("GGV API credentials not configured, logging payload instead");
      console.log("GGV export payload:", JSON.stringify(payload, null, 2));
      return new Response(JSON.stringify({
        success: true,
        dry_run: true,
        payload,
        message: "API credentials not configured yet. Payload logged.",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiResponse = await fetch(GGV_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GGV_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const apiResult = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("GGV API error:", apiResult);
      return new Response(JSON.stringify({
        success: false,
        error: "GGV API returned error",
        status: apiResponse.status,
        details: apiResult,
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      project_id: apiResult.project_id,
      feedback_id: apiResult.feedback_id,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
