import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Reply = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      
      <main id="main-content" className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Right to Reply</h1>

        <div className="max-w-3xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Stellungnahme für VNB</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Als Verteilnetzbetreiber haben Sie das Recht, zu Bewertungen auf dieser Plattform 
                Stellung zu nehmen. Wir verpflichten uns, Ihre Rückmeldung innerhalb von 10 Werktagen 
                zu prüfen und ggf. Korrekturen vorzunehmen.
              </p>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <Label htmlFor="vnb-name">Name des VNB *</Label>
                  <Input 
                    id="vnb-name" 
                    placeholder="z.B. Stadtwerke Beispielstadt"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact-email">Kontakt-E-Mail *</Label>
                  <Input 
                    id="contact-email" 
                    type="email"
                    placeholder="kontakt@vnb-beispiel.de"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Betroffene Kategorie *</Label>
                  <select 
                    id="category"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    required
                  >
                    <option value="">Bitte wählen...</option>
                    <option value="dezentral">Dezentrale Energiewende</option>
                    <option value="digitalisierung">Digitalisierung</option>
                    <option value="flexible">Flexible Anschlüsse</option>
                    <option value="allgemein">Allgemeine Bewertung</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="description">Ihre Stellungnahme *</Label>
                  <Textarea 
                    id="description"
                    placeholder="Bitte beschreiben Sie, welche Informationen korrigiert werden sollten und warum..."
                    rows={8}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="evidence">Evidenz-Links (optional)</Label>
                  <Textarea 
                    id="evidence"
                    placeholder="Links zu Dokumenten, die Ihre Stellungnahme unterstützen (einer pro Zeile)"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Bitte fügen Sie öffentlich zugängliche Links zu Belegen hinzu.
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Hinweis:</strong> Ihre Eingabe wird per E-Mail an unser Team gesendet. 
                    Wir prüfen alle Eingaben manuell und melden uns innerhalb von 10 Werktagen bei Ihnen.
                  </p>
                </div>

                <Button type="submit" size="lg" className="w-full md:w-auto">
                  Stellungnahme einreichen
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prozess & Transparenz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Einreichung</h3>
                <p className="text-sm text-muted-foreground">
                  Sie reichen Ihre Stellungnahme über dieses Formular ein.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Prüfung (max. 10 Werktage)</h3>
                <p className="text-sm text-muted-foreground">
                  Unser Team prüft Ihre Eingabe und die bereitgestellten Evidenzen.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Entscheidung</h3>
                <p className="text-sm text-muted-foreground">
                  Wenn Ihre Evidenzen schlüssig sind, korrigieren wir die Bewertung. 
                  Alle Änderungen werden im Changelog dokumentiert.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4. Kommunikation</h3>
                <p className="text-sm text-muted-foreground">
                  Sie erhalten eine Rückmeldung per E-Mail mit Begründung unserer Entscheidung.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Reply;
