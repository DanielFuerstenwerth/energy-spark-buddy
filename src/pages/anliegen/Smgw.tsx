import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryNav from "@/components/CategoryNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AnliegenSmgw = () => {
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
                Smart Meter Gateway (SMGW)
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Die Basis für intelligente Stromnetze
              </p>
              <Button size="lg" asChild>
                <Link to="/EHH">Zur Übersicht →</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Was ist ein Smart Meter Gateway?</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-lg mb-4">
                    Das Smart Meter Gateway ist die zentrale Kommunikationseinheit für intelligente 
                    Messsysteme. Es erfasst nicht nur den Stromverbrauch, sondern ermöglicht auch 
                    die sichere Kommunikation zwischen Zähler, Netzbetreiber und weiteren Marktteilnehmern.
                  </p>
                  <p className="text-lg">
                    SMGWs sind Voraussetzung für viele innovative Anwendungen wie zeitvariable 
                    Netzentgelte, Direktvermarktung und intelligente Steuerung von Verbrauchsgeräten.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Bewertungskriterien für VNBs</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Rollout-Geschwindigkeit</h3>
                    <p className="text-muted-foreground">
                      Wie schnell werden Smart Meter Gateways bei Kunden installiert?
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Kundenservice</h3>
                    <p className="text-muted-foreground">
                      Wie gut werden Kunden beim Umstieg auf SMGWs unterstützt?
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Funktionsumfang</h3>
                    <p className="text-muted-foreground">
                      Welche zusätzlichen Funktionen werden über das SMGW ermöglicht?
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Transparenz</h3>
                    <p className="text-muted-foreground">
                      Wie transparent informiert der VNB über SMGW-Kosten und -Nutzen?
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
                Vergleichen Sie die SMGW-Umsetzung
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Finden Sie heraus, welche VNBs beim Smart Meter Rollout führend sind.
              </p>
              <Button size="lg" asChild>
                <Link to="/EHH">Zur Übersicht →</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AnliegenSmgw;
