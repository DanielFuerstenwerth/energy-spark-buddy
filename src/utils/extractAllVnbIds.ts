// Utility to extract all VNB IDs from GeoJSON
import * as topojson from 'topojson-client';

export async function extractAllVnbIdsFromGeoJSON(): Promise<string[]> {
  try {
    const response = await fetch('/data/vnb_regions.json');
    const topoData = await response.json();
    
    const geoJsonData = topojson.feature(
      topoData,
      topoData.objects.data
    ) as any;
    
    const ids: string[] = [];
    geoJsonData.features.forEach((feature: any) => {
      if (feature.id) {
        ids.push(feature.id);
      }
    });
    
    return ids.sort();
  } catch (error) {
    console.error('Error extracting VNB IDs:', error);
    return [];
  }
}

export async function generateCompleteVnbReference(): Promise<string> {
  const ids = await extractAllVnbIdsFromGeoJSON();
  
  let csv = 'GeoJSON_ID,VNB_Name,Notes\n';
  ids.forEach(id => {
    csv += `${id},,Please fill in VNB name\n`;
  });
  
  return csv;
}
