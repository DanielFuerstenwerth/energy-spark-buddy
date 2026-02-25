import type { VnbRow } from '../types';

export function parseCsv(text: string): VnbRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',');
  const rows: VnbRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',');
    if (!vals[0]) continue;
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = vals[j] ?? '';
    }
    rows.push(row as unknown as VnbRow);
  }
  return rows;
}

/** Try to parse a value as number. Returns null if empty/nan/unparseable. */
export function tryParseNum(val: string | undefined | null): number | null {
  if (val == null || val === '' || val === 'nan' || val === 'NaN') return null;
  const cleaned = val.replace(',', '.');
  const n = Number(cleaned);
  return isNaN(n) ? null : n;
}

/** Compute rank (1 = smallest by default) among valid values. */
export function computeRanks(
  rows: VnbRow[],
  colKey: string,
  ascending = true
): Map<string, { rank: number; percentile: number; value: number }> {
  const valid: { bnr: string; value: number }[] = [];
  for (const r of rows) {
    const n = tryParseNum(r[colKey]);
    if (n !== null) valid.push({ bnr: r.bnr, value: n });
  }
  valid.sort((a, b) => (ascending ? a.value - b.value : b.value - a.value));
  const map = new Map<string, { rank: number; percentile: number; value: number }>();
  const N = valid.length;
  for (let i = 0; i < N; i++) {
    const rank = i + 1;
    map.set(valid[i].bnr, {
      rank,
      percentile: N > 1 ? Math.round(((N - rank) / (N - 1)) * 100) : 50,
      value: valid[i].value,
    });
  }
  return map;
}

/** Compute basic stats for numeric column */
export function computeStats(values: number[]): {
  min: number;
  max: number;
  median: number;
  q1: number;
  q3: number;
  mean: number;
} {
  if (values.length === 0)
    return { min: 0, max: 0, median: 0, q1: 0, q3: 0, mean: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const median = sorted[Math.floor(n / 2)];
  const q1 = sorted[Math.floor(n / 4)];
  const q3 = sorted[Math.floor((3 * n) / 4)];
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  return {
    min: sorted[0],
    max: sorted[n - 1],
    median,
    q1,
    q3,
    mean,
  };
}
