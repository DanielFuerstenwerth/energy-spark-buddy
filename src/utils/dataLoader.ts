import * as topojson from 'topojson-client';
import { getVnbIdFromName } from './vnbMapping';

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

export async function loadAllVnbNames(): Promise<Map<string, string>> {
  try {
    const response = await fetch('/data/vnb_names.json');
    const data = await response.json();
    const vnbMap = new Map<string, string>();
    
    Object.entries(data).forEach(([id, value]: [string, any]) => {
      vnbMap.set(id, value.name);
    });
    
    console.log(`[loadAllVnbNames] Loaded ${vnbMap.size} VNB names`);
    return vnbMap;
  } catch (error) {
    console.error('[loadAllVnbNames] Error loading VNB names:', error);
    return new Map();
  }
}

export async function loadScores(
  url: string,
  opts?: { aggregatedColumn?: string; requestedColumn?: string; fallbackUrl?: string }
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
    console.warn('[loadScores] Invalid data from primary source, using general fallback');
    // Fallback to local CSV if remote is unavailable
    text = await fetchText('/data/scores_ggv.csv');
  } else {
    // Check if this looks like the structure sheet (wrong tab exported)
    const firstLine = text.split('\n')[0];
    if (firstLine.includes('Kategorie_slug') || firstLine.includes('Kategorie_name')) {
      console.warn('[loadScores] Detected structure sheet instead of scores data');
      
      // Try route-specific fallback first
      if (opts?.fallbackUrl) {
        console.log('[loadScores] Trying route-specific fallback:', opts.fallbackUrl);
        text = await fetchText(opts.fallbackUrl);
      } else {
        console.warn('[loadScores] Using general fallback');
        text = await fetchText('/data/scores_ggv.csv');
      }
    }
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
  // Fallback to 'score' if 'aggregated_score' not found
  if (aggIdx === -1) aggIdx = headerIndex('score');

  let requestedIdx = -1;
  if (opts?.requestedColumn) {
    requestedIdx = headerIndex(opts.requestedColumn);
    if (requestedIdx === -1) {
      console.warn('[loadScores] Requested column not found:', opts.requestedColumn);
      console.warn('[loadScores] Available columns:', header);
      console.warn('[loadScores] Falling back to aggregated score column');
      // If requested column not found, use the aggregated column as fallback
      requestedIdx = aggIdx;
    } else {
      console.log('[loadScores] Using requested column:', opts.requestedColumn, 'at index', requestedIdx);
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
    const vnb_name = (parts[nameIdx] ?? '').trim();
    
    // ALWAYS use VNB name to look up GeoJSON ID
    // This way the user can keep VNB names in their Google Sheet
    const geoJsonId = getVnbIdFromName(vnb_name);

    // Choose score source: requested column > aggregated > fallback index 2
    let scoreStr = '';
    if (requestedIdx !== -1) scoreStr = parts[requestedIdx] ?? '';
    else if (aggIdx !== -1) scoreStr = parts[aggIdx] ?? '';
    else scoreStr = parts[2] ?? '';

    const updated_at = updatedIdx !== -1 ? (parts[updatedIdx] ?? '') : '';

    const parsed = scoreStr ? parseFloat(scoreStr.replace('+', '').replace(',', '.')) : NaN;
    const score = Number.isFinite(parsed) ? parsed : null;

    // Store data keyed by GeoJSON ID (for map matching)
    if (geoJsonId && vnb_name) {
      scoreMap.set(geoJsonId, { 
        vnb_id: geoJsonId, 
        vnb_name: vnb_name, 
        score, 
        updated_at 
      });
      
      // Debug logging for specific VNBs
      if (vnb_name.toLowerCase().includes('enercity')) {
        console.log('[loadScores] Enercity mapping:', { 
          vnb_name, 
          geoJsonId, 
          score, 
          scoreStr 
        });
      }
    } else if (vnb_name) {
      // Log unmapped VNBs for debugging
      console.warn('[loadScores] Unmapped VNB (no GeoJSON ID found):', vnb_name);
    }
  }
  
  console.log('[loadScores] Loaded', scoreMap.size, 'VNB scores');
  return scoreMap;
}

export function getColor(score: number | null | undefined): string {
  // Fixed 5-category system
  // Treat 0 and null as 0 (keine Daten)
  const normalizedScore = (score === null || score === undefined || score === 0) ? 0 : score;
  
  if (normalizedScore === 0) return 'hsl(220, 13%, 91%)';  // 0 (keine Daten)
  if (normalizedScore <= -50) return 'hsl(0, 84%, 25%)';   // -100 bis -50: dark red
  if (normalizedScore < 0) return 'hsl(0, 72%, 42%)';      // -50 bis 0: red
  if (normalizedScore <= 50) return 'hsl(142, 76%, 45%)';  // 0 bis 50: green
  return 'hsl(158, 64%, 32%)';                             // 50 bis 100: dark green
}

export function getColorLabel(index: number): string {
  const labels = ['-100 bis -50', '-50 bis 0', '0 (keine Daten)', '0 bis 50', '50 bis 100'];
  return labels[index] || '';
}

export function getColorByIndex(index: number): string {
  const colors = [
    'hsl(0, 84%, 25%)',      // -100 bis -50: dark red
    'hsl(0, 72%, 42%)',      // -50 bis 0: red
    'hsl(220, 13%, 91%)',    // 0 (keine Daten): gray
    'hsl(142, 76%, 45%)',    // 0 bis 50: green
    'hsl(158, 64%, 32%)'     // 50 bis 100: dark green
  ];
  return colors[index] || 'hsl(220, 13%, 91%)';
}
