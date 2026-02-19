import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const News = () => {
  const newsItems = [
    {
      slug: "umfrage-ggv-2026",
      title: "Umfrage zur Gemeinschaftlichen Gebäudeversorgung",
      date: "2026-02-19",
      excerpt: "Gemeinsam mit dem Bündnis Bürgerenergie und weiteren Partnern führen wir eine bundesweite Umfrage zu GGV, Mieterstrom und Energy Sharing durch.",
    },
    {
      slug: "warum-vnb-transparenz",
      title: "Warum VNB-Transparenz jetzt zählt",
      date: "2025-10-20",
      excerpt: "Die Energiewende braucht transparente Netzbetreiber. Erfahren Sie, warum Performance-Transparenz der Schlüssel ist.",
    },
    {
      slug: "methodik-v0-1",
      title: "Unsere Methodik v0.1",
      date: "2025-10-18",
      excerpt: "Wie wir VNB bewerten: Kategorien, Scores und Datenquellen im Detail.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      
      <main id="main-content" className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Neuigkeiten</h1>
        
        <div className="grid gap-6 max-w-3xl">
          {newsItems.map((item) => (
            <Card key={item.slug}>
              <CardHeader>
                <CardTitle>
                  <Link to={`/news/${item.slug}`} className="hover:text-primary transition-colors">
                    {item.title}
                  </Link>
                </CardTitle>
                <CardDescription>{item.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{item.excerpt}</p>
                <Link 
                  to={`/news/${item.slug}`}
                  className="text-primary hover:text-accent transition-colors"
                >
                  Weiterlesen →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default News;
