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

export async function loadScores(
  url: string,
  opts?: { aggregatedColumn?: string; requestedColumn?: string }
): Promise<Map<string, ScoreData>> {
  console.log('[loadScores] Loading scores from:', url, 'opts:', opts);

  function normalizeHeader(h: string) {
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
        // handle escaped quote
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
  if (lines.length === 0) return scoreMap;

  // Find header row dynamically (look for vnb_id and either aggregated_score or requestedColumn)
  let headerLineIdx = 0;
  let header: string[] = [];
  let normHeaders: string[] = [];

  for (let i = 0; i < Math.min(lines.length, 25); i++) { // search first 25 rows for header
    const cand = parseCSVLine(lines[i]);
    const norm = cand.map(normalizeHeader);
    const hasId = norm.includes(normalizeHeader('vnb_id')) || norm.includes(normalizeHeader('vnbid'));
    const needs = normalizeHeader(opts?.requestedColumn || opts?.aggregatedColumn || 'aggregated_score');
    const hasScore = norm.includes(needs) || norm.includes(normalizeHeader('aggregated_score'));
    if (hasId && hasScore) {
      headerLineIdx = i;
      header = cand;
      normHeaders = norm;
      break;
    }
  }
  if (header.length === 0) {
    header = parseCSVLine(lines[0]);
    normHeaders = header.map(normalizeHeader);
  }

  const headerIndex = (name: string) => normHeaders.indexOf(normalizeHeader(name));

  // Try to locate key columns
  let idIdx = headerIndex('vnb_id');
  if (idIdx === -1) idIdx = headerIndex('vnbid');
  if (idIdx === -1) idIdx = 0; // fallback

  let nameIdx = headerIndex('vnb_name');
  if (nameIdx === -1) nameIdx = headerIndex('vnbname');
  if (nameIdx === -1) nameIdx = 1; // fallback

  const aggregatedColumn = opts?.aggregatedColumn ?? 'aggregated_score';
  let aggIdx = headerIndex(aggregatedColumn);

  let requestedIdx = -1;
  if (opts?.requestedColumn) {
    requestedIdx = headerIndex(opts.requestedColumn);
    if (requestedIdx === -1) {
      console.warn('[loadScores] Requested column not found:', opts.requestedColumn, 'Headers:', header);
    }
  }

  let updatedIdx = headerIndex('updated_at');
  if (updatedIdx === -1) updatedIdx = headerIndex('updated');

  console.log('[loadScores] Header row at index', headerLineIdx, 'Columns:', header);
  console.log('[loadScores] Column indices:', { idIdx, nameIdx, aggIdx, requestedIdx, updatedIdx });

  // Data rows start after headerLineIdx
  for (let i = headerLineIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    const vnb_id = (parts[idIdx] ?? '').trim();
    const vnb_name = (parts[nameIdx] ?? '').trim();

    // Choose score source: requested column > aggregated > fallback index 2
    let scoreStr = '';
    if (requestedIdx !== -1) scoreStr = parts[requestedIdx] ?? '';
    else if (aggIdx !== -1) scoreStr = parts[aggIdx] ?? '';
    else scoreStr = parts[2] ?? '';

    const updated_at = updatedIdx !== -1 ? (parts[updatedIdx] ?? '') : '';

    const parsed = scoreStr ? parseFloat(scoreStr.replace('+', '').replace(',', '.')) : NaN;
    const score = Number.isFinite(parsed) ? parsed : null;

    if (vnb_id) {
      scoreMap.set(vnb_id, { vnb_id, vnb_name, score, updated_at });
      if (vnb_id === 'DE0017') {
        console.log('[loadScores] Enercity Netz (DE0017):', { score, scoreStr, vnb_name });
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
