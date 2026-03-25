/**
 * VNB ID to Name mapping loaded from JSON
 */
let idToVnbNameMap: Record<string, string> = {};
let vnbNameToIdMap: Record<string, string> = {};

/**
 * Load VNB mappings from JSON file
 */
async function loadVnbMappings() {
  try {
    const response = await fetch('/data/vnb_names.json');
    const data = await response.json();
    
    // Build ID to Name map
    idToVnbNameMap = Object.fromEntries(
      Object.entries(data).map(([id, obj]: [string, any]) => [id, obj.name])
    );
    
    // Build Name to ID map (reverse), including aliases
    vnbNameToIdMap = {};
    for (const [id, obj] of Object.entries(data) as [string, any][]) {
      vnbNameToIdMap[obj.name] = id;
      if (Array.isArray(obj.aliases)) {
        for (const alias of obj.aliases) {
          vnbNameToIdMap[alias] = id;
        }
      }
    }
    
    console.log(`Loaded ${Object.keys(idToVnbNameMap).length} VNB mappings (${Object.keys(vnbNameToIdMap).length} incl. aliases)`);
  } catch (error) {
    console.error('Failed to load VNB mappings:', error);
  }
}

// Load mappings on module initialization
loadVnbMappings();

/**
 * Get VNB name from ID
 */
export function getVnbNameFromId(id: string): string | undefined {
  return idToVnbNameMap[id];
}

/**
 * Get all ID to Name mappings
 */
export function getAllIdToNameMappings(): Record<string, string> {
  return { ...idToVnbNameMap };
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
  // Direct lookup
  if (vnbNameToIdMap[name]) {
    return vnbNameToIdMap[name];
  }
  
  // Try normalized lookup
  const normalized = normalizeVnbName(name);
  for (const [key, id] of Object.entries(vnbNameToIdMap)) {
    if (normalizeVnbName(key) === normalized) {
      return id;
    }
  }
  
  // Return original name as fallback
  return name;
}
