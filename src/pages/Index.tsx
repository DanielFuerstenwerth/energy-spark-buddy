import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("dezentrale-ew");
  const navigate = useNavigate();

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === "dezentrale-ew") {
      navigate("/dezentrale-ew");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
      
      <main id="main-content" className="flex-grow bg-background">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">VNB-Transparenz</h1>
            <p className="text-xl text-muted-foreground">
              Transparenz und Benchmarking für Verteilnetzbetreiber in Deutschland. 
              Vergleichen Sie die Leistung verschiedener Netzbetreiber in den Bereichen 
              dezentrale Energiewende, Digitalisierung und flexible Anschlüsse.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/dezentrale-ew")}>
              <CardHeader>
                <CardTitle>Dezentrale Energiewende</CardTitle>
                <CardDescription>
                  Analyse der Unterstützung für dezentrale Energieerzeugung und -versorgung
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Zur Analyse</Button>
              </CardContent>
            </Card>

            <Card className="opacity-60">
              <CardHeader>
                <CardTitle>Digitalisierung</CardTitle>
                <CardDescription>
                  Bewertung der digitalen Services und Prozesse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>Kommt später</Button>
              </CardContent>
            </Card>

            <Card className="opacity-60">
              <CardHeader>
                <CardTitle>Flexible Anschlüsse</CardTitle>
                <CardDescription>
                  Analyse der Flexibilität bei Netzanschlüssen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>Kommt später</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
