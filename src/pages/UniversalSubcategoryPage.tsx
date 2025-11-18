import { useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryNav from "@/components/CategoryNav";
import MapGgv, { MapGgvHandle } from "@/components/MapGgv";
import MapLegend from "@/components/MapLegend";
import BenchmarkPanel from "@/components/BenchmarkPanel";
import CommentsSection from "@/components/CommentsSection";
import { useMapData } from "@/hooks/useMapData";
import { useNavigation } from "@/hooks/useNavigation";

const UniversalSubcategoryPage = () => {
  const { category, subcategory } = useParams<{ category: string; subcategory: string }>();
  const [selectedVnb, setSelectedVnb] = useState<{ id: string; name: string } | null>(null);
  const mapRef = useRef<MapGgvHandle>(null);
  
  const route = `${category}/${subcategory}`;
  const { scoreData, loading, error } = useMapData(route);
  const { navData } = useNavigation();

  // Find the title from nav data
  const categoryData = navData?.kategorien.find(k => k.slug === category);
  const subcategoryData = categoryData?.unterkategorien?.find(u => u.slug === subcategory);
  const pageTitle = subcategoryData?.title || subcategory;
  const categoryTitle = categoryData?.title || category;

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
        <CategoryNav />
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
        <CategoryNav />
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
      <CategoryNav />
      
      <main id="main-content" className="flex-grow bg-background">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="mb-4 md:mb-6">
            <p className="text-sm text-muted-foreground mb-2">{categoryTitle}</p>
            <h1 className="text-2xl md:text-3xl font-bold">{pageTitle}</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 md:mb-8">
            <div className="space-y-4">
              <div className="h-[400px] md:h-[500px]">
                <MapGgv ref={mapRef} onRegionClick={handleRegionClick} scoreData={scoreData} />
              </div>
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
            route={route} 
            vnbName={selectedVnb?.name}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UniversalSubcategoryPage;
