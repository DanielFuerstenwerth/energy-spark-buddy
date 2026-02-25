import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { VnbRow } from '../types';
import { tryParseNum, computeRanks } from '../utils/csvParser';

interface Props {
  rows: VnbRow[];
  colKey: string;
  dataType: string;
}

export default function ComparisonPanel({ rows, colKey, dataType }: Props) {
  const [selectedBnrs, setSelectedBnrs] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const isNumeric = dataType === 'numeric' || dataType === 'binary_0_1';
  const ranks = useMemo(
    () => (isNumeric ? computeRanks(rows, colKey) : new Map()),
    [rows, colKey, isNumeric]
  );

  const suggestions = useMemo(() => {
    if (search.length < 2) return [];
    const q = search.toLowerCase();
    return rows
      .filter(
        (r) =>
          !selectedBnrs.includes(r.bnr) &&
          (r.firmenname.toLowerCase().includes(q) || r.bnr.includes(q))
      )
      .slice(0, 8);
  }, [rows, search, selectedBnrs]);

  const addBnr = (bnr: string) => {
    setSelectedBnrs((prev) => (prev.includes(bnr) ? prev : [...prev, bnr]));
    setSearch('');
  };

  const removeBnr = (bnr: string) => setSelectedBnrs((prev) => prev.filter((b) => b !== bnr));

  const selectedRows = rows.filter((r) => selectedBnrs.includes(r.bnr));

  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <h4 className="text-sm font-medium">Vergleich</h4>

      {/* Search + add */}
      <div className="relative">
        <Input
          placeholder="Netzbetreiber hinzufügen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 text-sm"
        />
        {suggestions.length > 0 && (
          <div className="absolute z-10 top-10 left-0 right-0 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((r) => (
              <button
                key={r.bnr}
                onClick={() => addBnr(r.bnr)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                {r.firmenname}
                <span className="text-xs text-muted-foreground ml-2">{r.bnr}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected chips */}
      {selectedBnrs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedRows.map((r) => (
            <Badge key={r.bnr} variant="secondary" className="gap-1 text-xs">
              {r.firmenname}
              <button onClick={() => removeBnr(r.bnr)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Comparison table */}
      {selectedRows.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Firmenname</TableHead>
              <TableHead className="text-right">Wert</TableHead>
              {isNumeric && <TableHead className="text-right">Rang</TableHead>}
              {isNumeric && <TableHead className="text-right">Perzentil</TableHead>}
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
                  <TableCell className="text-sm">{r.firmenname}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{display}</TableCell>
                  {isNumeric && (
                    <TableCell className="text-right text-sm">
                      {rankInfo ? rankInfo.rank : '–'}
                    </TableCell>
                  )}
                  {isNumeric && (
                    <TableCell className="text-right text-sm">
                      {rankInfo ? `${rankInfo.percentile}%` : '–'}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {selectedBnrs.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Netzbetreiber zum Vergleichen suchen und hinzufügen.
        </p>
      )}
    </div>
  );
}
