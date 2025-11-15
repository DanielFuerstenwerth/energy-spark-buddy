import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />

      <main id="main-content" className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Über VNB-Transparenz</h1>

        <div className="max-w-3xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Wer wir sind</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                VNB-Transparenz ist eine unabhängige Initiative zur Schaffung von Transparenz über die Performance
                deutscher Verteilnetzbetreiber.
              </p>
              <p className="text-muted-foreground">
                Wir sind keine amtliche Stelle, sondern eine Community-getriebene Plattform, die auf offenen Daten und
                Erfahrungsberichten basiert.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Warum wir das tun</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Die Energiewende ist eine der größten gesellschaftlichen Aufgaben unserer Zeit. Verteilnetzbetreiber
                spielen dabei eine zentrale Rolle – doch ihre Performance ist oft intransparent.
              </p>
              <p className="text-muted-foreground mb-4">
                Projektierer warten Monate auf Netzanschlüsse, Kommunen haben keine Vergleichsmöglichkeiten, und Best
                Practices bleiben unsichtbar.
              </p>
              <p className="text-muted-foreground">Mit dieser Plattform wollen wir:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Die Energiewende beschleunigen</li>
                <li>Best Practices sichtbar machen</li>
                <li>Regulierungsbehörden bessere Datengrundlagen geben</li>
                <li>Öffentlichen Druck auf ineffiziente VNBs unterstützen</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unsere Prinzipien</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold mb-1">Transparenz</h3>
                <p className="text-sm text-muted-foreground">
                  Unsere Methodik ist transparent, Diskussionen werden perspektivisch öffentlich geführt.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Fairness</h3>
                <p className="text-sm text-muted-foreground">
                  VNBs haben ein Right-to-Reply. Wir korrigieren Fehler zeitnah.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Evidenzbasiert</h3>
                <p className="text-sm text-muted-foreground">Bewertungen basieren auf vertrauenswerten Quellen.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Datenschutz</h3>
                <p className="text-sm text-muted-foreground">Keine personenbezogenen Daten.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kontakt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">Für Fragen, Anregungen oder Kooperationsanfragen:</p>
              <p className="text-muted-foreground">kontakt@vnb-transparenz.de (vorläufig: daniel@1000gw.de)</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default About;
