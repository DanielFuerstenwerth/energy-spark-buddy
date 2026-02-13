import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SurveyProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: { title: string; description: string }[];
  onStepClick?: (step: number) => void;
}

export function SurveyProgress({ currentStep, totalSteps, steps, onStepClick }: SurveyProgressProps) {
  const progress = ((currentStep) / totalSteps) * 100;
  return (
    <div className="mb-8">
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-6">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <div className="hidden md:flex justify-between">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;
          return (
            <div
              key={index}
              className={cn("flex flex-col items-center flex-1", onStepClick && "cursor-pointer")}
              onClick={() => onStepClick?.(index)}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                isComplete && "bg-primary text-primary-foreground hover:ring-4 hover:ring-primary/20",
                isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                isPending && "bg-muted text-muted-foreground hover:ring-4 hover:ring-muted-foreground/20"
              )}>
                {isComplete ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <div className="mt-2 text-center">
                <p className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                  {step.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="md:hidden text-center">
        <p className="text-sm text-muted-foreground">Schritt {currentStep + 1} von ca. {totalSteps}</p>
        <p className="text-lg font-semibold text-foreground mt-1">{steps[currentStep]?.title}</p>
      </div>
    </div>
  );
}
