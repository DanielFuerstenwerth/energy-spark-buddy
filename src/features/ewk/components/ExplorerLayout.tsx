import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { IndicatorMeta, VnbRow, SourceKey } from '../types';
import IndicatorFinder from './IndicatorFinder';
import ResultPanel from './ResultPanel';
import ComparisonBasket from './ComparisonBasket';

interface Props {
  catalog: IndicatorMeta[];
  selectedIndicator: IndicatorMeta | null;
  selectedId: string;
  onSelectIndicator: (id: string) => void;
  rows: VnbRow[];
  rowsLoading: boolean;
  selectedBnrs: string[];
  onSelectedBnrsChange: (b: string[]) => void;
  activeSources: SourceKey[];
  onSourcesChange: (s: SourceKey[]) => void;
  scatterYId: string | null;
  onScatterYChange: (id: string | null) => void;
  recentIds: string[];
}

export default function ExplorerLayout({
  catalog,
  selectedIndicator,
  selectedId,
  onSelectIndicator,
  rows,
  rowsLoading,
  selectedBnrs,
  onSelectedBnrsChange,
  activeSources,
  onSourcesChange,
  scatterYId,
  onScatterYChange,
  recentIds,
}: Props) {
  // Mobile step navigation
  const [mobileStep, setMobileStep] = useState<'finder' | 'result' | 'compare'>('result');

  return (
    <>
      {/* Mobile step nav */}
      <div className="flex md:hidden gap-1 mb-3">
        {(['finder', 'result', 'compare'] as const).map((step) => (
          <Button
            key={step}
            variant={mobileStep === step ? 'default' : 'outline'}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setMobileStep(step)}
          >
            {step === 'finder' ? 'Indikator' : step === 'result' ? 'Ergebnis' : 'Vergleich'}
          </Button>
        ))}
      </div>

      <div className="flex gap-0 min-h-[600px] rounded-xl border border-border overflow-hidden bg-card/30">
        {/* Left: Finder */}
        <div
          className={`${
            mobileStep === 'finder' ? 'block' : 'hidden'
          } md:block md:w-72 lg:w-80 border-r border-border bg-card/50 md:max-h-[calc(100vh-240px)] overflow-hidden flex-col`}
        >
          <IndicatorFinder
            catalog={catalog}
            selectedId={selectedId}
            onSelect={(id) => {
              onSelectIndicator(id);
              setMobileStep('result');
            }}
            activeSources={activeSources}
            onSourcesChange={onSourcesChange}
            scatterYId={scatterYId}
            onScatterYChange={onScatterYChange}
            recentIds={recentIds}
          />
        </div>

        {/* Center: Results */}
        <div
          className={`${
            mobileStep === 'result' ? 'block' : 'hidden'
          } md:block flex-1 md:max-h-[calc(100vh-240px)] overflow-y-auto`}
        >
          <ResultPanel
            indicator={selectedIndicator}
            rows={rows}
            loading={rowsLoading}
            catalog={catalog}
            selectedBnrs={selectedBnrs}
            scatterYId={scatterYId}
            onAddBnr={(bnr) => {
              if (!selectedBnrs.includes(bnr)) {
                onSelectedBnrsChange([...selectedBnrs, bnr]);
              }
            }}
          />
        </div>

        {/* Right: Comparison basket */}
        <div
          className={`${
            mobileStep === 'compare' ? 'block' : 'hidden'
          } md:block md:w-72 lg:w-80 border-l border-border bg-card/50 md:max-h-[calc(100vh-240px)] overflow-y-auto`}
        >
          <ComparisonBasket
            rows={rows}
            indicator={selectedIndicator}
            selectedBnrs={selectedBnrs}
            onSelectedBnrsChange={onSelectedBnrsChange}
          />
        </div>
      </div>
    </>
  );
}
