import { Zap, Megaphone, MapPin, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function SurveyHeader() {
  return (
    <>
      <header className="bg-primary text-primary-foreground py-8 px-4 md:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-foreground/10 backdrop-blur-sm mb-4">
            <Zap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-3">Umfrage zur Vor-Ort-Versorgung</h1>
          <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl mx-auto">
            Teilen Sie Ihre Erfahrungen mit GGV, Mieterstrom und Energy Sharing. Ihre Rückmeldung hilft, die Transparenz bei Verteilnetzbetreibern zu verbessern.
          </p>
        </div>
      </header>
    </>
  );
}

export function SurveyUpdateBanner() {
  return (
    <div className="mb-6 rounded-xl border border-border bg-card/60 backdrop-blur overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-start gap-3">
        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-accent/15">
          <Megaphone className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Update: Die erste Auswertung der Umfrage ist erfolgt!
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Wir haben die bisherigen Rückmeldungen ausgewertet und die Ergebnisse aufbereitet.
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 grid sm:grid-cols-2 gap-3">
        <Link
          to="/TaE/GGV"
          className="group flex items-start gap-3 rounded-lg border border-border bg-background/60 p-4 hover:border-primary/40 hover:shadow-sm transition-all"
        >
          <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              Interaktive Karte ansehen
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sehen Sie, welche Netzgebiete bereits Rückmeldungen erhalten haben.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary mt-0.5 shrink-0 transition-colors" />
        </Link>

        <Link
          to="/news/umfrage-ergebnisse-ggv"
          className="group flex items-start gap-3 rounded-lg border border-border bg-background/60 p-4 hover:border-primary/40 hover:shadow-sm transition-all"
        >
          <FileText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              Ergebnisse lesen (PDF)
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Die zusammengefassten Ergebnisse der ersten Auswertung als Download.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary mt-0.5 shrink-0 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
