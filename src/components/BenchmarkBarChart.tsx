import { useMemo, useState, useRef } from 'react';
import { getColor } from '@/utils/dataLoader';

interface VnbItem {
  id: string;
  name: string;
  score: number | null;
}

interface Props {
  vnbs: VnbItem[];
  selectedVnbId: string | null;
  onBarClick: (vnbId: string) => void;
}

export default function BenchmarkBarChart({ vnbs, selectedVnbId, onBarClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const ranked = useMemo(() => {
    const scored = vnbs
      .filter((v) => v.score !== null && v.score !== undefined)
      .sort((a, b) => b.score! - a.score!) as (VnbItem & { score: number })[];
    return scored.map((v, i) => ({ ...v, rank: i + 1 }));
  }, [vnbs]);

  const maxAbs = useMemo(
    () => Math.max(...ranked.map((v) => Math.abs(v.score)), 1),
    [ranked]
  );

  const strongPositiveCount = useMemo(
    () => ranked.filter((v) => v.score > 50).length,
    [ranked]
  );

  const total = ranked.length;

  if (total === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Keine bewerteten VNB vorhanden.
      </div>
    );
  }

  const chartHeight = 160;
  const halfHeight = chartHeight / 2;

  const handleMouseMove = (e: React.MouseEvent, vnbId: string) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setHoveredId(vnbId);
  };

  const hoveredVnb = hoveredId ? ranked.find((v) => v.id === hoveredId) : null;
  const selectedVnb = selectedVnbId ? ranked.find((v) => v.id === selectedVnbId) : null;

  return (
    <div className="space-y-1">
      {selectedVnb && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
            {selectedVnb.name}
          </span>
          <span className="text-xs text-muted-foreground">
            Rang {selectedVnb.rank}/{total}
          </span>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative select-none"
        style={{ height: chartHeight }}
        onMouseLeave={() => { setHoveredId(null); setTooltipPos(null); }}
      >
        <div className="flex items-stretch h-full gap-px">
          {ranked.map((vnb) => {
            const isSelected = vnb.id === selectedVnbId;
            const isHovered = vnb.id === hoveredId;
            const ratio = Math.abs(vnb.score) / maxAbs;
            const barH = Math.max(ratio * (halfHeight - 2), 1);
            const isPositive = vnb.score >= 0;

            const isRarePositive = vnb.score > 50 && strongPositiveCount <= 5;
            const widthMultiplier = isRarePositive
              ? Math.min(3, Math.max(1.5, 8 / Math.max(strongPositiveCount, 1)))
              : 1;

            const fillColor = isSelected ? 'hsl(var(--primary))' : getColor(vnb.score);
            const opacity = isSelected || isHovered ? 1 : 0.8;

            return (
              <div
                key={vnb.id}
                className="relative cursor-pointer transition-opacity duration-75"
                style={{
                  flex: widthMultiplier,
                  minWidth: isRarePositive ? 4 : 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onClick={() => onBarClick(vnb.id)}
                onMouseMove={(e) => handleMouseMove(e, vnb.id)}
              >
                {/* Top half: positive bars grow upward from center */}
                <div style={{ height: halfHeight, display: 'flex', alignItems: 'flex-end' }}>
                  {isPositive && (
                    <div
                      style={{
                        width: '100%',
                        height: barH,
                        backgroundColor: fillColor,
                        opacity,
                        borderRadius: '1px 1px 0 0',
                        transition: 'opacity 75ms',
                      }}
                    />
                  )}
                </div>
                {/* Bottom half: negative bars grow downward from center */}
                <div style={{ height: halfHeight, display: 'flex', alignItems: 'flex-start' }}>
                  {!isPositive && (
                    <div
                      style={{
                        width: '100%',
                        height: barH,
                        backgroundColor: fillColor,
                        opacity,
                        borderRadius: '0 0 1px 1px',
                        transition: 'opacity 75ms',
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Zero line */}
        <div
          className="absolute left-0 right-0 border-t border-border"
          style={{ top: halfHeight }}
        />

        {/* Tooltip */}
        {hoveredVnb && tooltipPos && (
          <div
            className="absolute z-30 pointer-events-none bg-popover text-popover-foreground border border-border rounded-md shadow-md px-2.5 py-1.5 text-xs"
            style={{
              left: Math.min(tooltipPos.x, (containerRef.current?.clientWidth ?? 300) - 180),
              top: Math.max(tooltipPos.y - 52, 0),
              maxWidth: 200,
            }}
          >
            <p className="font-semibold truncate">{hoveredVnb.name}</p>
            <p className="text-muted-foreground">
              Wert: {hoveredVnb.score > 0 ? '+' : ''}{hoveredVnb.score} · Rang {hoveredVnb.rank}/{total}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
        <span>beste Bewertung</span>
        <span>schlechteste Bewertung</span>
      </div>
    </div>
  );
}