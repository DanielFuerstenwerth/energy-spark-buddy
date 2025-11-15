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
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              Transparenz über Verteilnetzbetreiber
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Datenbasierte Analyse der Performance von Netzbetreibern in Deutschland
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/dezentrale-ew/ggv">Zur Karte</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/methodik">Methodik</Link>
              </Button>
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Aktuelle Inhalte</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Updates, Studien und neue Inhalte auf der Plattform
                </p>
                <Button variant="outline" asChild>
                  <Link to="/news">Zu den News</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Methodik</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Transparente Darstellung der Datenerhebung und Bewertungskriterien
                </p>
                <Button variant="outline" asChild>
                  <Link to="/methodik">Mehr erfahren</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Über uns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Informationen zum Projekt und den beteiligten Organisationen
                </p>
                <Button variant="outline" asChild>
                  <Link to="/about">Mehr erfahren</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NewHome;
