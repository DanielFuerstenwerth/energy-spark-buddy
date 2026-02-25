import { AlertTriangle } from 'lucide-react';

const DisclaimerBanner = () => (
  <div className="sticky top-[57px] z-40 bg-warning/10 border-b border-warning/30 px-4 py-2.5 text-xs text-foreground space-y-0.5">
    <div className="container mx-auto max-w-7xl flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-warning" />
      <div className="space-y-0.5">
        <p className="font-medium">Nicht-offizielle Aufbereitung veröffentlichter Daten der Bundesnetzagentur.</p>
        <p>KI-gestützte Aufbereitung und Visualisierung; kann Fehler enthalten. Maßgeblich sind die Originaldaten.</p>
        <p className="font-medium">Nicht-öffentlich: Arbeits-/Beta-Seite.</p>
      </div>
    </div>
  </div>
);

export default DisclaimerBanner;
