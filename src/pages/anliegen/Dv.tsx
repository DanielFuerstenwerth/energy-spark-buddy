import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryNav from "@/components/CategoryNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AnliegenDv = () => {
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
                Direktvermarktung (DV)
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Stromerzeuger direkt am Markt teilnehmen lassen
              </p>
              <Button size="lg" asChild>
                <Link to="/EHH/pv-direktvermarktung">Zur interaktiven Karte →</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Was ist Direktvermarktung?</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-lg mb-4">
                    Bei der Direktvermarktung verkaufen Betreiber von Erneuerbare-Energien-Anlagen 
                    ihren Strom direkt an der Börse statt die feste EEG-Vergütung zu erhalten.
                  </p>
                  <p className="text-lg">
                    Dies ermöglicht eine marktgetriebene Integration erneuerbarer Energien und 
                    kann für Anlagenbetreiber wirtschaftlich attraktiv sein.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Die Rolle der VNBs</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Anmeldung</h3>
                    <p className="text-muted-foreground">
                      Wie unkompliziert ist die Anmeldung zur Direktvermarktung beim VNB?
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Technische Unterstützung</h3>
                    <p className="text-muted-foreground">
                      Werden die notwendigen technischen Voraussetzungen (z.B. Fernsteuerbarkeit) 
                      vom VNB unterstützt?
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Datenaustausch</h3>
                    <p className="text-muted-foreground">
                      Funktioniert der Datenaustausch mit Direktvermarktern reibungslos?
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Bearbeitungszeit</h3>
                    <p className="text-muted-foreground">
                      Wie schnell werden Anträge bearbeitet und umgesetzt?
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
                Vergleichen Sie die VNBs
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Finden Sie heraus, welche Verteilnetzbetreiber die Direktvermarktung 
                besonders gut unterstützen.
              </p>
              <Button size="lg" asChild>
                <Link to="/EHH/pv-direktvermarktung">Zur Karte →</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AnliegenDv;
