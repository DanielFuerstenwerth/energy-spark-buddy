import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';

const CategoryNav = () => {
  const { navData, loading } = useNavigation();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null);
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);
  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subcategoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setClickedCategory(null);
        setHoveredCategory(null);
        setHoveredSubcategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show nothing while loading or if no data - but don't block the app
  if (loading) return null;
  if (!navData) {
    console.warn('[CategoryNav] No navigation data available');
    return null;
  }

  return (
    <nav ref={navRef} className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-[100] touch-pan-y">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-4 md:gap-8 py-3 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x">
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            @media (max-width: 768px) {
              .scrollbar-hide::after {
                content: '';
                position: absolute;
                right: 0;
                top: 0;
                bottom: 0;
                width: 40px;
                background: linear-gradient(to left, hsl(var(--background)), transparent);
                pointer-events: none;
              }
            }
          `}</style>
          {navData.kategorien.map((kategorie) => {
            const isOpen = hoveredCategory === kategorie.slug || clickedCategory === kategorie.slug;
            
            return (
            <div 
              key={kategorie.slug}
              className="relative group snap-start"
              onMouseEnter={() => {
                if (categoryTimeoutRef.current) {
                  clearTimeout(categoryTimeoutRef.current);
                }
                setHoveredCategory(kategorie.slug);
              }}
              onMouseLeave={() => {
                categoryTimeoutRef.current = setTimeout(() => {
                  setHoveredCategory(null);
                  setHoveredSubcategory(null);
                }, 300);
              }}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setClickedCategory(clickedCategory === kategorie.slug ? null : kategorie.slug);
                }}
                className="flex items-center gap-1 md:gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors py-2 whitespace-nowrap"
              >
                {kategorie.title}
                <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="absolute top-full left-0 mt-0 min-w-[280px] md:min-w-[300px] bg-background border border-border rounded-md shadow-lg z-[200] py-2 max-h-[70vh] overflow-y-auto">
                  {kategorie.unterkategorien && kategorie.unterkategorien.length > 0 ? (
                    <div>
                      {kategorie.unterkategorien.map((unterkategorie) => (
                        <div 
                          key={unterkategorie.slug} 
                          className="relative"
                          onMouseEnter={() => {
                            if (subcategoryTimeoutRef.current) {
                              clearTimeout(subcategoryTimeoutRef.current);
                            }
                            setHoveredSubcategory(unterkategorie.slug);
                          }}
                          onMouseLeave={() => {
                            subcategoryTimeoutRef.current = setTimeout(() => {
                              setHoveredSubcategory(null);
                            }, 300);
                          }}
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
                            <div className="absolute left-full top-0 ml-1 min-w-[250px] bg-background border border-border rounded-md shadow-lg z-[3020] py-2">
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
                  ) : kategorie.kriterien && kategorie.kriterien.length > 0 ? (
                    <div>
                      {kategorie.kriterien.map((kriterium) => (
                        <Link
                          key={kriterium.slug}
                          to={`/${kategorie.slug}/${kriterium.slug}`}
                          className="block px-4 py-2 text-sm text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                        >
                          {kriterium.title}
                        </Link>
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
          );
          })}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
