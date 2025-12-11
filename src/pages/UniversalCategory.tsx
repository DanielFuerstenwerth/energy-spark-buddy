import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryNav from "@/components/CategoryNav";
import SubNav from "@/components/SubNav";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { useNavigation } from "@/hooks/useNavigation";
import { Info } from "lucide-react";

const UniversalCategory = () => {
  const { category } = useParams<{ category: string }>();
  const { navData, loading } = useNavigation();

  // Check if this is a valid category
  const categoryData = navData?.kategorien.find(k => k.slug === category);
  
  // If loading, show loading state
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

  // If not a valid category, show not found
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
          
          <div className="flex items-center gap-3 p-6 bg-muted/50 rounded-lg border border-border">
            <Info className="h-6 w-6 text-primary flex-shrink-0" />
            <p className="text-muted-foreground">
              Bitte wählen Sie eine Unterkategorie aus der Navigation oben aus.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UniversalCategory;
