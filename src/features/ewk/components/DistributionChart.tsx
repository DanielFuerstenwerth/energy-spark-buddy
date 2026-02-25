import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { VnbRow } from '../types';
import { tryParseNum, computeStats } from '../utils/csvParser';

interface Props {
  rows: VnbRow[];
  colKey: string;
  dataType: string;
}

export default function DistributionChart({ rows, colKey, dataType }: Props) {
  if (dataType === 'text') {
    return (
      <div className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-6 text-center">
        Für Textindikatoren ist keine Verteilungsdarstellung verfügbar.
      </div>
    );
  }

  if (dataType === 'binary_0_1') {
    return <BinaryDistribution rows={rows} colKey={colKey} />;
  }

  return <NumericDistribution rows={rows} colKey={colKey} />;
}

function BinaryDistribution({ rows, colKey }: { rows: VnbRow[]; colKey: string }) {
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
      <h4 className="text-sm font-medium">Verteilung (Ja/Nein)</h4>
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
    </div>
  );
}

function NumericDistribution({ rows, colKey }: { rows: VnbRow[]; colKey: string }) {
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
      <h4 className="text-sm font-medium">Verteilung</h4>

      {/* Stats row */}
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

      <div className="text-xs text-muted-foreground">
        Gültige N: {validN} · Mittelwert: {stats.mean.toFixed(2)}
      </div>

      {/* Histogram */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={histogram}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
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
  );
}
