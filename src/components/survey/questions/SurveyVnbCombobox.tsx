import { useState, useMemo, useEffect } from "react";
import { Check, ChevronsUpDown, Search, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { QuestionTag } from "./QuestionTag";

interface VnbOption {
  id: string;
  name: string;
}

interface SurveyVnbComboboxProps {
  id: string;
  label: string;
  description?: string;
  value?: string;
  onChange: (value: string) => void;
  optional?: boolean;
  questionNumber?: string;
}

export function SurveyVnbCombobox({ id, label, description, value, onChange, optional, questionNumber }: SurveyVnbComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [vnbList, setVnbList] = useState<VnbOption[]>([]);

  // Load VNB names from the existing JSON file
  useEffect(() => {
    fetch('/data/vnb_names.json')
      .then(res => res.json())
      .then((data: Record<string, { name: string }>) => {
        const vnbs = Object.entries(data).map(([id, info]) => ({
          id,
          name: info.name
        }));
        setVnbList(vnbs);
      })
      .catch(console.error);
  }, []);

  const filteredVnbs = useMemo(() => {
    if (!searchQuery.trim()) return vnbList.slice(0, 50);
    const query = searchQuery.toLowerCase();
    return vnbList
      .filter(vnb => vnb.name.toLowerCase().includes(query))
      .slice(0, 50);
  }, [searchQuery, vnbList]);

  const handleSelect = (selectedValue: string) => { 
    onChange(selectedValue === value ? "" : selectedValue); 
    setOpen(false); 
  };

  const handleCustomEntry = () => {
    if (searchQuery.trim()) { 
      onChange(searchQuery.trim()); 
      setOpen(false); 
      setSearchQuery(""); 
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {questionNumber && <QuestionTag questionNumber={questionNumber} />}
        {optional && <span className="text-muted-foreground ml-1">(optional)</span>}
      </Label>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            id={id} 
            variant="outline" 
            role="combobox" 
            aria-expanded={open} 
            className="w-full justify-between font-normal h-auto min-h-10 py-2"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              {value ? (
                <span className="truncate">{value}</span>
              ) : (
                <span className="text-muted-foreground">VNB suchen oder eingeben...</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover z-50" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder="VNB suchen..." value={searchQuery} onValueChange={setSearchQuery} />
            <CommandList>
              <CommandEmpty>
                {searchQuery.trim() ? (
                  <div className="p-2">
                    <Button variant="ghost" className="w-full justify-start text-left" onClick={handleCustomEntry}>
                      <Search className="mr-2 h-4 w-4" />
                      "{searchQuery}" als neuen VNB eintragen
                    </Button>
                  </div>
                ) : (
                  <p className="p-4 text-sm text-muted-foreground text-center">Geben Sie einen VNB-Namen ein</p>
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredVnbs.map((vnb) => (
                  <CommandItem 
                    key={vnb.id} 
                    value={vnb.name} 
                    onSelect={() => handleSelect(vnb.name)} 
                    className="cursor-pointer"
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === vnb.name ? "opacity-100" : "opacity-0")} />
                    <span>{vnb.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
