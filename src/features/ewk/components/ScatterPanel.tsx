import { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { IndicatorMeta, VnbRow, SourceKey } from '../types';
import { SOURCE_LABELS } from '../types';
import { tryParseNum } from '../utils/csvParser';
import { useCsvData } from '../hooks/useEwkData';

interface Props {
  catalog: IndicatorMeta[];
  currentIndicator: IndicatorMeta;
  currentRows: VnbRow[];
}

export default function ScatterPanel({ catalog, currentIndicator, currentRows }: Props) {
  const [yIndicatorId, setYIndicatorId] = useState<string | null>(null);

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
    const points: { x: number; y: number; name: string }[] = [];
    for (const r of currentRows) {
      const xv = tryParseNum(r[currentIndicator.column_key]);
      const yv = tryParseNum(yMap.get(r.bnr));
      if (xv !== null && yv !== null) {
        points.push({ x: xv, y: yv, name: r.firmenname });
      }
    }
    return points;
  }, [currentIndicator, yIndicator, currentRows, effectiveYRows]);

  const numericIndicators = catalog.filter(
    (i) =>
      (i.data_type === 'numeric' || i.data_type === 'binary_0_1') &&
      i.indicator_id !== currentIndicator.indicator_id &&
      i.non_null_count > 0
  );

  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <h4 className="text-sm font-medium">Streudiagramm</h4>
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Y-Achse wählen:</label>
        <select
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={yIndicatorId ?? ''}
          onChange={(e) => setYIndicatorId(e.target.value || null)}
        >
          <option value="">— Y-Achse wählen —</option>
          {numericIndicators.map((i) => (
            <option key={i.indicator_id} value={i.indicator_id}>
              {i.display_label} ({SOURCE_LABELS[i.source as SourceKey]})
            </option>
          ))}
        </select>
      </div>

      {yIndicator && scatterData.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="x"
                type="number"
                tick={{ fontSize: 10 }}
                name={currentIndicator.display_label}
              />
              <YAxis
                dataKey="y"
                type="number"
                tick={{ fontSize: 10 }}
                name={yIndicator.display_label}
              />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
                formatter={(value: number, name: string) => [value.toFixed(2), name === 'x' ? 'X' : 'Y']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ''}
              />
              <Scatter data={scatterData} fill="hsl(var(--primary))" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {yIndicator && scatterData.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Keine gemeinsamen numerischen Werte für diese Kombination.
        </p>
      )}

      {!yIndicator && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Wählen Sie einen zweiten numerischen Indikator für die Y-Achse.
        </p>
      )}
    </div>
  );
}
