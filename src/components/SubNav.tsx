import { Link, useLocation } from "react-router-dom";
import { useNavigation } from "@/hooks/useNavigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SubNavProps {
  category: string;
  subcategory?: string;
}

const SubNav = ({ category, subcategory }: SubNavProps) => {
  const location = useLocation();
  const { navData, loading } = useNavigation();

  if (loading) {
    return (
      <nav aria-label="Subnavigation" className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 py-2 overflow-x-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-24 flex-shrink-0" />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  const categoryData = navData?.kategorien?.find(k => k.slug === category);

  if (!categoryData) {
    return null;
  }

  const hasSubcategories = categoryData.unterkategorien && categoryData.unterkategorien.length > 0;
  const subcategoryData = subcategory 
    ? categoryData.unterkategorien?.find(u => u.slug === subcategory)
    : null;
  const hasCriteria = subcategoryData?.kriterien && subcategoryData.kriterien.length > 0;

  if (!hasSubcategories) {
    return null;
  }

  return (
    <div className="border-b border-border">
      {/* Subcategories row - slightly darker background */}
      <nav aria-label="Unterkategorien" className="bg-muted/40 border-b border-border/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1 py-1.5 overflow-x-auto scrollbar-thin">
            {categoryData.unterkategorien!.map((sub) => {
              const href = `/${encodeURIComponent(category)}/${encodeURIComponent(sub.slug)}`;
              const isActive = subcategory === sub.slug;

              return (
                <Link
                  key={sub.slug}
                  to={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "px-3 py-1 text-sm transition-colors whitespace-nowrap flex-shrink-0 border-b-2",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    isActive
                      ? "text-primary font-medium border-primary bg-primary/10 rounded-t-md"
                      : "hover:bg-muted/60 text-foreground/80 border-transparent"
                  )}
                >
                  {sub.title}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Criteria row - lightest background */}
      {subcategory && hasCriteria && (
        <nav aria-label="Kriterien" className="bg-muted/20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center gap-1 py-1.5 overflow-x-auto scrollbar-thin">
              {subcategoryData!.kriterien!.map((krit) => {
                const href = `/${encodeURIComponent(category)}/${encodeURIComponent(subcategory)}/${encodeURIComponent(krit.slug)}`;
                const isActive = location.pathname === href || decodeURIComponent(location.pathname) === `/${category}/${subcategory}/${krit.slug}`;

                return (
                  <Link
                    key={krit.slug}
                    to={href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "px-3 py-1 text-sm rounded-full transition-colors whitespace-nowrap flex-shrink-0",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-muted/60 text-foreground/70"
                    )}
                  >
                    {krit.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};

export default SubNav;
