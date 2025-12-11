import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryNav from "@/components/CategoryNav";
import SubNav from "@/components/SubNav";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigation } from "@/hooks/useNavigation";
import { buildMapsConfig } from "@/utils/structureLoader";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const UniversalCategory = () => {
  const { category } = useParams<{ category: string }>();
  const { navData, loading } = useNavigation();
  const [mapsConfig, setMapsConfig] = useState<Record<string, any>>({});
  const [configLoaded, setConfigLoaded] = useState(false);

  // Load maps config to check which criteria have data
  useEffect(() => {
    buildMapsConfig().then((config) => {
      setMapsConfig(config);
      setConfigLoaded(true);
    });
  }, []);

  const categoryData = navData?.kategorien.find(k => k.slug === category);
  
  // Helper function to check if a criterion has data in the maps config
  const hasDataForCriterion = (subcatSlug: string, kritSlug: string): boolean => {
    const route = `${category}/${subcatSlug}/${kritSlug}`;
    const routeLower = route.toLowerCase();
    // Check if there's a config entry with a sheet URL
    return !!(mapsConfig[route]?.sheet || mapsConfig[routeLower]?.sheet);
  };
  
  if (loading || !configLoaded) {
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

  if (!categoryData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Banner />
        <Header />
        <CategoryNav />
        <main className="flex-grow bg-background">
          <div className="container mx-auto px-6 py-8">
            <p>Kategorie nicht gefunden</p>
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
      <SubNav category={category!} />
      
      <main id="main-content" className="flex-grow bg-background">
        <div className="container mx-auto px-6 py-8">
          <PageBreadcrumb items={[{ label: categoryData.title }]} />
          <h1 className="text-3xl font-bold mb-8">{categoryData.title}</h1>
          
          {categoryData.unterkategorien && categoryData.unterkategorien.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryData.unterkategorien.map((subcat, index) => {
                const totalKriterien = subcat.kriterien?.length || 0;
                // Count criteria that have data in maps config
                const ratedKriterien = subcat.kriterien?.filter(k => 
                  hasDataForCriterion(subcat.slug, k.slug)
                ).length || 0;
                const progressPercent = totalKriterien > 0 ? (ratedKriterien / totalKriterien) * 100 : 0;
                
                return (
                  <Card 
                    key={subcat.slug} 
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {subcat.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {totalKriterien > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              {ratedKriterien} von {totalKriterien} Kriterien
                            </span>
                            <span className="font-medium text-primary">{Math.round(progressPercent)}%</span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Übersicht</p>
                      )}
                      
                      <Button variant="outline" asChild className="w-full group/btn">
                        <Link to={`/${category}/${subcat.slug}`}>
                          Zur Übersicht
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">Keine Unterkategorien verfügbar.</p>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UniversalCategory;
