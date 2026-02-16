import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TOOLTIP_TEXT = 'Wenn Sie den Namen Ihres Verteilnetzbetreibers nicht kennen, können Sie diesen über die Website www.vnb-digital.de identifizieren. Um Projekte im Netzgebiet von weiteren VNB einzutragen, wählen Sie oben bitte „+Weitere VNB-Bewertung" aus.';

export default function TooltipDemo() {
  const [expandedC, setExpandedC] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold">Tooltip-Optionen – Vorschau</h1>
          <p className="text-muted-foreground text-sm">Hover über das Info-Icon bei jeder Option, um den Tooltip zu sehen.</p>

          {/* Option A: Radix Tooltip */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Option A: Radix Tooltip</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">2.1 Verteilnetzbetreiber (VNB)</label>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Info className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-sm">
                      <p>{TOOLTIP_TEXT}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="mt-2 h-10 rounded-md border bg-muted/30" />
            </CardContent>
          </Card>

          {/* Option B: Popover with hover */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Option B: Hover-Popover</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">2.1 Verteilnetzbetreiber (VNB)</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="max-w-sm text-sm">
                    <p>{TOOLTIP_TEXT}</p>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="mt-2 h-10 rounded-md border bg-muted/30" />
            </CardContent>
          </Card>

          {/* Option C: Inline expand */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Option C: Inline-Hinweis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">2.1 Verteilnetzbetreiber (VNB)</label>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onMouseEnter={() => setExpandedC(true)}
                  onMouseLeave={() => setExpandedC(false)}
                  onFocus={() => setExpandedC(true)}
                  onBlur={() => setExpandedC(false)}
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedC ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="rounded-md bg-muted/50 border border-border p-3 text-sm text-muted-foreground">
                  {TOOLTIP_TEXT}
                </div>
              </div>
              <div className="mt-2 h-10 rounded-md border bg-muted/30" />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
