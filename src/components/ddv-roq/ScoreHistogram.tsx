import { useMemo } from 'react';
import type { DdvRoqVnb } from './types';
import { BUCKET_ORDER, DDV_ROQ_PALETTE, getScoreBucketValue } from './types';

interface Props {
  vnbs: DdvRoqVnb[];
  selectedVnb: DdvRoqVnb | null;
}

export default function ScoreHistogram({ vnbs, selectedVnb }: Props) {
  const buckets = useMemo(() => {
    const map = new Map<number, number>();
    BUCKET_ORDER.forEach(b => map.set(b, 0));
    vnbs.forEach(v => {
      if (v.score !== null) {
        const b = getScoreBucketValue(v.score);
        map.set(b, (map.get(b) || 0) + 1);
      }
    });
    return BUCKET_ORDER.map(b => ({ score: b, count: map.get(b) || 0 }));
  }, [vnbs]);

  const selectedBucket = selectedVnb?.score !== null && selectedVnb?.score !== undefined
    ? getScoreBucketValue(selectedVnb.score)
    : null;

  const maxCount = Math.max(...buckets.map(b => b.count), 1);

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Score-Verteilung
      </h3>
      <div className="space-y-1.5">
        {buckets.map(({ score, count }) => {
          const entry = DDV_ROQ_PALETTE[score];
          const isSelected = score === selectedBucket;
          const widthPct = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={score} className="flex items-center gap-2 text-xs">
              <span className="w-10 text-right font-mono text-muted-foreground tabular-nums">
                {score > 0 ? '+' : ''}{score}
              </span>
              <div className="flex-1 h-5 relative">
                <div
                  className="h-full rounded-sm transition-all"
                  style={{
                    width: `${Math.max(widthPct, 1)}%`,
                    backgroundColor: entry.color,
                    opacity: isSelected ? 1 : 0.35,
                    outline: isSelected ? `2px solid ${entry.color}` : 'none',
                    outlineOffset: '1px',
                  }}
                />
              </div>
              <span className="w-8 text-right font-mono text-muted-foreground tabular-nums">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
