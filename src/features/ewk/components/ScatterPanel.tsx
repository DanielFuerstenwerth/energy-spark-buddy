import { useMemo, useRef } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import type { IndicatorMeta, VnbRow, SourceKey } from '../types';
import { tryParseNum } from '../utils/csvParser';
import { useCsvData } from '../hooks/useEwkData';
import DownloadImageButton from './DownloadImageButton';

/* ---- custom tooltip ---- */
function EwkScatterTooltip({ active, payload, xLabel, yLabel }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  const fmt = (v: number) => (Number.isFinite(v) ? v.toLocaleString('de-DE', { maximumFractionDigits: 2 }) : 'keine Angabe');
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl space-y-0.5">
      <div className="font-semibold text-sm">{p.name}</div>
      <div className="text-muted-foreground">{xLabel}: <span className="font-medium text-foreground">{fmt(p.x)}</span></div>
      <div className="text-muted-foreground">{yLabel}: <span className="font-medium text-foreground">{fmt(p.y)}</span></div>
    </div>
  );
}

/* ---- custom dot shapes ---- */
function ScatterDot(props: any) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null) return null;
  const hl = payload?.highlighted;
  return <circle cx={cx} cy={cy} r={hl ? 5 : 4} fill={hl ? 'hsl(0,72%,51%)' : 'hsl(var(--primary))'} fillOpacity={0.8} style={{ pointerEvents: 'all' }} />;
}

function ScatterActiveDot(props: any) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null) return null;
  const hl = payload?.highlighted;
  return <circle cx={cx} cy={cy} r={7} fill={hl ? 'hsl(0,72%,51%)' : 'hsl(var(--primary))'} fillOpacity={1} stroke="#fff" strokeWidth={2} style={{ pointerEvents: 'all' }} />;
}

interface Props {
  catalog: IndicatorMeta[];
  currentIndicator: IndicatorMeta;
  currentRows: VnbRow[];
  yIndicatorId: string | null;
  highlightedBnrs: string[];
}

export default function ScatterPanel({ catalog, currentIndicator, currentRows, yIndicatorId, highlightedBnrs }: Props) {
  const scatterRef = useRef<HTMLDivElement>(null);
  const yIndicator = catalog.find((i) => i.indicator_id === yIndicatorId);
  const ySource = yIndicator?.source as SourceKey | null;
  const { data: yRows } = useCsvData(
    ySource && ySource !== (currentIndicator.source as SourceKey) ? ySource : null
  );

  const effectiveYRows = ySource === (currentIndicator.source as SourceKey) ? currentRows : yRows;

  const scatterData = useMemo(() => {
    if (!yIndicator || !effectiveYRows.length) return [];
    const yMap = new Map<string, string>();
    for (const r of effectiveYRows) {
      yMap.set(r.bnr, r[yIndicator.column_key] ?? '');
    }
    const points: { x: number; y: number; name: string; bnr: string; highlighted: boolean }[] = [];
    for (const r of currentRows) {
      const xv = tryParseNum(r[currentIndicator.column_key]);
      const yv = tryParseNum(yMap.get(r.bnr));
      if (xv !== null && yv !== null) {
        points.push({
          x: xv,
          y: yv,
          name: r.firmenname,
          bnr: r.bnr,
          highlighted: highlightedBnrs.includes(r.bnr),
        });
      }
    }
    return points;
  }, [currentIndicator, yIndicator, currentRows, effectiveYRows, highlightedBnrs]);

  if (!yIndicator) return null;

  if (scatterData.length === 0) {
    return (
      <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground text-center">
        Keine gemeinsamen numerischen Werte für diese Kombination.
      </div>
    );
  }

  return (
    <div ref={scatterRef} className="bg-card rounded-xl border p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xs font-medium">
          Scatter: {currentIndicator.display_label} × {yIndicator.display_label}
        </h4>
        <DownloadImageButton targetRef={scatterRef} filename="scatter" />
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
            <XAxis dataKey="x" type="number" tick={{ fontSize: 9 }} />
            <YAxis dataKey="y" type="number" tick={{ fontSize: 9 }} />
            <Tooltip
              content={<EwkScatterTooltip xLabel={currentIndicator.display_label} yLabel={yIndicator!.display_label} />}
              cursor={{ strokeDasharray: '3 3' }}
            />
            <Scatter
              data={scatterData}
              isAnimationActive={false}
              shape={<ScatterDot />}
              activeShape={<ScatterActiveDot />}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {highlightedBnrs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {scatterData
            .filter((d) => d.highlighted)
            .map((d) => (
              <Badge key={d.bnr} variant="destructive" className="text-[9px]">
                {d.name}
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}
