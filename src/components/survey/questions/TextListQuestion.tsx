import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { QuestionTag } from "./QuestionTag";

interface TextListQuestionProps {
  id: string;
  label: string;
  questionNumber?: string;
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  optional?: boolean;
  tooltipNode?: React.ReactNode;
}

export function TextListQuestion({
  id, label, value, onChange, placeholder, optional, questionNumber, tooltipNode,
}: TextListQuestionProps) {
  const items = value && value.length > 0 ? value : [""];

  const updateItem = (index: number, newValue: string) => {
    const updated = [...items];
    updated[index] = newValue;
    onChange(updated);
  };

  const addItem = () => {
    onChange([...items, ""]);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated.length > 0 ? updated : [""]);
  };

  const hasLabel = label || questionNumber || optional;

  return (
    <div className="space-y-2">
      {hasLabel && (
        <div>
          <Label htmlFor={id} className="text-base font-semibold text-foreground">
            {label}
            {questionNumber && <QuestionTag questionNumber={questionNumber} />}
            {tooltipNode}
            {optional && <span className="text-muted-foreground font-normal ml-2">(optional)</span>}
          </Label>
        </div>
      )}
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            id={index === 0 ? id : undefined}
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={placeholder}
            className="w-full"
          />
          {items.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
              onClick={() => removeItem(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground"
        onClick={addItem}
      >
        <Plus className="h-4 w-4 mr-1" /> Weitere hinzufügen
      </Button>
    </div>
  );
}
