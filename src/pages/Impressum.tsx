import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Impressum = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />

      <main id="main-content" className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold mb-2">Impressum</h1>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-semibold">Diensteanbieter</h2>
              <p className="text-xs text-muted-foreground">Angaben gemäß § 5 DDG</p>
              <p className="text-muted-foreground leading-relaxed">
                1000 GW GmbH<br />
                Rollbergstraße 28a<br />
                12053 Berlin<br />
                Deutschland
              </p>

              <Separator />

              <div>
                <p className="font-medium">Vertreten durch</p>
                <p className="text-muted-foreground">Geschäftsführer: Daniel Fürstenwerth</p>
              </div>

              <Separator />

              <div>
                <p className="font-medium">Kontakt</p>
                <p className="text-muted-foreground">
                  E-Mail:{" "}
                  <a href="mailto:kontakt@vnb-transparenz.de" className="underline hover:text-foreground">
                    kontakt@vnb-transparenz.de
                  </a>
                </p>
              </div>

              <Separator />

              <div>
                <p className="font-medium">Registereintrag</p>
                <p className="text-muted-foreground">
                  Eingetragen im Handelsregister.<br />
                  Registergericht: Amtsgericht Berlin (Charlottenburg)<br />
                  Registernummer: HRB 273150 B
                </p>
              </div>

              <Separator />

              <div>
                <p className="font-medium">Umsatzsteuer</p>
                <p className="text-muted-foreground">USt-IdNr.: DE453210004</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-2">
              <h2 className="text-xl font-semibold">Verantwortlich für journalistisch-redaktionelle Inhalte</h2>
              <p className="text-xs text-muted-foreground">gemäß § 18 Abs. 2 MStV</p>
              <p className="text-muted-foreground leading-relaxed">
                Daniel Fürstenwerth<br />
                Rollbergstraße 28a<br />
                12053 Berlin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-semibold">Haftungshinweise</h2>

              <div>
                <p className="font-medium">Inhalte</p>
                <p className="text-muted-foreground">
                  Wir erstellen die Inhalte mit Sorgfalt, übernehmen aber keine Gewähr für Richtigkeit, Vollständigkeit und Aktualität. VNB-Transparenz ist keine amtliche Stelle; Bewertungen sind nicht rechtsverbindlich.
                </p>
              </div>

              <div>
                <p className="font-medium">Links</p>
                <p className="text-muted-foreground">
                  Für Inhalte externer Links sind ausschließlich deren Betreiber verantwortlich.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-2">
              <h2 className="text-xl font-semibold">Hinweise zum Bewertungsverfahren</h2>
              <p className="text-muted-foreground">
                Bewertungen basieren auf verfügbaren Quellen und Community-Eingaben. Verteilnetzbetreiber können Korrekturen über ein Right-to-Reply-Verfahren anstoßen.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Impressum;
