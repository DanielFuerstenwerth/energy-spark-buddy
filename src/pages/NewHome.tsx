import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NewHome = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />

      {/* Category Navigation with Hovering Dropdowns */}
      <CategoryNav />

      {/* Hero Section */}
      <main id="main-content" className="flex-1">
        <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-foreground leading-tight">
              Transparenz über Verteilnetzbetreiber
            </h1>
            
            <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 leading-relaxed px-2">
              Datenbasierte Analyse der Performance von Netzbetreibern in Deutschland
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto min-h-[44px]">
                <Link to="/TaE/GGV">Zur Karte</Link>
              </Button>
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
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
