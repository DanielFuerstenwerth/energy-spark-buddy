import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

interface SubcategoryTabsProps {
  activeSubcategory: string;
}

const SubcategoryTabs = ({ activeSubcategory }: SubcategoryTabsProps) => {
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    navigate(`/dezentrale-ew/${value}`);
  };

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="container mx-auto px-6">
        <Tabs value={activeSubcategory} onValueChange={handleTabChange}>
          <TabsList className="bg-transparent h-auto p-0 space-x-4">
            <TabsTrigger 
              value="ggv" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              GGV
            </TabsTrigger>
            <TabsTrigger 
              value="mieterstrom" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Mieterstrom
            </TabsTrigger>
            <TabsTrigger 
              value="14a" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              §14a
            </TabsTrigger>
            <TabsTrigger 
              value="direktvermarktung" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Direktvermarktung
            </TabsTrigger>
            <TabsTrigger 
              value="coming-soon" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Weitere
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default SubcategoryTabs;
