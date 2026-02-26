import { useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { VnbRow } from '../types';
import { tryParseNum, computeStats } from '../utils/csvParser';
import DownloadImageButton from './DownloadImageButton';

interface Props {
  rows: VnbRow[];
  colKey: string;
  dataType: string;
  indicatorLabel?: string;
  unit?: string;
}

export default function DistributionChart({ rows, colKey, dataType, indicatorLabel, unit = '' }: Props) {
  if (dataType === 'text') {
    return (
      <div className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-6 text-center">
        Für Textindikatoren ist keine Verteilungsdarstellung verfügbar.
      </div>
    );
  }

  if (dataType === 'binary_0_1') {
    return <BinaryDistribution rows={rows} colKey={colKey} indicatorLabel={indicatorLabel} />;
  }

  return <NumericDistribution rows={rows} colKey={colKey} indicatorLabel={indicatorLabel} unit={unit} />;
}

function BinaryDistribution({ rows, colKey, indicatorLabel }: { rows: VnbRow[]; colKey: string; indicatorLabel?: string }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const stats = useMemo(() => {
    let ones = 0;
    let zeros = 0;
    let total = 0;
    for (const r of rows) {
      const v = tryParseNum(r[colKey]);
      if (v === null) continue;
      total++;
      if (v === 1) ones++;
      else zeros++;
    }
    return { ones, zeros, total, ratio: total > 0 ? ((ones / total) * 100).toFixed(1) : '0' };
  }, [rows, colKey]);

  return (
    <div className="bg-card rounded-xl border p-6 space-y-3">
      {/* Stats (not in export) */}
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${stats.ratio}%` }}
          />
        </div>
        <span className="text-sm font-mono font-medium">{stats.ratio}%</span>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>Ja: {stats.ones}</span>
        <span>Nein: {stats.zeros}</span>
        <span>Gültige N: {stats.total}</span>
      </div>

      {/* Exportable chart area */}
      <div ref={chartRef} className="bg-card rounded-lg p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-medium">{indicatorLabel ?? 'Verteilung (Ja/Nein)'}</h4>
          <div className="shrink-0">
            <DownloadImageButton targetRef={chartRef} filename={`verteilung-${colKey}`} />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all flex items-center justify-center text-xs font-medium text-primary-foreground"
              style={{ width: `${stats.ratio}%` }}
            >
              {Number(stats.ratio) > 15 ? `${stats.ratio}%` : ''}
            </div>
          </div>
          {Number(stats.ratio) <= 15 && <span className="text-sm font-mono font-medium">{stats.ratio}%</span>}
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
          <span>Ja: {stats.ones}</span>
          <span>Nein: {stats.zeros}</span>
          <span>N: {stats.total}</span>
        </div>
      </div>
    </div>
  );
}

function NumericDistribution({ rows, colKey, indicatorLabel, unit = '' }: { rows: VnbRow[]; colKey: string; indicatorLabel?: string; unit?: string }) {
  const chartRef = useRef<HTMLDivElement>(null);

  const { histogram, stats, validN } = useMemo(() => {
    const values: number[] = [];
    for (const r of rows) {
      const v = tryParseNum(r[colKey]);
      if (v !== null) values.push(v);
    }
    if (values.length === 0) return { histogram: [], stats: null, validN: 0 };
    const s = computeStats(values);
    const bucketCount = Math.min(20, Math.max(5, Math.ceil(Math.sqrt(values.length))));
    const range = s.max - s.min || 1;
    const bucketSize = range / bucketCount;
    const buckets = Array.from({ length: bucketCount }, (_, i) => ({
      label: (s.min + i * bucketSize).toFixed(1),
      count: 0,
    }));
    for (const v of values) {
      const idx = Math.min(Math.floor((v - s.min) / bucketSize), bucketCount - 1);
      buckets[idx].count++;
    }
    return { histogram: buckets, stats: s, validN: values.length };
  }, [rows, colKey]);

  if (!stats) {
    return (
      <div className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-6 text-center">
        Keine gültigen Werte für Verteilung.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      {/* Stats row – visible on page but excluded from chart export */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Min', value: stats.min.toFixed(2) },
          { label: 'Q1', value: stats.q1.toFixed(2) },
          { label: 'Median', value: stats.median.toFixed(2) },
          { label: 'Q3', value: stats.q3.toFixed(2) },
          { label: 'Max', value: stats.max.toFixed(2) },
        ].map((s) => (
          <div key={s.label} className="text-center bg-muted/50 rounded-lg p-2">
            <div className="text-[10px] text-muted-foreground uppercase">{s.label}</div>
            <div className="text-sm font-mono font-medium">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Exportable chart area */}
      <div ref={chartRef} className="bg-card rounded-lg p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-sm font-medium min-w-0">{indicatorLabel ?? 'Verteilung'}{unit ? ` (${unit})` : ''}</h4>
          <div className="shrink-0">
            <DownloadImageButton targetRef={chartRef} filename={`verteilung-${colKey}`} />
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-2">
          Gültige N: {validN} · Mittelwert: {stats.mean.toFixed(2)}
        </div>

        {/* Histogram */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogram}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" label={unit ? { value: unit, position: 'insideBottomRight', offset: -4, fontSize: 10 } : undefined} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(value: number) => [value, 'Anzahl']}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
