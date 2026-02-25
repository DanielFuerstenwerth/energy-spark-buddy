import { useState, useMemo } from 'react';
import type { IndicatorMeta, SourceKey } from '../../types';
import { useCsvData } from '../../hooks/useEwkData';
import IndicatorList from '../IndicatorList';
import IndicatorDetail from '../IndicatorDetail';

interface Props {
  catalog: IndicatorMeta[];
}

export default function ExplorerTab({ catalog }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeSources, setActiveSources] = useState<SourceKey[]>([
    'Anschlussdauer_2024',
    'Digitalisierungsindex_2024',
  ]);

  const selectedIndicator = useMemo(
    () => catalog.find((i) => i.indicator_id === selectedId) ?? null,
    [catalog, selectedId]
  );

  const source = selectedIndicator?.source as SourceKey | null;
  const { data: rows, loading } = useCsvData(source);

  return (
    <div className="flex flex-col md:flex-row gap-0 min-h-[600px]">
      {/* Left: Indicator catalog */}
      <div className="md:w-80 lg:w-96 md:border-r border-b md:border-b-0 border-border bg-card/50 md:max-h-[calc(100vh-220px)] md:overflow-hidden flex flex-col rounded-l-xl">
        <IndicatorList
          catalog={catalog}
          selectedId={selectedId}
          onSelect={setSelectedId}
          activeSources={activeSources}
          onSourcesChange={setActiveSources}
        />
      </div>

      {/* Right: Detail area */}
      <div className="flex-1 p-4 md:p-6 md:max-h-[calc(100vh-220px)] md:overflow-y-auto">
        <IndicatorDetail
          indicator={selectedIndicator}
          rows={rows}
          loading={loading}
          catalog={catalog}
        />
      </div>
    </div>
  );
}
