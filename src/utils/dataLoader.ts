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

  function parseCSVRows(csvText: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const ch = csvText[i];

      if (ch === '"') {
        if (inQuotes && csvText[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
        if (ch === '\r' && csvText[i + 1] === '\n') i++;
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((field) => field !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentField += ch;
      }
    }

    if (currentField.length > 0 || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some((field) => field !== '')) {
        rows.push(currentRow);
      }
    }

    return rows;
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

  const text = await fetchText(url);

  const looksInvalid =
    !text ||
    text.includes('Sorry, the file you have requested does not exist') ||
    !text.includes('\n') ||
    text.toLowerCase().includes('<!doctype');

  if (looksInvalid) {
    console.warn('[loadScores] Invalid data from Google Sheet source');
    return new Map<string, ScoreData>();
  }

  const rows = parseCSVRows(text);
  if (rows.length === 0) {
    console.warn('[loadScores] No parsable rows found');
    return new Map<string, ScoreData>();
  }

  // Check if this looks like the structure sheet (wrong tab exported)
  const firstRow = rows[0].map(normalizeHeader);
  if (firstRow.includes(normalizeHeader('Kategorie_slug')) || firstRow.includes(normalizeHeader('Kategorie_name'))) {
    console.warn('[loadScores] Detected structure sheet instead of scores data');
    return new Map<string, ScoreData>();
  }

  console.log('[loadScores] Parsing', rows.length, 'rows');
  const scoreMap = new Map<string, ScoreData>();

  // Find header row dynamically (look for vnb_id and either aggregated_score or requestedColumn)
  let headerLineIdx = 0;
  let header: string[] = [];
  let normHeaders: string[] = [];

  for (let i = 0; i < Math.min(rows.length, 25); i++) {
    const cand = rows[i];
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
    header = rows[0];
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
  for (let i = headerLineIdx + 1; i < rows.length; i++) {
    const parts = rows[i];
    if (!parts.some((part) => part !== '')) continue;

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
  if (score === null || score === undefined || Number.isNaN(score)) return '#F2F2F2';
  if (score < -75) return '#C00000';             // Verhinderer: -100 bis < -75
  if (score < 0) return '#E97132';               // Verzögerer: -75 bis 0
  if (score === 0) return '#BFBFBF';             // Pflichterfüller: 0
  if (score <= 50) return '#4EA72E';             // Unterstützer: >0 bis 50
  return '#196B24';                              // Champion: >50 bis 100
}

export function getColorLabel(index: number): string {
  const labels = ['Champion (50 bis 100)', 'Unterstützer (> 0 bis 50)', 'Pflichterfüller (0)', 'Verzögerer (-75 bis 0)', 'Verhinderer (-100 bis < -75)', 'keine Daten'];
  return labels[index] || '';
}

export function getColorByIndex(index: number): string {
  const colors = [
    '#196B24',    // Champion: >50 bis 100
    '#4EA72E',    // Unterstützer: >0 bis 50
    '#BFBFBF',    // Pflichterfüller: 0
    '#E97132',    // Verzögerer: -75 bis 0
    '#C00000',    // Verhinderer: -100 bis -75
    '#F2F2F2',    // keine Daten
  ];
  return colors[index] || '#BFBFBF';
}
