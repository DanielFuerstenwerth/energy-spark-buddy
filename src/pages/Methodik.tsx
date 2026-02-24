import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileDown } from "lucide-react";
const Methodik = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />

      <main id="main-content" className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4 text-destructive">Methodik v1.0</h1>

        <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground mb-8">
          <strong>Hinweis:</strong> Das Transparenzportal befindet sich im Aufbau – ebenso wie die Methodik. Erste Analysen erfolgen ab dem 08.03.2026.
        </div>

        <div className="max-w-3xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Bewertungskategorien</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">1. Elektrifizierung der Haushalte</h3>
                <p className="text-muted-foreground">
                  Wie werden Haushalte unterstützt, Teil des neuen Energiesystems zu werden?
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">2. Teilhabe an der Energiewende</h3>
                <p className="text-muted-foreground">
                  Wie werden Möglichkeiten zur Teilhabe der Bevölkerung unterstützt?
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">3. Elektrifizierung im Gewerbe</h3>
                <p className="text-muted-foreground">
                  Wie effizient und günstig können Unternehmen Elektrifizierungstechnologien und erneuerbare Energien
                  anschliessen?
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">4. Netzanschlüsse in der Hochspannung</h3>
                <p className="text-muted-foreground">
                  Wie schnell werden neue große Verbraucher und Erzeuger angschlossen, inwiefern kommen innovative
                  Konzepte und Prozesse zum Einsatz?
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scoring-System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="mb-4">
                    Die Skala zur Bewertung variiert je abgefragtem Parameter und Aggregationslevel des
                    Bewertungskriteriums. Bei Bewertungen wird eine Skala von -100 bis +100 genutzt.{" "}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: "hsl(142, 71%, 37%)"
                        }}>
                      </div>
                      <span>
                        <strong>50–100 Punkte:</strong> Gut (grün)
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: "hsl(38, 92%, 50%)"
                        }}>
                      </div>
                      <span>
                        <strong>0-50 Punkte:</strong> Mittel (gelb/orange)
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: "hsl(0, 72%, 51%)"
                        }}>
                      </div>
                      <span>
                        <strong>-100 - 0 unkte:</strong> Schlecht (rot)
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-muted-foreground/40"></div>
                      <span>
                        <strong>Keine Daten:</strong> Grau
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datenquellen</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Öffentliche VNB-Websites (Antragsformulare, Prozessbeschreibungen)</li>
                <li>• Offizielle Berichte (BNetzA, Landesregulierungsbehörden)</li>
                <li>• Medienberichte und Recherchen</li>
                <li>• Umfragen und Datenerhebungen</li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                Bei fehlenden Daten wird &quot;keine Daten&quot; angezeigt (grau).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changelog</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-semibold">v1.0 (Entwurf) – 2026-02-24</div>
                  <p className="text-sm text-muted-foreground">
                    Erster Entwurf einer Methodik zur Bewertung der Umfrageergebnisse veröffentlicht.
                  </p>
                  <a
                    href="/data/vnb-transparenz.de-Methodik_v1.0.pdf"
                    download
                    className="inline-flex items-center gap-1.5 mt-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <FileDown className="h-4 w-4" />
                    Methodik v1.0 herunterladen (PDF)
                  </a>
                </div>
                <div>
                  <div className="text-sm font-semibold">v0.2 – 2026-02-19</div>
                  <p className="text-sm text-muted-foreground">
                    Umfrage zur GGV, Mieterstrom und Energy Sharing gestartet. Erste Analysen erfolgen ab 08.03.2026.
                  </p>
                </div>
                <div>
                  <div className="text-sm font-semibold">v0.1 – 2025-10-20</div>
                  <p className="text-sm text-muted-foreground">Erste Kategorisierung mit 4 Kategorien eingeführt. Erste Daten für Kategorie "Gemeinschae Version: 3 Kategorien definiert, Scoring-System festgelegt, MVP-Struktur mit Dummy-Daten.



                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>);

};
export default Methodik;