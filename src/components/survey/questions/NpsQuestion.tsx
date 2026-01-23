import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface NpsQuestionProps {
  id: string;
  label: string;
  description?: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  optional?: boolean;
}

export function NpsQuestion({ id, label, description, value, onChange, optional }: NpsQuestionProps) {
  const scores = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const getScoreColor = (score: number) => score <= 6 ? "detractor" : score <= 8 ? "passive" : "promoter";
  const handleClick = (score: number) => onChange(value === score ? undefined : score);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {optional && <span className="text-muted-foreground ml-1">(optional)</span>}
        </Label>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="space-y-3">
        <div className="flex justify-between gap-1 sm:gap-2">
          {scores.map((score) => {
            const colorType = getScoreColor(score);
            const isSelected = value === score;
            return (
              <button key={score} type="button" onClick={() => handleClick(score)}
                className={cn("flex-1 aspect-square sm:aspect-auto sm:h-12 min-w-[28px] sm:min-w-[36px] rounded-lg font-medium text-sm sm:text-base transition-all",
                  "border-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isSelected ? [
                    colorType === "detractor" && "bg-red-500 border-red-600 text-white",
                    colorType === "passive" && "bg-yellow-500 border-yellow-600 text-white",
                    colorType === "promoter" && "bg-green-500 border-green-600 text-white",
                  ] : [
                    colorType === "detractor" && "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
                    colorType === "passive" && "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100",
                    colorType === "promoter" && "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
                  ]
                )}>{score}</button>
            );
          })}
        </div>
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          <span>0 - Überhaupt nicht</span>
          <span>10 - Sehr wahrscheinlich</span>
        </div>
        <div className="flex flex-wrap gap-4 justify-center text-xs pt-2">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-muted-foreground">Kritiker (0-6)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-yellow-500" /><span className="text-muted-foreground">Passive (7-8)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-500" /><span className="text-muted-foreground">Promotoren (9-10)</span></div>
        </div>
      </div>
      {value !== undefined && (
        <p className="text-sm text-center font-medium">Ihre Bewertung: <span className={cn(
          getScoreColor(value) === "detractor" && "text-red-600",
          getScoreColor(value) === "passive" && "text-yellow-600",
          getScoreColor(value) === "promoter" && "text-green-600",
        )}>{value}</span></p>
      )}
    </div>
  );
}
