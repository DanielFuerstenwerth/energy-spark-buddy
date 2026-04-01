import * as topojson from 'topojson-client';
import { getVnbIdFromName, ensureVnbMappingsLoaded } from './vnbMapping';

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

  // Ensure VNB name→ID mappings are loaded before parsing
  await ensureVnbMappingsLoaded();

  let text = await fetchText(url);

  const looksInvalid =
    !text ||
    text.includes('Sorry, the file you have requested does not exist') ||
    !text.includes('\n') ||
    text.toLowerCase().includes('<!doctype');

  if (looksInvalid) {
    console.warn('[loadScores] Invalid data from Google Sheet source');
    return new Map<string, ScoreData>();
  }

  // Check if this looks like the structure sheet (wrong tab exported)
  const firstLine = text.split('\n')[0];
  if (firstLine.includes('Kategorie_slug') || firstLine.includes('Kategorie_name')) {
    console.warn('[loadScores] Detected structure sheet instead of scores data');
    return new Map<string, ScoreData>();
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
  // 6-category system: 0 is a valid score, separated from "keine Daten"
  if (score === null || score === undefined || Number.isNaN(score)) return 'hsl(220, 14%, 96%)';
  if (score < -50) return 'hsl(350, 80%, 35%)';              // -100 bis -50: deep crimson
  if (score < 0) return 'hsl(20, 85%, 55%)';                 // -50 bis 0: warm orange-red
  if (score === 0) return 'hsl(45, 30%, 80%)';               // exactly 0: warm neutral
  if (score <= 50) return 'hsl(142, 68%, 36%)';              // >0 bis 50: clear green
  return 'hsl(158, 72%, 26%)';                               // >50 bis 100: strong dark green
}

export function getColorLabel(index: number): string {
  const labels = ['-100 bis -50', '-50 bis 0', '0 (Pflicht erfüllt)', '> 0 bis 50', '50 bis 100', 'keine Daten'];
  return labels[index] || '';
}

export function getColorByIndex(index: number): string {
  const colors = [
    'hsl(350, 80%, 35%)',    // -100 bis -50: deep crimson
    'hsl(20, 85%, 55%)',     // -50 bis 0: warm orange-red
    'hsl(45, 30%, 80%)',     // 0: warm neutral
    'hsl(142, 68%, 36%)',    // >0 bis 50: clear green
    'hsl(158, 72%, 26%)',    // >50 bis 100: strong dark green
    'hsl(220, 14%, 96%)',    // keine Daten: very light gray
  ];
  return colors[index] || 'hsl(220, 14%, 96%)';
}
