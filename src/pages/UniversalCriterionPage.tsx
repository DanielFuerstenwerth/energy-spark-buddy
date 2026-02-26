import { useParams } from 'react-router-dom';
import { useState, useRef } from 'react';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
import CategoryNav from '@/components/CategoryNav';
import SubNav from '@/components/SubNav';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import Footer from '@/components/Footer';
import MapGgv, { MapGgvHandle } from '@/components/MapGgv';
import MapLegend from '@/components/MapLegend';
import BenchmarkPanel from '@/components/BenchmarkPanel';
import CommentsSection from '@/components/CommentsSection';
import { useMapData } from '@/hooks/useMapData';
import { useNavigation } from '@/hooks/useNavigation';

const UniversalCriterionPage = () => {
  const { category, subcategory, criterion } = useParams<{ 
    category: string; 
    subcategory: string;
    criterion: string;
  }>();
  const [selectedVnb, setSelectedVnb] = useState<{ id: string; name: string } | null>(null);
  const mapRef = useRef<MapGgvHandle>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const route = `${category}/${subcategory}/${criterion}`;
  const { scoreData, loading, error } = useMapData(route);
  const { navData } = useNavigation();

  const handleRegionClick = (vnbId: string) => {
    const vnbData = scoreData.get(vnbId);
    if (vnbData) {
      setSelectedVnb({ id: vnbId, name: vnbData.vnb_name });
    }
  };

  const handleVnbSelect = (vnbId: string, vnbName: string) => {
    setSelectedVnb({ id: vnbId, name: vnbName });
    mapRef.current?.zoomToVnb(vnbId);
  };

  // Find criterion details from navigation
  const categoryData = navData?.kategorien?.find(k => k.slug === category);
  const subcategoryData = categoryData?.unterkategorien?.find(uk => uk.slug === subcategory);
  const criterionData = subcategoryData?.kriterien?.find(k => k.slug === criterion);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Banner />
        <CategoryNav />
        <SubNav category={category!} subcategory={subcategory} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <p>Laden...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Banner />
        <CategoryNav />
        <SubNav category={category!} subcategory={subcategory} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <p className="text-red-500">Fehler beim Laden der Daten: {error}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <Banner />
      <CategoryNav />
      <SubNav category={category!} subcategory={subcategory} />
      
      <main className="flex-grow container mx-auto px-4 md:px-6 py-6 md:py-8" style={{ position: 'relative', zIndex: 1 }}>
        <PageBreadcrumb 
          items={[
            { label: categoryData?.title || category || '', href: `/${category}` },
            { label: subcategoryData?.title || subcategory || '', href: `/${category}/${subcategory}` },
            { label: criterionData?.title || criterion || '' }
          ]} 
        />
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8">
          {criterionData?.title || criterion}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          <div ref={mapContainerRef} className="lg:col-span-2 flex flex-col gap-3">
            <div className="h-[500px] md:h-[650px] rounded-lg border border-border overflow-hidden isolate">
              <MapGgv
                ref={mapRef}
                onRegionClick={handleRegionClick}
                scoreData={scoreData}
              />
            </div>
            <MapLegend />
          </div>
          
          <div className="lg:col-span-1">
            <BenchmarkPanel 
              scoreData={scoreData}
              selectedVnb={selectedVnb}
              onVnbSelect={handleVnbSelect}
              mapContainerRef={mapContainerRef}
            />
          </div>
        </div>

        <CommentsSection 
          route={route}
          vnbName={selectedVnb?.name}
        />
      </main>

      <Footer />
    </div>
  );
};

export default UniversalCriterionPage;
