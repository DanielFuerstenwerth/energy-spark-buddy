import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    // Auth check: only admins
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user is admin
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { export_ids, action } = await req.json();

    if (!Array.isArray(export_ids) || export_ids.length === 0) {
      return new Response(JSON.stringify({ error: "export_ids required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["approve", "reject"].includes(action)) {
      return new Response(JSON.stringify({ error: "action must be 'approve' or 'reject'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reject: just update status
    if (action === "reject") {
      const { error } = await supabaseAdmin
        .from("ggv_exports")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .in("id", export_ids)
        .eq("status", "pending_review");

      if (error) {
        return new Response(JSON.stringify({ error: "Update failed", details: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Audit log
      await supabaseAdmin.from("admin_audit_log").insert(
        export_ids.map((id: string) => ({
          admin_user_id: user.id,
          action: "ggv_export_rejected",
          entity_type: "ggv_exports",
          entity_id: id,
        }))
      );

      return new Response(JSON.stringify({ success: true, action: "rejected", count: export_ids.length }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Approve: send each to GGV API
    const GGV_API_URL = Deno.env.get("GGV_TRANSPARENZ_API_URL");
    const GGV_API_KEY = Deno.env.get("GGV_TRANSPARENZ_API_KEY");

    // Fetch all pending exports
    const { data: exports, error: fetchError } = await supabaseAdmin
      .from("ggv_exports")
      .select("*")
      .in("id", export_ids)
      .eq("status", "pending_review");

    if (fetchError || !exports) {
      return new Response(JSON.stringify({ error: "Failed to fetch exports" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ id: string; success: boolean; error?: string; dry_run?: boolean }> = [];

    for (const exp of exports) {
      try {
        if (!GGV_API_URL || !GGV_API_KEY) {
          // Dry run mode
          console.log("GGV dry run payload:", JSON.stringify(exp.payload, null, 2));
          await supabaseAdmin
            .from("ggv_exports")
            .update({
              status: "approved",
              reviewed_by: user.id,
              reviewed_at: new Date().toISOString(),
              error_message: "API credentials not configured – dry run",
            })
            .eq("id", exp.id);

          results.push({ id: exp.id, success: true, dry_run: true });
          continue;
        }

        const apiResponse = await fetch(GGV_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GGV_API_KEY}`,
          },
          body: JSON.stringify(exp.payload),
        });

        const apiResult = await apiResponse.json();

        if (!apiResponse.ok) {
          await supabaseAdmin
            .from("ggv_exports")
            .update({
              status: "failed",
              reviewed_by: user.id,
              reviewed_at: new Date().toISOString(),
              error_message: JSON.stringify(apiResult).slice(0, 1000),
            })
            .eq("id", exp.id);

          results.push({ id: exp.id, success: false, error: `HTTP ${apiResponse.status}` });
          continue;
        }

        await supabaseAdmin
          .from("ggv_exports")
          .update({
            status: "sent",
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            sent_at: new Date().toISOString(),
            remote_project_id: apiResult.project_id || null,
            remote_feedback_id: apiResult.feedback_id || null,
          })
          .eq("id", exp.id);

        results.push({ id: exp.id, success: true });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        await supabaseAdmin
          .from("ggv_exports")
          .update({
            status: "failed",
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            error_message: errMsg.slice(0, 1000),
          })
          .eq("id", exp.id);

        results.push({ id: exp.id, success: false, error: errMsg });
      }
    }

    // Audit log
    await supabaseAdmin.from("admin_audit_log").insert(
      results.map((r) => ({
        admin_user_id: user.id,
        action: r.success ? "ggv_export_sent" : "ggv_export_failed",
        entity_type: "ggv_exports",
        entity_id: r.id,
        details: r.error ? { error: r.error } : null,
      }))
    );

    return new Response(JSON.stringify({ success: true, results }), {
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
