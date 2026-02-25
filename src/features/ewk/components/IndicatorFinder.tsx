import { useMemo, useState, useCallback } from 'react';
import { Search, Star, Clock, Crosshair } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import type { IndicatorMeta, SourceKey } from '../types';
import { SOURCE_LABELS, RECOMMENDED_INDICATORS } from '../types';

interface Props {
  catalog: IndicatorMeta[];
  selectedId: string;
  onSelect: (id: string) => void;
  activeSources: SourceKey[];
  onSourcesChange: (s: SourceKey[]) => void;
  scatterYId: string | null;
  onScatterYChange: (id: string | null) => void;
  recentIds: string[];
}

const ALL_SOURCES: SourceKey[] = [
  'Anschlussdauer_2024',
  'Digitalisierungsindex_2024',
  'Umsetzungsquote_2024',
  'Datensatz_EWK_2024',
];

export default function IndicatorFinder({
  catalog,
  selectedId,
  onSelect,
  activeSources,
  onSourcesChange,
  scatterYId,
  onScatterYChange,
  recentIds,
}: Props) {
  const [search, setSearch] = useState('');
  const [onlyWithData, setOnlyWithData] = useState(true);
  const [debounced, setDebounced] = useState('');

  const debounceRef = useMemo(() => {
    let timer: ReturnType<typeof setTimeout>;
    return (val: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => setDebounced(val), 200);
    };
  }, []);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      debounceRef(e.target.value.toLowerCase());
    },
    [debounceRef]
  );

  const toggleSource = (src: SourceKey) => {
    if (activeSources.includes(src)) {
      if (activeSources.length > 1) onSourcesChange(activeSources.filter((s) => s !== src));
    } else {
      onSourcesChange([...activeSources, src]);
    }
  };

  const filtered = useMemo(() => {
    return catalog.filter((ind) => {
      if (!activeSources.includes(ind.source as SourceKey)) return false;
      if (onlyWithData && ind.non_null_count === 0) return false;
      if (debounced && !ind.display_label.toLowerCase().includes(debounced)) return false;
      return true;
    });
  }, [catalog, activeSources, onlyWithData, debounced]);

  // Group by cluster
  const grouped = useMemo(() => {
    const map = new Map<string, IndicatorMeta[]>();
    for (const ind of filtered) {
      const cluster = ind.cluster || 'Sonstige';
      if (!map.has(cluster)) map.set(cluster, []);
      map.get(cluster)!.push(ind);
    }
    return map;
  }, [filtered]);

  const recommended = useMemo(
    () => catalog.filter((ind) => RECOMMENDED_INDICATORS.includes(ind.indicator_id)),
    [catalog]
  );

  const recent = useMemo(
    () => recentIds.map((id) => catalog.find((i) => i.indicator_id === id)).filter(Boolean) as IndicatorMeta[],
    [recentIds, catalog]
  );

  const ItemButton = ({ ind }: { ind: IndicatorMeta }) => (
    <button
      onClick={() => onSelect(ind.indicator_id)}
      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors hover:bg-muted ${
        selectedId === ind.indicator_id ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
      }`}
    >
      <span className="line-clamp-2 leading-snug">{ind.display_label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-border space-y-2.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Indikator suchen…"
            value={search}
            onChange={handleSearch}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Source filters */}
        <div className="flex flex-wrap gap-1">
          {ALL_SOURCES.map((src) => (
            <Badge
              key={src}
              variant={activeSources.includes(src) ? 'default' : 'outline'}
              className="cursor-pointer text-[10px] px-1.5 py-0.5"
              onClick={() => toggleSource(src)}
            >
              {SOURCE_LABELS[src]}
            </Badge>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <Switch checked={onlyWithData} onCheckedChange={setOnlyWithData} className="scale-75" />
          Nur mit Daten
        </label>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Recommended */}
        {!debounced && (
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Schnellzugriff</span>
            </div>
            <div className="space-y-0.5">
              {recommended.map((ind) => (
                <ItemButton key={ind.indicator_id} ind={ind} />
              ))}
            </div>
          </div>
        )}

        {/* Recently used */}
        {!debounced && recent.length > 0 && (
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Zuletzt</span>
            </div>
            <div className="space-y-0.5">
              {recent.map((ind) => (
                <ItemButton key={ind.indicator_id} ind={ind} />
              ))}
            </div>
          </div>
        )}

        {/* Scatter Y selector */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Crosshair className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Scatter Y-Achse</span>
          </div>
          <select
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
            value={scatterYId ?? ''}
            onChange={(e) => onScatterYChange(e.target.value || null)}
          >
            <option value="">— nicht aktiv —</option>
            {catalog
              .filter(
                (i) =>
                  (i.data_type === 'numeric' || i.data_type === 'binary_0_1') &&
                  i.non_null_count > 0 &&
                  i.indicator_id !== selectedId
              )
              .map((i) => (
                <option key={i.indicator_id} value={i.indicator_id}>
                  {i.display_label}
                </option>
              ))}
          </select>
        </div>

        {/* Clustered list */}
        <div className="p-2 space-y-1">
          <div className="text-[10px] text-muted-foreground px-2 py-1">
            {filtered.length} Indikatoren
          </div>
          {debounced ? (
            // Flat search results
            filtered.map((ind) => <ItemButton key={ind.indicator_id} ind={ind} />)
          ) : (
            // Grouped by cluster
            Array.from(grouped.entries()).map(([cluster, items]) => (
              <div key={cluster} className="mb-2">
                <div className="text-[10px] font-medium text-muted-foreground px-2.5 py-1 uppercase tracking-wide">
                  {cluster}
                </div>
                {items.map((ind) => (
                  <ItemButton key={ind.indicator_id} ind={ind} />
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
