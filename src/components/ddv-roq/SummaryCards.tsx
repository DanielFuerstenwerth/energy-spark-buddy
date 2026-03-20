import type { DdvRoqVnb } from './types';
import { getColorForScore, getLabelForScore } from './types';

interface Props {
  selectedVnb: DdvRoqVnb | null;
  allVnbs: DdvRoqVnb[];
}

export default function SummaryCards({ selectedVnb, allVnbs }: Props) {
  if (!selectedVnb || selectedVnb.score === null) return null;

  const score = selectedVnb.score;
  const pct = selectedVnb.score_pct;
  const color = getColorForScore(score);
  const label = getLabelForScore(score);

  // Percentile: % of VNBs this one is better than
  const scored = allVnbs.filter(v => v.score !== null);
  const betterThan = scored.filter(v => v.score !== null && v.score < score).length;
  const percentile = scored.length > 0 ? Math.round((betterThan / scored.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
      {/* Rollout Quote */}
      <div className="bg-white border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Rollout-Quote</p>
        <p className="text-2xl font-bold" style={{ color }}>
          {pct !== null ? `${pct.toFixed(1).replace('.', ',')}%` : '—'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">iMSys-Einbauquote nach §45 MsbG</p>
      </div>

      {/* Score */}
      <div className="bg-white border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Score</p>
        <p className="text-2xl font-bold" style={{ color }}>
          {score > 0 ? '+' : ''}{score}
        </p>
        <p className="text-xs mt-1" style={{ color }}>{label}</p>
      </div>

      {/* Percentile */}
      <div className="bg-white border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Ranking</p>
        <p className="text-2xl font-bold text-foreground">
          Besser als {percentile}%
        </p>
        <p className="text-xs text-muted-foreground mt-1">aller {scored.length} VNB</p>
      </div>
    </div>
  );
}
