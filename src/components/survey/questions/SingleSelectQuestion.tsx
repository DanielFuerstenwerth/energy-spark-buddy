import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionTag } from "./QuestionTag";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const HARD_LIMIT = 10000;
const SOFT_LIMIT = 5000;

interface Option { value: string; label: string; hasTextField?: boolean; }

interface SingleSelectQuestionProps {
  id: string;
  label: string;
  questionNumber?: string;
  description?: string;
  options: Option[];
  value?: string;
  otherValue?: string;
  onChange: (value: string) => void;
  onOtherChange?: (value: string) => void;
  optional?: boolean;
  otherPlaceholder?: string;
  otherHint?: string;
  tooltipNode?: React.ReactNode;
}

export function SingleSelectQuestion({
  id, label, description, options, value, otherValue, onChange, onOtherChange, optional, questionNumber, otherPlaceholder, otherHint, tooltipNode,
}: SingleSelectQuestionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold text-foreground">
          {label}
          {questionNumber && <QuestionTag questionNumber={questionNumber} />}
          {tooltipNode}
          {optional && <span className="text-muted-foreground font-normal ml-2">(optional)</span>}
        </Label>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <RadioGroup value={value} onValueChange={onChange} className="rounded-lg border border-border overflow-hidden">
        {options.map((option, index) => {
          const isSelected = value === option.value;
          const isLast = index === options.length - 1;
          return (
            <div key={option.value}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 transition-all cursor-pointer",
                  isSelected ? "bg-primary/5" : "hover:bg-muted/50",
                  !isLast && "border-b border-border"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  onChange(option.value);
                }}
              >
                <RadioGroupItem value={option.value} id={`${id}-${option.value}`} className="pointer-events-none" />
                <span className="text-sm cursor-pointer flex-1">{option.label}</span>
              </div>
              {option.hasTextField && isSelected && onOtherChange && (
                <div className="px-3 py-2 border-b border-border bg-muted/20">
                  <div className="ml-7 space-y-1">
                    <Textarea
                      placeholder={otherPlaceholder || "Bitte angeben..."}
                      value={otherValue || ""}
                      onChange={(e) => {
                        const val = e.target.value.length <= HARD_LIMIT ? e.target.value : e.target.value.slice(0, HARD_LIMIT);
                        onOtherChange(val);
                      }}
                      className={cn("min-h-[60px] resize-y", !otherValue?.trim() ? "border-emerald-300 focus-visible:ring-emerald-400/30" : "")}
                      rows={2}
                    />
                    {!otherValue?.trim() && (
                      <p className="text-xs text-emerald-600">{otherHint || "Gerne können Sie hier Details ergänzen"}</p>
                    )}
                    {(otherValue?.length || 0) >= SOFT_LIMIT && (
                      <p className={`text-xs text-right ${(otherValue?.length || 0) >= HARD_LIMIT ? 'text-destructive font-medium' : 'text-amber-600'}`}>
                        {(otherValue?.length || 0).toLocaleString('de-DE')}/{HARD_LIMIT.toLocaleString('de-DE')} Zeichen
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
