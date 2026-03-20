import { useState, useEffect } from 'react';
import { getVnbIdFromName } from '@/utils/vnbMapping';
import { buildMapsConfig } from '@/utils/structureLoader';
import type { DdvRoqVnb } from './types';

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

function norm(h: string) {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function useDdvRoqData() {
  const [vnbs, setVnbs] = useState<DdvRoqVnb[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const config = await buildMapsConfig();
        // Try DdV/RoQ route first, then DdV/RoQ/K1
        const rc = config['DdV/RoQ'] || config['ddv/roq'] || config['DdV/RoQ/K1'] || config['ddv/roq/k1'];
        if (!rc?.sheet) {
          console.warn('[useDdvRoqData] No sheet URL found for DdV/RoQ');
          setLoading(false);
          return;
        }

        const res = await fetch(rc.sheet);
        const text = await res.text();
        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 2) { setLoading(false); return; }

        const headers = parseCSVLine(lines[0]).map(norm);
        const nameIdx = headers.findIndex(h => h === 'vnbname');
        const scoreIdx = headers.findIndex(h => h === 'score');
        const pctIdx = headers.findIndex(h => h === 'scorepct');

        if (nameIdx === -1 || scoreIdx === -1) {
          console.warn('[useDdvRoqData] Missing required columns. Headers:', headers);
          setLoading(false);
          return;
        }

        const result: DdvRoqVnb[] = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = parseCSVLine(lines[i]);
          const name = parts[nameIdx] || '';
          if (!name) continue;
          const geoId = getVnbIdFromName(name);
          const scoreVal = parseFloat((parts[scoreIdx] || '').replace('+', '').replace(',', '.'));
          const pctVal = pctIdx !== -1 ? parseFloat((parts[pctIdx] || '').replace(',', '.').replace('%', '')) : null;

          result.push({
            vnb_id: geoId || name,
            vnb_name: name,
            score: Number.isFinite(scoreVal) ? scoreVal : null,
            score_pct: pctVal !== null && Number.isFinite(pctVal) ? pctVal : null,
          });
        }
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
