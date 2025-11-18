import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getColor, ScoreData, loadAllVnbNames } from "@/utils/dataLoader";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { VnbCombobox } from "./VnbCombobox";
import { useEffect, useState } from "react";

interface BenchmarkPanelProps {
  scoreData: Map<string, ScoreData>;
  selectedVnb: { id: string; name: string } | null;
  onVnbSelect: (vnbId: string, vnbName: string) => void;
}

interface VnbItem {
  id: string;
  name: string;
  score: number | null;
}

const BenchmarkPanel = ({ scoreData, selectedVnb, onVnbSelect }: BenchmarkPanelProps) => {
  const [allVnbs, setAllVnbs] = useState<VnbItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllVnbs = async () => {
      try {
        const vnbNamesMap = await loadAllVnbNames();
        
        // Create a complete list by merging vnbNamesMap with scoreData
        const completeList: VnbItem[] = [];
        
        vnbNamesMap.forEach((name, id) => {
          const scoreInfo = scoreData.get(id);
          completeList.push({
            id,
            name,
            score: scoreInfo?.score ?? null
          });
        });
        
        // Split into positive and non-positive, then sort
        const positiveVnbs = completeList
          .filter(v => v.score !== null && v.score > 0)
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

        const nonPositiveVnbs = completeList
          .filter(v => v.score === null || v.score <= 0)
          .sort((a, b) => {
            if (a.score === null && b.score === null) return 0;
            if (a.score === null) return 1;
            if (b.score === null) return -1;
            return (b.score ?? 0) - (a.score ?? 0);
          });

        setAllVnbs([...positiveVnbs, ...nonPositiveVnbs]);
        setLoading(false);
      } catch (error) {
        console.error('Error loading all VNBs:', error);
        setLoading(false);
      }
    };

    loadAllVnbs();
  }, [scoreData]);

  const positiveVnbs = allVnbs.filter(v => v.score !== null && v.score > 0);
  const nonPositiveVnbs = allVnbs.filter(v => v.score === null || v.score <= 0);
  const selectedVnbData = selectedVnb ? allVnbs.find(v => v.id === selectedVnb.id) : null;

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Benchmark-Analyse</CardTitle>
        <CardDescription>Vergleich der Verteilnetzbetreiber</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Tabs defaultValue="performance" className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-6">
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

            <div>
              <h4 className="text-sm font-semibold mb-3">
                Ranking aller {allVnbs.length} VNB
                {positiveVnbs.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({positiveVnbs.length} mit positiven Werten, {nonPositiveVnbs.length} mit 0 oder negativen Werten)
                  </span>
                )}
              </h4>
              <div className="relative bg-muted/20 rounded-lg overflow-hidden p-4">
                <div className="flex items-end justify-start h-32 gap-[0.5px]">
                  {/* Positive VNBs - links */}
                  {positiveVnbs.map((vnb) => {
                    const isSelected = vnb.id === selectedVnb?.id;
                    const score = vnb.score ?? 0;
                    
                    const heightPercent = 5 + ((score + 100) / 200) * 95;
                    
                    let fillColor = 'hsl(var(--score-5))';
                    if (score <= 25) fillColor = 'hsl(var(--score-4))';
                    
                    return (
                      <div
                        key={vnb.id}
                        className={`flex-1 cursor-pointer transition-all hover:opacity-80 ${
                          isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: fillColor,
                          minHeight: '4px',
                          minWidth: '1px'
                        }}
                        title={`${vnb.name}: +${score}`}
                        onClick={() => onVnbSelect(vnb.id, vnb.name)}
                      />
                    );
                  })}
                  
                  {/* Visual separator */}
                  {positiveVnbs.length > 0 && nonPositiveVnbs.length > 0 && (
                    <div className="w-1 h-full bg-border/50 mx-1" />
                  )}
                  
                  {/* Non-positive VNBs - rechts */}
                  {nonPositiveVnbs.map((vnb) => {
                    const isSelected = vnb.id === selectedVnb?.id;
                    const score = vnb.score ?? 0;
                    
                    let heightPercent;
                    if (vnb.score === null || vnb.score === 0) {
                      heightPercent = 5;
                    } else {
                      heightPercent = 5 + ((score + 100) / 200) * 95;
                    }
                    
                    let fillColor = 'hsl(var(--score-unknown))';
                    if (vnb.score !== null) {
                      if (score <= -50) fillColor = 'hsl(var(--score-1))';
                      else if (score <= -25) fillColor = 'hsl(var(--score-2))';
                      else if (score <= 0) fillColor = 'hsl(var(--score-3))';
                    }
                    
                    return (
                      <div
                        key={vnb.id}
                        className={`flex-1 cursor-pointer transition-all hover:opacity-80 ${
                          isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: fillColor,
                          minHeight: '4px',
                          minWidth: '1px'
                        }}
                        title={`${vnb.name}: ${vnb.score !== null ? (vnb.score > 0 ? '+' : '') + vnb.score : 'N/A'}`}
                        onClick={() => onVnbSelect(vnb.id, vnb.name)}
                      />
                    );
                  })}
                </div>
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