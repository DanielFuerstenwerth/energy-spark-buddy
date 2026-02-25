import { useState } from 'react';
import { Info, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const DISCLAIMER_TEXT =
  'Nicht-offizielle Aufbereitung veröffentlichter Daten der Bundesnetzagentur; Aufbereitungs- und Visualisierungsfunktionen vollständig KI-basiert; keine Haftung oder Gewähr. Maßgeblich sind die Originaldaten.';

const DisclaimerBanner = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(DISCLAIMER_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mt-3 mb-4 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2">
      <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="text-sm text-muted-foreground truncate whitespace-nowrap flex-1 min-w-0">
        {DISCLAIMER_TEXT}
      </p>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0">
            Mehr
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Hinweis</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed">{DISCLAIMER_TEXT}</p>
          <Button variant="outline" size="sm" onClick={handleCopy} className="w-fit gap-1.5 text-xs mt-2">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Kopiert' : 'Kopieren'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DisclaimerBanner;
