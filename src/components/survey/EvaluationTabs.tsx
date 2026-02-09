import { Plus, X, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Evaluation } from "@/hooks/useMultiEvaluation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EvaluationTabsProps {
  evaluations: Evaluation[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onRename: (index: number, label: string) => void;
}

export function EvaluationTabs({
  evaluations,
  activeIndex,
  onSelect,
  onAdd,
  onRemove,
  onRename,
}: EvaluationTabsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(evaluations[index].label);
  };

  const confirmEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      onRename(editingIndex, editValue.trim());
    }
    setEditingIndex(null);
  };

  if (evaluations.length <= 1 && !evaluations[0]?.data.vnbName) {
    // Don't show tabs until user has at least started one evaluation or has multiple
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <span>VNB-Bewertungen</span>
        <Badge variant="secondary" className="text-xs px-1.5 py-0">
          {evaluations.length}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {evaluations.map((ev, i) => (
          <div
            key={ev.id}
            className={`group flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-all ${
              i === activeIndex
                ? "border-primary bg-primary/5 text-primary font-medium shadow-sm"
                : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onSelect(i)}
          >
            {editingIndex === i ? (
              <form
                onSubmit={(e) => { e.preventDefault(); confirmEdit(); }}
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-6 w-32 text-sm px-1"
                  autoFocus
                  onBlur={confirmEdit}
                />
                <Button type="submit" variant="ghost" size="icon" className="h-5 w-5">
                  <Check className="w-3 h-3" />
                </Button>
              </form>
            ) : (
              <>
                <span className="truncate max-w-[120px]">
                  {ev.data.vnbName || ev.label}
                </span>
                {ev.data.projectFocus && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    {ev.data.projectFocus === 'ggv' ? 'GGV' : ev.data.projectFocus === 'mieterstrom' ? 'MS' : 'ES'}
                  </Badge>
                )}
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-primary"
                  onClick={(e) => { e.stopPropagation(); startEditing(i); }}
                  title="Umbenennen"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                {evaluations.length > 1 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                        title="Entfernen"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Bewertung entfernen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Die Bewertung „{ev.data.vnbName || ev.label}" und alle eingetragenen Daten werden gelöscht.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onRemove(i)}>Entfernen</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            )}
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-xs"
          onClick={onAdd}
        >
          <Plus className="w-3.5 h-3.5" />
          Weitere VNB-Bewertung
        </Button>
      </div>
    </div>
  );
}
