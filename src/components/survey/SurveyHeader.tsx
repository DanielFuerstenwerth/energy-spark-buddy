import { Zap } from "lucide-react";

export function SurveyHeader() {
  return (
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
  );
}
