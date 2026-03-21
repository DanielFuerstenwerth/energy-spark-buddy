/**
 * Color function specifically for the DdV/RoQ criterion map.
 * Uses the 10-bucket palette matching the score system in types.ts.
 */
export function getDdvRoqColor(score: number | null | undefined): string {
  if (score === null || score === undefined || Number.isNaN(score)) return '#f0f0f0'; // keine Daten
  if (score >= 75) return '#00832D';  // +100/+75: dunkelgrün
  if (score >= 25) return '#27AE60';  // +50/+25: hellgrün
  if (score >= 0) return '#888780';   // 0: grau
  if (score >= -25) return '#F1C40F'; // -25: gelb
  if (score >= -75) return '#E67E22'; // -50/-75: orange
  return '#A32D2D';                   // -90/-100: dunkelrot
}
