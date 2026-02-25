import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Search, Star, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import type { IndicatorMeta, SourceKey } from '../types';
import { SOURCE_LABELS, RECOMMENDED_INDICATORS } from '../types';

const ALL_SOURCES: SourceKey[] = [
  'Anschlussdauer_2024',
  'Digitalisierungsindex_2024',
  'Umsetzungsquote_2024',
  'Datensatz_EWK_2024',
];

interface Props {
  catalog: IndicatorMeta[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeSources: SourceKey[];
  onSourcesChange: (s: SourceKey[]) => void;
  recentIds: string[];
  /** If true, only show numeric indicators */
  numericOnly?: boolean;
  /** Exclude this indicator_id from the list */
  excludeId?: string | null;
  /** Auto-focus search on mount */
  autoFocus?: boolean;
}

export default function IndicatorFinderContent({
  catalog,
  selectedId,
  onSelect,
  activeSources,
  onSourcesChange,
  recentIds,
  numericOnly = false,
  excludeId = null,
  autoFocus = false,
}: Props) {
  const [search, setSearch] = useState('');
  const [onlyWithData, setOnlyWithData] = useState(true);
  const [debounced, setDebounced] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [autoFocus]);

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

  const baseCatalog = useMemo(() => {
    let list = catalog;
    if (numericOnly) list = list.filter((i) => i.data_type === 'numeric' || i.data_type === 'binary_0_1');
    if (excludeId) list = list.filter((i) => i.indicator_id !== excludeId);
    return list;
  }, [catalog, numericOnly, excludeId]);

  const filtered = useMemo(() => {
    return baseCatalog.filter((ind) => {
      if (!activeSources.includes(ind.source as SourceKey)) return false;
      if (onlyWithData && ind.non_null_count === 0) return false;
      if (debounced && !ind.display_label.toLowerCase().includes(debounced)) return false;
      return true;
    });
  }, [baseCatalog, activeSources, onlyWithData, debounced]);

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
    () => baseCatalog.filter((ind) => RECOMMENDED_INDICATORS.includes(ind.indicator_id)),
    [baseCatalog]
  );

  const recent = useMemo(
    () => recentIds.map((id) => baseCatalog.find((i) => i.indicator_id === id)).filter(Boolean) as IndicatorMeta[],
    [recentIds, baseCatalog]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filtered.length > 0) {
      onSelect(filtered[0].indicator_id);
    }
  };

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
            ref={searchRef}
            placeholder="Indikator suchen…"
            value={search}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
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
        {!debounced && recommended.length > 0 && (
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

        {/* Clustered list */}
        <div className="p-2 space-y-1">
          <div className="text-[10px] text-muted-foreground px-2 py-1">
            {filtered.length} Indikatoren
          </div>
          {debounced ? (
            filtered.map((ind) => <ItemButton key={ind.indicator_id} ind={ind} />)
          ) : (
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
