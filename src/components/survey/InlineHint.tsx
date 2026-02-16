import { useState } from "react";
import { Info } from "lucide-react";

interface InlineHintProps {
  text: string;
}

export function InlineHint({ text }: InlineHintProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-1">
      <button
        type="button"
        className={`inline-flex items-center gap-1 text-xs transition-colors ${
          open ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Hinweis anzeigen"
      >
        <Info className="w-3.5 h-3.5" />
        <span className="underline underline-offset-2">{open ? "Hinweis ausblenden" : "Hinweis"}</span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
        }`}
      >
        <div className="rounded-md bg-muted/50 border border-border p-3 text-sm text-muted-foreground">
          {text}
        </div>
      </div>
    </div>
  );
}
