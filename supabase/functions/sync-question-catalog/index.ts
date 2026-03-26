import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { COLUMN_LABELS, SCHEMA_VERSION } from "../_shared/survey-labels.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Derives project_scope from section name or column prefix.
 */
function deriveProjectScope(col: string, section: string): string | null {
  if (section.includes("GGV") || section.startsWith("4. GGV") || section.startsWith("5. GGV")) return "ggv";
  if (section.includes("MS") || section.includes("Mieterstrom")) return "ms";
  if (section.includes("Energy Sharing") || section.startsWith("4. ES")) return "es";
  if (col.startsWith("mieterstrom_")) return "ms";
  if (col.startsWith("es_")) return "es";
  if (col.startsWith("ggv_")) return "ggv";
  if (col.startsWith("vnb_") || col.startsWith("operation_")) return "ggv";
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: require admin user token OR service-role key
    const authHeader = req.headers.get("Authorization");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const token = authHeader?.replace("Bearer ", "") ?? "";
    const isServiceRole = token === serviceRoleKey || token === anonKey;
    const isServiceRole = token === serviceRoleKey;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceRoleKey
    );

    if (!isServiceRole) {
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

      const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userId = claimsData.claims.sub;
      const { data: roleData } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Build catalog rows from COLUMN_LABELS (the SSOT for DB-column → question metadata)
    const entries = Object.entries(COLUMN_LABELS);
    const rows = entries.map(([col, meta], idx) => ({
      field_key: col,
      question_number: meta.uiNumber || null,
      question_text: meta.questionLabel,
      section_key: meta.section,
      project_scope: deriveProjectScope(col, meta.section),
      sort_order: idx + 1,
      schema_version: SCHEMA_VERSION,
      is_active: true,
      updated_at: new Date().toISOString(),
    }));

    // Upsert all rows
    const { error: upsertError } = await supabaseAdmin
      .from("survey_question_catalog")
      .upsert(rows, { onConflict: "field_key" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return new Response(JSON.stringify({ error: "Failed to upsert catalog", details: upsertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Report fields without canonical question_number
    const noNumber = rows.filter(r => !r.question_number).map(r => r.field_key);

    return new Response(JSON.stringify({
      success: true,
      total: rows.length,
      fields_without_question_number: noNumber,
      fields_without_question_number_count: noNumber.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
