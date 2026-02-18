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

  // Required: session_group_id must be UUID
  if (!data.session_group_id || typeof data.session_group_id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.session_group_id)) {
    errors.push("session_group_id must be a valid UUID");
  }

  // Validate all fields defensively
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    // String length check
    if (typeof value === "string" && value.length > MAX_TEXT_LENGTH) {
      errors.push(`${key} exceeds max length of ${MAX_TEXT_LENGTH}`);
    }

    // Array length check
    if (Array.isArray(value) && value.length > MAX_ARRAY_ITEMS) {
      errors.push(`${key} exceeds max array items of ${MAX_ARRAY_ITEMS}`);
    }

    // Number range check (basic)
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
    // Payload size limit: reject requests > 100KB
    const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
    if (contentLength > 102400) {
      return new Response(
        JSON.stringify({ error: "Payload too large. Maximum 100KB allowed." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting by IP (Maßnahme 7)
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     req.headers.get("cf-connecting-ip") || "unknown";

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check rate limit
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

    // Record this submission attempt for rate limiting
    await supabaseAdmin
      .from("chat_rate_limits")
      .insert({ client_ip: `survey:${clientIp}` });

    // Parse body
    const body = await req.json();
    const { submissions, website } = body;

    // Maßnahme 11: Honeypot check - bots fill the hidden "website" field
    if (website && typeof website === "string" && website.trim().length > 0) {
      // Silently reject - return success to not reveal detection
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

    // Validate all submissions first (Maßnahme 5)
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

      sanitizedRows.push(sanitizeRow(sub as Record<string, unknown>));
    }

    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: validationErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Atomic insert: all or nothing (Maßnahme 6)
    // Supabase insert with array inserts all rows in a single transaction
    const { error: insertError } = await supabaseAdmin
      .from("survey_responses")
      .insert(sanitizedRows);

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save survey responses", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
