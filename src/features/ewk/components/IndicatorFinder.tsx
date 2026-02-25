import type { IndicatorMeta, SourceKey } from '../types';
import IndicatorFinderContent from './IndicatorFinderContent';

interface Props {
  catalog: IndicatorMeta[];
  selectedId: string;
  onSelect: (id: string) => void;
  activeSources: SourceKey[];
  onSourcesChange: (s: SourceKey[]) => void;
  recentIds: string[];
}

export default function IndicatorFinder({
  catalog,
  selectedId,
  onSelect,
  activeSources,
  onSourcesChange,
  recentIds,
}: Props) {
  return (
    <IndicatorFinderContent
      catalog={catalog}
      selectedId={selectedId}
      onSelect={onSelect}
      activeSources={activeSources}
      onSourcesChange={onSourcesChange}
      recentIds={recentIds}
    />
  );
}
