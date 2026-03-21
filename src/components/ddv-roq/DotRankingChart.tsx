import { useMemo, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { DdvRoqVnb } from './types';
import { getColorForScore, getScoreBucketValue, BUCKET_ORDER } from './types';

interface Props {
  vnbs: DdvRoqVnb[];
  selectedVnb: DdvRoqVnb | null;
  onSelectVnb: (vnbId: string, vnbName: string) => void;
}

const DOT_R = 3.5;
const DOT_D = DOT_R * 2 + 1; // diameter + 1px gap

export default function DotRankingChart({ vnbs, selectedVnb, onSelectVnb }: Props) {
  const [hoveredVnb, setHoveredVnb] = useState<DdvRoqVnb | null>(null);

  // Group VNBs by score bucket, then stack them symmetrically around center
  const { positions, maxStack, bucketCounts } = useMemo(() => {
    const scored = vnbs.filter(v => v.score !== null);

    // Group by bucket
    const groups = new Map<number, DdvRoqVnb[]>();
    for (const bucket of BUCKET_ORDER) groups.set(bucket, []);
    for (const v of scored) {
      const bucket = getScoreBucketValue(v.score!);
      groups.get(bucket)?.push(v);
    }

    // Build positions: stack dots vertically per bucket
    const pos: { vnb: DdvRoqVnb; col: number; row: number; bucket: number }[] = [];
    let maxS = 0;
    const counts = new Map<number, number>();

    for (const bucket of BUCKET_ORDER) {
      const group = groups.get(bucket) || [];
      counts.set(bucket, group.length);
      // Sort within bucket: selected first, then by score_pct descending
      const sorted = [...group].sort((a, b) => (b.score_pct ?? 0) - (a.score_pct ?? 0));
      
      // Stack in columns from center outward (beeswarm)
      // Layout: fill column 0, then alternate -1/+1, -2/+2, etc.
      const colStacks = new Map<number, number>(); // col -> current row count
      const maxPerCol = 100; // max dots per column before expanding

      for (let i = 0; i < sorted.length; i++) {
        // Find the column with space, spiraling outward
        let col = 0;
        let placed = false;
        for (let c = 0; !placed; c++) {
          const tryCol = c === 0 ? 0 : (c % 2 === 1 ? Math.ceil(c / 2) : -Math.ceil(c / 2));
          const curCount = colStacks.get(tryCol) || 0;
          if (curCount < maxPerCol) {
            col = tryCol;
            colStacks.set(tryCol, curCount + 1);
            pos.push({ vnb: sorted[i], col: tryCol, row: curCount, bucket });
            maxS = Math.max(maxS, curCount + 1);
            placed = true;
          }
        }
      }
    }

    return { positions: pos, maxStack: maxS, bucketCounts: counts };
  }, [vnbs]);

  // Chart dimensions
  const margin = { left: 40, right: 40, top: 24, bottom: 28 };
  const chartWidth = 900;
  const rowHeight = Math.max(DOT_D, Math.min(DOT_D + 2, 300 / Math.max(maxStack, 1)));
  const chartHeight = Math.max(160, maxStack * rowHeight + margin.top + margin.bottom);

  // X scale: bucket index to x position
  const bucketXScale = (bucket: number) => {
    const idx = BUCKET_ORDER.indexOf(bucket as any);
    const usable = chartWidth - margin.left - margin.right;
    const step = usable / (BUCKET_ORDER.length - 1);
    return margin.left + idx * step;
  };

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Dot-Ranking ({vnbs.filter(v => v.score !== null).length} VNB)
      </h3>
      <div className="relative w-full border border-border rounded-lg overflow-x-auto bg-white">
        <svg
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
          style={{ minWidth: 600 }}
        >
          {/* Background zones */}
          <rect
            x={margin.left}
            y={margin.top}
            width={bucketXScale(0) - margin.left}
            height={chartHeight - margin.top - margin.bottom}
            fill="hsla(0, 70%, 50%, 0.06)"
          />
          <rect
            x={bucketXScale(0)}
            y={margin.top}
            width={chartWidth - margin.right - bucketXScale(0)}
            height={chartHeight - margin.top - margin.bottom}
            fill="hsla(140, 70%, 40%, 0.06)"
          />

          {/* Zero line */}
          <line
            x1={bucketXScale(0)}
            y1={margin.top}
            x2={bucketXScale(0)}
            y2={chartHeight - margin.bottom}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x={bucketXScale(0)}
            y={margin.top - 6}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            Pflicht (20%)
          </text>

          {/* Axis labels */}
          {BUCKET_ORDER.map(bucket => (
            <text
              key={bucket}
              x={bucketXScale(bucket)}
              y={chartHeight - margin.bottom + 16}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {bucket > 0 ? `+${bucket}` : bucket}
            </text>
          ))}

          {/* Axis line */}
          <line
            x1={margin.left}
            y1={chartHeight - margin.bottom}
            x2={chartWidth - margin.right}
            y2={chartHeight - margin.bottom}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />

          {/* Dots */}
          <TooltipProvider delayDuration={0}>
            {positions.map(({ vnb, col, row, bucket }) => {
              const cx = bucketXScale(bucket) + col * DOT_D;
              // Stack from bottom up, centered
              const cy = chartHeight - margin.bottom - DOT_R - 1 - row * rowHeight;

              const isSelected = selectedVnb?.vnb_id === vnb.vnb_id;
              const isHovered = hoveredVnb?.vnb_id === vnb.vnb_id;
              const color = getColorForScore(vnb.score);

              let r = DOT_R;
              let opacity = 0.7;
              if (isSelected) { r = 6; opacity = 1; }
              else if (isHovered) { r = 5; opacity = 1; }

              return (
                <Tooltip key={vnb.vnb_id}>
                  <TooltipTrigger asChild>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={color}
                      opacity={opacity}
                      stroke={isSelected ? 'hsl(var(--foreground))' : 'none'}
                      strokeWidth={isSelected ? 2 : 0}
                      className="cursor-pointer transition-all duration-100"
                      style={{ zIndex: isSelected ? 30 : isHovered ? 20 : 1 }}
                      onClick={() => onSelectVnb(vnb.vnb_id, vnb.vnb_name)}
                      onMouseEnter={() => setHoveredVnb(vnb)}
                      onMouseLeave={() => setHoveredVnb(null)}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-[200px]">
                    <p className="font-semibold">{vnb.vnb_name}</p>
                    <p>Score: {vnb.score !== null ? (vnb.score > 0 ? '+' : '') + vnb.score : 'k.A.'}</p>
                    {vnb.score_pct !== null && (
                      <p>Rollout: {vnb.score_pct.toFixed(1).replace('.', ',')}%</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>

          {/* Bucket counts */}
          {BUCKET_ORDER.map(bucket => {
            const count = bucketCounts.get(bucket) || 0;
            if (count === 0) return null;
            return (
              <text
                key={`count-${bucket}`}
                x={bucketXScale(bucket)}
                y={chartHeight - margin.bottom + 26}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize={8}
              >
                ({count})
              </text>
            );
          })}

          {/* Selected VNB label */}
          {selectedVnb && selectedVnb.score !== null && (() => {
            const bucket = getScoreBucketValue(selectedVnb.score!);
            const x = bucketXScale(bucket);
            return (
              <g>
                <rect
                  x={x - 60}
                  y={2}
                  width={120}
                  height={16}
                  rx={3}
                  fill="hsl(var(--foreground))"
                />
                <text
                  x={x}
                  y={13}
                  textAnchor="middle"
                  fill="hsl(var(--background))"
                  fontSize={9}
                  fontWeight={600}
                >
                  {selectedVnb.vnb_name}: {selectedVnb.score > 0 ? '+' : ''}{selectedVnb.score}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
