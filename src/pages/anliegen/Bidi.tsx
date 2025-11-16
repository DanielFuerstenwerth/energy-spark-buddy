import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryNav from "@/components/CategoryNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AnliegenBidi = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      <CategoryNav />
      
      <main id="main-content" className="flex-grow bg-background">
        <section className="bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Bidirektionales Laden (BiDi)
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Elektrofahrzeuge als mobile Stromspeicher nutzen
              </p>
              <Button size="lg" asChild>
                <Link to="/EHH/elektromobilitaet">Zur interaktiven Karte →</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Was ist bidirektionales Laden?</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-lg mb-4">
                    Bidirektionales Laden ermöglicht es, Elektrofahrzeuge nicht nur aufzuladen, 
                    sondern auch Strom aus der Fahrzeugbatterie zurück ins Netz oder ins Gebäude 
                    zu speisen (Vehicle-to-Grid, V2G / Vehicle-to-Home, V2H).
                  </p>
                  <p className="text-lg">
                    Dies macht E-Autos zu flexiblen Stromspeichern, die zur Netzstabilität 
                    beitragen und die Integration erneuerbarer Energien erleichtern können.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Die Rolle der Verteilnetzbetreiber</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Technische Freigabe</h3>
                    <p className="text-muted-foreground">
                      Erlaubt der VNB bidirektionales Laden und welche technischen 
                      Anforderungen müssen erfüllt werden?
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Anmeldeprozess</h3>
                    <p className="text-muted-foreground">
                      Wie unkompliziert ist die Anmeldung bidirektionaler Ladesysteme?
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Vergütung</h3>
                    <p className="text-muted-foreground">
                      Wie wird eingespeister Strom vergütet? Gibt es Anreize für V2G?
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Pilotprojekte</h3>
                    <p className="text-muted-foreground">
                      Beteiligt sich der VNB an Pilotprojekten für bidirektionales Laden?
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Finden Sie BiDi-freundliche VNBs
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Vergleichen Sie, welche Verteilnetzbetreiber bidirektionales Laden 
                aktiv unterstützen.
              </p>
              <Button size="lg" asChild>
                <Link to="/EHH/elektromobilitaet">Zur Karte →</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AnliegenBidi;
