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
}

export interface NavigationStructure {
  kategorien: NavigationKategorie[];
}

const STRUCTURE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/14n61IcOwk5fUZ-MYbO1D4XJOAN5sDdCZxo6XQIgMf8o/export?format=csv&gid=0';

export async function loadStructureFromSheet(): Promise<NavigationStructure> {
  try {
    const response = await fetch(STRUCTURE_SHEET_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    const rows = parseCSV(text);
    
    return buildNavigationStructure(rows);
  } catch (error) {
    console.error('Error loading structure from sheet:', error);
    // Fallback to local nav.json
    const response = await fetch('/data/nav.json');
    return await response.json();
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
    }
  }
  
  return rows;
}

function buildNavigationStructure(rows: StructureRow[]): NavigationStructure {
  const kategorienMap = new Map<string, NavigationKategorie>();
  
  rows.forEach(row => {
    if (!row.kategorie_slug) return;
    
    // Get or create category
    if (!kategorienMap.has(row.kategorie_slug)) {
      kategorienMap.set(row.kategorie_slug, {
        slug: row.kategorie_slug,
        title: row.kategorie_name,
        tabs: [],
        unterkategorien: []
      });
    }
    
    const kategorie = kategorienMap.get(row.kategorie_slug)!;
    
    // Determine unterkategorie slug - use name as slug if slug is empty
    let ukSlug = row.unterkategorie_slug || row.unterkategorie_name;
    let ukName = row.unterkategorie_name || row.unterkategorie_slug;
    
    // Skip if no valid unterkategorie info
    if (!ukSlug || ukSlug === '-') return;
    
    // Find or create unterkategorie
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
  
  return {
    kategorien: Array.from(kategorienMap.values())
  };
}

// Build maps.json structure from sheet data
export async function buildMapsConfig(): Promise<Record<string, any>> {
  try {
    const response = await fetch(STRUCTURE_SHEET_URL);
    const text = await response.text();
    const rows = parseCSV(text);
    
    const mapsConfig: Record<string, any> = {};
    
    rows.forEach(row => {
      if (!row.kategorie_slug || !row.unterkategorie_slug) return;
      
      const subKey = `${row.kategorie_slug}/${row.unterkategorie_slug}`;
      
      // Add unterkategorie-level map config
      if (row.sheet_url && !mapsConfig[subKey]) {
        // Convert edit URL to export URL
        const sheetId = row.sheet_url.match(/\/d\/([^\/]+)/)?.[1];
        const gid = row.sheet_url.match(/gid=(\d+)/)?.[1];
        
        if (sheetId && gid) {
          mapsConfig[subKey] = {
            sheet: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
          };
        }
      }
      
      // Add criterion-level map config
      if (row.kriterium_slug && row.sheet_url) {
        const critKey = `${row.kategorie_slug}/${row.unterkategorie_slug}/${row.kriterium_slug}`;
        const sheetId = row.sheet_url.match(/\/d\/([^\/]+)/)?.[1];
        const gid = row.sheet_url.match(/gid=(\d+)/)?.[1];
        
        if (sheetId && gid) {
          mapsConfig[critKey] = {
            sheet: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
            criterion_column: row.kriterium_slug
          };
        }
      }
    });
    
    return mapsConfig;
  } catch (error) {
    console.error('Error building maps config:', error);
    return {};
  }
}
