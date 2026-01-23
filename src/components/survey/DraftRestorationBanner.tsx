import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, X } from "lucide-react";

interface DraftRestorationBannerProps {
  savedTime: string;
  stepTitle: string;
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftRestorationBanner({ savedTime, stepTitle, onRestore, onDiscard }: DraftRestorationBannerProps) {
  return (
    <Card className="mb-6 border-primary/30 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="font-medium text-foreground">Entwurf gefunden</p>
            <p className="text-sm text-muted-foreground">Gespeichert {savedTime} • Zuletzt bei "{stepTitle}"</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onDiscard} className="gap-1.5">
              <X className="w-4 h-4" />Verwerfen
            </Button>
            <Button size="sm" onClick={onRestore} className="gap-1.5">
              <RotateCcw className="w-4 h-4" />Fortsetzen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
