import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";
import SubcategoryTabs from "@/components/SubcategoryTabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ComingSoonCard from "@/components/ComingSoonCard";

const DezentraleEw = () => {
  const [activeCategory, setActiveCategory] = useState("dezentrale-ew");
  const navigate = useNavigate();

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category !== "dezentrale-ew") {
      // Show coming soon for other categories
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
      
      {activeCategory === "dezentrale-ew" ? (
        <>
          <SubcategoryTabs activeSubcategory="overview" />
          
          <main id="main-content" className="flex-grow bg-background">
            <div className="container mx-auto px-6 py-12">
              <div className="max-box-w-4xl mx-auto mb-12">
                <h1 className="text-4xl font-bold mb-4">Dezentrale Energiewende</h1>
                <p className="text-lg text-muted-foreground">
                  Analyse der Verteilnetzbetreiber im Bereich der dezentralen Energiewende. 
                  Bewertung erfolgt anhand verschiedener Kriterien zur Förderung erneuerbarer Energien und dezentraler Erzeugung.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>Gemeinschaftliche Gebäudeversorgung (GGV)</CardTitle>
                    <CardDescription>
                      Bewertung der Unterstützung von gemeinschaftlichen Versorgungskonzepten in Gebäuden
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => navigate('/dezentrale-ew/ggv')}
                      className="w-full"
                    >
                      Zur Karte
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>Mieterstrom</CardTitle>
                    <CardDescription>
                      Analyse der Mieterstrommodelle und deren Umsetzung bei den Netzbetreibern
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => navigate('/dezentrale-ew/mieterstrom')}
                      className="w-full"
                    >
                      Zur Karte
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>§14a EnWG</CardTitle>
                    <CardDescription>
                      Bewertung der Umsetzung steuerbarer Verbrauchseinrichtungen nach §14a EnWG
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => navigate('/dezentrale-ew/14a')}
                      className="w-full"
                    >
                      Zur Karte
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>Direktvermarktung</CardTitle>
                    <CardDescription>
                      Analyse der Prozesse und Unterstützung bei der Direktvermarktung von Strom
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => navigate('/dezentrale-ew/direktvermarktung')}
                      className="w-full"
                    >
                      Zur Karte
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>Weitere Kategorien</CardTitle>
                    <CardDescription>
                      Zusätzliche Bewertungskriterien in Planung
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => navigate('/dezentrale-ew/coming-soon')}
                      className="w-full"
                      variant="outline"
                    >
                      Details ansehen
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </>
      ) : (
        <main id="main-content" className="flex-grow bg-background">
          <div className="container mx-auto px-6 py-12">
            <ComingSoonCard />
          </div>
        </main>
      )}
      
      <Footer />
    </div>
  );
};

export default DezentraleEw;
