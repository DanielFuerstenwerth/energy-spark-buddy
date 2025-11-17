/**
 * VNB Name to GeoJSON ID Mapping
 * Complete mapping from VNB company names to their GeoJSON polygon IDs
 * Source: scores_ggv.csv fallback data
 */

export const vnbNameToId: Record<string, string> = {
  // Major network operators - Enercity
  'enercity Netz GmbH': '7506edfa',
  'enercity': '7506edfa',
  'Enercity Netz GmbH': '7506edfa',
  'Enercity': '7506edfa',
  'ENERCITY NETZ GMBH': '7506edfa',
  'ENERCITY': '7506edfa',
  
  // Complete mapping from fallback CSV
  'SachsenNetze GmbH': '0b2d22e0',
  'SachsenNetze HS.HD GmbH': 'ad13be72',
  'Stadtwerke Riesa GmbH': '0e7bd422',
  'Stadtwerke Elbtal GmbH': '044f9b91',
  'Meißener Stadtwerke GmbH': '7a340e36',
  'Freitaler Stadtwerke GmbH': '96ffa483',
  'Stadtwerke Pirna Energie GmbH': '7ccf51f8',
  'Energie und Wasserversorgung Aktiengesellschaft Kamenz': 'b283205d',
  'Stadtwerke Senftenberg GmbH': 'efb48028',
  'BASF Schwarzheide GmbH': '66a1c4ac',
  'Energie- und Wasserwerke Bautzen GmbH': 'c9850879',
  'Stadtwerke Löbau GmbH': '50a2b3f4',
  'Stadtwerke Zittau GmbH': '20cdc2f5',
  'Stadtwerke Görlitz AG': 'fdb1c4d2',
  'Stadtwerke Niesky GmbH': '47d6e656',
  'Stadtwerke Weißwasser GmbH': 'cacbad99',
  'Versorgungsbetriebe Hoyerswerda GmbH': 'daef09ce',
  'Elektroenergieversorgung Cottbus GmbH': '382e84b7',
  'Städtische Werke Spremberg (Lausitz) GmbH': 'fb0bad75',
  'Netzgesellschaft Forst (Lausitz) mbH & Co. KG': '4cf5cdc4',
  'Energieversorgung Guben GmbH': '5e31e0b2',
  'Stadt- und Überlandwerke GmbH Luckau-Lübbenau': '57c4fb46',
  'Stadtwerke Finsterwalde GmbH': '350a73fc',
  'Netz Leipzig GmbH': 'afd10af4',
  'Stadtwerke Schkeuditz GmbH': 'b8442920',
  'Stadtwerke Delitzsch GmbH': 'b34f5e3c',
  'Städtische Werke Borna Netz GmbH': '8b5ef500',
  'Energie- und Wasserversorgung Altenburg GmbH': 'f03c14d9',
  'Stadtwerke Döbeln GmbH': 'c3b66878',
  'Stadtwerke Eilenburg GmbH': '738ac62b',
  'Stadtwerke Torgau GmbH': '90f0f015',
  'Energieversorgung Halle Netz GmbH': '93d3d285',
  'Mitteldeutsche Netzgesellschaft Strom mbH': '8bfbc6cc',
  'Verteilnetz Plauen GmbH': '4fa53768',
  'Stadtwerke Merseburg GmbH': '388424b1',
  'Industrienetzgesellschaft Schkopau mbH': 'c8114833',
  'Stadtwerke Lutherstadt Eisleben GmbH': '8eb2621e',
  'Stadtwerke Hettstedt GmbH': '1fdbb6f7',
  'Stadtwerke Bernburg GmbH': 'ffd0edb5',
  'ASCANETZ GmbH': 'bd80d44d',
  'Stadtwerke Quedlinburg GmbH': '1d7d19bc',
  'Stadtwerke Sangerhausen GmbH': 'ad848761',
  'Technische Werke Naumburg GmbH': '06635360',
  'Stadtwerke Weißenfels Energienetze GmbH': 'e1535a32',
  'REDINET Burgenland GmbH': '0531bccf',
  'EVIP GmbH': '60c649c5',
  'Netzgesellschaft Bitterfeld-Wolfen mbH': 'd9756cc9',
  'Dessauer Stromversorgung GmbH': '1b8a4503',
  'Stadtwerke Lutherstadt Wittenberg GmbH': '62414e99',
  'Saalfelder Energienetze GmbH': '27b73a6a',
  'Elektrizitätswerk Max Peissker': 'c8be5a25',
  'EnR Energienetze Rudolstadt GmbH': 'c16a3a51',
  'GeraNetz GmbH': '33d909cd',
  'Netzgesellschaft Eisenberg mbH': '19d502fb',
  'TRIDELTA Energieversorgungs GmbH': '3939a41c',
  'Stadtwerke Stadtroda GmbH': '8ceac1ae',
  'Stadtwerke Jena Netze GmbH': 'a39794c0',
  'Stadtwerke Neustadt an der Orla GmbH': '06beb693',
  'Energiewerke Zeulenroda GmbH': '60fa0c69',
  'Greizer Energienetze GmbH': '218f4912',
  'Zwickauer Energieversorgung GmbH': 'c2e88979',
  'Elektrizitätswerk des Kantons Schaffhausen AG': 'afc33ca2',
  'Stadtwerke Aue - Bad Schlema GmbH': 'e90525d2',
  'Stadtwerke Schneeberg GmbH': 'f7157822',
  'Stadtwerke Schwarzenberg GmbH': 'a9f9739b',
  'Stadtwerke Glauchau Dienstleistungsgesellschaft mbH': '03f94845',
  'Stadtwerke Meerane GmbH': '6ef609af',
  'Stadtwerke Werdau GmbH': 'ffbdc6a7',
  'Stadtwerke Reichenbach/Vogtl. GmbH': '09574852',
  'Stadtwerke OELSNITZ/V. GmbH': 'bfc951ee',
  'inetz GmbH': '0fb413d7',
  'Stadtwerke Annaberg-Buchholz Energie AG': '3fdf6c5c',
  'Freiberger Stromversorgung GmbH': '8694cada',
  'Stadtwerke Olbernhau GmbH': 'fcde1fab',
  'ENGIE Deutschland GmbH': '3f9e15d8',
  'decarbon1ze GmbH': 'cb45bbfd',
  'Stromnetz Berlin GmbH': '82c8ab84',
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
