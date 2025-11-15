import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Mitmachen = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />

      <main id="main-content" className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Mitmachen & Daten liefern</h1>

        <div className="max-w-3xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Warum Ihre Daten wichtig sind</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                VNB-Transparenz lebt von den Erfahrungen der Community. Als Projektierer, Installateur oder
                Anlagenbetreiber kennen Sie die Realität vor Ort am besten.
              </p>
              <p className="text-muted-foreground">
                Ihre Eingaben helfen uns, ein realistisches Bild der VNB-Performance zu zeichnen und öffentlichen Druck
                für Verbesserungen aufzubauen.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>So funktioniert der Prozess</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Umfrage ausfüllen</h3>
                  <p className="text-sm text-muted-foreground">
                    Beantworten Sie Fragen zu Ihren Erfahrungen mit einem VNB (Anschlussdauer, Digitalisierung,
                    Flexibilität).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Evidenzen hochladen</h3>
                  <p className="text-sm text-muted-foreground">
                    Optional: Fügen Sie Belege hinzu (E-Mails, Screenshots, Dokumente) – natürlich ohne personenbezogene
                    Daten.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Review & Veröffentlichung</h3>
                  <p className="text-sm text-muted-foreground">
                    Wir prüfen die Eingaben, aggregieren die Daten und aktualisieren die VNB-Scores.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Jetzt Daten liefern</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 opacity-90">
                Die ersten Umfragen werden hier bald verfügbar sein. Registrieren Sie sich für Updates oder kontaktieren
                Sie uns direkt.
              </p>
              <Button variant="secondary" size="lg">
                Dateneingabe (wird 2026 aktiviert)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datenschutz & Anonymität</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ Alle Eingaben werden anonymisiert</li>
                <li>✓ Keine personenbezogenen Daten werden gespeichert</li>
                <li>✓ Optional: Kontaktdaten nur für Rückfragen (getrennt gespeichert)</li>
                <li>✓ Evidenzen werden auf PII geprüft</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Mitmachen;
