import { useState, useMemo } from "react";
import { Info } from "lucide-react";

interface InlineHintProps {
  text: string;
}

/** Turn URLs (www. or https://) in plain text into clickable links */
function linkify(text: string): React.ReactNode[] {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const url = match[0];
    const href = url.startsWith("http") ? url : `https://${url}`;
    parts.push(
      <a key={match.index} href={href} target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-foreground">
        {url}
      </a>
    );
    lastIndex = match.index + url.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

/**
 * Inline trigger (i) icon meant to sit next to a question label.
 * Renders an expandable hint panel below when clicked.
 */
export function InlineHintTrigger({ text }: InlineHintProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`inline-flex items-center ml-1.5 align-middle transition-colors ${
          open ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        aria-expanded={open}
        aria-label="Hinweis anzeigen"
      >
        <Info className="w-4 h-4" />
      </button>
      {open && (
        <div className="mt-2 rounded-md bg-muted/50 border border-border p-3 text-sm text-muted-foreground font-normal">
          {linkify(text)}
        </div>
      )}
    </>
  );
}

/** @deprecated Use InlineHintTrigger instead */
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
