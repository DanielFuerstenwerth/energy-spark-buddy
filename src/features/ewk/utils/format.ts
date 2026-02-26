const NO_SPACE_UNITS = new Set(['%', '‰', '°C', '°F']);

export function parseNumber(raw: string | number | null | undefined): number | null {
  if (raw == null || raw === '' || raw === 'nan' || raw === 'NaN') return null;
  const s = typeof raw === 'number' ? String(raw) : raw;
  const cleaned = s.replace(',', '.');
  const n = Number(cleaned);
  return isNaN(n) ? null : n;
}

export function formatDisplay(raw: string | number | null | undefined, unit: string): string {
  if (raw == null || raw === '' || raw === 'nan' || raw === 'NaN') return 'keine Angabe';

  const num = parseNumber(raw);
  if (num !== null) {
    const formatted = num.toLocaleString('de-DE', { maximumFractionDigits: 2 });
    const suffix = unit ? (NO_SPACE_UNITS.has(unit) ? unit : ` ${unit}`) : '';
    return `${formatted}${suffix}`;
  }

  // Non-numeric: return raw string without unit
  return typeof raw === 'string' ? raw : String(raw);
}
