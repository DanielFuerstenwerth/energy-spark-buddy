import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Datenschutz = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />

      <main id="main-content" className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Datenschutzerklärung</h1>
            <p className="text-sm text-muted-foreground">Stand: 19.02.2026</p>
          </div>

          {/* 1. Verantwortlicher */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-semibold">1. Verantwortlicher</h2>
              <p className="text-muted-foreground leading-relaxed">
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p className="text-muted-foreground leading-relaxed">
                1000 GW GmbH<br />
                Rollbergstraße 28a<br />
                12053 Berlin, Deutschland<br />
                E-Mail:{" "}
                 <a href="mailto:kontakt@vnb-transparenz.de" className="underline hover:text-foreground">
                   kontakt@vnb-transparenz.de
                 </a>
              </p>

              <Separator />

              <div>
               <p className="font-medium">Datenschutzbeauftragter</p>
                 <p className="text-muted-foreground">
                   Es besteht derzeit keine gesetzliche Benennungspflicht. Ein Datenschutzbeauftragter ist daher nicht benannt.
                 </p>
              </div>
            </CardContent>
          </Card>

          {/* 2. Hosting / Server-Logs */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-semibold">2. Hosting / Server-Logs (GitHub Pages)</h2>
              <p className="text-muted-foreground leading-relaxed">
                Diese Website wird über GitHub Pages bereitgestellt. Beim Aufruf der Website können durch GitHub
                technische Zugriffsdaten verarbeitet werden (z.&nbsp;B. IP-Adresse, Zeitstempel, angeforderte Seite)
                zur Bereitstellung, Sicherheit und Fehleranalyse.
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Rechtsgrundlage:</span>{" "}
                Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO (berechtigtes Interesse an sicherem Betrieb).
              </p>
              <p className="text-muted-foreground">
                Weitere Informationen:{" "}
                <a
                  href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                  className="underline hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Privacy Statement
                </a>{" "}
                und{" "}
                <a
                  href="https://docs.github.com/de/pages/getting-started-with-github-pages/about-github-pages#data-collection"
                  className="underline hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Pages Hinweise
                </a>.
              </p>
            </CardContent>
          </Card>

          {/* 3. Cookies / Tracking */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-semibold">3. Cookies / Local Storage / Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                Wir setzen keine Tracking- oder Marketing-Technologien ein.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Es werden keine einwilligungspflichtigen Cookies oder vergleichbare Technologien eingesetzt.
                Sollten technisch notwendige Speicherungen für die Bereitstellung einzelner Funktionen erforderlich
                sein, erfolgt dies nur im erforderlichen Umfang.
              </p>
            </CardContent>
          </Card>

          {/* 4. E-Mail-Kontakt */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-semibold">4. Kontaktaufnahme per E-Mail</h2>
              <p className="text-muted-foreground leading-relaxed">
                Wenn Sie uns per E-Mail kontaktieren, verarbeiten wir Ihre Angaben (E-Mail-Adresse, Inhalt, Metadaten)
                zur Bearbeitung der Anfrage.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Zweck:</span> Kommunikation und Bearbeitung.
                </li>
                <li>
                  <span className="font-medium text-foreground">Rechtsgrundlage:</span>{" "}
                  Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO (vorvertraglich/vertraglich) oder lit.&nbsp;f DSGVO
                  (allgemeine Anfragen).
                </li>
                <li>
                  <span className="font-medium text-foreground">Speicherdauer:</span> bis Abschluss der Bearbeitung;
                  danach nur, soweit gesetzliche Aufbewahrungspflichten bestehen oder eine Dokumentation erforderlich ist.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 5. Community-Eingaben */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-semibold">5. Community-Eingaben („Mitmachen", „Right to Reply")</h2>
              <p className="text-muted-foreground leading-relaxed">
                Wenn Sie über Formulare Informationen einreichen, verarbeiten wir je nach Inhalt:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Kontaktdaten (z.&nbsp;B. E-Mail) für Rückfragen</li>
                <li>Inhalte Ihrer Einreichung (Bewertungs-/Korrekturhinweise)</li>
                <li>hochgeladene Evidenzen (Dokumente/Screenshots), die personenbezogene Daten enthalten können</li>
              </ul>

              <Separator />

              <div>
                <p className="font-medium">Zwecke</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-1">
                  <li>Prüfung, Qualitätssicherung und Korrektur von Plattforminhalten</li>
                  <li>Durchführung des Right-to-Reply-Verfahrens</li>
                </ul>
              </div>

              <div>
                <p className="font-medium">Rechtsgrundlagen</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-1">
                  <li>Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO (berechtigtes Interesse an korrekten, überprüfbaren Inhalten)</li>
                  <li>ggf. Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;a DSGVO (Einwilligung), wenn Sie uns freiwillig zusätzliche Daten/Evidenzen übermitteln</li>
                </ul>
              </div>

              <div>
                <p className="font-medium">Speicherdauer</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-1">
                  <li>Kontaktdaten: bis Abschluss der Rückfragen/Prüfung, anschließend Löschung oder Anonymisierung</li>
                  <li>Evidenzen: nur solange erforderlich; anschließend Löschung/Schwärzung/Anonymisierung nach Prüfabschluss</li>
                </ul>
              </div>

               <div>
                 <p className="font-medium">Empfänger / Dienstleister</p>
                 <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-1">
                   <li>Supabase Inc. (Backend &amp; Datenbank) –{" "}
                     <a href="https://supabase.com/privacy" className="underline hover:text-foreground" target="_blank" rel="noopener noreferrer">
                       Datenschutzhinweise
                     </a>
                   </li>
                 </ul>
               </div>

               <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                 <strong>Hinweis:</strong> Bitte übermitteln Sie keine sensiblen Daten.
               </div>
            </CardContent>
          </Card>

          {/* 6. Chatbot */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-semibold">6. Chatbot (Beta)</h2>
              <p className="text-muted-foreground leading-relaxed">
                Der Chatbot dient der Orientierung und kann Inhalte ausgeben, die unvollständig oder fehlerhaft sind.
                Wenn Sie den Chat nutzen, können Ihre Eingaben technisch verarbeitet werden, um Antworten zu generieren
                und den Dienst bereitzustellen.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Verarbeitete Daten:</span> Chat-Eingaben; ggf. technische
                  Metadaten (Zeitpunkt, Browser).
                </li>
                <li>
                  <span className="font-medium text-foreground">Zweck:</span> Bereitstellung der Chat-Funktion.
                </li>
                <li>
                  <span className="font-medium text-foreground">Rechtsgrundlage:</span>{" "}
                  Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO (berechtigtes Interesse an Nutzer-Support) bzw. lit.&nbsp;b
                  DSGVO, wenn Teil einer angefragten Leistung.
                </li>
                 <li>
                   <span className="font-medium text-foreground">Dienstleister:</span>{" "}
                   OpenAI, Inc. (Sprachmodell GPT-4o-mini) –{" "}
                   <a href="https://openai.com/privacy" className="underline hover:text-foreground" target="_blank" rel="noopener noreferrer">
                     Datenschutzhinweise
                   </a>;{" "}
                   Supabase Inc. (Backend &amp; Speicherung) –{" "}
                   <a href="https://supabase.com/privacy" className="underline hover:text-foreground" target="_blank" rel="noopener noreferrer">
                     Datenschutzhinweise
                   </a>
                 </li>
                 <li>
                   <span className="font-medium text-foreground">Speicherdauer:</span>{" "}
                   Chat-Verläufe werden dauerhaft gespeichert, um den Gesprächskontext innerhalb einer Sitzung zu erhalten. Eine automatische Löschung findet derzeit nicht statt.
                 </li>
              </ul>
              <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                <strong>Hinweis:</strong> Bitte keine personenbezogenen oder vertraulichen Informationen in den Chat eingeben.
              </div>
            </CardContent>
          </Card>

          {/* 7. Drittland */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-semibold">7. Empfänger, Drittlandübermittlungen</h2>
              <p className="text-muted-foreground leading-relaxed">
                Je nach eingesetzten Dienstleistern kann eine Verarbeitung auch in Drittländern (außerhalb EU/EWR)
                stattfinden. Details ergeben sich aus den Datenschutzinformationen der jeweiligen Dienstleister
                (siehe Links oben) und den von uns getroffenen Einstellungen/Verträgen.
              </p>
              <p className="text-muted-foreground">
                Wir wählen Dienstleister nach Datenschutzkriterien.
              </p>
            </CardContent>
          </Card>

          {/* 8. Ihre Rechte */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-semibold">8. Ihre Rechte</h2>
              <p className="text-muted-foreground leading-relaxed">
                Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
                Datenübertragbarkeit sowie Widerspruch gegen Verarbeitung auf Grundlage von Art.&nbsp;6 Abs.&nbsp;1
                lit.&nbsp;f DSGVO.
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Kontakt:</span>{" "}
                <a href="mailto:kontakt@vnb-transparenz.de" className="underline hover:text-foreground">
                  kontakt@vnb-transparenz.de
                </a>
              </p>
               <p className="text-muted-foreground">
                 <span className="font-medium text-foreground">Beschwerderecht:</span>{" "}
                 Sie können sich bei einer Datenschutz-Aufsichtsbehörde beschweren, insbesondere in dem Mitgliedstaat
                 Ihres Aufenthaltsorts oder des Orts des mutmaßlichen Verstoßes. Zuständig für unseren Sitz ist die{" "}
                 <a href="https://www.datenschutz-berlin.de" className="underline hover:text-foreground" target="_blank" rel="noopener noreferrer">
                   Berliner Beauftragte für Datenschutz und Informationsfreiheit
                 </a>, Friedrichstr.&nbsp;219, 10969 Berlin.
               </p>
            </CardContent>
          </Card>

          {/* 9. Änderungen */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <h2 className="text-xl font-semibold">9. Änderungen</h2>
              <p className="text-muted-foreground leading-relaxed">
                Wir passen diese Datenschutzerklärung an, wenn sich Funktionen oder Rechtslage ändern. Stand siehe oben.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Datenschutz;
