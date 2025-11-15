import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VnbComboboxProps {
  vnbList: Array<{ id: string; name: string; score: number | null }>;
  selectedVnbId: string | null;
  onVnbSelect: (vnbId: string) => void;
  disabled?: boolean;
}

export function VnbCombobox({ vnbList, selectedVnbId, onVnbSelect, disabled }: VnbComboboxProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  
  const filteredVnbs = React.useMemo(() => {
    if (!searchTerm.trim()) return vnbList;
    const search = searchTerm.toLowerCase();
    return vnbList.filter(vnb => 
      vnb.name.toLowerCase().includes(search) || 
      vnb.id.toLowerCase().includes(search)
    );
  }, [searchTerm, vnbList]);

  const handleFocus = () => setShowDropdown(true);
  const handleBlur = () => {
    // Delay to allow click on dropdown items
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="VNB suchen ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className="pl-9"
        />
      </div>
      
      {showDropdown && filteredVnbs.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
          <ScrollArea className="h-auto max-h-60">
            <div className="p-1">
              {filteredVnbs.slice(0, 10).map((vnb) => (
                <button
                  key={vnb.id}
                  onMouseDown={(e) => {
                    e.preventDefault(); // ensure selection before input blur
                    onVnbSelect(vnb.id);
                    setSearchTerm("");
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-sm transition-colors ${
                    vnb.id === selectedVnbId ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex-1 truncate font-medium">
                      {vnb.name}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {vnb.score !== null ? `${vnb.score > 0 ? '+' : ''}${vnb.score}` : 'N/A'}
                    </span>
                  </div>
                </button>
              ))}
              {filteredVnbs.length > 10 && (
                <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                  +{filteredVnbs.length - 10} weitere Ergebnisse
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
      
      {showDropdown && searchTerm && filteredVnbs.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-3 text-sm text-muted-foreground text-center">
          Keine VNB gefunden für "{searchTerm}"
        </div>
      )}
    </div>
  );
}
