/**
 * Build-time script: fetches the navigation structure from the Google Sheet
 * and writes it to public/data/nav.json so the fallback is always up-to-date.
 */
import { writeFileSync } from "fs";
import { resolve } from "path";

const STRUCTURE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/14n61IcOwk5fUZ-MYbO1D4XJOAN5sDdCZxo6XQIgMf8o/export?format=csv&gid=0";

interface StructureRow {
  kategorie_slug: string;
  kategorie_name: string;
  unterkategorie_slug: string;
  unterkategorie_name: string;
  kriterium_slug: string;
  kriterium_name: string;
  sheet_url: string;
}

interface NavKriterium {
  slug: string;
  title: string;
  hasData?: boolean;
}

interface NavUnterkategorie {
  slug: string;
  title: string;
  kriterien: NavKriterium[];
}

interface NavKategorie {
  slug: string;
  title: string;
  tabs: string[];
  unterkategorien: NavUnterkategorie[];
}

function parseCSV(text: string): StructureRow[] {
  const lines = text.trim().split(/\r?\n/);
  const rows: StructureRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());

    if (fields.length >= 7) {
      rows.push({
        kategorie_slug: fields[0],
        kategorie_name: fields[1],
        unterkategorie_slug: fields[2],
        unterkategorie_name: fields[3],
        kriterium_slug: fields[4],
        kriterium_name: fields[5],
        sheet_url: fields[6],
      });
    }
  }
  return rows;
}

function buildStructure(rows: StructureRow[]) {
  const katMap = new Map<string, NavKategorie>();

  for (const row of rows) {
    if (!row.kategorie_slug || row.kategorie_slug === "-") continue;

    if (!katMap.has(row.kategorie_slug)) {
      katMap.set(row.kategorie_slug, {
        slug: row.kategorie_slug,
        title: row.kategorie_name,
        tabs: ["Performance VNB", "Best Practices"],
        unterkategorien: [],
      });
    }

    const kat = katMap.get(row.kategorie_slug)!;

    const ukSlug = (row.unterkategorie_slug || "").trim();
    const ukName = (row.unterkategorie_name || "").trim();
    const effectiveSlug = ukSlug || ukName;

    if (!effectiveSlug || effectiveSlug === "-") continue;

    let uk = kat.unterkategorien.find((u) => u.slug === effectiveSlug);
    if (!uk) {
      uk = { slug: effectiveSlug, title: ukName || ukSlug, kriterien: [] };
      kat.unterkategorien.push(uk);
    }

    if (
      row.kriterium_slug &&
      row.kriterium_name &&
      row.kriterium_name !== "-"
    ) {
      if (!uk.kriterien.find((k) => k.slug === row.kriterium_slug)) {
        const hasData = !!(row.sheet_url && row.sheet_url.trim() !== "");
        uk.kriterien.push({
          slug: row.kriterium_slug,
          title: row.kriterium_name,
          ...(hasData ? { hasData: true } : {}),
        });
      }
    }
  }

  return { kategorien: Array.from(katMap.values()) };
}

async function main() {
  console.log("📡 Fetching navigation structure from Google Sheet...");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(STRUCTURE_SHEET_URL, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const csv = await res.text();
    const rows = parseCSV(csv);

    if (rows.length === 0) throw new Error("No rows parsed from sheet");

    const structure = buildStructure(rows);

    if (structure.kategorien.length === 0)
      throw new Error("No categories built");

    const outPath = resolve(process.cwd(), "public/data/nav.json");
    writeFileSync(outPath, JSON.stringify(structure, null, 2), "utf-8");

    const totalUK = structure.kategorien.reduce(
      (s, k) => s + k.unterkategorien.length,
      0
    );
    const totalK = structure.kategorien.reduce(
      (s, k) =>
        s + k.unterkategorien.reduce((s2, u) => s2 + u.kriterien.length, 0),
      0
    );

    console.log(
      `✅ nav.json updated: ${structure.kategorien.length} Kategorien, ${totalUK} Unterkategorien, ${totalK} Kriterien`
    );
  } catch (err) {
    clearTimeout(timeout);
    console.warn("⚠️ Could not update nav.json from Sheet:", (err as Error).message);
    console.warn("   Keeping existing nav.json as fallback.");
  }
}

main();
