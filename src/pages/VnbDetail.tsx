import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const VnbDetail = () => {
  const { id } = useParams();

  // Dummy data - will be replaced with real data loader
  const vnb = {
    id: id || "unknown",
    name: "Beispiel Stadtwerke",
    categories: [
      {
        id: "dezentral",
        name: "Dezentrale Energiewende",
        score: null,
        status: "unknown",
        evidence: [],
        updated: null
      },
      {
        id: "digitalisierung",
        name: "Digitalisierung",
        score: null,
        status: "unknown",
        evidence: [],
        updated: null
      },
      {
        id: "flexible",
        name: "Flexible Anschlüsse",
        score: null,
        status: "unknown",
        evidence: [],
        updated: null
      }
    ]
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-muted-foreground/40";
    if (score >= 75) return "bg-accent";
    if (score >= 50) return "bg-[hsl(38,92%,50%)]";
    return "bg-destructive";
  };

  const getScoreLabel = (score: number | null) => {
    if (score === null) return "Keine Daten";
    if (score >= 75) return "Gut";
    if (score >= 50) return "Mittel";
    return "Schlecht";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      
      <main id="main-content" className="flex-1 container mx-auto px-4 py-12">
        <Link to="/" className="text-primary hover:text-accent transition-colors inline-flex items-center gap-2 mb-6">
          ← Zurück zur Karte
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{vnb.name}</h1>
          <p className="text-muted-foreground">VNB-ID: {vnb.id}</p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {vnb.categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-lg ${getScoreColor(category.score)} flex items-center justify-center text-white font-bold text-xl`}>
                    {category.score ?? "?"}
                  </div>
                  <div>
                    <div className="font-semibold">{getScoreLabel(category.score)}</div>
                    {category.updated && (
                      <div className="text-xs text-muted-foreground">
                        Stand: {category.updated}
                      </div>
                    )}
                  </div>
                </div>

                {category.status === "unknown" && (
                  <p className="text-sm text-muted-foreground">
                    Für diese Kategorie liegen noch keine Daten vor.
                  </p>
                )}

                {category.evidence.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Evidenzen:</h4>
                    <ul className="space-y-1">
                      {category.evidence.map((link: string, i: number) => (
                        <li key={i}>
                          <a 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-accent"
                          >
                            Quelle {i + 1} →
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Keine Daten vorhanden</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Für diesen VNB liegen aktuell noch keine vollständigen Bewertungen vor. 
              Helfen Sie uns, die Datenbasis zu erweitern.
            </p>
            <Link to="/mitmachen" className="text-primary hover:text-accent">
              Daten liefern →
            </Link>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default VnbDetail;
