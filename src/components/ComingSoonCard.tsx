import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

const ComingSoonCard = () => {
  return (
    <Card className="bg-muted/50 border-muted">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm text-foreground">
              <strong>Kommt später.</strong> Wir starten mit „Dezentrale Energiewende → GGV". Datenerhebung & Methodik folgen.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComingSoonCard;
