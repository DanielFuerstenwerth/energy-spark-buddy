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

  // On subcategory page: show criteria
  if (subcategory) {
    const subcategoryData = categoryData.unterkategorien?.find(u => u.slug === subcategory);
    
    if (!subcategoryData?.kriterien || subcategoryData.kriterien.length === 0) {
      return null;
    }

    return (
      <nav aria-label="Subnavigation" className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-thin">
            <span className="text-xs font-medium text-muted-foreground mr-2 flex-shrink-0">
              Kriterien:
            </span>
            {subcategoryData.kriterien.map((krit) => {
              const href = `/${encodeURIComponent(category)}/${encodeURIComponent(subcategory)}/${encodeURIComponent(krit.slug)}`;
              const isActive = location.pathname === href || decodeURIComponent(location.pathname) === `/${category}/${subcategory}/${krit.slug}`;

              return (
                <Link
                  key={krit.slug}
                  to={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap flex-shrink-0",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  {krit.title}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    );
  }

  // On category page: show subcategories
  if (!categoryData.unterkategorien || categoryData.unterkategorien.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Subnavigation" className="bg-muted/50 border-b border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-thin">
          <span className="text-xs font-medium text-muted-foreground mr-2 flex-shrink-0">
            Unterkategorien:
          </span>
          {categoryData.unterkategorien.map((sub) => {
            const href = `/${encodeURIComponent(category)}/${encodeURIComponent(sub.slug)}`;
            const isActive = location.pathname === href || decodeURIComponent(location.pathname) === `/${category}/${sub.slug}`;

            return (
              <Link
                key={sub.slug}
                to={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap flex-shrink-0",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                {sub.title}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default SubNav;
