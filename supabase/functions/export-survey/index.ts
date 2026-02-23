import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { COLUMN_LABELS, resolveValue, SCHEMA_VERSION } from "../_shared/survey-labels.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // 2. Check admin role using service role client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      console.warn(`[Security] Non-admin user ${userId} attempted survey export`);
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Log this access in audit log
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_user_id: userId,
      action: "export",
      entity_type: "survey_responses",
      entity_id: "00000000-0000-0000-0000-000000000000",
      details: { format: "csv", timestamp: new Date().toISOString() },
    });

    // 4. Fetch ALL survey responses (paginated to avoid 1000-row limit)
    const PAGE_SIZE = 1000;
    let allResponses: Record<string, unknown>[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: page, error: fetchError } = await supabaseAdmin
        .from("survey_responses")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (page && page.length > 0) {
        allResponses = allResponses.concat(page);
        offset += PAGE_SIZE;
        hasMore = page.length === PAGE_SIZE;
      } else {
        hasMore = false;
      }
    }

    const responses = allResponses;

    if (responses.length === 0) {
      return new Response(JSON.stringify({ error: "No data to export" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Generate TRANSPOSED CSV (fields as rows, projects as columns)
    // Machine-readable format: raw technical values, stable question IDs
    // UTF-8 BOM + semicolon separator (Excel default for German locale)
    const allKeys = Object.keys(responses[0]);
    
    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return "";
      const str = typeof val === "object" ? JSON.stringify(val) : String(val);
      if (str.includes(";") || str.includes('"') || str.includes("\n") || str.includes("|")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build project labels for column headers
    const projectHeaders = responses.map((r: Record<string, unknown>, i: number) => {
      const label = r.evaluation_label || r.vnb_name || `Projekt ${i + 1}`;
      return escapeCsv(label);
    });

    // Columns: Frage-Nr | Abschnitt | DB-Spalte | Fragetext | Projekt1 | Projekt2 | ...
    const headerRow = ["Frage-Nr", "Abschnitt", "DB-Spalte", "Fragetext", ...projectHeaders].join(";");

    // One row per field, with RAW values from each project (no label resolution)
    const dataRows = allKeys.map((key) => {
      const meta = COLUMN_LABELS[key];
      const rawUiNumber = meta?.uiNumber || "";
      // Wrap in ="..." so Excel treats "1.2" as text, not as a date
      const uiNumber = rawUiNumber ? `="\"${rawUiNumber}\""` : "";
      const section = escapeCsv(meta?.section || "");
      const dbColumn = escapeCsv(key);
      const questionLabel = escapeCsv(meta?.questionLabel || key);
      const values = responses.map((r: Record<string, unknown>) => escapeCsv(resolveValue(key, r[key])));
      return [uiNumber, section, dbColumn, questionLabel, ...values].join(";");
    });

    const bom = "\uFEFF";
    const csv = bom + [headerRow, ...dataRows].join("\n");

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `umfrage-export-${timestamp}.csv`;

    console.log(`[Audit] Admin ${userId} exported ${responses.length} survey responses`);

    return new Response(csv, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
