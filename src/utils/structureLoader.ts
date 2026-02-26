interface StructureRow {
  kategorie_slug: string;
  kategorie_name: string;
  unterkategorie_slug: string;
  unterkategorie_name: string;
  kriterium_slug: string;
  kriterium_name: string;
  sheet_url: string;
  gewichtung_unterkategorie: string;
  gewichtung_kategorie: string;
}

interface NavigationKriterium {
  slug: string;
  title: string;
  hasData?: boolean;
}

interface NavigationUnterkategorie {
  slug: string;
  title: string;
  kriterien: NavigationKriterium[];
}

interface NavigationKategorie {
  slug: string;
  title: string;
  tabs: string[];
  unterkategorien: NavigationUnterkategorie[];
  kriterien?: NavigationKriterium[];
}

export interface NavigationStructure {
  kategorien: NavigationKategorie[];
}

const STRUCTURE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/14n61IcOwk5fUZ-MYbO1D4XJOAN5sDdCZxo6XQIgMf8o/export?format=csv&gid=0';

/** Unified timeout for all sheet fetches (ms) */
const SHEET_FETCH_TIMEOUT = 5000;

export async function loadStructureFromSheet(): Promise<NavigationStructure> {
  console.log('[loadStructureFromSheet] Starting to load structure...');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SHEET_FETCH_TIMEOUT);
    
    const response = await fetch(STRUCTURE_SHEET_URL, { 
      signal: controller.signal 
    }).finally(() => clearTimeout(timeoutId));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    
    if (!text || text.trim().length < 10 || !text.includes('\n')) {
      throw new Error('Invalid or empty response from structure sheet');
    }
    
    const rows = parseCSV(text);
    
    if (rows.length === 0) {
      throw new Error('No rows parsed from structure sheet');
    }
    
    const structure = buildNavigationStructure(rows);
    
    if (!structure.kategorien || structure.kategorien.length === 0) {
      throw new Error('No categories found in structure');
    }
    
    return structure;
  } catch (error) {
    console.warn('[loadStructureFromSheet] Sheet fetch failed, falling back to nav.json:', error);
    return loadNavJsonFallback();
  }
}

/** Single fallback loader — used by both loadStructureFromSheet and useNavigation */
export async function loadNavJsonFallback(): Promise<NavigationStructure> {
  try {
    const response = await fetch('/data/nav.json');
    if (!response.ok) {
      throw new Error(`Failed to load fallback nav.json: ${response.status}`);
    }
    const data = await response.json();
    console.log('[loadNavJsonFallback] Successfully loaded nav.json');
    return data;
  } catch (fallbackError) {
    console.error('[loadNavJsonFallback] Fallback also failed:', fallbackError);
    return { kategorien: [] };
  }
}

function parseCSV(text: string): StructureRow[] {
  const lines = text.trim().split(/\r?\n/);
  const rows: StructureRow[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const fields: string[] = [];
    let currentField = '';
    let insideQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim());
    
    // Minimum 6 fields required (aligned with build script)
    if (fields.length >= 6) {
      rows.push({
        kategorie_slug: fields[0],
        kategorie_name: fields[1],
        unterkategorie_slug: fields[2],
        unterkategorie_name: fields[3],
        kriterium_slug: fields[4] || '',
        kriterium_name: fields[5] || '',
        sheet_url: fields[6] || '',
        gewichtung_unterkategorie: fields[7] || '',
        gewichtung_kategorie: fields[8] || ''
      });
    } else {
      console.warn(`[parseCSV] Line ${i} has only ${fields.length} fields, expected at least 6`);
    }
  }
  
  return rows;
}

function buildNavigationStructure(rows: StructureRow[]): NavigationStructure {
  const kategorienMap = new Map<string, NavigationKategorie>();
  
  rows.forEach((row) => {
    if (!row.kategorie_slug) return;
    
    if (!kategorienMap.has(row.kategorie_slug)) {
      kategorienMap.set(row.kategorie_slug, {
        slug: row.kategorie_slug,
        title: row.kategorie_name,
        tabs: [],
        unterkategorien: [],
        kriterien: []
      });
    }
    
    const kategorie = kategorienMap.get(row.kategorie_slug)!;
    
    const ukSlugRaw = (row.unterkategorie_slug || '').trim();
    const ukNameRaw = (row.unterkategorie_name || '').trim();
    
    let ukSlug = ukSlugRaw || ukNameRaw;
    let ukName = ukNameRaw || ukSlugRaw;
    
    if (!ukSlug || ukSlug === '-') {
      if (row.kriterium_slug && row.kriterium_name && row.kriterium_name !== '-') {
        const existingKrit = kategorie.kriterien!.find(k => k.slug === row.kriterium_slug);
        if (!existingKrit) {
          kategorie.kriterien!.push({
            slug: row.kriterium_slug,
            title: row.kriterium_name
          });
        }
      }
      return;
    }
    
    let unterkategorie = kategorie.unterkategorien.find(
      uk => uk.slug === ukSlug
    );
    
    if (!unterkategorie) {
      unterkategorie = {
        slug: ukSlug,
        title: ukName,
        kriterien: []
      };
      kategorie.unterkategorien.push(unterkategorie);
    }
    
    if (row.kriterium_slug && row.kriterium_name && row.kriterium_name !== '-') {
      const existingKrit = unterkategorie.kriterien.find(
        k => k.slug === row.kriterium_slug
      );
      
      const hasData = !!(row.sheet_url && row.sheet_url.trim() !== '');
      
      if (!existingKrit) {
        unterkategorie.kriterien.push({
          slug: row.kriterium_slug,
          title: row.kriterium_name,
          hasData
        });
      }
    }
  });
  
  return {
    kategorien: Array.from(kategorienMap.values())
  };
}

// ── MapsConfig with module-level cache ──────────────────────────────────

let _mapsConfigCache: Record<string, any> | null = null;
let _mapsConfigPromise: Promise<Record<string, any>> | null = null;

/**
 * Build maps.json structure from sheet data.
 * Results are cached in memory — only fetched once per page session.
 */
export async function buildMapsConfig(): Promise<Record<string, any>> {
  if (_mapsConfigCache) return _mapsConfigCache;
  if (_mapsConfigPromise) return _mapsConfigPromise;

  _mapsConfigPromise = _buildMapsConfigInternal().then(result => {
    // If we got an empty config on first try (timeout), retry once
    if (Object.keys(result).length === 0 && !_mapsConfigCache) {
      console.warn('[buildMapsConfig] Empty config on first attempt, retrying...');
      return _buildMapsConfigInternal();
    }
    return result;
  });
  try {
    _mapsConfigCache = await _mapsConfigPromise;
    return _mapsConfigCache;
  } finally {
    _mapsConfigPromise = null;
  }
}

/** Invalidate the MapsConfig cache (e.g. after admin cache-reset). */
export function invalidateMapsConfigCache() {
  _mapsConfigCache = null;
  _mapsConfigPromise = null;
}

async function _buildMapsConfigInternal(): Promise<Record<string, any>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SHEET_FETCH_TIMEOUT);

    const response = await fetch(STRUCTURE_SHEET_URL, {
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      throw new Error(`Failed to fetch structure sheet: ${response.status}`);
    }
    
    const text = await response.text();
    const rows = parseCSV(text);
    
    console.log(`[buildMapsConfig] Parsed ${rows.length} rows from structure sheet`);
    
    const mapsConfig: Record<string, any> = {};
    
    rows.forEach((row) => {
      if (!row.kategorie_slug || !row.unterkategorie_slug) return;
      
      const subKey = `${row.kategorie_slug}/${row.unterkategorie_slug}`;
      const subKeyLower = subKey.toLowerCase();
      
      if (row.sheet_url && row.sheet_url.trim() !== '' && !mapsConfig[subKey]) {
        const sheetId = row.sheet_url.match(/\/d\/([^\/]+)/)?.[1];
        const gidMatch = row.sheet_url.match(/[?&#]gid=(\d+)/);
        const gid = gidMatch?.[1];
        
        if (sheetId && gid) {
          const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
          const config = { sheet: exportUrl };
          mapsConfig[subKey] = config;
          mapsConfig[subKeyLower] = config;
        }
      }
      
      if (row.kriterium_slug && row.kriterium_slug !== '-' && row.sheet_url && row.sheet_url.trim() !== '') {
        const critKey = `${row.kategorie_slug}/${row.unterkategorie_slug}/${row.kriterium_slug}`;
        const critKeyLower = critKey.toLowerCase();
        
        const sheetId = row.sheet_url.match(/\/d\/([^\/]+)/)?.[1];
        const gidMatch = row.sheet_url.match(/[?&#]gid=(\d+)/);
        const gid = gidMatch?.[1];
        
        if (sheetId && gid) {
          const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
          const config = {
            sheet: exportUrl,
            criterion_column: row.kriterium_slug
          };
          mapsConfig[critKey] = config;
          mapsConfig[critKeyLower] = config;
        }
      }
    });
    
    console.log(`[buildMapsConfig] Built config with ${Object.keys(mapsConfig).length} routes`);
    return mapsConfig;
  } catch (error) {
    console.error('[buildMapsConfig] Error:', error);
    return {};
  }
}
