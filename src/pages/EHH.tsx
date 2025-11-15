import { useState, useRef, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";
import MapContainer, { MapContainerHandle } from "@/components/MapContainer";
import MapLegend from "@/components/MapLegend";
import BenchmarkPanel from "@/components/BenchmarkPanel";
import Banner from "@/components/Banner";
import CommentsSection from "@/components/CommentsSection";
import { useMapData } from "@/hooks/useMapData";

const EHH = () => {
  const [activeCategory, setActiveCategory] = useState("EHH");
  const [selectedVnb, setSelectedVnb] = useState<{ id: string; name: string } | null>(null);
  const mapRef = useRef<MapContainerHandle>(null);
  const { scoreData, loading, error } = useMapData("EHH");

  const handleRegionClick = useCallback((vnbId: string, vnbName: string) => {
    setSelectedVnb({ id: vnbId, name: vnbName });
  }, []);

  const handleVnbSelect = (vnbId: string, vnbName: string) => {
    setSelectedVnb({ id: vnbId, name: vnbName });
    if (vnbId && mapRef.current) {
      mapRef.current.zoomToVnb(vnbId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Banner />
        <Header />
        <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <main className="flex-grow bg-background">
          <div className="container mx-auto px-6 py-8">
            <p>Daten werden geladen...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Banner />
        <Header />
        <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <main className="flex-grow bg-background">
          <div className="container mx-auto px-6 py-8">
            <p className="text-destructive">Fehler beim Laden der Daten: {error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      
      <main id="main-content" className="flex-grow bg-background">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-6">Elektrifizierung der Haushalte (EHH)</h1>
          
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <MapContainer 
                ref={mapRef} 
                onRegionClick={handleRegionClick}
                scoreData={scoreData}
              />
              <MapLegend />
            </div>

            <div>
              <BenchmarkPanel 
                scoreData={scoreData}
                selectedVnb={selectedVnb}
                onVnbSelect={handleVnbSelect}
              />
            </div>
          </div>

          <CommentsSection 
            route="EHH" 
            vnbName={selectedVnb?.name}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EHH;
