import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limiting: max 10 submissions per IP per hour
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_HOURS = 1;

// Text limits
const MAX_TEXT_LENGTH = 10000;
const MAX_SHORT_TEXT = 500;
const MAX_ARRAY_ITEMS = 20;

function sanitizeText(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const trimmed = val.trim().replace(/[\x00-\x1F\x7F]/g, "");
  return trimmed.length > MAX_TEXT_LENGTH ? trimmed.slice(0, MAX_TEXT_LENGTH) : trimmed;
}

function validateSubmission(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.session_group_id || typeof data.session_group_id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.session_group_id)) {
    errors.push("session_group_id must be a valid UUID");
  }

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string" && value.length > MAX_TEXT_LENGTH) {
      errors.push(`${key} exceeds max length of ${MAX_TEXT_LENGTH}`);
    }
    if (Array.isArray(value) && value.length > MAX_ARRAY_ITEMS) {
      errors.push(`${key} exceeds max array items of ${MAX_ARRAY_ITEMS}`);
    }
    if (typeof value === "number" && (value < -1000000 || value > 10000000)) {
      errors.push(`${key} number out of range`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function sanitizeRow(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (typeof value === "string") {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.slice(0, MAX_ARRAY_ITEMS).map((item) =>
        typeof item === "string" ? sanitizeText(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// --- GGV Export Payload Builder (mirrors export-ggv logic) ---

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

const VALID_SERVICE_IDS = new Set([
  "data_provision", "invoicing_prep", "full_settlement",
  "metering_full", "metering_invoicing_prep", "metering_full_settlement",
]);

function buildGgvPayload(row: Record<string, unknown>): Record<string, unknown> | null {
  const hasOptIn = row.ggv_transparenz_opt_in === "ja";
  const hasProvider = !!row.service_provider_name;

  if (!hasOptIn && !hasProvider) return null;

  const payload: Record<string, unknown> = { source: "vnb-transparenz-survey" };

  if (hasOptIn) {
    // Use flat columns (project_plz, project_address, ggv_project_name, ggv_project_links)
    const plz = row.project_plz as string | undefined;
    const address = row.project_address as string | undefined;

    const nameParts = ["GGV"];
    if (address) nameParts.push(address);
    if (row.ggv_project_city) nameParts.push(row.ggv_project_city as string);
    const name = (row.ggv_project_name as string) || (nameParts.length > 1 ? nameParts.join(", ") : "GGV-Projekt");

    const planningStatus = Array.isArray(row.planning_status) ? row.planning_status[0] : undefined;
    const status = planningStatus ? STATUS_MAP[planningStatus] || "interested" : undefined;

    const project: Record<string, unknown> = { name };
    if (plz) project.plz = plz;
    if (row.ggv_project_city) project.city = row.ggv_project_city;
    if (address) project.address = address;
    if (row.ggv_pv_size_kw) project.pv_size_kwp = row.ggv_pv_size_kw;
    if (row.ggv_party_count) project.units_count = row.ggv_party_count;
    if (row.ggv_building_type) project.building_type = BUILDING_TYPE_MAP[row.ggv_building_type as string] || "wohngebaeude";
    if (status) project.status = status;
    if (row.vnb_name) project.dso_name = row.vnb_name;
    if (row.ggv_project_website) project.website = row.ggv_project_website;
    const links = row.ggv_project_links as string[] | undefined;
    if (links && links.length > 0) project.links = links.slice(0, 5);
    if (row.ggv_experience_notes) project.experience_notes = row.ggv_experience_notes;
    if (row.service_provider_name) project.provider_name = row.service_provider_name;
    if (row.service_provider_comments) project.provider_experience = (row.service_provider_comments as string).slice(0, 2000);

    const services = ((row.service_provider_services || []) as string[]).filter(s => VALID_SERVICE_IDS.has(s));
    if (services.length > 0) project.provider_services = services;
    project.country = "DE";

    payload.project = project;
  } else if (hasProvider) {
    const feedback: Record<string, unknown> = { provider_name: row.service_provider_name };
    const services = ((row.service_provider_services || []) as string[]).filter(s => VALID_SERVICE_IDS.has(s));
    if (services.length > 0) feedback.provider_services = services;
    if (row.service_provider_comments) feedback.provider_experience = (row.service_provider_comments as string).slice(0, 2000);
    payload.provider_feedback = feedback;
  }

  if (row.contact_email) payload.submitter_email = row.contact_email;

  return payload;
}

// --- Main handler ---

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
    const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
    if (contentLength > 102400) {
      return new Response(
        JSON.stringify({ error: "Payload too large. Maximum 100KB allowed." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     req.headers.get("cf-connecting-ip") || "unknown";

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit check
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabaseAdmin
      .from("chat_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("client_ip", `survey:${clientIp}`)
      .gte("created_at", windowStart);

    if ((recentCount || 0) >= RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabaseAdmin
      .from("chat_rate_limits")
      .insert({ client_ip: `survey:${clientIp}` });

    const body = await req.json();
    const { submissions, website } = body;

    // Honeypot
    if (website && typeof website === "string" && website.trim().length > 0) {
      console.log("Honeypot triggered, rejecting submission from IP:", clientIp);
      return new Response(
        JSON.stringify({ success: true, count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(submissions) || submissions.length === 0 || submissions.length > 10) {
      return new Response(
        JSON.stringify({ error: "submissions must be an array with 1-10 items" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validationErrors: string[] = [];
    const sanitizedRows: Record<string, unknown>[] = [];

    for (let i = 0; i < submissions.length; i++) {
      const sub = submissions[i];
      if (typeof sub !== "object" || sub === null) {
        validationErrors.push(`Submission ${i}: invalid format`);
        continue;
      }

      const validation = validateSubmission(sub as Record<string, unknown>);
      if (!validation.valid) {
        validationErrors.push(`Submission ${i}: ${validation.errors.join(", ")}`);
      }

      sanitizedRows.push({ ...sanitizeRow(sub as Record<string, unknown>), status: "submitted" });
    }

    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: validationErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert survey responses
    const { data: insertedRows, error: insertError } = await supabaseAdmin
      .from("survey_responses")
      .insert(sanitizedRows)
      .select("id");

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save survey responses", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create ggv_exports entries for rows that qualify
    const exportEntries: Array<{ survey_id: string; payload: Record<string, unknown>; status: string }> = [];
    
    for (let i = 0; i < sanitizedRows.length; i++) {
      const row = sanitizedRows[i];
      const surveyId = insertedRows?.[i]?.id;
      if (!surveyId) continue;

      const payload = buildGgvPayload(row);
      if (payload) {
        exportEntries.push({
          survey_id: surveyId,
          payload,
          status: "pending_review",
        });
      }
    }

    if (exportEntries.length > 0) {
      const { error: exportInsertError } = await supabaseAdmin
        .from("ggv_exports")
        .insert(exportEntries);

      if (exportInsertError) {
        // Non-blocking: log but don't fail the submission
        console.error("Failed to create ggv_export entries:", exportInsertError);
      } else {
        console.log(`Created ${exportEntries.length} ggv_export entries for admin review`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: sanitizedRows.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
