import { useState } from "react";
import { useNavigate } from "react-router-dom";
interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}
const CategoryTabs = ({
  activeCategory,
  onCategoryChange
}: CategoryTabsProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const subcategories = [{
    id: "ggv",
    label: "Gemeinschaftliche Gebäudeversorgung (GGV)",
    path: "/dezentrale-ew/ggv"
  }, {
    id: "mieterstrom",
    label: "Mieterstrom",
    path: "/dezentrale-ew/mieterstrom"
  }, {
    id: "14a",
    label: "§14a EnWG",
    path: "/dezentrale-ew/14a"
  }, {
    id: "direktvermarktung",
    label: "Direktvermarktung",
    path: "/dezentrale-ew/direktvermarktung"
  }, {
    id: "coming-soon",
    label: "Weitere Kategorien",
    path: "/dezentrale-ew/coming-soon"
  }];
  return <div className="border-b border-border bg-background">
      <div className="container mx-auto px-6">
        <div className="flex items-center space-x-4">
          <div className="relative" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
            <button onClick={() => onCategoryChange("dezentrale-ew")} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeCategory === "dezentrale-ew" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              Dezentrale Energiewende
            </button>
            
            {showDropdown && <div className="absolute top-full left-0 mt-0 bg-background border border-border rounded-b-lg shadow-lg z-[100] min-w-[300px]">
                <ul className="py-2">
                  {subcategories.map(sub => <li key={sub.id}>
                      <button onClick={() => {
                  navigate(sub.path);
                  setShowDropdown(false);
                }} className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        {sub.label}
                      </button>
                    </li>)}
                </ul>
              </div>}
          </div>
          
          <button 
            className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground opacity-50 cursor-not-allowed" 
            disabled
          >
            Digitalisierung
          </button>
        </div>
      </div>
    </div>;
};
export default CategoryTabs;