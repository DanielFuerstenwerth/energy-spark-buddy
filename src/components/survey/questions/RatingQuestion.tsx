import { Label } from "@/components/ui/label";
import { QuestionTag } from "./QuestionTag";
import { cn } from "@/lib/utils";

interface RatingQuestionProps {
  id: string;
  label: string;
  questionNumber?: string;
  description?: string;
  value?: number;
  onChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
  min?: number;
  max?: number;
  optional?: boolean;
}

export function RatingQuestion({
  id, label, description, value, onChange, minLabel = "1", maxLabel = "10", min = 1, max = 10, optional, questionNumber,
}: RatingQuestionProps) {
  const ratings = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold text-foreground">
          {label}
          {questionNumber && <QuestionTag questionNumber={questionNumber} />}
          {optional && <span className="text-muted-foreground font-normal ml-2">(optional)</span>}
        </Label>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
        <div className="hidden sm:flex gap-2">
          {ratings.map((rating) => (
            <button key={rating} type="button" onClick={() => onChange(rating)}
              className={cn("flex-1 py-3 text-sm font-medium rounded-lg border transition-all min-w-0",
                value === rating ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
              )}>{rating}</button>
          ))}
        </div>
        <div className="sm:hidden grid grid-cols-5 gap-2">
          {ratings.map((rating) => (
            <button key={rating} type="button" onClick={() => onChange(rating)}
              className={cn("py-3 text-base font-medium rounded-lg border transition-all min-h-[48px]",
                value === rating ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border active:bg-muted"
              )}>{rating}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
