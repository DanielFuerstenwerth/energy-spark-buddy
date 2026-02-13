
import { toast } from "sonner";

interface QuestionTagProps {
  questionNumber: string;
}

export function QuestionTag({ questionNumber }: QuestionTagProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(questionNumber);
    toast.success(`Frage-ID ${questionNumber} kopiert`);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 text-xs text-muted-foreground/50 hover:text-muted-foreground hover:underline cursor-pointer transition-colors tabular-nums"
      title={`ID kopieren: ${questionNumber}`}
    >
      {questionNumber}
    </button>
  );
}
