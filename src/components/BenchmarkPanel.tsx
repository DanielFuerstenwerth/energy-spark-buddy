import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getColor, ScoreData, loadAllVnbNames } from "@/utils/dataLoader";
import { CheckCircle2, MessageSquare, Download, Loader2 } from "lucide-react";
import { VnbCombobox } from "./VnbCombobox";
import { Button } from "./ui/button";
import { useEffect, useState, useRef, useCallback } from "react";
import { exportMapContainerAsTiff } from "@/utils/exportTiff";

interface BenchmarkPanelProps {
  scoreData: Map<string, ScoreData>;
  selectedVnb: { id: string; name: string } | null;
  onVnbSelect: (vnbId: string, vnbName: string) => void;
  mapContainerRef?: React.RefObject<HTMLDivElement>;
}

interface VnbItem {
  id: string;
  name: string;
  score: number | null;
}

const BenchmarkPanel = ({ scoreData, selectedVnb, onVnbSelect, mapContainerRef }: BenchmarkPanelProps) => {
  const [allVnbs, setAllVnbs] = useState<VnbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadAllVnbs = async () => {
      try {
        const vnbNamesMap = await loadAllVnbNames();
        const completeList: VnbItem[] = [];
        vnbNamesMap.forEach((name, id) => {
          const scoreInfo = scoreData.get(id);
          completeList.push({ id, name, score: scoreInfo?.score ?? null });
        });
        
        const sorted = completeList.sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity));
        setAllVnbs(sorted);
        setLoading(false);
      } catch (error) {
        console.error('Error loading all VNBs:', error);
        setLoading(false);
      }
    };
    loadAllVnbs();
  }, [scoreData]);

  const handleExportTiff = useCallback(async () => {
    if (!mapContainerRef?.current || exporting) return;
    setExporting(true);
    try {
      // Force Leaflet to recalculate before capture
      const mapEl = mapContainerRef.current.querySelector('.leaflet-container') as HTMLElement;
      if (mapEl && (mapEl as any)._leaflet_id) {
        // Access the Leaflet map instance via the container's internal reference
        const mapInstance = (window as any).L?.DomUtil?.get?.(mapEl)?._leaflet_id;
        // Simpler: dispatch resize to trigger invalidateSize via ResizeObserver
        window.dispatchEvent(new Event('resize'));
        await new Promise(r => setTimeout(r, 300));
      }
      await exportMapContainerAsTiff(mapContainerRef.current);
    } catch (e) {
      console.error('TIFF export failed', e);
    } finally {
      setExporting(false);
    }
  }, [mapContainerRef, exporting]);

  // Compute chart data: sorted by score descending
  const chartVnbs = allVnbs.filter(v => v.score !== null) as (VnbItem & { score: number })[];
  const maxAbs = Math.max(
    ...chartVnbs.map(v => Math.abs(v.score)),
    1
  );

  // Category helpers & counts for highlight layer
  const getBarColor = (score: number): string => {
    if (score === 0) return 'hsl(220, 13%, 91%)';
    if (score > 50) return 'hsl(158, 64%, 32%)';
    if (score > 0) return 'hsl(142, 76%, 45%)';
    if (score >= -50) return 'hsl(20, 85%, 55%)';
    return 'hsl(350, 80%, 35%)';
  };

  const getBarCategory = (score: number): string => {
    if (score === 0) return 'zero';
    if (score > 50) return 'highPos';
    if (score > 0) return 'lowPos';
    if (score >= -50) return 'lowNeg';
    return 'highNeg';
  };

  const categoryCounts: Record<string, number> = {};
  for (const v of chartVnbs) {
    const cat = getBarCategory(v.score);
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  }

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Benchmark-Analyse</CardTitle>
          <CardDescription>Vergleich der Verteilnetzbetreiber</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Lade VNB-Daten...</p>
        </CardContent>
      </Card>
    );
  }

  const selectedVnbData = selectedVnb ? allVnbs.find(v => v.id === selectedVnb.id) : null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Benchmark-Analyse</CardTitle>
            <CardDescription>Vergleich der Verteilnetzbetreiber</CardDescription>
          </div>
          {mapContainerRef && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportTiff}
              disabled={exporting}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              title="Karte als TIFF herunterladen"
            >
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {exporting ? 'Export…' : 'TIFF'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Tabs defaultValue="performance" className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6">
            <TabsTrigger value="performance">Performance VNB</TabsTrigger>
            <TabsTrigger value="practices">Best Practices</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="flex-1 space-y-6 mt-0">
            <div>
              <label htmlFor="vnb-select" className="text-sm font-medium mb-2 block">
                VNB auswählen
              </label>
              <VnbCombobox
                vnbList={allVnbs}
                selectedVnbId={selectedVnb?.id || null}
                onVnbSelect={(vnbId: string) => {
                  const vnb = allVnbs.find(v => v.id === vnbId);
                  if (vnb) onVnbSelect(vnbId, vnb.name);
                }}
                disabled={false}
              />
            </div>

            {selectedVnb && (
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="text-sm font-medium mb-2">Punktzahl</p>
                <p className="text-3xl font-bold" style={{ color: getColor(selectedVnbData?.score ?? null) }}>
                  {selectedVnbData?.score !== null && selectedVnbData?.score !== undefined ? (selectedVnbData.score > 0 ? '+' : '') + selectedVnbData.score : 'N/A'}
                </p>
              </div>
            )}

            {/* Diverging Bar Chart around zero axis */}
            <div>
              <h4 className="text-sm font-semibold mb-3">
                Ranking aller {allVnbs.length} VNB
              </h4>
              <div className="relative bg-muted/20 rounded-lg overflow-hidden" style={{ height: '200px' }}>
                {/* Zero axis label */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border z-10" />
                <div className="absolute left-1/2 -translate-x-1/2 top-1 text-[10px] text-muted-foreground z-10 bg-muted/20 px-1 rounded">0</div>
                
                {/* All-layer: thin 1px bars */}
                <div className="flex items-center h-full px-2 absolute inset-0">
                  {chartVnbs.map((vnb) => {
                    const isSelected = vnb.id === selectedVnb?.id;
                    const score = vnb.score;
                    const barPercent = (Math.abs(score) / maxAbs) * 50;
                    const fillColor = getBarColor(score);
                    const isPositive = score >= 0;

                    return (
                      <div
                        key={vnb.id}
                        className="flex-1 relative cursor-pointer group"
                        style={{ height: '100%', minWidth: '1px' }}
                        title={`${vnb.name}: ${score > 0 ? '+' : ''}${score}`}
                        onClick={() => onVnbSelect(vnb.id, vnb.name)}
                      >
                        <div
                          className={`absolute transition-all ${isSelected ? 'ring-1 ring-primary z-20' : 'hover:brightness-110'}`}
                          style={{
                            backgroundColor: fillColor,
                            height: '100%',
                            width: `${barPercent}%`,
                            ...(isPositive
                              ? { left: '50%' }
                              : { right: '50%' }),
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Highlight-layer: wide bars for rare categories (count ≤ 5), pointer-events disabled */}
                <div className="flex items-center h-full px-2 absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
                  {chartVnbs.map((vnb) => {
                    const score = vnb.score;
                    const cat = getBarCategory(score);
                    const catCount = categoryCounts[cat] ?? 0;
                    const isRare = catCount <= 5 && cat !== 'noData';
                    if (!isRare) return <div key={vnb.id} className="flex-1" style={{ minWidth: '1px' }} />;

                    const barPercent = (Math.abs(score) / maxAbs) * 50;
                    const fillColor = getBarColor(score);
                    const isPositive = score >= 0;

                    return (
                      <div
                        key={vnb.id}
                        className="flex-1 relative"
                        style={{ height: '100%', minWidth: '1px' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            backgroundColor: fillColor,
                            height: '100%',
                            width: '6px',
                            transform: 'translateX(-50%)',
                            ...(isPositive
                              ? { left: `calc(50% + ${barPercent}% / 2)` }
                              : { left: `calc(50% - ${barPercent}% / 2)` }),
                            // center the 6px bar at the same position as the thin bar's tip
                            ...(isPositive
                              ? { left: `calc(50% + ${barPercent * 0.5}%)`, transform: 'translateX(-3px)' }
                              : { right: `calc(50% + ${barPercent * 0.5}%)`, left: 'auto', transform: 'translateX(3px)' }),
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Scale labels */}
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-2">
                <span>−{maxAbs}</span>
                <span>0</span>
                <span>+{maxAbs}</span>
              </div>
            </div>

            {selectedVnb && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Kriterien-Details</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-score-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Setzt GGV als gMSB um</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Weitere Details folgen in Kürze
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium mb-1">Kommentare zu diesem Kriterium</p>
                      <p className="text-xs text-muted-foreground">
                        Scrollen Sie nach unten, um Kommentare zu sehen oder eigene hinzuzufügen
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="practices" className="flex-1 mt-0">
            <div className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold mb-4">Best Practices</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Digitale Prozesse
                    </h4>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Kommunikation
                    </h4>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Standardisierung
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BenchmarkPanel;
