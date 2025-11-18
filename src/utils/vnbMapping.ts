/**
 * VNB Name to GeoJSON ID Mapping
 * Loads mapping from authoritative vnb_names.json file
 */

// Cache for the loaded mapping
let vnbNameToIdCache: Record<string, string> | null = null;
let idToVnbNameCache: Record<string, string> | null = null;

/**
 * Loads VNB mapping from the authoritative vnb_names.json file
 */
async function loadVnbMapping(): Promise<void> {
  if (vnbNameToIdCache) return; // Already loaded

  try {
    const response = await fetch('/data/vnb_names.json');
    if (!response.ok) {
      throw new Error(`Failed to load VNB names: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Build name-to-id mapping
    vnbNameToIdCache = {};
    idToVnbNameCache = {};
    
    for (const [id, info] of Object.entries(data)) {
      const name = (info as { name: string }).name;
      vnbNameToIdCache[name] = id;
      idToVnbNameCache[id] = name;
      
      // Also add normalized versions for fuzzy matching
      const normalized = normalizeVnbName(name);
      vnbNameToIdCache[normalized] = id;
    }
    
    console.log(`[vnbMapping] Loaded ${Object.keys(idToVnbNameCache).length} VNB mappings`);
  } catch (error) {
    console.error('[vnbMapping] Error loading VNB names:', error);
    vnbNameToIdCache = {};
    idToVnbNameCache = {};
  }
}

/**
 * Synchronous getter for name-to-id mapping (must be loaded first)
 */
export function getVnbNameToIdMap(): Record<string, string> {
  if (!vnbNameToIdCache) {
    console.warn('[vnbMapping] Mapping not loaded yet, returning empty map');
    return {};
  }
  return vnbNameToIdCache;
}

/**
 * Synchronous getter for id-to-name mapping (must be loaded first)
 */
export function getIdToVnbNameMap(): Record<string, string> {
  if (!idToVnbNameCache) {
    console.warn('[vnbMapping] Mapping not loaded yet, returning empty map');
    return {};
  }
  return idToVnbNameCache;
}

/**
 * Ensures the mapping is loaded (call this early in app initialization)
 */
export async function ensureVnbMappingLoaded(): Promise<void> {
  await loadVnbMapping();
}

/**
 * Normalizes a VNB name for matching
 * Removes common suffixes, extra spaces, and converts to lowercase
 */
export function normalizeVnbName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+gmbh$/i, '')
    .replace(/\s+ag$/i, '')
    .replace(/\s+kg$/i, '')
    .replace(/\s+co\.?\s*kg$/i, '')
    .replace(/\s+mbh$/i, '')
    .replace(/\s+&\s+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Looks up a VNB ID from a company name
 * Returns the name itself if no mapping is found (fallback)
 */
export function getVnbIdFromName(name: string): string {
  const mapping = getVnbNameToIdMap();
  
  // Direct lookup
  if (mapping[name]) {
    return mapping[name];
  }
  
  // Try normalized lookup
  const normalized = normalizeVnbName(name);
  if (mapping[normalized]) {
    return mapping[normalized];
  }
  
  // Try case-insensitive search
  const lowerName = name.toLowerCase();
  for (const [key, id] of Object.entries(mapping)) {
    if (key.toLowerCase() === lowerName) {
      return id;
    }
  }
  
  // Return original name as fallback
  return name;
}

/**
 * Looks up a VNB name from an 8-digit ID
 * Returns the ID itself if no mapping is found (fallback)
 */
export function getVnbNameFromId(id: string): string {
  const mapping = getIdToVnbNameMap();
  return mapping[id] || id;
}

// Auto-load mapping on module import
ensureVnbMappingLoaded();
