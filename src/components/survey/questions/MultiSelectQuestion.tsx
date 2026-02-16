import { Checkbox } from "@/components/ui/checkbox";
import { QuestionTag } from "./QuestionTag";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const HARD_LIMIT = 10000;
const SOFT_LIMIT = 5000;

interface Option {
  value: string;
  label: string;
  hasTextField?: boolean;
  textFieldLabel?: string;
  textFieldHint?: string;
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
  tooltipNode?: React.ReactNode;
}

export function MultiSelectQuestion({
  id, label, description, options, value, otherValue, optionTextValues, onChange, onOtherChange, onOptionTextChange, optional, questionNumber, tooltipNode,
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
          {tooltipNode}
          {optional && <span className="text-muted-foreground font-normal ml-2">(optional)</span>}
        </Label>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        {options.map((option, index) => {
          const isChecked = value.includes(option.value);
          const isDisabled = exclusiveSelected && !option.exclusive && !isChecked;
          const textValue = optionTextValues?.[option.value] || "";
          const showTextFieldHint = option.hasTextField && isChecked && !textValue.trim();
          const isLast = index === options.length - 1;
          
          return (
            <div key={option.value}>
              <div
                className={cn(
                  "flex items-start space-x-3 px-3 py-2.5 transition-all",
                  isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                  isChecked ? "bg-primary/5" : "hover:bg-muted/50",
                  !isLast && !isChecked && "border-b border-border",
                  isChecked && "border-b border-border"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isDisabled) handleToggle(option.value);
                }}
              >
                <Checkbox 
                  id={`${id}-${option.value}`} 
                  checked={isChecked} 
                  onCheckedChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-0.5 pointer-events-none"
                  disabled={isDisabled}
                />
                <span className={cn("text-sm flex-1", isDisabled ? "cursor-not-allowed" : "cursor-pointer")}>
                  {option.label}
                </span>
              </div>
              {option.hasTextField && isChecked && (
                onOptionTextChange ? (
                  <div className="px-3 py-2 border-b border-border bg-muted/20">
                    <div className="ml-7 space-y-1">
                      {option.textFieldLabel && (
                        <Label className="text-sm text-muted-foreground">
                          {option.textFieldLabel} <span className="text-muted-foreground/60 font-normal">(optional)</span>
                        </Label>
                      )}
                      <Textarea 
                        placeholder={option.textFieldPlaceholder || "Bitte angeben..."} 
                        value={textValue} 
                        onChange={(e) => {
                          const val = e.target.value.length <= HARD_LIMIT ? e.target.value : e.target.value.slice(0, HARD_LIMIT);
                          onOptionTextChange(option.value, val);
                        }}
                        className={cn("min-h-[60px] resize-y", showTextFieldHint && "border-emerald-300 focus-visible:ring-emerald-400/30")}
                        rows={2}
                      />
                      {showTextFieldHint && (
                        <p className="text-xs text-emerald-600">{option.textFieldHint || "Gerne können Sie hier Details ergänzen"}</p>
                      )}
                      {(textValue?.length || 0) >= SOFT_LIMIT && (
                        <p className={`text-xs text-right ${(textValue?.length || 0) >= HARD_LIMIT ? 'text-destructive font-medium' : 'text-amber-600'}`}>
                          {(textValue?.length || 0).toLocaleString('de-DE')}/{HARD_LIMIT.toLocaleString('de-DE')} Zeichen
                        </p>
                      )}
                    </div>
                  </div>
                ) : onOtherChange && (
                  <div className="px-3 py-2 border-b border-border bg-muted/20">
                    <Textarea 
                      placeholder="Bitte angeben..." 
                      value={otherValue || ""} 
                      onChange={(e) => {
                        const val = e.target.value.length <= HARD_LIMIT ? e.target.value : e.target.value.slice(0, HARD_LIMIT);
                        onOtherChange(val);
                      }}
                      className="ml-7 min-h-[60px] resize-y" 
                      rows={2}
                    />
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
