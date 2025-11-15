import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";

const Impressum = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />

      <main id="main-content" className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Impressum</h1>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">Angaben gemäß § 5 TMG</h2>
              <p className="text-muted-foreground">
                Daniel Fürstenwerth
                <br />
                1000 GW GmbH
                <br />
                Rollbergstraße 28a <br />
                12053 Berlin
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Kontakt</h2>
              <p className="text-muted-foreground">
                E-Mail: [kontakt@vnb-transparenz.de vorläufig: daniel@1000gw.de]
                <br />
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Verantwortlich für den Inhalt</h2>
              <p className="text-muted-foreground">
                Daniel Fürstenwerth, 1000 GW GmbH
                <br />
                Rollbergstraße 28a, 12053 Berlin
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Haftungsausschluss</h2>

              <h3 className="text-xl font-semibold mb-2">Haftung für Inhalte</h3>
              <p className="text-muted-foreground mb-4">
                Die Inhalte dieser Plattform wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit
                und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. VNB-Transparenz ist keine amtliche
                Stelle und stellt keine rechtlich bindenden Bewertungen dar.
              </p>

              <h3 className="text-xl font-semibold mb-2">Haftung für Links</h3>
              <p className="text-muted-foreground">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
                Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
              <p className="text-muted-foreground">
                Diese Plattform stellt Informationen auf Best-Effort-Basis bereit. Alle Bewertungen basieren auf
                verfügbaren Datenquellen und Community-Eingaben. Wir bieten Verteilnetzbetreibern ein
                Right-to-Reply-Verfahren zur Korrektur von Fehlern.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Impressum;
