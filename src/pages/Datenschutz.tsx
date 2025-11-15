import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";

const Datenschutz = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      
      <main id="main-content" className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Datenschutz auf einen Blick</h2>
              
              <h3 className="text-xl font-semibold mb-2">Allgemeine Hinweise</h3>
              <p className="text-muted-foreground">
                VNB-Transparenz nimmt den Schutz Ihrer persönlichen Daten sehr ernst. 
                Diese Plattform verzichtet bewusst auf die Erhebung personenbezogener Daten 
                und den Einsatz von Tracking-Technologien.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Datenerfassung auf dieser Website</h2>
              
              <h3 className="text-xl font-semibold mb-2">Welche Daten werden erhoben?</h3>
              <p className="text-muted-foreground mb-4">
                Diese Website erhebt <strong>keine personenbezogenen Daten</strong>. 
                Es werden keine Cookies gesetzt, keine Analytics-Tools verwendet und 
                keine IP-Adressen gespeichert.
              </p>

              <h3 className="text-xl font-semibold mb-2">Server-Logs (GitHub Pages)</h3>
              <p className="text-muted-foreground">
                Diese Seite wird über GitHub Pages gehostet. GitHub kann technische Logs 
                (IP-Adressen, Zeitstempel) für Sicherheits- und Betriebszwecke erfassen. 
                Siehe: <a href="https://docs.github.com/de/pages/getting-started-with-github-pages/about-github-pages#data-collection" 
                className="text-primary hover:text-accent" target="_blank" rel="noopener noreferrer">
                GitHub Pages Datenschutz</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Externe Ressourcen</h2>
              <p className="text-muted-foreground">
                Diese Website lädt <strong>keine externen Ressourcen</strong> von CDNs oder 
                Drittanbietern. Alle Schriftarten, JavaScript-Bibliotheken und Assets werden 
                lokal gehostet.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Community-Eingaben</h2>
              <p className="text-muted-foreground mb-4">
                Wenn Sie über das Formular „Mitmachen" oder „Right to Reply" Daten einreichen:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Alle Eingaben werden anonymisiert</li>
                <li>Kontaktdaten (E-Mail) werden nur für Rückfragen gespeichert (getrennt von Bewertungen)</li>
                <li>Evidenzen (Dokumente, Screenshots) werden auf PII geprüft</li>
                <li>Sie können jederzeit die Löschung Ihrer Kontaktdaten verlangen</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Ihre Rechte</h2>
              <p className="text-muted-foreground">
                Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung 
                der Verarbeitung Ihrer Daten. Kontakt: [kontakt@vnb-transparenz.de]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Keine Cookies</h2>
              <p className="text-muted-foreground">
                Diese Website verwendet <strong>keine Cookies</strong>. 
                Daher ist auch kein Cookie-Banner notwendig.
              </p>
            </section>

            <section className="bg-muted p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Zusammenfassung</h3>
              <p className="text-muted-foreground">
                ✓ Keine personenbezogenen Daten<br />
                ✓ Keine Cookies<br />
                ✓ Keine Tracker<br />
                ✓ Keine externen CDNs<br />
                ✓ EU-Speicher bevorzugt
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Datenschutz;
