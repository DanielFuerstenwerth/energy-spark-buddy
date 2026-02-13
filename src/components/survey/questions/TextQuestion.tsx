import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { QuestionTag } from "./QuestionTag";

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
}

export function TextQuestion({
  id, label, description, value, onChange, placeholder, type = "text", optional, min, max, questionNumber,
}: TextQuestionProps) {
  const InputComponent = type === "textarea" ? Textarea : Input;
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={id} className="text-base font-semibold text-foreground">
          {label}
          {questionNumber && <QuestionTag questionNumber={questionNumber} />}
          {optional && <span className="text-muted-foreground font-normal ml-2">(optional)</span>}
        </Label>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <InputComponent
        id={id}
        type={type === "textarea" ? undefined : type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full"
      />
    </div>
  );
}
