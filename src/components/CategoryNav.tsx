import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';

const CategoryNav = () => {
  const { navData, loading } = useNavigation();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null);

  if (loading || !navData) return null;

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-8 py-3">
          {navData.kategorien.map((kategorie) => (
            <div
              key={kategorie.slug}
              className="relative group"
              onMouseEnter={() => setHoveredCategory(kategorie.slug)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors py-2">
                {kategorie.title}
                <ChevronDown className="w-4 h-4" />
              </button>

              {hoveredCategory === kategorie.slug && (
                <div className="absolute top-full left-0 mt-0 min-w-[300px] bg-popover border border-border rounded-md shadow-lg z-50 py-2">
                  {kategorie.unterkategorien && kategorie.unterkategorien.length > 0 ? (
                    <div>
                      {kategorie.unterkategorien.map((unterkategorie) => (
                        <div 
                          key={unterkategorie.slug} 
                          className="relative"
                          onMouseEnter={() => setHoveredSubcategory(unterkategorie.slug)}
                          onMouseLeave={() => setHoveredSubcategory(null)}
                        >
                          <Link
                            to={`/${kategorie.slug}/${unterkategorie.slug}`}
                            className="block px-4 py-2 text-sm font-semibold text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                          >
                            {unterkategorie.title}
                          </Link>
                          
                          {hoveredSubcategory === unterkategorie.slug && 
                           unterkategorie.kriterien && 
                           unterkategorie.kriterien.length > 0 && (
                            <div className="absolute left-full top-0 ml-1 min-w-[250px] bg-popover border border-border rounded-md shadow-lg z-50 py-2">
                              {unterkategorie.kriterien.map((kriterium) => (
                                <Link
                                  key={kriterium.slug}
                                  to={`/${kategorie.slug}/${unterkategorie.slug}/${kriterium.slug}`}
                                  className="block px-4 py-2 text-sm text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                                >
                                  {kriterium.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-2">
                      <Link
                        to={`/${kategorie.slug}`}
                        className="block text-sm text-foreground hover:text-primary transition-colors"
                      >
                        Zur Übersicht →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
