import { useState } from 'react';
import { Crosshair, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { IndicatorMeta, SourceKey } from '../types';
import IndicatorFinderContent from './IndicatorFinderContent';
import { track } from '@/utils/plausibleTrack';

interface Props {
  catalog: IndicatorMeta[];
  selectedId: string; // current X indicator
  scatterYId: string | null;
  onScatterYChange: (id: string | null) => void;
  activeSources: SourceKey[];
  onSourcesChange: (s: SourceKey[]) => void;
  recentIds: string[];
}

export default function ScatterYSelector({
  catalog,
  selectedId,
  scatterYId,
  onScatterYChange,
  activeSources,
  onSourcesChange,
  recentIds,
}: Props) {
  const [open, setOpen] = useState(false);
  const yIndicator = scatterYId ? catalog.find((i) => i.indicator_id === scatterYId) : null;

  return (
    <div className="p-3 border-b border-border">
      <div className="flex items-center gap-1.5 mb-2">
        <Crosshair className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
          Scatter Y-Achse
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs justify-start flex-1 truncate gap-1.5">
              <Crosshair className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {yIndicator ? yIndicator.display_label : 'Y-Achse wählen…'}
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[340px] sm:w-[400px] p-0 flex flex-col">
            <SheetHeader className="px-4 pt-4 pb-2">
              <SheetTitle className="text-sm">Y-Achse auswählen</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden">
              <IndicatorFinderContent
                catalog={catalog}
                selectedId={scatterYId}
                onSelect={(id) => {
                  onScatterYChange(id);
                  const ind = catalog.find((i) => i.indicator_id === id);
                  track('EWK Scatter Y Select', { indicator: id, label: ind?.display_label ?? id });
                  setOpen(false);
                }}
                activeSources={activeSources}
                onSourcesChange={onSourcesChange}
                recentIds={recentIds}
                numericOnly
                excludeId={selectedId}
                autoFocus
              />
            </div>
          </SheetContent>
        </Sheet>

        {scatterYId && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            onClick={() => onScatterYChange(null)}
            title="Y-Achse entfernen"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Active axes display */}
      {yIndicator && (
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="outline" className="text-[10px] cursor-default">
            X: {catalog.find((i) => i.indicator_id === selectedId)?.display_label ?? selectedId}
          </Badge>
          <Badge variant="secondary" className="text-[10px] cursor-default">
            Y: {yIndicator.display_label}
          </Badge>
        </div>
      )}
    </div>
  );
}
