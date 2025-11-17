import * as topojson from 'topojson-client';

export interface ScoreData {
  vnb_id: string;
  vnb_name: string;
  score: number | null;
  updated_at: string;
}

export interface GeoJSONFeature {
  type: string;
  properties: {
    vnb_id: string;
    vnb_name?: string;
  };
  geometry: any;
}

export interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

export async function loadRegions(url: string): Promise<GeoJSONData> {
  const response = await fetch(url);
  const data = await response.json();
  
  // Convert TopoJSON to GeoJSON
  if (data.type === 'Topology') {
    const geojson = topojson.feature(data, data.objects.data) as any;
    return geojson;
  }
  
  return data;
}

export async function loadScores(url: string): Promise<Map<string, ScoreData>> {
  console.log('[loadScores] Loading scores from:', url);
  
  async function fetchText(u: string): Promise<string> {
    try {
      console.log('[loadScores] Fetching:', u);
      const res = await fetch(u);
      const text = await res.text();
      console.log('[loadScores] Received', text.length, 'characters');
      return text;
    } catch (err) {
      console.error('[loadScores] Fetch error:', err);
      return '';
    }
  }

  let text = await fetchText(url);

  const looksInvalid =
    !text ||
    text.includes('Sorry, the file you have requested does not exist') ||
    !text.includes('\n') ||
    text.toLowerCase().includes('<!doctype');

  if (looksInvalid) {
    console.warn('[loadScores] Invalid data from primary source, using fallback');
    // Fallback to local CSV if remote is unavailable
    text = await fetchText('/data/scores_ggv.csv');
  }
  
  const lines = text.trim().split(/\r?\n/);
  console.log('[loadScores] Parsing', lines.length, 'lines');
  const scoreMap = new Map<string, ScoreData>();
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Basic CSV split and strip optional quotes
    const parts = line.split(',').map(p => p.replace(/^"(.*)"$/, '$1').trim());
    if (parts.length >= 3) {
      const vnb_id = parts[0].trim();
      const vnb_name = parts[1].trim();
      const scoreStr = parts[2].trim();
      const updated_at = parts.length > 3 ? parts[3].trim() : '';
      
      const parsed = scoreStr ? parseFloat(scoreStr.replace('+', '').replace(',', '.')) : NaN;
      const score = Number.isFinite(parsed) ? parsed : null;
      scoreMap.set(vnb_id, { vnb_id, vnb_name, score, updated_at });
      
      if (vnb_id === 'DE0017') {
        console.log('[loadScores] Found Enercity Netz (DE0017):', { vnb_name, score, scoreStr });
      }
    }
  }
  
  console.log('[loadScores] Loaded', scoreMap.size, 'VNB scores');
  return scoreMap;
}

export function getColor(score: number | null | undefined): string {
  // Handle null, undefined, and 0 as same color
  if (score === null || score === undefined || score === 0) return 'hsl(var(--neutral))';
  
  if (score <= -50) return 'hsl(var(--neg-50))';
  if (score < 0) return 'hsl(var(--neg-25))';
  if (score < 50) return 'hsl(var(--pos-25))';
  return 'hsl(var(--pos-50))';
}

export function getColorLabel(index: number): string {
  const labels = ['≤ -50', '< 0', '0 / No Data', '< 50', '≥ 50'];
  return labels[index] || '';
}

export function getColorByIndex(index: number): string {
  const colors = [
    'hsl(var(--neg-50))',
    'hsl(var(--neg-25))',
    'hsl(var(--neutral))',
    'hsl(var(--pos-25))',
    'hsl(var(--pos-50))'
  ];
  return colors[index] || 'hsl(var(--neutral))';
}
