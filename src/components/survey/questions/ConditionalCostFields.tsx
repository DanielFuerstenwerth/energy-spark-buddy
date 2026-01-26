import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ConditionalCostFieldsProps {
  oneTimeValue?: number;
  yearlyValue?: number;
  onOneTimeChange: (value: number | undefined) => void;
  onYearlyChange: (value: number | undefined) => void;
  idPrefix: string;
}

/**
 * Conditional cost fields component with validation.
 * At least one of the two fields (one-time or yearly) must be filled.
 */
export function ConditionalCostFields({
  oneTimeValue,
  yearlyValue,
  onOneTimeChange,
  onYearlyChange,
  idPrefix,
}: ConditionalCostFieldsProps) {
  // Validation: at least one field must be filled
  const hasOneTimeValue = oneTimeValue !== undefined && oneTimeValue !== null;
  const hasYearlyValue = yearlyValue !== undefined && yearlyValue !== null;
  const isValid = hasOneTimeValue || hasYearlyValue;
  const showError = !isValid;

  return (
    <div className="space-y-3 pl-4 border-l-2 border-primary/20">
      {showError && (
        <p className="text-sm text-destructive">
          Bitte geben Sie mindestens einen Betrag an (Einmal oder Jährlich)
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label 
            htmlFor={`${idPrefix}-one-time`}
            className={cn(
              "text-sm font-medium",
              showError && !hasOneTimeValue && "text-destructive"
            )}
          >
            Einmalbetrag (EUR)
            {showError && !hasOneTimeValue && !hasYearlyValue && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>
          <Input
            id={`${idPrefix}-one-time`}
            type="number"
            min={0}
            value={oneTimeValue ?? ""}
            onChange={(e) => onOneTimeChange(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="z.B. 500"
            className={cn(showError && !hasOneTimeValue && !hasYearlyValue && "border-destructive")}
          />
        </div>
        <div className="space-y-2">
          <Label 
            htmlFor={`${idPrefix}-yearly`}
            className={cn(
              "text-sm font-medium",
              showError && !hasYearlyValue && "text-destructive"
            )}
          >
            Jährlicher Betrag (EUR)
            {showError && !hasOneTimeValue && !hasYearlyValue && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>
          <Input
            id={`${idPrefix}-yearly`}
            type="number"
            min={0}
            value={yearlyValue ?? ""}
            onChange={(e) => onYearlyChange(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="z.B. 100"
            className={cn(showError && !hasYearlyValue && !hasOneTimeValue && "border-destructive")}
          />
        </div>
      </div>
    </div>
  );
}
