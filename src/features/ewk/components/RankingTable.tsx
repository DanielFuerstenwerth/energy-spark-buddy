import { useMemo, useState, useCallback } from 'react';
import { ArrowUpDown, Download, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { VnbRow } from '../types';
import { tryParseNum } from '../utils/csvParser';

interface Props {
  rows: VnbRow[];
  colKey: string;
  dataType: string;
  onAddBnr?: (bnr: string) => void;
}

type SortField = 'rank' | 'firmenname' | 'value';
type SortDir = 'asc' | 'desc';

export default function RankingTable({ rows, colKey, dataType, onAddBnr }: Props) {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(50);

  const debounceRef = useMemo(() => {
    let timer: ReturnType<typeof setTimeout>;
    return (val: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => setDebouncedSearch(val.toLowerCase()), 200);
    };
  }, []);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      debounceRef(e.target.value);
    },
    [debounceRef]
  );

  const isNumeric = dataType === 'numeric' || dataType === 'binary_0_1';

  const ranked = useMemo(() => {
    type Entry = { bnr: string; firmenname: string; raw: string; numVal: number | null; rank: number };
    const entries: Entry[] = rows.map((r) => ({
      bnr: r.bnr,
      firmenname: r.firmenname,
      raw: r[colKey] ?? '',
      numVal: isNumeric ? tryParseNum(r[colKey]) : null,
      rank: 0,
    }));

    if (isNumeric) {
      const valid = entries.filter((e) => e.numVal !== null).sort((a, b) => a.numVal! - b.numVal!);
      valid.forEach((e, i) => (e.rank = i + 1));
      entries.filter((e) => e.numVal === null).forEach((e) => (e.rank = 99999));
    }

    return entries;
  }, [rows, colKey, isNumeric]);

  const sorted = useMemo(() => {
    let list = [...ranked];
    if (debouncedSearch) {
      list = list.filter((e) => e.firmenname.toLowerCase().includes(debouncedSearch));
    }
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'rank':
          cmp = a.rank - b.rank;
          break;
        case 'firmenname':
          cmp = a.firmenname.localeCompare(b.firmenname);
          break;
        case 'value':
          if (a.numVal === null && b.numVal === null) cmp = 0;
          else if (a.numVal === null) cmp = 1;
          else if (b.numVal === null) cmp = -1;
          else cmp = a.numVal - b.numVal;
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [ranked, debouncedSearch, sortField, sortDir]);

  const visible = sorted.slice(0, visibleCount);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const exportCsv = () => {
    const header = 'Rang,Firmenname,Wert\n';
    const csvRows = sorted
      .map((e) => `${e.rank === 99999 ? '' : e.rank},"${e.firmenname}",${e.raw}`)
      .join('\n');
    const blob = new Blob([header + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ranking_${colKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Netzbetreiber suchen…"
            value={search}
            onChange={handleSearch}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1 h-8 text-xs">
          <Download className="h-3 w-3" />
          CSV
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {isNumeric && (
                <TableHead className="w-12 text-xs">
                  <SortButton field="rank" label="#" />
                </TableHead>
              )}
              <TableHead className="text-xs">
                <SortButton field="firmenname" label="Netzbetreiber" />
              </TableHead>
              <TableHead className="text-right w-28 text-xs">
                <SortButton field="value" label="Wert" />
              </TableHead>
              {onAddBnr && <TableHead className="w-8" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isNumeric ? 4 : 3} className="text-center text-muted-foreground py-6 text-xs">
                  Keine Ergebnisse
                </TableCell>
              </TableRow>
            ) : (
              visible.map((e) => (
                <TableRow key={e.bnr}>
                  {isNumeric && (
                    <TableCell className="text-muted-foreground text-xs py-1.5">
                      {e.rank === 99999 ? '–' : e.rank}
                    </TableCell>
                  )}
                  <TableCell className="text-xs py-1.5">{e.firmenname}</TableCell>
                  <TableCell className="text-right font-mono text-xs py-1.5">
                    {e.raw === '' || e.raw === 'nan' ? (
                      <span className="text-muted-foreground">keine Angabe</span>
                    ) : (
                      e.raw
                    )}
                  </TableCell>
                  {onAddBnr && (
                    <TableCell className="py-1.5">
                      <button
                        onClick={() => onAddBnr(e.bnr)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Zum Vergleich hinzufügen"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {visibleCount < sorted.length && (
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={() => setVisibleCount((c) => c + 100)} className="text-xs">
            Weitere laden ({sorted.length - visibleCount} verbleibend)
          </Button>
        </div>
      )}
    </div>
  );
}
