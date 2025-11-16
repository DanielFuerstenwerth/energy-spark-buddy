import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryNav from "@/components/CategoryNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AnliegenGgv = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      <CategoryNav />
      
      <main id="main-content" className="flex-grow bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Gemeinschaftliche Gebäudeversorgung (GGV)
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Die neue Möglichkeit für Mieterstrom ohne komplizierte Lieferantenstrukturen
              </p>
              <Button size="lg" asChild>
                <Link to="/TaE/ggv">Zur interaktiven Karte →</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Die Herausforderung</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-lg mb-4">
                    Bisher war Mieterstrom mit hohen bürokratischen Hürden verbunden. 
                    Vermieter mussten als Stromlieferanten auftreten und komplexe 
                    Abrechnungsprozesse bewältigen.
                  </p>
                  <p className="text-lg">
                    Die GGV vereinfacht dies erheblich: Der Solarstrom wird direkt 
                    im Gebäude verbraucht, ohne dass der Vermieter zum Stromlieferanten wird.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Die Rolle der Verteilnetzbetreiber</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Anmeldeprozess</h3>
                    <p className="text-muted-foreground">
                      Wie einfach ist es, eine GGV-Anlage beim VNB anzumelden? 
                      Werden digitale Prozesse angeboten?
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Unterstützung</h3>
                    <p className="text-muted-foreground">
                      Bietet der VNB Hilfestellung und klare Informationen für 
                      Vermieter und Betreiber?
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Abrechnung</h3>
                    <p className="text-muted-foreground">
                      Wie transparent und nachvollziehbar ist die Abrechnung 
                      der Reststrommengen?
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Bearbeitungszeit</h3>
                    <p className="text-muted-foreground">
                      Wie schnell werden GGV-Anmeldungen bearbeitet und genehmigt?
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Vergleichen Sie die Verteilnetzbetreiber
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Unsere interaktive Karte zeigt, welche VNBs die GGV besonders gut umsetzen 
                und wo noch Verbesserungspotenzial besteht.
              </p>
              <Button size="lg" asChild>
                <Link to="/TaE/ggv">Zur Karte →</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AnliegenGgv;
