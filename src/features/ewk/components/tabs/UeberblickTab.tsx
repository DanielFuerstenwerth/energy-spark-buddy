import { ArrowRight, Download, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onNavigate: (tab: string) => void;
}

export default function UeberblickTab({ onNavigate }: Props) {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Einleitung */}
      <div className="bg-card rounded-2xl border p-6 md:p-8 space-y-4">
        <p className="text-sm leading-relaxed text-foreground">
          Die Bundesnetzagentur will besser nachvollziehen können, wie gut Netzbetreiber die Energiewende im Alltag
          umsetzen – zum Beispiel bei Netzanschlüssen und digitalen Prozessen. Dafür hat sie die Verteilnetzbetreiber
          abgefragt. Die Werte auf dieser Seite sind die Antworten der Netzbetreiber auf diese Abfrage; sie wurden
          nicht von uns erhoben oder geprüft.
        </p>
        <p className="text-sm text-muted-foreground">
          Berichtsjahr: 2024. Datenstand der Veröffentlichung: 22.12.2025.
        </p>
      </div>

      {/* Quelle */}
      <div className="bg-muted/50 rounded-2xl border p-6 space-y-2">
        <h3 className="text-sm font-semibold">Quelle</h3>
        <p className="text-xs text-muted-foreground break-all">
          Quelle: Download am 25.02.2026:{' '}
          <a
            href="https://www.bundesnetzagentur.de/DE/Beschlusskammern/GBK/GBK_Aktuell/start.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            https://www.bundesnetzagentur.de/DE/Beschlusskammern/GBK/GBK_Aktuell/start.html
          </a>
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => onNavigate('explorer')} className="gap-2">
          <ArrowRight className="h-4 w-4" />
          Zum Explorer
        </Button>
        <Button variant="outline" onClick={() => onNavigate('karte')} className="gap-2">
          <Map className="h-4 w-4" />
          Zur Karte
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <a href="#" target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
            Download Original-Excel
          </a>
        </Button>
      </div>
    </div>
  );
}
