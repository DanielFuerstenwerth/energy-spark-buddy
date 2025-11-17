/**
 * VNB Name to ID Mapping
 * Maps VNB company names to their official VNB IDs (DE#### format)
 * This allows Google Sheets to use company names while the system uses IDs internally
 */

export const vnbNameToId: Record<string, string> = {
  // Major VNBs
  'enercity Netz GmbH': 'DE0017',
  'enercity': 'DE0017',
  'Enercity Netz GmbH': 'DE0017',
  'Enercity': 'DE0017',
  
  // Add more mappings as needed
  'Avacon Netz GmbH': 'DE0002',
  'Avacon': 'DE0002',
  'SachsenNetze GmbH': 'DE0003',
  'Mitteldeutsche Netzgesellschaft Strom mbH': 'DE0004',
  'Bayernwerk Netz GmbH': 'DE0005',
  'Netze BW GmbH': 'DE0006',
  'Westnetz GmbH': 'DE0007',
  'E.DIS Netz GmbH': 'DE0008',
  'Schleswig-Holstein Netz AG': 'DE0009',
  'SWK NETZE GmbH': 'DE0010',
  'Stromnetz Berlin GmbH': 'DE0011',
  'Stromnetz Hamburg GmbH': 'DE0012',
  'Stadtwerke München GmbH': 'DE0013',
  'N-ERGIE Netz GmbH': 'DE0014',
  'Rheinische NETZGesellschaft mbH': 'DE0015',
  'LEW Verteilnetz GmbH': 'DE0016',
  'EWE NETZ GmbH': 'DE0018',
  'Thüringer Energienetze GmbH & Co. KG': 'DE0019',
  'Energienetze Mitteldeutschland': 'DE0020',
  
  // Stadtwerke
  'Stadtwerke Stuttgart': 'DE0021',
  'Stadtwerke Frankfurt am Main': 'DE0022',
  'Stadtwerke Düsseldorf': 'DE0023',
  'Stadtwerke Köln': 'DE0024',
  'Stadtwerke Leipzig': 'DE0025',
  'Stadtwerke Dresden': 'DE0026',
  'Stadtwerke Hannover': 'DE0027',
  'Stadtwerke Nürnberg': 'DE0028',
  'Stadtwerke Bonn': 'DE0029',
  'Stadtwerke Bielefeld': 'DE0030',
  
  // Regional operators
  'ASCANETZ GmbH': 'DE0031',
  'Energieversorgung Halle Netz GmbH': 'DE0032',
  'Netz Leipzig GmbH': 'DE0033',
  'Stadtwerke Merseburg GmbH': 'DE0034',
  'Dessauer Stromversorgung GmbH': 'DE0035',
  
  // Add case-insensitive variations
  'ENERCITY NETZ GMBH': 'DE0017',
  'ENERCITY': 'DE0017',
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
