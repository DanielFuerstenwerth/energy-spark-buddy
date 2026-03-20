import { useMemo, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { DdvRoqVnb } from './types';
import { getColorForScore } from './types';

interface Props {
  vnbs: DdvRoqVnb[];
  selectedVnb: DdvRoqVnb | null;
  onSelectVnb: (vnbId: string, vnbName: string) => void;
}

// Seeded pseudo-random for consistent jitter
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function DotRankingChart({ vnbs, selectedVnb, onSelectVnb }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredVnb, setHoveredVnb] = useState<DdvRoqVnb | null>(null);

  const scoredVnbs = useMemo(
    () => vnbs.filter(v => v.score !== null).sort((a, b) => (a.score ?? 0) - (b.score ?? 0)),
    [vnbs]
  );

  const chartHeight = 140;
  const dotAreaTop = 30;
  const dotAreaBottom = chartHeight - 20;
  const dotAreaHeight = dotAreaBottom - dotAreaTop;

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Dot-Ranking ({scoredVnbs.length} VNB)
      </h3>
      <div
        ref={containerRef}
        className="relative w-full border border-border rounded-lg overflow-hidden"
        style={{ height: `${chartHeight}px` }}
      >
        {/* Background zones */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-red-50" />
          <div className="w-1/2 bg-green-50" />
        </div>

        {/* Zero line */}
        <div
          className="absolute top-0 bottom-0 border-l-2 border-dashed border-muted-foreground/40"
          style={{ left: '50%' }}
        />
        <div
          className="absolute text-[9px] text-muted-foreground bg-white/80 px-1 rounded"
          style={{ left: '50%', transform: 'translateX(-50%)', top: '2px' }}
        >
          Gesetzliche Pflicht (20%)
        </div>

        {/* Axis labels */}
        <div className="absolute bottom-1 left-2 text-[9px] text-muted-foreground">−100</div>
        <div className="absolute bottom-1 right-2 text-[9px] text-muted-foreground">+100</div>

        {/* Dots */}
        <TooltipProvider delayDuration={0}>
          {scoredVnbs.map((vnb, i) => {
            const score = vnb.score!;
            const xPct = ((score + 100) / 200) * 100;
            const rng = seededRandom(i * 7919 + 31);
            const yJitter = dotAreaTop + rng() * dotAreaHeight;

            const isSelected = selectedVnb?.vnb_id === vnb.vnb_id;
            const isHovered = hoveredVnb?.vnb_id === vnb.vnb_id;

            let radius: number;
            let opacity: number;
            if (isSelected) {
              radius = 9;
              opacity = 1;
            } else if (score >= 100) {
              radius = 6;
              opacity = 0.9;
            } else if (score >= 25) {
              radius = 4.5;
              opacity = 0.55;
            } else {
              radius = 3.5;
              opacity = 0.22;
            }

            const color = getColorForScore(score);

            return (
              <Tooltip key={vnb.vnb_id}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute cursor-pointer transition-transform hover:scale-150"
                    style={{
                      left: `${xPct}%`,
                      top: `${yJitter}px`,
                      width: `${radius * 2}px`,
                      height: `${radius * 2}px`,
                      borderRadius: '50%',
                      backgroundColor: color,
                      opacity: isHovered ? 1 : opacity,
                      border: isSelected
                        ? '2px solid hsl(var(--foreground))'
                        : score >= 100
                          ? `1.5px solid ${color}`
                          : 'none',
                      transform: 'translate(-50%, -50%)',
                      zIndex: isSelected ? 30 : isHovered ? 20 : 1,
                    }}
                    onClick={() => onSelectVnb(vnb.vnb_id, vnb.vnb_name)}
                    onMouseEnter={() => setHoveredVnb(vnb)}
                    onMouseLeave={() => setHoveredVnb(null)}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-[200px]">
                  <p className="font-semibold">{vnb.vnb_name}</p>
                  <p>Score: {score > 0 ? '+' : ''}{score}</p>
                  {vnb.score_pct !== null && (
                    <p>Rollout: {vnb.score_pct.toFixed(1).replace('.', ',')}%</p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>

        {/* Selected VNB label */}
        {selectedVnb && selectedVnb.score !== null && (
          <div
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: `${((selectedVnb.score + 100) / 200) * 100}%`,
              top: '0',
              transform: 'translateX(-50%)',
              zIndex: 40,
            }}
          >
            <div className="bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
              {selectedVnb.vnb_name}: {selectedVnb.score > 0 ? '+' : ''}{selectedVnb.score}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
