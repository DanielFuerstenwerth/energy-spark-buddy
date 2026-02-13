import { Checkbox } from "@/components/ui/checkbox";
import { QuestionTag } from "./QuestionTag";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  hasTextField?: boolean;
  textFieldLabel?: string;
  textFieldPlaceholder?: string;
  exclusive?: boolean; // If true, selecting this deselects all others
}

interface MultiSelectQuestionProps {
  id: string;
  label: string;
  questionNumber?: string;
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
  id, label, description, options, value, otherValue, optionTextValues, onChange, onOtherChange, onOptionTextChange, optional, questionNumber,
}: MultiSelectQuestionProps) {
  const handleToggle = (optionValue: string) => {
    const option = options.find(o => o.value === optionValue);
    
    if (option?.exclusive) {
      // If selecting an exclusive option, deselect all others
      if (value.includes(optionValue)) {
        onChange(value.filter((v) => v !== optionValue));
      } else {
        onChange([optionValue]);
      }
    } else {
      // If selecting a non-exclusive option, remove any exclusive options
      const exclusiveOptions = options.filter(o => o.exclusive).map(o => o.value);
      
      if (value.includes(optionValue)) {
        onChange(value.filter((v) => v !== optionValue));
      } else {
        const newValue = value.filter(v => !exclusiveOptions.includes(v));
        onChange([...newValue, optionValue]);
      }
    }
  };

  // Check if an exclusive option is selected (to disable others)
  const exclusiveSelected = options.some(o => o.exclusive && value.includes(o.value));

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
      <div className="space-y-3">
        {options.map((option) => {
          const isChecked = value.includes(option.value);
          const isDisabled = exclusiveSelected && !option.exclusive && !isChecked;
          const textValue = optionTextValues?.[option.value] || "";
          const showTextFieldHint = option.hasTextField && isChecked && !textValue.trim();
          
          return (
            <div key={option.value} className="space-y-2">
              <div
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg border transition-all",
                  isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                  isChecked ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
                onClick={() => !isDisabled && handleToggle(option.value)}
              >
                <Checkbox 
                  id={`${id}-${option.value}`} 
                  checked={isChecked} 
                  onCheckedChange={() => !isDisabled && handleToggle(option.value)} 
                  className="mt-0.5"
                  disabled={isDisabled}
                />
                <Label 
                  htmlFor={`${id}-${option.value}`} 
                  className={cn("text-sm flex-1", isDisabled ? "cursor-not-allowed" : "cursor-pointer")}
                >
                  {option.label}
                </Label>
              </div>
              {option.hasTextField && isChecked && (
                onOptionTextChange ? (
                  <div className="ml-8 space-y-1">
                    {option.textFieldLabel && (
                      <Label className="text-sm text-muted-foreground">
                        {option.textFieldLabel} <span className="text-muted-foreground/60 font-normal">(optional)</span>
                      </Label>
                    )}
                    <Input 
                      placeholder={option.textFieldPlaceholder || "Bitte angeben..."} 
                      value={textValue} 
                      onChange={(e) => onOptionTextChange(option.value, e.target.value)}
                      className={cn(showTextFieldHint && "border-emerald-300 focus-visible:ring-emerald-400/30")}
                    />
                    {showTextFieldHint && (
                      <p className="text-xs text-emerald-600">Gerne können Sie hier Details ergänzen</p>
                    )}
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
