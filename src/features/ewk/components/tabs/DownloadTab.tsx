import { Download, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBeschreibung } from '../../hooks/useEwkData';

const CSV_FILES = [
  { name: 'datensatz_ewk_2024.csv', label: 'Datensatz EWK 2024' },
  { name: 'umsetzungsquote_2024.csv', label: 'Umsetzungsquote 2024' },
  { name: 'anschlussdauer_2024.csv', label: 'Anschlussdauer 2024' },
  { name: 'digitalisierungsindex_2024.csv', label: 'Digitalisierungsindex 2024' },
  { name: 'dropped_vnb_no_vnb_id.csv', label: 'Ausgeschlossene VNB (ohne VNB-ID)' },
];

export default function DownloadTab() {
  const beschreibung = useBeschreibung();

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Quelle */}
      <div className="bg-muted/40 rounded-xl border border-border p-4 space-y-1.5">
        <h3 className="text-xs font-semibold text-muted-foreground">Quelle</h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            Download-Seite:{' '}
            <a
              href="https://www.bundesnetzagentur.de/DE/Beschlusskammern/GBK/GBK_Aktuell/start.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              bundesnetzagentur.de/…/GBK_Aktuell <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </p>
          <p>
            Erhebungsbogen:{' '}
            <a
              href="https://www.bundesnetzagentur.de/1052876"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              bundesnetzagentur.de/1052876 <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </p>
        </div>
      </div>

      {/* Downloads */}
      <div className="bg-card rounded-2xl border p-6 md:p-8 space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Download className="h-4 w-4" />
          Downloads
        </h3>

        <div className="space-y-2">
          <Button variant="outline" asChild className="gap-2 w-full justify-start">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <FileText className="h-4 w-4" />
              Original-Excel (BNetzA-Veröffentlichung)
            </a>
          </Button>

          {CSV_FILES.map((f) => (
            <Button key={f.name} variant="ghost" asChild className="gap-2 w-full justify-start text-sm">
              <a href={`/data/ewk/${f.name}`} download>
                <Download className="h-3.5 w-3.5" />
                {f.label}
              </a>
            </Button>
          ))}
        </div>
      </div>

      {/* Beschreibung */}
      <div className="bg-card rounded-2xl border p-6 md:p-8 space-y-3">
        <h3 className="text-base font-semibold">Originalbeschreibung aus Datei</h3>
        <pre className="text-xs font-mono whitespace-pre-wrap bg-muted/50 rounded-lg p-4 overflow-x-auto text-muted-foreground leading-relaxed">
          {beschreibung || 'Wird geladen…'}
        </pre>
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
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            bundesnetzagentur.de <ExternalLink className="h-3 w-3" />
          </a>
        </p>
        <p className="text-xs text-muted-foreground">Lizenz: siehe Impressum der Bundesnetzagentur.</p>
      </div>
    </div>
  );
}
