import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import CategoryNav from '@/components/CategoryNav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NewHome = () => {
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

      {/* Category Navigation with Hovering Dropdowns */}
      <CategoryNav />

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
                  <Link to="/GGV">Beispiel ansehen</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/methodik">Methodik</Link>
                </Button>
              </div>
            </div>

            {/* Quick Access Cards */}
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>Aktuelle Studien</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">Neueste Analysen und Erkenntnisse aus der Energiewende</p>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/news">Zu den News</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>Methodik</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">Wie wir die Daten erheben und bewerten</p>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/methodik">Mehr erfahren</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>Über uns</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">Unser Team und unsere Mission</p>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/about">Kennenlernen</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NewHome;
