import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { IndicatorMeta, VnbRow, SourceKey } from '../types';
import { SOURCE_LABELS } from '../types';
import RankingTable from './RankingTable';
import DistributionChart from './DistributionChart';
import ComparisonPanel from './ComparisonPanel';
import ScatterPanel from './ScatterPanel';

interface Props {
  indicator: IndicatorMeta | null;
  rows: VnbRow[];
  loading: boolean;
  catalog: IndicatorMeta[];
}

export default function IndicatorDetail({ indicator, rows, loading, catalog }: Props) {
  if (!indicator) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm py-20">
        <div className="text-center space-y-2">
          <p className="text-lg">← Indikator auswählen</p>
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
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isNumeric = indicator.data_type === 'numeric' || indicator.data_type === 'binary_0_1';

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold leading-tight">{indicator.display_label}</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="outline" className="text-[10px]">
            {SOURCE_LABELS[indicator.source as SourceKey]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Gültige N: {indicator.non_null_count}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {indicator.data_type}
          </Badge>
        </div>
      </div>

      {/* Sub-tabs */}
      <Tabs defaultValue="ranking" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="ranking" className="text-xs">Ranking</TabsTrigger>
          {indicator.data_type !== 'text' && (
            <TabsTrigger value="distribution" className="text-xs">Verteilung</TabsTrigger>
          )}
          <TabsTrigger value="compare" className="text-xs">Vergleich</TabsTrigger>
          {isNumeric && (
            <TabsTrigger value="scatter" className="text-xs">Scatter</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="ranking">
          <RankingTable rows={rows} colKey={indicator.column_key} dataType={indicator.data_type} />
        </TabsContent>

        {indicator.data_type !== 'text' && (
          <TabsContent value="distribution">
            <DistributionChart rows={rows} colKey={indicator.column_key} dataType={indicator.data_type} />
          </TabsContent>
        )}

        <TabsContent value="compare">
          <ComparisonPanel rows={rows} colKey={indicator.column_key} dataType={indicator.data_type} />
        </TabsContent>

        {isNumeric && (
          <TabsContent value="scatter">
            <ScatterPanel catalog={catalog} currentIndicator={indicator} currentRows={rows} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
