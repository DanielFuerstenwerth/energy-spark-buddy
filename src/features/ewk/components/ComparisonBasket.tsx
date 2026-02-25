import { useMemo } from 'react';
import { X, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import type { IndicatorMeta, VnbRow } from '../types';
import { tryParseNum, computeRanks } from '../utils/csvParser';
import { useState } from 'react';

interface Props {
  rows: VnbRow[];
  indicator: IndicatorMeta | null;
  selectedBnrs: string[];
  onSelectedBnrsChange: (b: string[]) => void;
}

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(280, 68%, 60%)', 'hsl(190, 80%, 45%)', 'hsl(330, 70%, 55%)', 'hsl(60, 75%, 45%)'];

export default function ComparisonBasket({ rows, indicator, selectedBnrs, onSelectedBnrsChange }: Props) {
  const [search, setSearch] = useState('');

  const isNumeric = indicator && (indicator.data_type === 'numeric' || indicator.data_type === 'binary_0_1');
  const colKey = indicator?.column_key ?? '';

  const ranks = useMemo(
    () => (isNumeric && colKey ? computeRanks(rows, colKey) : new Map()),
    [rows, colKey, isNumeric]
  );

  const suggestions = useMemo(() => {
    if (search.length < 2) return [];
    const q = search.toLowerCase();
    return rows
      .filter((r) => !selectedBnrs.includes(r.bnr) && r.firmenname.toLowerCase().includes(q))
      .slice(0, 8);
  }, [rows, search, selectedBnrs]);

  const addBnr = (bnr: string) => {
    if (!selectedBnrs.includes(bnr)) onSelectedBnrsChange([...selectedBnrs, bnr]);
    setSearch('');
  };

  const removeBnr = (bnr: string) => onSelectedBnrsChange(selectedBnrs.filter((b) => b !== bnr));

  const selectedRows = rows.filter((r) => selectedBnrs.includes(r.bnr));

  // Chart data
  const chartData = useMemo(() => {
    if (!isNumeric || !colKey) return [];
    return selectedRows.map((r) => {
      const v = tryParseNum(r[colKey]);
      return { name: r.firmenname.length > 20 ? r.firmenname.slice(0, 20) + '…' : r.firmenname, value: v, bnr: r.bnr };
    }).filter((d) => d.value !== null);
  }, [selectedRows, colKey, isNumeric]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-1.5 mb-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Vergleichskorb</span>
          {selectedBnrs.length > 0 && (
            <Badge variant="secondary" className="text-[10px] ml-auto">{selectedBnrs.length}</Badge>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Netzbetreiber hinzufügen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-20 top-9 left-0 right-0 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((r) => (
                <button
                  key={r.bnr}
                  onClick={() => addBnr(r.bnr)}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                >
                  {r.firmenname}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Chips */}
        {selectedBnrs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedRows.map((r) => (
              <Badge key={r.bnr} variant="secondary" className="gap-1 text-[10px] pr-1">
                {r.firmenname.length > 18 ? r.firmenname.slice(0, 18) + '…' : r.firmenname}
                <button onClick={() => removeBnr(r.bnr)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="rounded-lg border bg-background p-2">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={80} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Table */}
        {selectedRows.length > 0 && indicator && (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs py-1.5">Name</TableHead>
                  <TableHead className="text-xs text-right py-1.5">Wert</TableHead>
                  {isNumeric && <TableHead className="text-xs text-right py-1.5">Rang</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedRows.map((r) => {
                  const raw = r[colKey] ?? '';
                  const rankInfo = ranks.get(r.bnr);
                  const display =
                    raw === '' || raw === 'nan' ? (
                      <span className="text-muted-foreground">keine Angabe</span>
                    ) : (
                      raw
                    );
                  return (
                    <TableRow key={r.bnr}>
                      <TableCell className="text-xs py-1.5">{r.firmenname}</TableCell>
                      <TableCell className="text-right font-mono text-xs py-1.5">{display}</TableCell>
                      {isNumeric && (
                        <TableCell className="text-right text-xs py-1.5">
                          {rankInfo ? `${rankInfo.rank} (P${rankInfo.percentile})` : '–'}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {selectedBnrs.length === 0 && (
          <p className="text-[10px] text-muted-foreground text-center py-6">
            Netzbetreiber suchen und hinzufügen, um sie zu vergleichen.
          </p>
        )}
      </div>
    </div>
  );
}
