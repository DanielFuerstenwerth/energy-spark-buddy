import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const News = () => {
  const newsItems = [
    {
      slug: "vnb-benchmarking",
      title: "Neues Benchmarking-Tool für Verteilnetzbetreiber",
      date: "2026-03-20",
      excerpt: "Ab sofort können sich CEOs und Verteilnetzbetreiber direkt vergleichen: Wo steht mein VNB bei der Energiewendekompetenz? Das neue Benchmarking-Tool macht den Vergleich einfach, datenbasiert und transparent – auf Basis der gleichen BNetzA-Daten wie unser Datenexplorer.",
      directLink: "https://www.vnb-benchmark.de",
    },
    {
      slug: "ewk-datenexplorer",
      title: "Datenexplorer Energiewendekompetenz",
      date: "2026-02-25",
      excerpt: "Neue Beta-Seite: Der Datenexplorer macht veröffentlichte Daten der Bundesnetzagentur zur Energiewendekompetenz durchsuchbar, vergleichbar und auf der Karte sichtbar.",
      directLink: "/EWK-Monitoring-BNetzA",
    },
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
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      
      <main id="main-content" className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Neuigkeiten</h1>
        
        <div className="grid gap-6 max-w-3xl">
          {newsItems.map((item) => {
            const linkTarget = (item as any).directLink || `/news/${item.slug}`;
            const isExternal = linkTarget.startsWith('http');
            const LinkOrA = isExternal
              ? ({ children, className }: any) => <a href={linkTarget} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
              : ({ children, className }: any) => <Link to={linkTarget} className={className}>{children}</Link>;
            return (
              <Card key={item.slug}>
                <CardHeader>
                  <CardTitle>
                    <LinkOrA className="hover:text-primary transition-colors">
                      {item.title}
                    </LinkOrA>
                  </CardTitle>
                  <CardDescription>{item.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{item.excerpt}</p>
                  <LinkOrA className="text-primary hover:text-accent transition-colors">
                    {(item as any).directLink ? 'Ausprobieren →' : 'Weiterlesen →'}
                  </LinkOrA>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default News;
