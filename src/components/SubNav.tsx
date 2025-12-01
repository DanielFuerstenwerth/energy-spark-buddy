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
      <nav aria-label="Subnavigation" className="mb-6">
        <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-32 lg:w-full" />
          ))}
        </div>
      </nav>
    );
  }

  const categoryData = navData?.kategorien?.find(k => k.slug === category);

  if (!categoryData) {
    return (
      <nav aria-label="Subnavigation" className="mb-6">
        <p className="text-sm text-muted-foreground">Keine Unterpunkte definiert</p>
      </nav>
    );
  }

  // On subcategory page: show criteria
  if (subcategory) {
    const subcategoryData = categoryData.unterkategorien?.find(u => u.slug === subcategory);
    
    if (!subcategoryData?.kriterien || subcategoryData.kriterien.length === 0) {
      return (
        <nav aria-label="Subnavigation" className="mb-6">
          <p className="text-sm text-muted-foreground">Keine Kriterien definiert</p>
        </nav>
      );
    }

    return (
      <nav aria-label="Subnavigation" className="mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Kriterien
        </h2>
        <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          {subcategoryData.kriterien.map((krit) => {
            const href = `/${encodeURIComponent(category)}/${encodeURIComponent(subcategory)}/${encodeURIComponent(krit.slug)}`;
            const isActive = location.pathname === href || decodeURIComponent(location.pathname) === `/${category}/${subcategory}/${krit.slug}`;

            return (
              <li key={krit.slug}>
                <Link
                  to={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block px-3 py-2 text-sm rounded-md transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  {krit.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  // On category page: show subcategories
  if (!categoryData.unterkategorien || categoryData.unterkategorien.length === 0) {
    return (
      <nav aria-label="Subnavigation" className="mb-6">
        <p className="text-sm text-muted-foreground">Keine Unterkategorien definiert</p>
      </nav>
    );
  }

  return (
    <nav aria-label="Subnavigation" className="mb-6">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
        Unterkategorien
      </h2>
      <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
        {categoryData.unterkategorien.map((sub) => {
          const href = `/${encodeURIComponent(category)}/${encodeURIComponent(sub.slug)}`;
          const isActive = location.pathname === href || decodeURIComponent(location.pathname) === `/${category}/${sub.slug}`;

          return (
            <li key={sub.slug}>
              <Link
                to={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "block px-3 py-2 text-sm rounded-md transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                {sub.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SubNav;
