import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CategoryNav from "@/components/CategoryNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AnliegenZvne = () => {
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
                Zeitvariable Netzentgelte (zvNE)
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Dynamische Netzentgelte für eine flexible Energiewende
              </p>
              <Button size="lg" asChild>
                <Link to="/EHH/zvNE">Zur interaktiven Karte →</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Warum zvNE?</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-lg mb-4">
                    Zeitvariable Netzentgelte ermöglichen es Verbrauchern, ihre Stromnachfrage 
                    flexibel an die Netzauslastung anzupassen und dabei Kosten zu sparen.
                  </p>
                  <p className="text-lg">
                    Gleichzeitig wird das Stromnetz entlastet und die Integration erneuerbarer 
                    Energien erleichtert.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Was macht einen guten VNB aus?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Modul 1 & 2</h3>
                    <p className="text-muted-foreground">
                      Bietet der VNB die Basismodule für zeitvariable Netzentgelte an 
                      und rechnet diese korrekt ab?
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Modul 3</h3>
                    <p className="text-muted-foreground">
                      Wird das erweiterte Modul 3 für noch flexiblere Tarife angeboten?
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">MaKo-Integration</h3>
                    <p className="text-muted-foreground">
                      Kann Modul 3 über die Marktkommunikation (MaKo) bestellt werden?
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Fehlerquote</h3>
                    <p className="text-muted-foreground">
                      Wie zuverlässig ist die Abrechnung? Liegt die Fehlerquote unter 10%?
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
                Finden Sie den besten Tarif
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Vergleichen Sie die Umsetzung zeitvariabler Netzentgelte bei verschiedenen 
                Verteilnetzbetreibern.
              </p>
              <Button size="lg" asChild>
                <Link to="/EHH/zvNE">Zur Karte →</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AnliegenZvne;
