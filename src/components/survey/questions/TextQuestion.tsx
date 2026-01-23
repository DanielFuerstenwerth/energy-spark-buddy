import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TextQuestionProps {
  id: string;
  label: string;
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
  id, label, description, value, onChange, placeholder, type = "text", optional, min, max,
}: TextQuestionProps) {
  const InputComponent = type === "textarea" ? Textarea : Input;
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={id} className="text-base font-semibold text-foreground">
          {label}
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
