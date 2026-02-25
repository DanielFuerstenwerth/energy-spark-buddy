import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const DISCLAIMER_TEXT =
  'Nicht-offizielle Aufbereitung veröffentlichter Daten der Bundesnetzagentur; Aufbereitungs- und Visualisierungsfunktionen vollständig KI-basiert; keine Haftung oder Gewähr. Maßgeblich sind die Originaldaten.';

const DisclaimerBanner = () => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="mt-3 mb-4 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2 cursor-default">
          <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground truncate">{DISCLAIMER_TEXT}</p>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-md text-xs">
        {DISCLAIMER_TEXT}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default DisclaimerBanner;
