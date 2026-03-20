export interface DdvRoqVnb {
  vnb_id: string;
  vnb_name: string;
  score: number | null;
  score_pct: number | null;
}

export interface ScoreBucket {
  score: number;
  label: string;
  color: string;
  count: number;
  vnbs: DdvRoqVnb[];
}

export const DDV_ROQ_PALETTE: Record<number, { color: string; label: string }> = {
  100:  { color: '#00832D', label: 'Exzellent (Bestleistung)' },
  75:   { color: '#1A5276', label: 'Sehr gut' },
  50:   { color: '#1E8449', label: 'Gut' },
  25:   { color: '#27AE60', label: 'Über Pflicht' },
  0:    { color: '#888780', label: 'Pflicht erfüllt' },
  '-25': { color: '#F1C40F', label: 'Knapp unter Pflicht' },
  '-50': { color: '#F39C12', label: 'Unter Pflicht' },
  '-75': { color: '#E67E22', label: 'Deutlich unter Pflicht' },
  '-90': { color: '#E24B4A', label: 'Weit unter Pflicht' },
  '-100': { color: '#A32D2D', label: 'Kein Rollout' },
};

// Ordered from lowest to highest
export const BUCKET_ORDER = [-100, -90, -75, -50, -25, 0, 25, 50, 75, 100] as const;

export function getScoreBucketValue(score: number): number {
  if (score >= 100) return 100;
  if (score >= 75) return 75;
  if (score >= 50) return 50;
  if (score >= 25) return 25;
  if (score >= 0) return 0;
  if (score >= -25) return -25;
  if (score >= -50) return -50;
  if (score >= -75) return -75;
  if (score >= -90) return -90;
  return -100;
}

export function getPaletteEntry(score: number) {
  const bucket = getScoreBucketValue(score);
  return DDV_ROQ_PALETTE[bucket] || DDV_ROQ_PALETTE[0];
}

export function getColorForScore(score: number | null): string {
  if (score === null) return '#d1d5db';
  return getPaletteEntry(score).color;
}

export function getLabelForScore(score: number | null): string {
  if (score === null) return 'Keine Daten';
  return getPaletteEntry(score).label;
}
