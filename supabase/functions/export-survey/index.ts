import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { COLUMN_LABELS, resolveValue, SCHEMA_VERSION } from "../_shared/survey-labels.ts";
import * as XLSX from "https://esm.sh/xlsx@0.18.5/xlsx.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── PII columns stripped in anonymized mode ──
const PII_COLUMNS = new Set([
  "contact_email", "project_address", "project_plz",
  "ggv_project_name", "ggv_project_website", "ggv_project_links", "ggv_project_city",
  "dienstleister_kontakt", "dienstleister_website",
  "service_provider_name", "service_provider_2_name",
  "actor_text_fields",
]);

const SYSTEM_FIELDS = new Set([
  "id", "created_at", "updated_at", "status", "session_group_id",
  "schema_version", "draft_token", "client_submission_id",
]);

const DERIVED_FIELDS = new Set(["project_type_tag", "evaluation_label"]);

const FREETEXT_TYPES = new Set(["text", "textarea", "email"]);

// ── Helpers ──

function getFieldOrigin(col: string): string {
  if (SYSTEM_FIELDS.has(col)) return "System";
  if (DERIVED_FIELDS.has(col)) return "abgeleitet";
  return "Rohwert";
}

function getApplicableProjectType(col: string, section: string): string | null {
  if (section.includes("GGV")) return "ggv";
  if (section.includes("MS")) return "ms";
  if (section.includes("Energy Sharing") || section.startsWith("4. ES")) return "es";
  if (col.startsWith("mieterstrom_")) return "ms";
  if (col.startsWith("es_")) return "es";
  return null;
}

function normalizeVnb(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*(GmbH|AG|KG|e\.?\s*G\.?|& Co\.?\s*KG|mbH|SE)\s*$/i, "")
    .trim();
}

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (v === "") return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
}

function resolveExportValue(col: string, raw: unknown, tag: string | null): string {
  const meta = COLUMN_LABELS[col];
  if (meta && tag) {
    const applicable = getApplicableProjectType(col, meta.section);
    if (applicable && applicable !== tag && isEmpty(raw)) return "(n.z.)";
  }
  if (raw === null || raw === undefined) return "(keine Antwort)";
  if (raw === "") return "(leer)";
  if (Array.isArray(raw) && raw.length === 0) return "(keine Antwort)";
  return resolveValue(col, raw);
}

// ── Quality flags ──

function buildDuplicateIndex(rows: Record<string, unknown>[]): Set<number> {
  const key = (r: Record<string, unknown>) =>
    `${r.session_group_id}|${r.project_type_tag}|${r.vnb_name}`;
  const counts = new Map<string, number[]>();
  rows.forEach((r, i) => {
    const k = key(r);
    if (!counts.has(k)) counts.set(k, []);
    counts.get(k)!.push(i);
  });
  const dupes = new Set<number>();
  for (const indices of counts.values()) {
    if (indices.length > 1) indices.forEach((i) => dupes.add(i));
  }
  return dupes;
}

function qualityFlags(r: Record<string, unknown>, isDupe: boolean) {
  const status = r.status as string;
  const vnb = r.vnb_name as string | null;
  const types = r.project_types as string[] | null;
  const tag = r.project_type_tag as string | null;

  const complete = status === "submitted" && !!vnb && !!types?.length;
  const missingKey = !vnb || !types?.length;

  let inconsistent = false;
  if (tag === "ggv" && r.mieterstrom_pv_size_kw && !r.ggv_pv_size_kw) inconsistent = true;
  if (tag === "ms" && r.ggv_pv_size_kw && !r.mieterstrom_pv_size_kw) inconsistent = true;

  const known = new Set(Object.keys(COLUMN_LABELS));
  const unmapped = Object.keys(r).filter((k) => !known.has(k) && !isEmpty(r[k]));

  return {
    response_complete: complete ? "ja" : "nein",
    draft_flag: status === "draft" ? "ja" : "nein",
    duplicate_suspected: isDupe ? "ja" : "nein",
    missing_key_fields_flag: missingKey ? "ja" : "nein",
    inconsistent_answer_flag: inconsistent ? "ja" : "nein",
    unmapped_fields_flag: unmapped.length > 0 ? unmapped.join(", ") : "nein",
  };
}

// ── Sheet builders ──

function buildDatenSheet(
  responses: Record<string, unknown>[],
  columns: string[],
  isAnon: boolean
) {
  const dupes = buildDuplicateIndex(responses);
  const flagKeys = [
    "response_complete", "draft_flag", "duplicate_suspected",
    "missing_key_fields_flag", "inconsistent_answer_flag", "unmapped_fields_flag",
  ];
  const cols = isAnon ? columns.filter((c) => !PII_COLUMNS.has(c)) : columns;

  const headerLabels = cols.map((c) => {
    const m = COLUMN_LABELS[c];
    return m ? `${m.questionLabel}` : c;
  });

  const header = [...headerLabels, ...flagKeys.map(k => `[QF] ${k}`)];
  const rows = [header];

  responses.forEach((r, idx) => {
    const tag = r.project_type_tag as string | null;
    const flags = qualityFlags(r, dupes.has(idx));
    const vals = cols.map((c) => resolveExportValue(c, r[c], tag));
    rows.push([...vals, ...flagKeys.map((k) => flags[k as keyof typeof flags])]);
  });

  return XLSX.utils.aoa_to_sheet(rows);
}

function buildMethodikSheet(
  responses: Record<string, unknown>[],
  draftCount: number,
  isAnon: boolean
) {
  const submitted = responses.filter((r) => r.status === "submitted");
  const dates = responses.map((r) => new Date(r.created_at as string).getTime()).filter(Boolean);
  const minDate = dates.length ? new Date(Math.min(...dates)).toISOString().slice(0, 10) : "–";
  const maxDate = dates.length ? new Date(Math.max(...dates)).toISOString().slice(0, 10) : "–";
  const versions = [...new Set(responses.map((r) => r.schema_version || "unbekannt"))];
  const missingKey = submitted.filter(
    (r) => !r.vnb_name || !(r.project_types as string[] | null)?.length
  ).length;

  const data: (string | number)[][] = [
    ["Feld", "Wert"],
    ["Name der Umfrage", "Umfrage GGV & Co – Erfahrungen mit Verteilnetzbetreibern"],
    ["Exportdatum", new Date().toISOString().slice(0, 10)],
    ["Exportmodus", isAnon ? "Anonymisiert (ohne personenbezogene Daten)" : "Vollständig"],
    ["Feldzeitraum", `${minDate} bis ${maxDate}`],
    ["Anzahl Responses gesamt (im Export)", responses.length],
    ["Anzahl vollständiger Responses (submitted)", submitted.length],
    ["Anzahl mit fehlenden Schlüsselfeldern (submitted)", missingKey],
    ["Anzahl Entwürfe / Drafts (nicht im Export)", draftCount],
    ["Schema-Version(en)", versions.join(", ")],
    ["Export-Schema-Version", SCHEMA_VERSION],
    [],
    ["Bereinigungsschritte", ""],
    ["1.", "Rohdaten werden unverändert aus der Datenbank exportiert."],
    ["2.", "Antwort-IDs werden zu Klartext-Labels aufgelöst (Mapping siehe Sheet 'Codebook')."],
    ["3.", "Fehlende Werte werden differenziert: '(keine Antwort)' = nicht beantwortet, '(n.z.)' = Frage nicht zutreffend für diesen Projekttyp, '(leer)' = technisch leerer String."],
    ["4.", "VNB-Namen werden normalisiert (Original und normalisierter Wert, siehe Sheet 'Normalisierung')."],
    ["5.", "Qualitätsflags werden berechnet (Spalten [QF]… im Daten-Sheet)."],
    ["6.", "Jede Zeile im Daten-Sheet entspricht einer VNB-Bewertung. Mehrere Bewertungen einer Sitzung sind über session_group_id verknüpft."],
    [],
    ["Definitionen", ""],
    ["GGV", "Gemeinschaftliche Gebäudeversorgung nach §42b EnWG"],
    ["Mieterstrom", "Mieterstrom nach §42a EnWG"],
    ["Energy Sharing", "Gemeinschaftliche Eigenversorgung / Energy Sharing (§42c EnWG)"],
    ["VNB", "Verteilnetzbetreiber"],
    ["gMSB", "Grundzuständiger Messstellenbetreiber"],
    ["wMSB", "Wettbewerblicher Messstellenbetreiber"],
    ["ESA", "Energieserviceanbieter (z.B. für Zugang zu Messwerten)"],
    ["project_type_tag", "Projekttyp-Kennung pro Zeile: ggv, ms, es"],
    ["session_group_id", "Verknüpft mehrere Bewertungen einer Umfrage-Sitzung"],
    ["evaluation_label", "Vom Nutzer vergebenes Label für die VNB-Bewertung"],
    [],
    ["Qualitätsflags (Spalten im Daten-Sheet)", ""],
    ["[QF] response_complete", "'ja' wenn status=submitted UND vnb_name und project_types vorhanden"],
    ["[QF] draft_flag", "'ja' wenn status=draft"],
    ["[QF] duplicate_suspected", "'ja' wenn gleiche session_group_id + project_type_tag + vnb_name mehrfach vorkommt"],
    ["[QF] missing_key_fields_flag", "'ja' wenn vnb_name oder project_types fehlt"],
    ["[QF] inconsistent_answer_flag", "'ja' wenn project_type_tag nicht zu den ausgefüllten Feldern passt"],
    ["[QF] unmapped_fields_flag", "Liste von DB-Spalten ohne Zuordnung im Codebook, oder 'nein'"],
    [],
    ["Fehlende-Werte-Kodierung", ""],
    ["(keine Antwort)", "Feld war für den Nutzer sichtbar, wurde aber nicht beantwortet (NULL oder leeres Array)"],
    ["(n.z.)", "Nicht zutreffend – Feld gehört zu einem anderen Projekttyp und wurde deshalb nicht angezeigt"],
    ["(leer)", "Technisch leerer String (unterschieden von NULL)"],
    ["Explizites 'Nein'", "Nutzer hat aktiv 'Nein' gewählt – wird als Klartext-Label angezeigt"],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 50 }, { wch: 80 }];
  return ws;
}

function buildFreitexteSheet(
  responses: Record<string, unknown>[],
  columns: string[],
  isAnon: boolean
) {
  const header = [
    "response_id", "Export-Header", "Interner Feldname",
    "Abschnitt", "Frage-Nr", "Fragetext", "Freitextinhalt", "created_at",
  ];
  const rows: string[][] = [header];

  for (const r of responses) {
    const id = r.id as string;
    const createdAt = (r.created_at as string || "").slice(0, 19);
    for (const col of columns) {
      const meta = COLUMN_LABELS[col];
      if (!meta) continue;
      if (!FREETEXT_TYPES.has(meta.type)) continue;
      if (isAnon && PII_COLUMNS.has(col)) continue;
      const raw = r[col];
      if (isEmpty(raw)) continue;
      const text = Array.isArray(raw) ? raw.join(" | ") : String(raw);
      // Strip control characters but preserve content
      const cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
      if (!cleaned.trim()) continue;
      rows.push([
        id,
        meta.questionLabel,
        col,
        meta.section,
        meta.uiNumber || "",
        meta.questionLabel,
        cleaned,
        createdAt,
      ]);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 36 }, { wch: 40 }, { wch: 30 },
    { wch: 20 }, { wch: 8 }, { wch: 40 }, { wch: 80 }, { wch: 19 },
  ];
  return ws;
}

function buildCodebookSheet() {
  const header = [
    "Frage-Nr", "DB-Spalte", "Abschnitt", "Fragetext",
    "Typ", "Herkunft", "Antwort-ID", "Antwort-Label",
  ];
  const rows: string[][] = [header];

  for (const [col, meta] of Object.entries(COLUMN_LABELS)) {
    const origin = getFieldOrigin(col);
    if (meta.options && Object.keys(meta.options).length > 0) {
      for (const [val, label] of Object.entries(meta.options)) {
        rows.push([
          meta.uiNumber || "", col, meta.section, meta.questionLabel,
          meta.type, origin, val, label,
        ]);
      }
    } else {
      rows.push([
        meta.uiNumber || "", col, meta.section, meta.questionLabel,
        meta.type, origin, "", "",
      ]);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 8 }, { wch: 35 }, { wch: 22 }, { wch: 55 },
    { wch: 14 }, { wch: 12 }, { wch: 25 }, { wch: 55 },
  ];
  return ws;
}

function buildNormalisierungSheet(responses: Record<string, unknown>[]) {
  const header = ["Originalwert", "Normalisierter Analysewert", "Anzahl Vorkommen"];
  const counts = new Map<string, number>();

  for (const r of responses) {
    const name = r.vnb_name as string | null;
    if (name) counts.set(name, (counts.get(name) || 0) + 1);
  }

  const rows: (string | number)[][] = [header];
  const sorted = [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], "de"));
  for (const [orig, count] of sorted) {
    rows.push([orig, normalizeVnb(orig), count]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 45 }, { wch: 45 }, { wch: 18 }];
  return ws;
}

// ── Main handler ──

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
    // 1. Auth
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
      console.warn(`[Security] Non-admin ${userId} attempted export`);
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Parse mode
    const url = new URL(req.url);
    const isAnon = url.searchParams.get("mode") === "anon";

    // 3. Fetch ALL responses (submitted + draft), paginated
    const PAGE_SIZE = 1000;
    let allResponses: Record<string, unknown>[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: page, error: fetchError } = await supabaseAdmin
        .from("survey_responses")
        .select("*")
        .in("status", ["submitted", "draft"])
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

    if (allResponses.length === 0) {
      return new Response(JSON.stringify({ error: "No data to export" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Fetch draft count for Methodik
    const { count: draftCount } = await supabaseAdmin
      .from("survey_responses")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft");

    // 5. Determine column order from COLUMN_LABELS (survey flow order)
    const allDbKeys = new Set(Object.keys(allResponses[0]));
    const orderedColumns: string[] = [];
    for (const col of Object.keys(COLUMN_LABELS)) {
      if (allDbKeys.has(col)) orderedColumns.push(col);
    }
    // Add any remaining columns not in COLUMN_LABELS
    for (const col of allDbKeys) {
      if (!orderedColumns.includes(col)) orderedColumns.push(col);
    }

    // 6. Build workbook
    const wb = XLSX.utils.book_new();

    const wsDaten = buildDatenSheet(allResponses, orderedColumns, isAnon);
    XLSX.utils.book_append_sheet(wb, wsDaten, "Daten");

    const wsMethodik = buildMethodikSheet(allResponses, draftCount || 0, isAnon);
    XLSX.utils.book_append_sheet(wb, wsMethodik, "Methodik");

    const wsFreitexte = buildFreitexteSheet(allResponses, orderedColumns, isAnon);
    XLSX.utils.book_append_sheet(wb, wsFreitexte, "Freitexte");

    const wsCodebook = buildCodebookSheet();
    XLSX.utils.book_append_sheet(wb, wsCodebook, "Codebook");

    const wsNorm = buildNormalisierungSheet(allResponses);
    XLSX.utils.book_append_sheet(wb, wsNorm, "Normalisierung");

    // 7. Generate binary
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });

    // 8. Audit log
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_user_id: userId,
      action: "export",
      entity_type: "survey_responses",
      entity_id: "00000000-0000-0000-0000-000000000000",
      details: {
        format: "xlsx",
        mode: isAnon ? "anonymized" : "full",
        count: allResponses.length,
        timestamp: new Date().toISOString(),
      },
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const suffix = isAnon ? "-anon" : "";
    const filename = `umfrage-export${suffix}-${timestamp}.xlsx`;

    console.log(`[Audit] Admin ${userId} exported ${allResponses.length} responses (${isAnon ? "anon" : "full"})`);

    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
