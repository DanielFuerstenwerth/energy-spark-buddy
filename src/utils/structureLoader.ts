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

export async function loadStructureFromSheet(): Promise<NavigationStructure> {
  console.log('[loadStructureFromSheet] Starting to load structure...');
  try {
    console.log('[loadStructureFromSheet] Fetching from:', STRUCTURE_SHEET_URL);
    const response = await fetch(STRUCTURE_SHEET_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('[loadStructureFromSheet] Received text length:', text.length);
    
    const rows = parseCSV(text);
    console.log('[loadStructureFromSheet] Parsed rows:', rows.length);
    
    const structure = buildNavigationStructure(rows);
    console.log('[loadStructureFromSheet] Built navigation structure with', structure.kategorien.length, 'categories');
    
    return structure;
  } catch (error) {
    console.error('[loadStructureFromSheet] Error loading structure from sheet:', error);
    // Fallback to local nav.json
    console.log('[loadStructureFromSheet] Falling back to local nav.json');
    const response = await fetch('/data/nav.json');
    if (!response.ok) {
      throw new Error('Failed to load fallback nav.json');
    }
    return await response.json();
  }
}

function parseCSV(text: string): StructureRow[] {
  const lines = text.trim().split(/\r?\n/);
  const rows: StructureRow[] = [];
  
  console.log(`[parseCSV] Parsing ${lines.length} lines from structure sheet`);
  
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
    
    if (fields.length >= 9) {
      rows.push({
        kategorie_slug: fields[0],
        kategorie_name: fields[1],
        unterkategorie_slug: fields[2],
        unterkategorie_name: fields[3],
        kriterium_slug: fields[4],
        kriterium_name: fields[5],
        sheet_url: fields[6],
        gewichtung_unterkategorie: fields[7],
        gewichtung_kategorie: fields[8]
      });
    } else {
      console.warn(`[parseCSV] Line ${i} has only ${fields.length} fields, expected 9`);
    }
  }
  
  console.log(`[parseCSV] Successfully parsed ${rows.length} rows`);
  return rows;
}

function buildNavigationStructure(rows: StructureRow[]): NavigationStructure {
  console.log('[buildNavigationStructure] Building structure from', rows.length, 'rows');
  const kategorienMap = new Map<string, NavigationKategorie>();
  
  rows.forEach((row, index) => {
    if (!row.kategorie_slug) return;
    
    // Get or create category
    if (!kategorienMap.has(row.kategorie_slug)) {
      console.log('[buildNavigationStructure] Creating category:', row.kategorie_slug, '-', row.kategorie_name);
      kategorienMap.set(row.kategorie_slug, {
        slug: row.kategorie_slug,
        title: row.kategorie_name,
        tabs: [],
        unterkategorien: [],
        kriterien: []
      });
    }
    
    const kategorie = kategorienMap.get(row.kategorie_slug)!;
    
    // Determine unterkategorie slug and name
    // Trim whitespace and check if we have valid data
    const ukSlugRaw = (row.unterkategorie_slug || '').trim();
    const ukNameRaw = (row.unterkategorie_name || '').trim();
    
    // Use name as slug if slug is empty, but prioritize slug if both exist
    let ukSlug = ukSlugRaw || ukNameRaw;
    let ukName = ukNameRaw || ukSlugRaw;
    
    // If no valid unterkategorie, check if this is a direct kriterium under category
    if (!ukSlug || ukSlug === '-') {
      // Try to add as direct kriterium to category
      if (row.kriterium_slug && row.kriterium_name && row.kriterium_name !== '-') {
        const existingKrit = kategorie.kriterien!.find(k => k.slug === row.kriterium_slug);
        if (!existingKrit) {
          console.log('[buildNavigationStructure] Adding direct kriterium to category:', row.kriterium_slug, '-', row.kriterium_name);
          kategorie.kriterien!.push({
            slug: row.kriterium_slug,
            title: row.kriterium_name
          });
        }
      }
      return;
    }
    
    // Find or create unterkategorie
    let unterkategorie = kategorie.unterkategorien.find(
      uk => uk.slug === ukSlug
    );
    
    if (!unterkategorie) {
      console.log('[buildNavigationStructure] Creating unterkategorie:', ukSlug, '-', ukName, 'under', row.kategorie_slug);
      unterkategorie = {
        slug: ukSlug,
        title: ukName,
        kriterien: []
      };
      kategorie.unterkategorien.push(unterkategorie);
    }
    
    // Add kriterium if exists
    if (row.kriterium_slug && row.kriterium_name && row.kriterium_name !== '-') {
      const existingKrit = unterkategorie.kriterien.find(
        k => k.slug === row.kriterium_slug
      );
      
      if (!existingKrit) {
        unterkategorie.kriterien.push({
          slug: row.kriterium_slug,
          title: row.kriterium_name
        });
      }
    }
  });
  
  const result = {
    kategorien: Array.from(kategorienMap.values())
  };
  
  console.log('[buildNavigationStructure] Final structure:', JSON.stringify(result, null, 2));
  
  return result;
}

// Build maps.json structure from sheet data
// This function handles MULTIPLE TABS within a single Google Sheets file
// by extracting the gid (tab identifier) from edit URLs and converting to export URLs
export async function buildMapsConfig(): Promise<Record<string, any>> {
  try {
    const response = await fetch(STRUCTURE_SHEET_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch structure sheet: ${response.status}`);
    }
    
    const text = await response.text();
    const rows = parseCSV(text);
    
    console.log(`[buildMapsConfig] Parsed ${rows.length} rows from structure sheet`);
    
    const mapsConfig: Record<string, any> = {};
    
    rows.forEach((row, index) => {
      // Skip rows without required fields
      if (!row.kategorie_slug || !row.unterkategorie_slug) {
        return;
      }
      
      const subKey = `${row.kategorie_slug}/${row.unterkategorie_slug}`;
      
      // Add unterkategorie-level map config
      // This is for pages like /EHH/zvNE
      if (row.sheet_url && row.sheet_url.trim() !== '' && !mapsConfig[subKey]) {
        // Extract spreadsheet ID and tab gid from edit URL
        // Format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit?gid={GID}#gid={GID}
        const sheetId = row.sheet_url.match(/\/d\/([^\/]+)/)?.[1];
        const gidMatch = row.sheet_url.match(/[?&#]gid=(\d+)/);
        const gid = gidMatch?.[1];
        
        if (sheetId && gid) {
          const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
          mapsConfig[subKey] = {
            sheet: exportUrl
          };
          console.log(`[buildMapsConfig] Added unterkategorie config: ${subKey} -> gid=${gid}`);
        } else {
          console.warn(`[buildMapsConfig] Could not extract sheetId or gid from URL in row ${index}:`, row.sheet_url);
        }
      }
      
      // Add criterion-level map config
      // This is for pages like /EHH/zvNE/Modul1&2
      if (row.kriterium_slug && row.kriterium_slug !== '-' && row.sheet_url && row.sheet_url.trim() !== '') {
        const critKey = `${row.kategorie_slug}/${row.unterkategorie_slug}/${row.kriterium_slug}`;
        
        const sheetId = row.sheet_url.match(/\/d\/([^\/]+)/)?.[1];
        const gidMatch = row.sheet_url.match(/[?&#]gid=(\d+)/);
        const gid = gidMatch?.[1];
        
        if (sheetId && gid) {
          const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
          mapsConfig[critKey] = {
            sheet: exportUrl,
            criterion_column: row.kriterium_slug
          };
          console.log(`[buildMapsConfig] Added criterion config: ${critKey} -> gid=${gid}`);
        }
      }
    });
    
    console.log(`[buildMapsConfig] Built config with ${Object.keys(mapsConfig).length} routes`);
    return mapsConfig;
  } catch (error) {
    console.error('Error building maps config:', error);
    return {};
  }
}
