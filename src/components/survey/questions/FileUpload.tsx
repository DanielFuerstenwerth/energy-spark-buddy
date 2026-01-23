import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  id: string;
  label: string;
  description?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  optional?: boolean;
  maxFiles?: number;
  accept?: string;
}

export function FileUpload({ 
  id, label, description, value, onChange, optional = true, maxFiles = 5, accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx" 
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (value.length + files.length > maxFiles) { 
      toast.error(`Maximal ${maxFiles} Dateien erlaubt`); 
      return; 
    }
    setIsUploading(true);
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) { 
          toast.error(`${file.name} ist zu groß (max. 10MB)`); 
          continue; 
        }
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('survey-documents').upload(filePath, file);
        if (uploadError) { 
          toast.error(`Fehler beim Hochladen von ${file.name}`); 
          continue; 
        }
        newUrls.push(filePath);
      }
      if (newUrls.length > 0) { 
        onChange([...value, ...newUrls]); 
        toast.success(`${newUrls.length} Datei(en) hochgeladen`); 
      }
    } catch (error) { 
      toast.error('Fehler beim Hochladen'); 
    } finally { 
      setIsUploading(false); 
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  const handleRemove = async (urlToRemove: string) => {
    try {
      await supabase.storage.from('survey-documents').remove([urlToRemove]);
      onChange(value.filter((url) => url !== urlToRemove));
      toast.success('Datei entfernt');
    } catch (error) { 
      toast.error('Fehler beim Löschen'); 
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-semibold">
          {label}
          {optional && <span className="text-muted-foreground font-normal ml-1">(optional)</span>}
        </Label>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
        isUploading ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        value.length >= maxFiles && "opacity-50 pointer-events-none"
      )}>
        <input 
          ref={fileInputRef} 
          type="file" 
          id={id} 
          accept={accept} 
          multiple 
          onChange={handleFileChange} 
          className="hidden" 
          disabled={isUploading || value.length >= maxFiles} 
        />
        <label htmlFor={id} className="cursor-pointer flex flex-col items-center gap-2">
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Wird hochgeladen...</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Dateien hier ablegen oder klicken</span>
              <span className="text-xs text-muted-foreground">PDF, JPG, PNG, DOC (max. 10MB)</span>
            </>
          )}
        </label>
      </div>
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((url, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm truncate max-w-[200px]">{url.split('/').pop()}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleRemove(url)} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">{value.length} von {maxFiles} Dateien</p>
        </div>
      )}
    </div>
  );
}
