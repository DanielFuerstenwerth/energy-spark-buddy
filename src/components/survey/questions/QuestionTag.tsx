
import { Hash } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QuestionTagProps {
  questionNumber: string;
}

export function QuestionTag({ questionNumber }: QuestionTagProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(questionNumber);
    toast.success(`Frage-ID ${questionNumber} kopiert`);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground ml-2"
            onClick={handleCopy}
            type="button"
          >
            <Hash className="h-3 w-3" />
            <span className="sr-only">Frage-ID {questionNumber} kopieren</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">ID kopieren: {questionNumber}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
