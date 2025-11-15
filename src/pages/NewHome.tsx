import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';

const NewHome = () => {
  const { navData, loading } = useNavigation();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="hidden md:flex items-center gap-8">
              <Link to="/news" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                News
              </Link>
              <Link to="/methodik" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Methodik
              </Link>
              <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Über uns
              </Link>
              <Link to="/impressum" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Kontakt
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main id="main-content" className="flex-1">
        <section className="relative py-24 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Transparenz über Verteilnetzbetreiber
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Vergleichen Sie die Performance der Netzbetreiber in verschiedenen Dimensionen, 
                dargestellt auf interaktiven Karten und Benchmarks.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/GGV">Zur Karte</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/methodik">Methodik</Link>
                </Button>
              </div>
            </div>

            {/* Navigation Structure - Folie 1 Style */}
            {!loading && navData && (
              <div className="max-w-6xl mx-auto">
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 text-center">Kategorien</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {navData.kategorien.map((kategorie) => (
                      <Card
                        key={kategorie.slug}
                        className="group cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                        onMouseEnter={() => setHoveredCategory(kategorie.slug)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center justify-between">
                            {kategorie.title}
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {kategorie.unterkategorien && kategorie.unterkategorien.length > 0 && (
                            <ul className="space-y-2">
                              {kategorie.unterkategorien.map((uk) => (
                                <li key={uk.slug}>
                                  <Link
                                    to={`/${kategorie.slug}/${uk.slug}`}
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    → {uk.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                          {(!kategorie.unterkategorien || kategorie.unterkategorien.length === 0) && (
                            <p className="text-sm text-muted-foreground">Kommt bald</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-6 text-center">Anliegen</h2>
                  <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {navData.anliegen.map((anliegen) => (
                      <Card
                        key={anliegen.slug}
                        className="group cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                        onClick={() => window.location.href = `/${anliegen.slug}`}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center justify-between">
                            {anliegen.title}
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {anliegen.kriterien && anliegen.kriterien.length > 0 && (
                            <ul className="space-y-2">
                              {anliegen.kriterien.map((kr) => (
                                <li key={kr.slug}>
                                  <Link
                                    to={`/${anliegen.slug}/${kr.slug}`}
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    → {kr.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* News Section Teaser */}
        <section className="py-16 bg-muted/40">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Aktuelle Einblicke</h2>
              <Link to="/news">
                <Button variant="outline">Alle News</Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>
                    <Link to="/news/warum-vnb-transparenz" className="hover:text-primary transition-colors">
                      Warum VNB-Transparenz jetzt zählt
                    </Link>
                  </CardTitle>
                  <CardDescription>2025-10-20</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Die Energiewende braucht transparente Netzbetreiber. Erfahren Sie, warum Performance-Transparenz der Schlüssel ist.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>
                    <Link to="/news/methodik-v0-1" className="hover:text-primary transition-colors">
                      Unsere Methodik v0.1
                    </Link>
                  </CardTitle>
                  <CardDescription>2025-10-18</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Wie wir VNB bewerten: Kategorien, Scores und Datenquellen im Detail.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle>Ihre Erfahrungen zählen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    Teilen Sie Ihre Erfahrungen mit Ihrem Netzbetreiber und helfen Sie anderen bei der Bewertung.
                  </p>
                  <Button variant="secondary" asChild className="w-full">
                    <Link to="/mitmachen">Jetzt mitmachen</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NewHome;
