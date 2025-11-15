import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import MapContainer, { MapContainerHandle } from '@/components/MapContainer';
import BenchmarkPanel from '@/components/BenchmarkPanel';
import CommentsSection from '@/components/CommentsSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useMapData } from '@/hooks/useMapData';
import { ChevronRight } from 'lucide-react';
import MapLegend from '@/components/MapLegend';

const GGVPage = () => {
  const { scoreData, loading, error } = useMapData('GGV');
  const [selectedVnb, setSelectedVnb] = useState<{ id: string; name: string } | null>(null);
  const mapRef = useRef<MapContainerHandle>(null);

  const handleRegionClick = (vnbId: string, vnbName: string) => {
    setSelectedVnb({ id: vnbId, name: vnbName });
  };

  const handleVnbSelect = (vnbId: string, vnbName: string) => {
    setSelectedVnb({ id: vnbId, name: vnbName });
    mapRef.current?.zoomToVnb(vnbId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="hidden md:flex items-center gap-8">
              <Link to="/news" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                News
              </Link>
              <Link to="/methodik" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Methodik
              </Link>
              <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Über uns
              </Link>
              <Link to="/impressum" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Kontakt
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Breadcrumb */}
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Start
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Gemeinschaftliche Gebäudeversorgung</span>
          </div>
        </div>
      </div>

      <main className="flex-1 bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Gemeinschaftliche Gebäudeversorgung (GGV)</h1>
            <p className="text-lg text-muted-foreground">
              Bewertung der VNB-Performance bei der Umsetzung der gemeinschaftlichen Gebäudeversorgung
            </p>
          </div>

          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
              <TabsTrigger value="performance">Performance VNB</TabsTrigger>
              <TabsTrigger value="practices">Best Practices</TabsTrigger>
              <TabsTrigger value="comments">Kommentare</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-6">
              {loading && (
                <Card className="p-8 text-center">
                  <p>Lade Kartendaten...</p>
                </Card>
              )}

              {error && (
                <Card className="p-8 text-center text-destructive">
                  <p>Fehler beim Laden: {error}</p>
                </Card>
              )}

              {!loading && !error && (
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <Card className="p-6">
                      <MapContainer
                        ref={mapRef}
                        onRegionClick={handleRegionClick}
                        scoreData={scoreData}
                      />
                    </Card>
                    <MapLegend />
                  </div>

                  <div className="lg:col-span-1">
                    <BenchmarkPanel
                      scoreData={scoreData}
                      selectedVnb={selectedVnb}
                      onVnbSelect={handleVnbSelect}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="practices">
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-4">Best Practices</h3>
                <p className="text-muted-foreground">
                  Hier werden erfolgreiche Beispiele und bewährte Verfahren für die Umsetzung der GGV präsentiert.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Coming soon: Detaillierte Fallstudien und Best-Practice-Beispiele
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="comments">
              <CommentsSection route="GGV" vnbName={selectedVnb?.name} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GGVPage;
