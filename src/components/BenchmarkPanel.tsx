import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getColor, ScoreData } from "@/utils/dataLoader";
import { loadScoresFromGoogleSheets } from "@/utils/googleSheetsLoader";
import { CheckCircle2 } from "lucide-react";
import { VnbCombobox } from "./VnbCombobox";

interface BenchmarkPanelProps {
  selectedVnbId: string | null;
  onVnbSelect: (vnbId: string) => void;
}

const BenchmarkPanel = ({ selectedVnbId, onVnbSelect }: BenchmarkPanelProps) => {
  const [vnbList, setVnbList] = useState<Array<{ id: string; name: string; score: number | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScoresFromGoogleSheets()
      .then((scoresMap) => {
        const list = Array.from(scoresMap.values()).map(scoreData => ({
          id: scoreData.vnb_id,
          name: scoreData.vnb_name,
          score: scoreData.score
        }));

        // Sort by score (nulls last)
        list.sort((a, b) => {
          if (a.score === null) return 1;
          if (b.score === null) return -1;
          return b.score - a.score;
        });

        setVnbList(list);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading VNB data:', error);
        setLoading(false);
      });
  }, []);

  const selectedVnb = vnbList.find(v => v.id === selectedVnbId);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Benchmark-Analyse</CardTitle>
        <CardDescription>Vergleich der Verteilnetzbetreiber</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="benchmark" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="benchmark">Benchmarking</TabsTrigger>
            <TabsTrigger value="methodik">Methodik & Erläuterungen</TabsTrigger>
          </TabsList>

          <TabsContent value="benchmark" className="space-y-6">
            <div>
              <label htmlFor="vnb-select" className="text-sm font-medium mb-2 block">
                VNB auswählen
              </label>
              <VnbCombobox
                vnbList={vnbList}
                selectedVnbId={selectedVnbId}
                onVnbSelect={onVnbSelect}
                disabled={loading}
              />
            </div>

            {selectedVnb && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Punktzahl</p>
                  <p className="text-2xl font-bold" style={{ color: getColor(selectedVnb.score) }}>
                    {selectedVnb.score !== null ? (selectedVnb.score > 0 ? '+' : '') + selectedVnb.score : 'N/A'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Ranking aller VNB</h4>
                  <div className="relative bg-muted/20 rounded-lg overflow-hidden p-4">
                    {/* All VNBs as vertical bars with score-based height */}
                    <div className="flex items-end justify-start h-32 gap-[1px]">
                      {vnbList.map((vnb) => {
                        const isSelected = vnb.id === selectedVnbId;
                        const score = vnb.score ?? 0;
                        
                        // Calculate height based on score (-100 to +100 range)
                        // Map score to height: 0 or null = 5%, -100 = 5%, +100 = 100%
                        let heightPercent;
                        if (vnb.score === null || vnb.score === 0) {
                          heightPercent = 5; // Minimum height for visibility
                        } else {
                          // Map -100...+100 to 5%...100%
                          heightPercent = 5 + ((vnb.score + 100) / 200) * 95;
                        }
                        
                        // Hardcoded colors matching map
                        let fillColor = '#E5E7EB'; // No data
                        if (vnb.score !== null) {
                          if (score <= -50) fillColor = '#7F1D1D';
                          else if (score <= -25) fillColor = '#DC2626';
                          else if (score < 25) fillColor = '#9CA3AF';
                          else if (score < 50) fillColor = '#16A34A';
                          else fillColor = '#065F46';
                        }
                        
                        return (
                          <div
                            key={vnb.id}
                            className="flex-1 min-w-[1px] transition-all cursor-pointer"
                            style={{
                              height: `${heightPercent}%`,
                              backgroundColor: fillColor,
                              opacity: isSelected ? 1 : 0.7,
                              border: isSelected ? '1px solid #000' : 'none'
                            }}
                            title={`${vnb.name}: ${vnb.score !== null ? (vnb.score > 0 ? '+' : '') + vnb.score : 'N/A'}`}
                            onClick={() => onVnbSelect(vnb.id)}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Legend below */}
                    <div className="flex justify-between text-xs text-muted-foreground mt-3 px-1">
                      <span>Beste (+100)</span>
                      <span>{vnbList.length} VNB</span>
                      <span>Schlechteste (-100)</span>
                    </div>
                  </div>
                  
                  {selectedVnb && (
                    <div className="mt-3 text-center text-sm bg-muted/30 p-3 rounded-lg">
                      <span className="font-medium">{selectedVnb.name}</span>
                      <span className="text-muted-foreground"> - Score: </span>
                      <span className="font-semibold" style={{ color: getColor(selectedVnb.score) }}>
                        {selectedVnb.score !== null ? (selectedVnb.score > 0 ? '+' : '') + selectedVnb.score : 'N/A'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-score-excellent" />
                      Best Practices
                    </h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Online-Antragsverfahren</li>
                      <li>• Transparente Fristen</li>
                      <li>• Digitale Dokumentation</li>
                      <li>• Support-Hotline</li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-score-excellent" />
                      Gesetzliche Anforderungen
                    </h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• EnWG §19 Abs. 2</li>
                      <li>• NAV §8</li>
                      <li>• MsbG §21</li>
                      <li>• StromNZV §10</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {!selectedVnb && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Bitte wählen Sie einen VNB aus der Liste oder klicken Sie auf eine Region in der Karte</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="methodik" className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <h4 className="text-base font-semibold mb-3">Bewertungsmethodik GGV</h4>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">Datenquellen</h5>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Öffentliche Websites der VNB</li>
                    <li>Veröffentlichte Geschäftsberichte</li>
                    <li>Informationsanfragen nach IFG/UIG</li>
                    <li>Medienberichte und Pressemitteilungen</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Bewertungskriterien</h5>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Transparenz der Prozesse und Fristen</li>
                    <li>Digitalisierung des Antragsverfahrens</li>
                    <li>Qualität der Beratung und Unterstützung</li>
                    <li>Umsetzungsgeschwindigkeit</li>
                    <li>Anzahl realisierter GGV-Projekte</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Scoring-System</h5>
                  <p className="text-muted-foreground mb-2">
                    Die Bewertung erfolgt auf einer Skala von -100 bis +100 Punkten:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li><strong>+50 bis +100:</strong> Sehr gut - Vorbildliche Umsetzung</li>
                    <li><strong>+25 bis +49:</strong> Gut - Überdurchschnittlich</li>
                    <li><strong>-24 bis +24:</strong> Neutral - Durchschnittlich</li>
                    <li><strong>-49 bis -25:</strong> Verbesserungsbedarf</li>
                    <li><strong>-100 bis -50:</strong> Mangelhaft - Deutliche Defizite</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Aktualisierung</h5>
                  <p className="text-muted-foreground">
                    Die Daten werden quartalsweise aktualisiert. Stand der aktuellen Daten: Oktober 2025.
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
