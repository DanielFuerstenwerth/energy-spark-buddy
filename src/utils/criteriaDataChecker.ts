import { buildMapsConfig } from './structureLoader';

interface CriteriaDataStatus {
  [criterionSlug: string]: boolean;
}

interface SubcategoryDataStatus {
  [subcategoryRoute: string]: CriteriaDataStatus;
}

// Cache for loaded data
let dataStatusCache: SubcategoryDataStatus = {};
let cachePromise: Promise<void> | null = null;

function normalizeHeader(h: string): string {
  return (h || '').toLowerCase().replace(/\s+/g, '')
    .replace(/[._-]+/g, '')
    .replace(/&/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((p) => p.trim());
}

async function loadSubcategoryDataStatus(route: string, sheetUrl: string): Promise<CriteriaDataStatus> {
  console.log(`[criteriaDataChecker] Loading data status for ${route}`);
  
  try {
    const response = await fetch(sheetUrl);
    if (!response.ok) {
      console.warn(`[criteriaDataChecker] Failed to fetch sheet for ${route}`);
      return {};
    }
    
    const text = await response.text();
    const lines = text.trim().split(/\r?\n/);
    
    if (lines.length < 2) {
      return {};
    }
    
    // Parse header row (first row contains criterion names)
    const header = parseCSVLine(lines[0]);
    const normHeaders = header.map(normalizeHeader);
    
    console.log(`[criteriaDataChecker] Headers for ${route}:`, header);
    
    // Track which columns have non-null data
    const columnHasData: boolean[] = new Array(header.length).fill(false);
    
    // Check each data row
    for (let i = 1; i < lines.length; i++) {
      const parts = parseCSVLine(lines[i]);
      
      for (let j = 0; j < parts.length; j++) {
        const value = parts[j].trim();
        // Check if value is not empty and not just a dash or zero
        if (value && value !== '-' && value !== '0' && value !== 'null' && value !== 'undefined') {
          // Try to parse as number
          const parsed = parseFloat(value.replace(',', '.').replace('+', ''));
          if (!isNaN(parsed) && parsed !== 0) {
            columnHasData[j] = true;
          }
        }
      }
    }
    
    // Build result mapping header names to data availability
    const result: CriteriaDataStatus = {};
    for (let i = 0; i < header.length; i++) {
      const headerName = header[i];
      const normHeader = normHeaders[i];
      
      // Skip common non-criterion columns
      if (['vnbid', 'vnbname', 'updatedat', 'aggregatedscore', 'score'].includes(normHeader)) {
        continue;
      }
      
      result[headerName] = columnHasData[i];
      result[normHeader] = columnHasData[i]; // Also store normalized version
    }
    
    console.log(`[criteriaDataChecker] Data status for ${route}:`, result);
    return result;
  } catch (error) {
    console.error(`[criteriaDataChecker] Error loading ${route}:`, error);
    return {};
  }
}

export async function loadAllCriteriaDataStatus(): Promise<SubcategoryDataStatus> {
  // Return cached data if available
  if (Object.keys(dataStatusCache).length > 0) {
    return dataStatusCache;
  }
  
  // If already loading, wait for it
  if (cachePromise) {
    await cachePromise;
    return dataStatusCache;
  }
  
  // Start loading
  cachePromise = (async () => {
    const mapsConfig = await buildMapsConfig();
    const status: SubcategoryDataStatus = {};
    
    // Find unique subcategory routes (routes with exactly one slash, e.g., "TaE/GGV")
    const subcategoryRoutes = Object.keys(mapsConfig).filter(route => {
      const parts = route.split('/');
      return parts.length === 2 && mapsConfig[route]?.sheet;
    });
    
    console.log(`[criteriaDataChecker] Loading data for ${subcategoryRoutes.length} subcategories`);
    
    // Load data for each subcategory in parallel
    await Promise.all(subcategoryRoutes.map(async (route) => {
      const config = mapsConfig[route];
      if (config?.sheet) {
        status[route] = await loadSubcategoryDataStatus(route, config.sheet);
        // Also store lowercase version
        status[route.toLowerCase()] = status[route];
      }
    }));
    
    dataStatusCache = status;
  })();
  
  await cachePromise;
  return dataStatusCache;
}

export function checkCriterionHasData(
  dataStatus: SubcategoryDataStatus,
  category: string,
  subcatSlug: string,
  criterionSlug: string
): boolean {
  const route = `${category}/${subcatSlug}`;
  const routeLower = route.toLowerCase();
  
  const subcatStatus = dataStatus[route] || dataStatus[routeLower];
  
  if (!subcatStatus) {
    return false;
  }
  
  // Check both original and normalized criterion slug
  const normCriterion = normalizeHeader(criterionSlug);
  
  return subcatStatus[criterionSlug] === true || subcatStatus[normCriterion] === true;
}

// Clear cache (e.g., for manual refresh)
export function clearCriteriaDataCache(): void {
  dataStatusCache = {};
  cachePromise = null;
}
