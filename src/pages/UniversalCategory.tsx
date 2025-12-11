import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryNav from "@/components/CategoryNav";
import SubNav from "@/components/SubNav";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/hooks/useNavigation";
import { ArrowRight } from "lucide-react";

const UniversalCategory = () => {
  const { category } = useParams<{ category: string }>();
  const { navData, loading } = useNavigation();

  const categoryData = navData?.kategorien.find(k => k.slug === category);
  
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
              {categoryData.unterkategorien.map((subcat, index) => (
                <Card 
                  key={subcat.slug} 
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {subcat.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {subcat.kriterien && subcat.kriterien.length > 0 
                        ? `${subcat.kriterien.length} Kriterien` 
                        : 'Übersicht'}
                    </p>
                    <Button variant="outline" asChild className="group/btn">
                      <Link to={`/${category}/${subcat.slug}`}>
                        Zur Übersicht
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
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
