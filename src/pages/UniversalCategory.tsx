import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryNav from "@/components/CategoryNav";
import SubNav from "@/components/SubNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/hooks/useNavigation";

const UniversalCategory = () => {
  const { category } = useParams<{ category: string }>();
  const { navData } = useNavigation();

  const categoryData = navData?.kategorien.find(k => k.slug === category);
  
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
      
      <main id="main-content" className="flex-grow bg-background">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-6">{categoryData.title}</h1>

          {/* Mobile: SubNav above content */}
          <div className="lg:hidden">
            <SubNav category={category!} />
          </div>
          
          <div className="flex gap-6">
            {/* Desktop: SubNav sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <SubNav category={category!} />
            </aside>

            <div className="flex-1">
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {categoryData.unterkategorien?.map((subcat) => (
                  <Card key={subcat.slug} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{subcat.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {subcat.kriterien && subcat.kriterien.length > 0 
                          ? `${subcat.kriterien.length} Kriterien` 
                          : 'Übersicht'}
                      </p>
                      <Button variant="outline" asChild>
                        <Link to={`/${encodeURIComponent(category!)}/${encodeURIComponent(subcat.slug)}`}>
                          Zur Übersicht →
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UniversalCategory;
