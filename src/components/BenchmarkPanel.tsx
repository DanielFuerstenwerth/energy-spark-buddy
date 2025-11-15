import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getColor, ScoreData } from "@/utils/dataLoader";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { VnbCombobox } from "./VnbCombobox";

interface BenchmarkPanelProps {
  scoreData: Map<string, ScoreData>;
  selectedVnb: { id: string; name: string } | null;
  onVnbSelect: (vnbId: string, vnbName: string) => void;
}

const BenchmarkPanel = ({ scoreData, selectedVnb, onVnbSelect }: BenchmarkPanelProps) => {
  const vnbList = Array.from(scoreData.values()).map(sd => ({
    id: sd.vnb_id,
    name: sd.vnb_name,
    score: sd.score
  })).sort((a, b) => {
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    return b.score - a.score;
  });

  const selectedVnbData = selectedVnb ? vnbList.find(v => v.id === selectedVnb.id) : null;

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
                vnbList={vnbList}
                selectedVnbId={selectedVnb?.id || null}
                onVnbSelect={(vnbId: string) => {
                  const vnb = vnbList.find(v => v.id === vnbId);
                  if (vnb) onVnbSelect(vnbId, vnb.name);
                }}
                disabled={false}
              />
            </div>

            {selectedVnb && (
              <div className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-sm font-medium mb-2">Punktzahl</p>
                  <p className="text-3xl font-bold" style={{ color: getColor(selectedVnbData?.score ?? null) }}>
                    {selectedVnbData?.score !== null && selectedVnbData?.score !== undefined ? (selectedVnbData.score > 0 ? '+' : '') + selectedVnbData.score : 'N/A'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Ranking aller VNB</h4>
                  <div className="relative bg-muted/20 rounded-lg overflow-hidden p-4">
                    <div className="flex items-end justify-start h-32 gap-[1px]">
                      {vnbList.map((vnb) => {
                        const isSelected = vnb.id === selectedVnb?.id;
                        const score = vnb.score ?? 0;
                        
                        let heightPercent;
                        if (vnb.score === null || vnb.score === 0) {
                          heightPercent = 5;
                        } else {
                          heightPercent = 5 + ((vnb.score + 100) / 200) * 95;
                        }
                        
                        let fillColor = 'hsl(var(--score-unknown))';
                        if (vnb.score !== null) {
                          if (score <= -50) fillColor = 'hsl(var(--score-1))';
                          else if (score <= -25) fillColor = 'hsl(var(--score-2))';
                          else if (score <= 0) fillColor = 'hsl(var(--score-3))';
                          else if (score <= 25) fillColor = 'hsl(var(--score-4))';
                          else fillColor = 'hsl(var(--score-5))';
                        }
                        
                        return (
                          <div
                            key={vnb.id}
                            className={`flex-1 transition-all cursor-pointer ${isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                            style={{
                              height: `${heightPercent}%`,
                              backgroundColor: fillColor,
                              minHeight: '4px'
                            }}
                            title={`${vnb.name}: ${vnb.score !== null ? (vnb.score > 0 ? '+' : '') + vnb.score : 'N/A'}`}
                            onClick={() => onVnbSelect(vnb.id, vnb.name)}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

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
              </div>
            )}

            {!selectedVnb && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Wählen Sie einen VNB aus, um Details anzuzeigen</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="practices" className="flex-1 mt-0">
            <div className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold mb-4">Best Practices zur GGV-Umsetzung</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-score-5/10 border border-score-5/30 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-score-5" />
                      Digitale Prozesse
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Führende VNB bieten vollständig digitalisierte Antragsprozesse an, 
                      die eine schnelle und transparente Abwicklung ermöglichen.
                    </p>
                  </div>

                  <div className="p-4 bg-score-5/10 border border-score-5/30 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-score-5" />
                      Klare Kommunikation
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Transparente Dokumentation der Anforderungen und proaktive 
                      Kommunikation während des gesamten Prozesses.
                    </p>
                  </div>

                  <div className="p-4 bg-score-5/10 border border-score-5/30 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-score-5" />
                      Standardisierung
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Einsatz standardisierter Verfahren und Schnittstellen zur 
                      Vereinfachung der Integration.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Diese Best Practices basieren auf den Erfahrungen führender 
                    Verteilnetzbetreiber und werden kontinuierlich aktualisiert.
                  </p>
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