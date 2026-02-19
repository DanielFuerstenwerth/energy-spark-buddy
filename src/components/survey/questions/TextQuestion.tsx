import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { QuestionTag } from "./QuestionTag";

const SOFT_LIMIT = 5000;
const HARD_LIMIT = 10000;

interface TextQuestionProps {
  id: string;
  label: string;
  questionNumber?: string;
  description?: string;
  value?: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "number" | "textarea";
  optional?: boolean;
  min?: number;
  max?: number;
  multiline?: boolean;
  tooltipNode?: React.ReactNode;
}

export function TextQuestion({
  id, label, description, value, onChange, placeholder, type = "text", optional, min, max, questionNumber, multiline, tooltipNode,
}: TextQuestionProps) {
  const stringValue = String(value ?? "");
  const charCount = stringValue.length;
  const isOverSoft = charCount >= SOFT_LIMIT;
  const isOverHard = charCount >= HARD_LIMIT;

  // Use textarea for explicit textarea type, or when multiline is true (default for text type)
  const useTextarea = type === "textarea" || (multiline !== false && type === "text");

  const handleChange = (newValue: string) => {
    if (newValue.length <= HARD_LIMIT) {
      onChange(newValue);
    } else {
      onChange(newValue.slice(0, HARD_LIMIT));
    }
  };

  const hasLabel = label || questionNumber || optional;

  return (
    <div className="space-y-3">
      {hasLabel && (
        <div>
          <Label htmlFor={id} className="text-base font-semibold text-foreground">
            {label}
            {questionNumber && <QuestionTag questionNumber={questionNumber} />}
            {tooltipNode}
            {optional && <span className="text-muted-foreground font-normal ml-2">(optional)</span>}
          </Label>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      {useTextarea ? (
        <div className="space-y-1">
          <Textarea
            id={id}
            value={stringValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[80px] resize-y"
            rows={3}
          />
          {isOverSoft && (
            <p className={`text-xs text-right ${isOverHard ? 'text-destructive font-medium' : 'text-amber-600'}`}>
              {charCount.toLocaleString('de-DE')}/{HARD_LIMIT.toLocaleString('de-DE')} Zeichen
              {!isOverHard && ' – bitte kürzen Sie den Text wenn möglich'}
            </p>
          )}
        </div>
      ) : (
        <Input
          id={id}
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          className="w-full"
        />
      )}
    </div>
  );
}
