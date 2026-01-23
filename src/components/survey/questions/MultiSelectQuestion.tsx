import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  hasTextField?: boolean;
  textFieldLabel?: string;
  textFieldPlaceholder?: string;
}

interface MultiSelectQuestionProps {
  id: string;
  label: string;
  description?: string;
  options: Option[];
  value: string[];
  otherValue?: string;
  optionTextValues?: Record<string, string>;
  onChange: (values: string[]) => void;
  onOtherChange?: (value: string) => void;
  onOptionTextChange?: (optionValue: string, text: string) => void;
  optional?: boolean;
}

export function MultiSelectQuestion({
  id, label, description, options, value, otherValue, optionTextValues, onChange, onOtherChange, onOptionTextChange, optional,
}: MultiSelectQuestionProps) {
  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold text-foreground">
          {label}
          {optional && <span className="text-muted-foreground font-normal ml-2">(optional)</span>}
        </Label>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="space-y-3">
        {options.map((option) => {
          const isChecked = value.includes(option.value);
          return (
            <div key={option.value} className="space-y-2">
              <div
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
                  isChecked ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
                onClick={() => handleToggle(option.value)}
              >
                <Checkbox id={`${id}-${option.value}`} checked={isChecked} onCheckedChange={() => handleToggle(option.value)} className="mt-0.5" />
                <Label htmlFor={`${id}-${option.value}`} className="text-sm cursor-pointer flex-1">{option.label}</Label>
              </div>
              {option.hasTextField && isChecked && (
                onOptionTextChange ? (
                  <div className="ml-8 space-y-1">
                    {option.textFieldLabel && <Label className="text-sm text-muted-foreground">{option.textFieldLabel}</Label>}
                    <Input placeholder={option.textFieldPlaceholder || "Bitte angeben..."} value={optionTextValues?.[option.value] || ""} onChange={(e) => onOptionTextChange(option.value, e.target.value)} />
                  </div>
                ) : onOtherChange && (
                  <Input placeholder="Bitte angeben..." value={otherValue || ""} onChange={(e) => onOtherChange(e.target.value)} className="ml-8" />
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
