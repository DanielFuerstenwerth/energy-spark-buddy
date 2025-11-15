import { useState } from "react";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";
import SubcategoryTabs from "@/components/SubcategoryTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ComingSoonCard from "@/components/ComingSoonCard";
const ComingSoon = () => {
  const [activeCategory, setActiveCategory] = useState("dezentrale-ew");
  return <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      <SubcategoryTabs activeSubcategory="coming-soon" />
      
      <main id="main-content" className="flex-grow bg-background">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-6">Weitere Kategorien</h1>
          
          <div className="max-w-4xl space-y-6">
            <ComingSoonCard />
            
            <Card>
              <CardHeader>
                <CardTitle>Mögliche weitere Unterkategorien</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-muted-foreground">•</span>
                    <div>
                      <h4 className="font-medium">Webportale Netzanschluss</h4>
                      <p className="text-sm text-muted-foreground">Analyse der Transparenz und Prozesse beim Einspeisemanagement</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-muted-foreground">•</span>
                    <div>
                      <h4 className="font-medium">Speicherintegration</h4>
                      <p className="text-sm text-muted-foreground">Analyse der Unterstützung der flexiblen Nutzung von Speichern für die Optimierung des Stromeinkaufs</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-muted-foreground">•</span>
                    <div>
                      <h4 className="font-medium">Energy Sharing</h4>
                      <p className="text-sm text-muted-foreground">Analyse der Umsetzung des EnergySharings</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-muted-foreground">•</span>
                    <div>
                      <h4 className="font-medium">...</h4>
                      <p className="text-sm text-muted-foreground">...</p>
                    </div>
                  </li>
                  
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>;
};
export default ComingSoon;