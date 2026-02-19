import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ClipboardList, Upload } from "lucide-react";

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
                  <h3 className="font-semibold mb-1">Umfrage ausfüllen oder Daten einreichen</h3>
                  <p className="text-sm text-muted-foreground">
                    Beantworten Sie unsere strukturierte Umfrage oder reichen Sie Dokumente und Erfahrungsberichte direkt ein.
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
                    Optional: Fügen Sie Belege hinzu (E-Mails, Screenshots, Dokumente).
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
            <CardContent className="space-y-4">
              <p className="opacity-90">
                Wählen Sie, wie Sie Ihre Erfahrungen teilen möchten:
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/Umfrage-GGV">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Umfrage GGV & Co ausfüllen
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/dateninput">
                    <Upload className="h-4 w-4 mr-2" />
                    Erfahrungen & Belege melden
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datenschutz & Anonymität</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ Alle Eingaben werden anonymisiert ausgewertet und veröffentlicht</li>
                <li>✓ Kontaktdaten (E-Mail) werden nur für Rückfragen genutzt und nicht veröffentlicht</li>
                <li>✓ Löschung Ihrer Daten jederzeit möglich auf Anfrage an <a href="mailto:kontakt@vnb-transparenz.de" className="underline hover:text-foreground">kontakt@vnb-transparenz.de</a></li>
                <li>✓ Hochgeladene Evidenzen sind nur für das Redaktionsteam einsehbar</li>
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
