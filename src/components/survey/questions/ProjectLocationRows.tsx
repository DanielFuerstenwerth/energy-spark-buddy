import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { QuestionTag } from "./QuestionTag";

export interface ProjectLocation {
  plz?: string;
  address?: string;
  pvSizeKw?: number;
}

interface ProjectLocationRowsProps {
  locations: ProjectLocation[];
  onChange: (locations: ProjectLocation[]) => void;
  multiple?: boolean;
  questionNumber?: string;
}

export function ProjectLocationRows({ locations, onChange, multiple = false, questionNumber }: ProjectLocationRowsProps) {
  const rows = locations.length > 0 ? locations : [{}];

  const updateRow = (index: number, field: keyof ProjectLocation, value: string) => {
    const updated = [...rows];
    if (field === 'pvSizeKw') {
      updated[index] = { ...updated[index], [field]: value ? parseFloat(value) : undefined };
    } else {
      updated[index] = { ...updated[index], [field]: value || undefined };
    }
    onChange(updated);
  };

  const addRow = () => {
    onChange([...rows, {}]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 rounded-lg border-2 border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-700 p-4">
      <div>
        <Label className="text-base font-semibold text-foreground">
          Standort{multiple ? 'e' : ''} des Projekts
          {questionNumber && <QuestionTag questionNumber={questionNumber} />}
          <span className="text-emerald-600 dark:text-emerald-400 font-normal ml-2 text-sm">
            (optional – nur wenn Anzeige auf einer Karte erwünscht ist)
          </span>
        </Label>
      </div>

      {rows.map((row, index) => (
        <div key={index} className="flex gap-3 items-start">
          <div className="w-28 shrink-0">
            <Input
              placeholder="PLZ"
              value={row.plz ?? ""}
              onChange={(e) => updateRow(index, 'plz', e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Adresse (z.B. Musterstraße 1, Berlin)"
              value={row.address ?? ""}
              onChange={(e) => updateRow(index, 'address', e.target.value)}
            />
          </div>
          {multiple && (
            <div className="w-28 shrink-0">
              <Input
                type="number"
                placeholder="kW"
                value={row.pvSizeKw ?? ""}
                onChange={(e) => updateRow(index, 'pvSizeKw', e.target.value)}
              />
            </div>
          )}
          {multiple && rows.length > 1 && (
            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground" onClick={() => removeRow(index)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}

      {multiple && (
        <Button variant="outline" size="sm" onClick={addRow} className="gap-1.5">
          <Plus className="w-4 h-4" /> Weiteren Standort hinzufügen
        </Button>
      )}
    </div>
  );
}
