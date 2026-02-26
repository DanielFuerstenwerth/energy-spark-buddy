import { useState } from 'react';
import { Search, BarChart3, GitCompareArrows } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { IndicatorMeta, VnbRow, SourceKey } from '../types';
import IndicatorFinder from './IndicatorFinder';
import ScatterYSelector from './ScatterYSelector';
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

const MOBILE_TABS = [
  { key: 'finder' as const, label: 'Indikator', icon: Search },
  { key: 'result' as const, label: 'Ergebnis', icon: BarChart3 },
  { key: 'compare' as const, label: 'Vergleich', icon: GitCompareArrows },
];

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
  const [mobileStep, setMobileStep] = useState<'finder' | 'result' | 'compare'>('result');
  const isMobile = useIsMobile();

  return (
    <>
      <div className="flex gap-0 min-h-[600px] md:min-h-[600px] rounded-xl border border-border overflow-hidden bg-card/30 mb-16 md:mb-0">
        {/* Left: Finder */}
        <div
          className={`${
            mobileStep === 'finder' ? 'block' : 'hidden'
          } md:flex md:w-72 lg:w-80 border-r border-border bg-card/50 md:max-h-[calc(100vh-240px)] flex-col`}
        >
          <div className="flex-1 overflow-hidden">
            <IndicatorFinder
              catalog={catalog}
              selectedId={selectedId}
              onSelect={(id) => {
                onSelectIndicator(id);
                setMobileStep('result');
              }}
              activeSources={activeSources}
              onSourcesChange={onSourcesChange}
              recentIds={recentIds}
            />
          </div>
          <ScatterYSelector
            catalog={catalog}
            selectedId={selectedId}
            scatterYId={scatterYId}
            onScatterYChange={onScatterYChange}
            activeSources={activeSources}
            onSourcesChange={onSourcesChange}
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

      {/* Mobile bottom tab bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border flex md:hidden">
          {MOBILE_TABS.map((tab) => {
            const isActive = mobileStep === tab.key;
            const badge = tab.key === 'compare' && selectedBnrs.length > 0 ? selectedBnrs.length : null;
            return (
              <button
                key={tab.key}
                onClick={() => setMobileStep(tab.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] min-h-[56px] transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className="relative">
                  <tab.icon className="h-5 w-5" />
                  {badge && (
                    <span className="absolute -top-1.5 -right-2.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : ''}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
