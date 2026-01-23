import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Option { value: string; label: string; hasTextField?: boolean; }

interface SingleSelectQuestionProps {
  id: string;
  label: string;
  description?: string;
  options: Option[];
  value?: string;
  otherValue?: string;
  onChange: (value: string) => void;
  onOtherChange?: (value: string) => void;
  optional?: boolean;
}

export function SingleSelectQuestion({
  id, label, description, options, value, otherValue, onChange, onOtherChange, optional,
}: SingleSelectQuestionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold text-foreground">
          {label}
          {optional && <span className="text-muted-foreground font-normal ml-2">(optional)</span>}
        </Label>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <div key={option.value} className="space-y-2">
              <div
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
                  isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
                onClick={() => onChange(option.value)}
              >
                <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
                <Label htmlFor={`${id}-${option.value}`} className="text-sm cursor-pointer flex-1">{option.label}</Label>
              </div>
              {option.hasTextField && isSelected && onOtherChange && (
                <Input placeholder="Bitte angeben..." value={otherValue || ""} onChange={(e) => onOtherChange(e.target.value)} className="ml-8" />
              )}
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
