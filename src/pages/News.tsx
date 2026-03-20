import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const News = () => {
  const newsItems = [
    {
      slug: "vnb-benchmarking",
      title: "Wo steht Ihr VNB? Jetzt selbst benchmarken.",
      date: "20.03.2026",
      excerpt: "Die BNetzA hat die Daten — jetzt können Sie sie nutzen. Unser neues Benchmarking-Tool zeigt Geschäftsführern von Verteilnetzbetreibern erstmals, wo ihr Unternehmen bei Digitalisierung und Anschlussgeschwindigkeit steht: im Vergleich zu selbst gewählten Peers, auf Basis der offiziellen BNetzA-Erhebung (Datenstand Dezember 2024).\n\nAb 2026 werden diese Zahlen öffentlich — für Kunden, Kommunen und Wettbewerber sichtbar. Wissen Sie bereits, in welchem Quartil Sie liegen?",
      directLink: "https://www.vnb-benchmarking.de",
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
                  {item.excerpt.includes('\n\n') ? (
                    item.excerpt.split('\n\n').map((para, i) => (
                      <p key={i} className="text-muted-foreground mb-4">{para}</p>
                    ))
                  ) : (
                    <p className="text-muted-foreground mb-4">{item.excerpt}</p>
                  )}
                  {(item as any).directLink ? (
                    <LinkOrA className="inline-block mt-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-md hover:bg-accent/90 transition-colors text-sm">
                      Jetzt analysieren →
                    </LinkOrA>
                  ) : (
                    <LinkOrA className="text-primary hover:text-accent transition-colors">
                      Weiterlesen →
                    </LinkOrA>
                  )}
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
