import { useState } from "react";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";
import SubcategoryTabs from "@/components/SubcategoryTabs";
import ComingSoonCard from "@/components/ComingSoonCard";
import { Card, CardContent } from "@/components/ui/card";
const Direktvermarktung = () => {
  const [activeCategory, setActiveCategory] = useState("dezentrale-ew");
  return <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      <SubcategoryTabs activeSubcategory="direktvermarktung" />
      
      <main id="main-content" className="flex-grow bg-background">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-6">Direktvermarktung</h1>
          
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <div className="w-full rounded-lg border border-border bg-muted/30 flex items-center justify-center" style={{
              height: '70vh',
              minHeight: '500px'
            }} role="img" aria-label="Platzhalter für zukünftige Karte">
                <p className="text-muted-foreground">folgt</p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <ComingSoonCard />
              
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Geplante Inhalte</h3>
                  <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
                    <li>Prozesse Direktvermarktung</li>
                    <li>Unterstützung durch VNB</li>
                    <li>Technische Voraussetzungen</li>
                    <li>Abrechnungsverfahren</li>
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
export default Direktvermarktung;