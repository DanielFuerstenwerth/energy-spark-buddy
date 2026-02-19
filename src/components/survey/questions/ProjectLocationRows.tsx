import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { QuestionTag } from "./QuestionTag";

export interface ProjectLocation {
  plz?: string;
  address?: string;
  pvSizeKw?: number;
  projectName?: string;
  weblinks?: string[];
}

interface ProjectLocationRowsProps {
  locations: ProjectLocation[];
  onChange: (locations: ProjectLocation[]) => void;
  multiple?: boolean;
  questionNumber?: string;
  label?: string;
  /** Show GGV-transparenz fields (projectName, weblinks) when address is filled */
  showGgvFields?: boolean;
}

export function ProjectLocationRows({ locations, onChange, multiple = false, questionNumber, label, showGgvFields = false }: ProjectLocationRowsProps) {
  const displayLabel = label || `Standort${multiple ? 'e' : ''} des Projekts`;
  const rows = locations.length > 0 ? locations : [{}];

  const updateRow = (index: number, field: keyof ProjectLocation, value: string | string[] | undefined) => {
    const updated = [...rows];
    if (field === 'pvSizeKw') {
      updated[index] = { ...updated[index], [field]: value ? parseFloat(value as string) : undefined };
    } else {
      updated[index] = { ...updated[index], [field]: value || undefined };
    }
    onChange(updated);
  };

  const updateWeblink = (rowIndex: number, linkIndex: number, value: string) => {
    const currentLinks = rows[rowIndex].weblinks || [""];
    const updated = [...currentLinks];
    updated[linkIndex] = value;
    updateRow(rowIndex, 'weblinks', updated);
  };

  const addWeblink = (rowIndex: number) => {
    const currentLinks = rows[rowIndex].weblinks || [""];
    updateRow(rowIndex, 'weblinks', [...currentLinks, ""]);
  };

  const removeWeblink = (rowIndex: number, linkIndex: number) => {
    const currentLinks = rows[rowIndex].weblinks || [""];
    const updated = currentLinks.filter((_, i) => i !== linkIndex);
    updateRow(rowIndex, 'weblinks', updated.length > 0 ? updated : [""]);
  };

  const addRow = () => {
    onChange([...rows, {}]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-4 rounded-lg border-2 p-4 ${showGgvFields ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-700' : 'border-border bg-muted/30'}`}>
      <div>
        <Label className="text-base font-semibold text-foreground">
          {displayLabel}
          {questionNumber && <QuestionTag questionNumber={questionNumber} />}
          {showGgvFields ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-normal ml-2 text-sm">
              (optional – nur wenn Anzeige auf einer Deutschlandkarte erwünscht ist)
            </span>
          ) : (
            <span className="text-muted-foreground font-normal ml-2 text-sm">(optional)</span>
          )}
        </Label>
      </div>

      {rows.map((row, index) => {
        const hasAddress = !!(row.plz?.trim() || row.address?.trim());
        return (
          <div key={index} className="space-y-2">
            <div className="flex gap-3 items-start">
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
            {showGgvFields && hasAddress && (
              <div className="ml-0 pl-4 border-l-2 border-emerald-200 dark:border-emerald-700 space-y-2">
                <Input
                  placeholder="Optional: Name des Projekts (wird angezeigt auf ggv-transparenz.de)"
                  value={row.projectName ?? ""}
                  onChange={(e) => updateRow(index, 'projectName', e.target.value)}
                />
                <div className="space-y-1">
                  {(row.weblinks && row.weblinks.length > 0 ? row.weblinks : [""]).map((link, linkIdx) => (
                    <div key={linkIdx} className="flex items-center gap-2">
                      <Input
                        placeholder="Optional: Weblink (z.B. Website, Presseartikel, Social Media)"
                        value={link}
                        onChange={(e) => updateWeblink(index, linkIdx, e.target.value)}
                        className="flex-1"
                      />
                      {(row.weblinks?.length ?? 0) > 1 && (
                        <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => removeWeblink(index, linkIdx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => addWeblink(index)}>
                    <Plus className="w-4 h-4 mr-1" /> Weiteren Link hinzufügen
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {multiple && (
        <Button variant="outline" size="sm" onClick={addRow} className="gap-1.5">
          <Plus className="w-4 h-4" /> Weiteren Standort hinzufügen
        </Button>
      )}
    </div>
  );
}
