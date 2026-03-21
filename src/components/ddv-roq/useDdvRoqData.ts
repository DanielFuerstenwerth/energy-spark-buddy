import { useState, useEffect } from 'react';
import { getVnbIdFromName } from '@/utils/vnbMapping';
import type { DdvRoqVnb } from './types';

// Direct URL to the Scores_DdV_RoQ tab
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/14n61IcOwk5fUZ-MYbO1D4XJOAN5sDdCZxo6XQIgMf8o/export?format=csv&gid=2146744485';

function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else { inQ = !inQ; } }
    else if (ch === ',' && !inQ) { out.push(cur); cur = ''; }
    else { cur += ch; }
  }
  out.push(cur);
  return out.map(s => s.trim());
}

export function useDdvRoqData() {
  const [vnbs, setVnbs] = useState<DdvRoqVnb[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(SHEET_URL);
        const text = await res.text();
        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 2) { setLoading(false); return; }

        // CSV format: vnb_name, Score_pct (e.g. "17.51%"), Score (e.g. -25)
        // Header row may only label first two columns: "vnb_name,Score,,,..."
        // Actual data: col0=name, col1=percentage, col2=score number
        const result: DdvRoqVnb[] = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = parseCSVLine(lines[i]);
          const name = parts[0] || '';
          if (!name) continue;

          const geoId = getVnbIdFromName(name);
          
          // Column 1: percentage like "17.51%" or "0.00%"
          const pctStr = (parts[1] || '').replace('%', '').replace(',', '.');
          const pctVal = parseFloat(pctStr);
          
          // Column 2: score like -100, -75, 0, 25, etc.
          const scoreStr = (parts[2] || '').replace('+', '').replace(',', '.');
          const scoreVal = parseFloat(scoreStr);

          result.push({
            vnb_id: geoId || name,
            vnb_name: name,
            score: Number.isFinite(scoreVal) ? scoreVal : null,
            score_pct: Number.isFinite(pctVal) ? pctVal : null,
          });
        }
        
        console.log(`[useDdvRoqData] Loaded ${result.length} VNBs, sample:`, result.slice(0, 3));
        setVnbs(result);
      } catch (e) {
        console.error('[useDdvRoqData] Error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { vnbs, loading };
}
