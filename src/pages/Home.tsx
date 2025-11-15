import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("dezentrale-ew");

  // Dummy news data
  const newsItems = [{
    slug: "warum-vnb-transparenz",
    title: "Warum VNB-Transparenz jetzt zählt",
    date: "2025-10-20",
    excerpt: "Die Energiewende braucht transparente Netzbetreiber. Erfahren Sie, warum Performance-Transparenz der Schlüssel ist."
  }, {
    slug: "methodik-v0-1",
    title: "Unsere Methodik v0.1",
    date: "2025-10-18",
    excerpt: "Wie wir VNB bewerten: Kategorien, Scores und Datenquellen im Detail."
  }];

  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Transparenz über Verteilnetzbetreiber</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Vergleichen Sie die Performance der Netzbetreiber in verschiedenen Dimensionen, dargestellt auf interaktiven Karten.
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => window.location.href = '/dezentrale-ew/ggv'}
            >
              Zur Karte
            </Button>
          </div>
        </section>

        {/* News Teaser Section */}
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Neuigkeiten</h2>
              <Link to="/news">
                <Button variant="outline">Alle News</Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {newsItems.map(item => (
                <Card key={item.slug} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>
                      <Link to={`/news/${item.slug}`} className="hover:text-primary transition-colors">
                        {item.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>{item.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.excerpt}</p>
                    <Link to={`/news/${item.slug}`} className="text-sm text-primary hover:text-accent transition-colors mt-4 inline-block">
                      Weiterlesen →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;