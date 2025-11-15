import { useState, useRef, useCallback } from "react";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";
import SubcategoryTabs from "@/components/SubcategoryTabs";
import MapA14, { MapA14Handle } from "@/components/MapA14";
import MapLegendA14 from "@/components/MapLegendA14";
import BenchmarkPanel from "@/components/BenchmarkPanel";
import { Card, CardContent } from "@/components/ui/card";
const A14 = () => {
  const [activeCategory, setActiveCategory] = useState("dezentrale-ew");
  const [selectedVnbId, setSelectedVnbId] = useState<string | null>(null);
  const mapRef = useRef<MapA14Handle>(null);

  const handleRegionClick = useCallback((vnbId: string, vnbName: string) => {
    setSelectedVnbId(vnbId);
  }, []);

  const handleVnbSelect = (vnbId: string | null) => {
    setSelectedVnbId(vnbId);
    if (vnbId && mapRef.current) {
      mapRef.current.zoomToVnb(vnbId);
    }
  };

  return <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      <SubcategoryTabs activeSubcategory="14a" />
      
      <main id="main-content" className="flex-grow bg-background">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-6">§14a EnWG - Steuerbare Verbrauchseinrichtungen</h1>
          
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <MapA14 ref={mapRef} onRegionClick={handleRegionClick} />
              <MapLegendA14 />
            </div>

            <div className="lg:col-span-5">
              <BenchmarkPanel 
                selectedVnbId={selectedVnbId}
                onVnbSelect={handleVnbSelect}
              />
              
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Geplante Inhalte</h3>
                  <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
                    <li>Umsetzung §14a EnWG</li>
                    <li>Anmeldeprozesse für steuerbare Verbrauchseinrichtungen</li>
                    <li>Netzentgeltreduktion</li>
                    <li>Technische Integration</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>;
};
export default A14;