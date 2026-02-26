import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { IndicatorMeta, VnbRow, SourceKey } from '../types';
import { SOURCE_LABELS } from '../types';
import RankingTable from './RankingTable';
import DistributionChart from './DistributionChart';
import ScatterPanel from './ScatterPanel';

interface Props {
  indicator: IndicatorMeta | null;
  rows: VnbRow[];
  loading: boolean;
  catalog: IndicatorMeta[];
  selectedBnrs: string[];
  scatterYId: string | null;
  onAddBnr: (bnr: string) => void;
}

export default function ResultPanel({
  indicator,
  rows,
  loading,
  catalog,
  selectedBnrs,
  scatterYId,
  onAddBnr,
}: Props) {
  if (!indicator) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm py-20">
        <div className="text-center space-y-2">
          <p className="text-base">← Indikator auswählen</p>
          <p className="text-xs">Wählen Sie links einen Indikator aus dem Katalog.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const isNumeric = indicator.data_type === 'numeric' || indicator.data_type === 'binary_0_1';
  const showScatter = isNumeric && scatterYId;

  return (
    <div className="p-4 md:p-5 space-y-4">
      {/* Header */}
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold leading-tight">{indicator.display_label}</h2>
        <div className="flex flex-wrap gap-1.5 items-center text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px]">
            {SOURCE_LABELS[indicator.source as SourceKey]}
          </Badge>
          <span>Gültige N: {indicator.non_null_count}</span>
        </div>
      </div>

      {/* Distribution always on top for numeric */}
      {indicator.data_type !== 'text' && (
        <DistributionChart rows={rows} colKey={indicator.column_key} dataType={indicator.data_type} indicatorLabel={indicator.display_label} />
      )}

      {/* Scatter if Y selected */}
      {showScatter && (
        <ScatterPanel
          catalog={catalog}
          currentIndicator={indicator}
          currentRows={rows}
          yIndicatorId={scatterYId}
          highlightedBnrs={selectedBnrs}
        />
      )}

      {/* Ranking */}
      <RankingTable
        rows={rows}
        colKey={indicator.column_key}
        dataType={indicator.data_type}
        onAddBnr={onAddBnr}
      />
    </div>
  );
}
