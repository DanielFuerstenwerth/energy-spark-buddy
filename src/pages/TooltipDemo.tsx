import { useState } from "react";
import { Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const TOOLTIP_TEXT = 'Wenn Sie den Namen Ihres Verteilnetzbetreibers nicht kennen, können Sie diesen über die Website www.vnb-digital.de identifizieren. Um Projekte im Netzgebiet von weiteren VNB einzutragen, wählen Sie oben bitte „+Weitere VNB-Bewertung" aus.';

export default function TooltipDemo() {
  const [expandedClick, setExpandedClick] = useState(false);
  const [expandedHover, setExpandedHover] = useState(false);
  const [expandedHybrid, setExpandedHybrid] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold">Inline-Hinweis – Varianten</h1>
          <p className="text-muted-foreground text-sm">
            Gerät: <span className="font-medium text-foreground">{isMobile ? "📱 Mobile" : "🖥️ Desktop"}</span>
          </p>

          {/* Variante 1: Click-Toggle (gleich auf allen Geräten) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Variante 1: Klick-Toggle</CardTitle>
              <p className="text-sm text-muted-foreground">Klick öffnet/schließt – identisch auf Desktop & Mobile</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">2.1 Verteilnetzbetreiber (VNB)</label>
                <button
                  type="button"
                  className={`transition-colors ${expandedClick ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setExpandedClick(!expandedClick)}
                  aria-expanded={expandedClick}
                  aria-label="Hinweis anzeigen"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedClick ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="rounded-md bg-muted/50 border border-border p-3 text-sm text-muted-foreground">
                  {TOOLTIP_TEXT}
                </div>
              </div>
              <div className="mt-2 h-10 rounded-md border bg-muted/30" />
            </CardContent>
          </Card>

          {/* Variante 2: Hover auf Desktop, Klick auf Mobile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Variante 2: Hybrid (Hover / Klick)</CardTitle>
              <p className="text-sm text-muted-foreground">
                {isMobile ? "📱 Klick-Modus aktiv" : "🖥️ Hover-Modus aktiv (öffnet bei Hover, schließt beim Verlassen)"}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">2.1 Verteilnetzbetreiber (VNB)</label>
                <button
                  type="button"
                  className={`transition-colors ${expandedHybrid ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => { if (isMobile) setExpandedHybrid(!expandedHybrid); }}
                  onMouseEnter={() => { if (!isMobile) setExpandedHybrid(true); }}
                  onMouseLeave={() => { if (!isMobile) setExpandedHybrid(false); }}
                  aria-expanded={expandedHybrid}
                  aria-label="Hinweis anzeigen"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedHybrid ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="rounded-md bg-muted/50 border border-border p-3 text-sm text-muted-foreground">
                  {TOOLTIP_TEXT}
                </div>
              </div>
              <div className="mt-2 h-10 rounded-md border bg-muted/30" />
            </CardContent>
          </Card>

          {/* Variante 3: Hover auf Desktop mit Klick-Pin, Klick auf Mobile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Variante 3: Hover + anpinnen</CardTitle>
              <p className="text-sm text-muted-foreground">
                {isMobile
                  ? "📱 Klick-Modus aktiv"
                  : "🖥️ Hover zeigt Hinweis, Klick pinnt ihn an (bleibt offen)"}
              </p>
            </CardHeader>
            <CardContent>
              <HoverPinInline label="2.1 Verteilnetzbetreiber (VNB)" text={TOOLTIP_TEXT} isMobile={isMobile} />
              <div className="mt-2 h-10 rounded-md border bg-muted/30" />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** Hover + pin: hover opens, click pins, click again or mouse-leave-when-unpinned closes */
function HoverPinInline({ label, text, isMobile }: { label: string; text: string; isMobile: boolean }) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const open = pinned || hovered;

  return (
    <>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">{label}</label>
        <button
          type="button"
          className={`transition-colors ${open ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => {
            if (isMobile) { setPinned(!pinned); }
            else { setPinned(!pinned); }
          }}
          onMouseEnter={() => { if (!isMobile) setHovered(true); }}
          onMouseLeave={() => { if (!isMobile) setHovered(false); }}
          aria-expanded={open}
          aria-label="Hinweis anzeigen"
        >
          <Info className="w-4 h-4" />
        </button>
        {pinned && !isMobile && (
          <span className="text-xs text-muted-foreground">📌 angepinnt</span>
        )}
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="rounded-md bg-muted/50 border border-border p-3 text-sm text-muted-foreground">
          {text}
        </div>
      </div>
    </>
  );
}
