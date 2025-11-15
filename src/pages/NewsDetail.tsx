import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const NewsDetail = () => {
  const { slug } = useParams();

  const articles: Record<string, { title: string; date: string; author: string; content: string }> = {
    "warum-vnb-transparenz": {
      title: "Warum VNB-Transparenz jetzt zählt",
      date: "2025-10-20",
      author: "VNB-Transparenz Team",
      content: `
Die Energiewende steht und fällt mit der Geschwindigkeit, mit der Elektrifzierungstechnologien, Flexibilitäten und erneuerbare Energien an das Netz angeschlossen werden. 
Verteilnetzbetreiber (VNB) spielen dabei eine zentrale Rolle – doch ihre Performance ist für die Geschäftsführer, Eigentümer, Energieverbraucher, Projektentwickler, 
und die lokale Öffentlichkeit derzeit nicht nachvollziehbar.

## Warum Transparenz wichtig ist

Ohne Vergleichsmöglichkeiten können ineffiziente Prozesse nicht identifiziert werden. 
VNB-Transparenz schafft die Grundlage für:

- **Best Practice Sharing**: Erfolgreiche VNBs können als Vorbild dienen
- **Politische Steuerung**: Regulierungsbehörden erhalten bessere Datengrundlagen
- **Öffentlichen Druck**: Netzbetreiber mit schlechter Performance werden sichtbar

## Unsere Mission

Mit dieser Plattform wollen wir die Performance der >800 deutschen Verteilnetzbetreiber vergleichbar machen. 
Wir bewerten sie in verschiedenen Kategorien:

1. **Elektrifizierung der Haushalte**: Wie werden Haushalte unterstützt, Teil des neuen Energiesystems zu werden?
2. **Teilhabe an der Energiewende**: Wie werden Möglichkeiten zur Teilhabe der Bevölkerung unterstützt?
3. **Elektrifizierung im Gewerbe**: Wie effizient und günstig können Unternehmen Elektrifizierungstechnologien und erneuerbare Energien anschliessen?
4. **Netzanschlüsse in der Hochspannung**: Wie schnell werden neue große Verbraucher und Erzeuger angschlossen, inwiefern kommen innovative Konzepte und Prozesse zum Einsatz?

## Nächste Schritte

In den kommenden Wochen veröffentlichen wir ein ausführliches Hintergrundpapier zur Methodik. 
Parallel bauen wir die Datenbank aus – und dabei sind wir auf Ihre Hilfe angewiesen.

**Haben Sie Erfahrungen mit einem VNB gemacht?** [Teilen Sie Ihre Daten mit uns →](/mitmachen)
      `,
    },
    "methodik-v0-1": {
      title: "Unsere Methodik v0.1",
      date: "2025-10-18",
      author: "VNB-Transparenz Team",
      content: `
Mit der Methodik v0.1 haben wir einen ersten Rahmen geschaffen, um die Performance deutscher Verteilnetzbetreiber messbar und vergleichbar zu machen.

## Die Kategorien

Wir bewerten VNBs in vier Hauptkategorien:

1. **Elektrifizierung der Haushalte**
2. **Teilhabe an der Energiewende**
3. **Elektrifizierung im Gewerbe**
4. **Netzanschlüsse in der Hochspannung**

## Scoring-System

Jede Kategorie wird mit 0-100 Punkten bewertet. Die Gesamtnote ergibt sich aus dem gewichteten Durchschnitt aller Kategorien.

## Datenquellen

Unsere Bewertungen basieren auf:

- Öffentlich verfügbaren Daten der Bundesnetzagentur
- Informationen aus VNB-Webseiten und Preisblättern
- Community-Feedback von Netzkunden
- Auswertung von Anschlusszeiten und Prozessen

## Nächste Schritte

Die Methodik wird kontinuierlich weiterentwickelt. Feedback ist ausdrücklich erwünscht.

**Haben Sie Vorschläge zur Methodik?** [Kontaktieren Sie uns →](/mitmachen)
      `,
    },
  };

  const article = articles[slug || ""] || articles["warum-vnb-transparenz"];

  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />

      <main id="main-content" className="flex-1">
        <article className="container mx-auto px-4 py-12 max-w-3xl">
          <Link
            to="/news"
            className="text-primary hover:text-accent transition-colors inline-flex items-center gap-2 mb-6"
          >
            ← Zurück zu News
          </Link>

          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <time dateTime={article.date}>{article.date}</time>
              <span>•</span>
              <span>{article.author}</span>
            </div>
          </header>

          <div className="prose prose-lg max-w-none">
            {article.content.split("\n\n").map((paragraph, index) => {
              if (paragraph.startsWith("## ")) {
                return (
                  <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                    {paragraph.replace("## ", "")}
                  </h2>
                );
              } else if (paragraph.startsWith("1. ") || paragraph.startsWith("- ")) {
                const items = paragraph.split("\n");
                return (
                  <ul key={index} className="list-disc pl-6 mb-4 space-y-2">
                    {items.map((item, i) => (
                      <li key={i}>
                        {item.replace(/^[1-9]\.\s|-\s/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="mb-4 text-foreground/90 leading-relaxed">
                  {paragraph
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:text-accent">$1</a>')}
                </p>
              );
            })}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;
