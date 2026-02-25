import { useMemo, useState, useCallback } from 'react';
import { Search, Star, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import type { IndicatorMeta, SourceKey } from '../types';
import { SOURCE_LABELS, RECOMMENDED_INDICATORS } from '../types';

interface Props {
  catalog: IndicatorMeta[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeSources: SourceKey[];
  onSourcesChange: (s: SourceKey[]) => void;
}

const ALL_SOURCES: SourceKey[] = [
  'Anschlussdauer_2024',
  'Digitalisierungsindex_2024',
  'Umsetzungsquote_2024',
  'Datensatz_EWK_2024',
];

export default function IndicatorList({ catalog, selectedId, onSelect, activeSources, onSourcesChange }: Props) {
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

  const recommended = useMemo(
    () => catalog.filter((ind) => RECOMMENDED_INDICATORS.includes(ind.indicator_id)),
    [catalog]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-border space-y-3">
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
        <div className="flex flex-wrap gap-1.5">
          {ALL_SOURCES.map((src) => (
            <Badge
              key={src}
              variant={activeSources.includes(src) ? 'default' : 'outline'}
              className="cursor-pointer text-[10px] px-2 py-0.5"
              onClick={() => toggleSource(src)}
            >
              {SOURCE_LABELS[src]}
            </Badge>
          ))}
        </div>

        {/* Only with data toggle */}
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <Switch checked={onlyWithData} onCheckedChange={setOnlyWithData} className="scale-75" />
          Nur mit Daten
        </label>
      </div>

      {/* Recommended section */}
      {!debounced && (
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="h-3.5 w-3.5 text-warning" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Empfohlen</span>
          </div>
          <div className="space-y-0.5">
            {recommended.map((ind) => (
              <button
                key={ind.indicator_id}
                onClick={() => onSelect(ind.indicator_id)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors hover:bg-muted ${
                  selectedId === ind.indicator_id ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                }`}
              >
                {ind.display_label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <div className="text-[10px] text-muted-foreground px-2 py-1">
          {filtered.length} Indikatoren
        </div>
        {filtered.map((ind) => (
          <button
            key={ind.indicator_id}
            onClick={() => onSelect(ind.indicator_id)}
            className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors hover:bg-muted ${
              selectedId === ind.indicator_id ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
            }`}
          >
            <span className="line-clamp-2">{ind.display_label}</span>
            <span className="text-[10px] text-muted-foreground">
              {SOURCE_LABELS[ind.source as SourceKey]} · N={ind.non_null_count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
