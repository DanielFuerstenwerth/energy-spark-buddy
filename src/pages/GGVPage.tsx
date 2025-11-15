import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import CategoryNav from '@/components/CategoryNav';
import MapContainer, { MapContainerHandle } from '@/components/MapContainer';
import BenchmarkPanel from '@/components/BenchmarkPanel';
import CommentsSection from '@/components/CommentsSection';
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
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="hidden md:flex items-center gap-8">
              <Link to="/news" className="text-sm font-medium text-foreground hover:text-primary transition-colors">News</Link>
              <Link to="/methodik" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Methodik</Link>
              <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Über uns</Link>
              <Link to="/impressum" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Kontakt</Link>
            </div>
          </div>
        </nav>
      </header>

      <CategoryNav />

      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Start</Link>
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

          {loading && <Card className="p-8 text-center"><p>Lade Kartendaten...</p></Card>}
          {error && <Card className="p-8 text-center text-destructive"><p>Fehler beim Laden: {error}</p></Card>}

          {!loading && !error && scoreData.size > 0 && (
            <>
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="relative h-[600px] rounded-lg overflow-hidden border border-border">
                    <MapContainer ref={mapRef} scoreData={scoreData} onRegionClick={handleRegionClick} />
                  </div>
                  <MapLegend />
                </div>
                <div className="h-[600px]">
                  <BenchmarkPanel scoreData={scoreData} selectedVnb={selectedVnb} onVnbSelect={handleVnbSelect} />
                </div>
              </div>
              <div className="mt-12">
                <CommentsSection route="/GGV" vnbName={selectedVnb?.name} kriterium="setzt-ggv-als-gmsb-um" />
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GGVPage;