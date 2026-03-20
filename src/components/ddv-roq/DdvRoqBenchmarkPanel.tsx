import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VnbCombobox } from '@/components/VnbCombobox';
import { useDdvRoqData } from './useDdvRoqData';
import SummaryCards from './SummaryCards';
import ScoreHistogram from './ScoreHistogram';
import DotRankingChart from './DotRankingChart';
import type { DdvRoqVnb } from './types';

interface Props {
  selectedVnb: { id: string; name: string } | null;
  onVnbSelect: (vnbId: string, vnbName: string) => void;
}

export default function DdvRoqBenchmarkPanel({ selectedVnb, onVnbSelect }: Props) {
  const { vnbs, loading } = useDdvRoqData();

  const vnbList = useMemo(
    () => vnbs.map(v => ({ id: v.vnb_id, name: v.vnb_name, score: v.score })),
    [vnbs]
  );

  const selectedData: DdvRoqVnb | null = useMemo(() => {
    if (!selectedVnb) return null;
    return vnbs.find(v => v.vnb_id === selectedVnb.id || v.vnb_name === selectedVnb.name) || null;
  }, [vnbs, selectedVnb]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Smart-Meter-Rollout</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-20">
          <p className="text-muted-foreground text-sm">Lade Daten…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Smart-Meter-Rollout Benchmark</CardTitle>
        <CardDescription>Umsetzungsquote nach §45 MsbG · BNetzA-Daten Q3/2025</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-5">
        {/* VNB Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">VNB auswählen</label>
          <VnbCombobox
            vnbList={vnbList}
            selectedVnbId={selectedVnb?.id || null}
            onVnbSelect={(id: string) => {
              const v = vnbs.find(x => x.vnb_id === id);
              if (v) onVnbSelect(id, v.vnb_name);
            }}
            disabled={false}
          />
        </div>

        {/* Summary Cards */}
        <SummaryCards selectedVnb={selectedData} allVnbs={vnbs} />

        {/* Charts side by side on large screens */}
        <div className="grid grid-cols-1 gap-5">
          <DotRankingChart vnbs={vnbs} selectedVnb={selectedData} onSelectVnb={onVnbSelect} />
          <ScoreHistogram vnbs={vnbs} selectedVnb={selectedData} />
        </div>

        {/* Source note */}
        <p className="text-[10px] text-muted-foreground mt-auto pt-2 border-t border-border">
          Quelle: Bundesnetzagentur Q3/2025, §45 MsbG
        </p>
      </CardContent>
    </Card>
  );
}
