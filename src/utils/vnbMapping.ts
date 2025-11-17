/**
 * VNB Name to GeoJSON ID Mapping
 * Maps VNB company names to their GeoJSON polygon IDs
 * This allows Google Sheets to use company names while the system uses GeoJSON IDs internally
 */

export const vnbNameToId: Record<string, string> = {
  // Enercity - based on session replay showing 7506edfa
  'enercity Netz GmbH': '7506edfa',
  'enercity': '7506edfa',
  'Enercity Netz GmbH': '7506edfa',
  'Enercity': '7506edfa',
  'ENERCITY NETZ GMBH': '7506edfa',
  'ENERCITY': '7506edfa',
  
  // From fallback CSV - known GeoJSON IDs
  'SachsenNetze GmbH': '0b2d22e0',
  'Mitteldeutsche Netzgesellschaft Strom mbH': '8bfbc6cc',
  'Stromnetz Berlin GmbH': '82c8ab84',
  'Energieversorgung Halle Netz GmbH': '93d3d285',
  'ASCANETZ GmbH': 'bd80d44d',
  'Netz Leipzig GmbH': 'afd10af4',
  'Stadtwerke Merseburg GmbH': '388424b1',
  'Dessauer Stromversorgung GmbH': '1b8a4503',
  
  // Add more mappings as VNBs are identified
};

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
  if (vnbNameToId[name]) {
    return vnbNameToId[name];
  }
  
  // Try normalized lookup
  const normalized = normalizeVnbName(name);
  for (const [key, id] of Object.entries(vnbNameToId)) {
    if (normalizeVnbName(key) === normalized) {
      return id;
    }
  }
  
  // Return original name as fallback
  return name;
}
