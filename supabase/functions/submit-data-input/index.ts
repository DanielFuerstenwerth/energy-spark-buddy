import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "Expected multipart/form-data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const category = formData.get("category") as string;
    const categoryOther = formData.get("categoryOther") as string | null;
    const description = formData.get("description") as string;
    const contactName = formData.get("contactName") as string | null;
    const contactEmail = formData.get("contactEmail") as string | null;

    if (!category || !description) {
      return new Response(JSON.stringify({ error: "category and description are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (description.length > 10000) {
      return new Response(JSON.stringify({ error: "Description too long" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Upload files
    const uploadedPaths: string[] = [];
    const submissionId = crypto.randomUUID();

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file_") && value instanceof File) {
        if (value.size > 10 * 1024 * 1024) continue; // Skip files > 10MB
        const safeName = value.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `data-inputs/${submissionId}/${safeName}`;
        const arrayBuf = await value.arrayBuffer();
        const { error } = await supabase.storage
          .from("survey-documents")
          .upload(path, arrayBuf, { contentType: value.type });
        if (!error) uploadedPaths.push(path);
      }
    }

    // Insert into DB
    const { error: insertError } = await supabase.from("data_inputs").insert({
      id: submissionId,
      category,
      category_other: categoryOther || null,
      description,
      contact_name: contactName || null,
      contact_email: contactEmail || null,
      uploaded_files: uploadedPaths,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save submission" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: submissionId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
