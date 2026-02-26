import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const CategoryNav = () => {
  const { navData, loading } = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Get current category from URL path
  const currentCategory = location.pathname.split('/')[1] || '';
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null);
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);
  const [clickedSubcategory, setClickedSubcategory] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [criteriaPosition, setCriteriaPosition] = useState<{ top: number; left: number } | null>(null);
  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subcategoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const subcategoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Update dropdown position when category changes
  useEffect(() => {
    const activeCategory = clickedCategory || hoveredCategory;
    if (activeCategory && buttonRefs.current[activeCategory]) {
      const button = buttonRefs.current[activeCategory];
      const rect = button!.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left
      });
    } else {
      setDropdownPosition(null);
    }
  }, [clickedCategory, hoveredCategory]);

  // Update criteria position when subcategory is hovered
  useEffect(() => {
    if (hoveredSubcategory && subcategoryRefs.current[hoveredSubcategory]) {
      const element = subcategoryRefs.current[hoveredSubcategory];
      const rect = element!.getBoundingClientRect();
      setCriteriaPosition({
        top: rect.top,
        left: rect.right + 4
      });
    } else {
      setCriteriaPosition(null);
    }
  }, [hoveredSubcategory]);

  // Close menu when clicking outside (mobile only)
  useEffect(() => {
    if (!isMobile) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setClickedCategory(null);
        setClickedSubcategory(null);
        setHoveredCategory(null);
        setHoveredSubcategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  // Show nothing while loading or if no data - but don't block the app
  if (loading) return null;
  if (!navData) {
    console.warn('[CategoryNav] No navigation data available');
    return null;
  }

  return (
    <nav ref={navRef} className="border-b border-border bg-background backdrop-blur sticky top-[57px] md:top-[73px] z-40 touch-pan-y shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative flex items-center gap-4 md:gap-8 py-3 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x">
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::after {
              content: '';
              position: absolute;
              right: 0;
              top: 0;
              bottom: 0;
              width: 40px;
              background: linear-gradient(to left, hsl(var(--background)), transparent);
              pointer-events: none;
              z-index: 1;
            }
          `}</style>
          {navData.kategorien.map((kategorie) => {
            const isOpen = hoveredCategory === kategorie.slug || clickedCategory === kategorie.slug;
            const isActive = decodeURIComponent(currentCategory) === kategorie.slug;
            
            return (
            <div 
              key={kategorie.slug}
              className="relative group snap-start"
              onMouseEnter={() => {
                if (isMobile) return; // No hover on mobile
                if (categoryTimeoutRef.current) {
                  clearTimeout(categoryTimeoutRef.current);
                }
                setHoveredCategory(kategorie.slug);
              }}
              onMouseLeave={() => {
                if (isMobile) return; // No hover on mobile
                categoryTimeoutRef.current = setTimeout(() => {
                  setHoveredCategory(null);
                  setHoveredSubcategory(null);
                }, 300);
              }}
            >
              <div className="flex items-center">
                <Link
                  to={`/${kategorie.slug}`}
                  className={`text-sm font-medium transition-all duration-200 py-2 px-2 whitespace-nowrap border-b-2 rounded-t-md ${
                    isActive 
                      ? 'text-primary border-primary bg-primary/10' 
                      : 'text-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/50 border-transparent'
                  }`}
                  onClick={() => {
                    setClickedCategory(null);
                    setHoveredCategory(null);
                    setHoveredSubcategory(null);
                  }}
                >
                  {kategorie.title}
                </Link>
                  <button
                  ref={(el) => buttonRefs.current[kategorie.slug] = el}
                  onClick={(e) => {
                    e.stopPropagation();
                    setClickedCategory(clickedCategory === kategorie.slug ? null : kategorie.slug);
                  }}
                  className={`min-h-[44px] min-w-[44px] flex items-center justify-center ml-0.5 transition-colors rounded-md ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-foreground hover:text-primary'
                  }`}
                  aria-label={`${kategorie.title} Untermenü öffnen`}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Mobile: Click-based dropdown with inline criteria */}
              {isMobile && isOpen && dropdownPosition && createPortal(
                <div 
                  className="min-w-[280px] bg-background border border-border rounded-md shadow-lg py-2 max-h-[70vh] overflow-y-auto" 
                  style={{ position: 'fixed', top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px`, zIndex: 999999 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {kategorie.unterkategorien && kategorie.unterkategorien.length > 0 ? (
                    <div>
                      {kategorie.unterkategorien.map((unterkategorie) => (
                        <div key={unterkategorie.slug}>
                          <div className="flex items-center justify-between">
                            <Link
                              to={`/${kategorie.slug}/${unterkategorie.slug}`}
                              className="flex-1 text-left px-4 py-2 text-sm font-semibold text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                              onClick={() => {
                                console.log('[Mobile] Unterkategorie link clicked:', unterkategorie.slug);
                                setClickedCategory(null);
                                setClickedSubcategory(null);
                              }}
                            >
                              {unterkategorie.title}
                            </Link>
                            {unterkategorie.kriterien && unterkategorie.kriterien.length > 0 && (
                              <button
                                className="px-4 py-2 text-foreground hover:text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newValue = clickedSubcategory === unterkategorie.slug ? null : unterkategorie.slug;
                                  console.log('[Mobile] Toggling kriterien for:', unterkategorie.slug, 'to:', newValue);
                                  setClickedSubcategory(newValue);
                                }}
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform ${clickedSubcategory === unterkategorie.slug ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>
                          
                          {clickedSubcategory === unterkategorie.slug && 
                           unterkategorie.kriterien && 
                           unterkategorie.kriterien.length > 0 && (
                            <div className="bg-accent/20 border-l-2 border-primary/40 ml-2">
                              {unterkategorie.kriterien.map((kriterium) => (
                                <Link
                                  key={kriterium.slug}
                                  to={`/${kategorie.slug}/${unterkategorie.slug}/${kriterium.slug}`}
                                  className="block px-4 py-2.5 text-sm text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                                  onClick={() => {
                                    console.log('[Mobile] Kriterium clicked:', kriterium.slug);
                                    setClickedCategory(null);
                                    setClickedSubcategory(null);
                                  }}
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
                          onClick={() => {
                            setClickedCategory(null);
                          }}
                        >
                          {kriterium.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      to={`/${kategorie.slug}`}
                      className="block px-4 py-2 text-sm text-foreground hover:text-primary transition-colors"
                      onClick={() => {
                        setClickedCategory(null);
                      }}
                    >
                      Zur Übersicht →
                    </Link>
                  )}
                </div>,
                document.body
              )}

              {/* Desktop: Portal-based dropdown with hover */}
              {!isMobile && isOpen && dropdownPosition && createPortal(
                <div 
                  className="min-w-[280px] md:min-w-[300px] bg-background border border-border rounded-md shadow-lg py-2 max-h-[70vh] overflow-y-auto"
                  style={{
                    position: 'fixed',
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                    zIndex: 99999
                  }}
                  onMouseEnter={() => {
                    if (categoryTimeoutRef.current) {
                      clearTimeout(categoryTimeoutRef.current);
                    }
                  }}
                  onMouseLeave={() => {
                    categoryTimeoutRef.current = setTimeout(() => {
                      setHoveredCategory(null);
                      setClickedCategory(null);
                      setHoveredSubcategory(null);
                    }, 300);
                  }}
                >
                  {kategorie.unterkategorien && kategorie.unterkategorien.length > 0 ? (
                    <div>
                      {kategorie.unterkategorien.map((unterkategorie) => (
                        <div 
                          key={unterkategorie.slug}
                          ref={(el) => subcategoryRefs.current[unterkategorie.slug] = el}
                          onMouseEnter={() => {
                            if (isMobile) return; // No hover on mobile
                            if (subcategoryTimeoutRef.current) {
                              clearTimeout(subcategoryTimeoutRef.current);
                            }
                            setHoveredSubcategory(unterkategorie.slug);
                          }}
                          onMouseLeave={() => {
                            if (isMobile) return; // No hover on mobile
                            subcategoryTimeoutRef.current = setTimeout(() => {
                              setHoveredSubcategory(null);
                            }, 200);
                          }}
                        >
                          <Link
                            to={`/${kategorie.slug}/${unterkategorie.slug}`}
                            className="block px-4 py-2 text-sm font-semibold text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                            onClick={(e) => {
                              console.log('[CategoryNav] Subcategory clicked:', unterkategorie.slug, 'isMobile:', isMobile);
                              
                              if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
                              if (subcategoryTimeoutRef.current) clearTimeout(subcategoryTimeoutRef.current);
                              
                              setClickedCategory(null);
                              setHoveredCategory(null);
                              setHoveredSubcategory(null);
                            }}
                          >
                            {unterkategorie.title}
                          </Link>
                          
                          {/* Desktop: Hover-based portal dropdown */}
                          {!isMobile && hoveredSubcategory === unterkategorie.slug && 
                           unterkategorie.kriterien && 
                           unterkategorie.kriterien.length > 0 && 
                           criteriaPosition && createPortal(
                            <div 
                              className="min-w-[250px] bg-background border border-border rounded-md shadow-lg py-2"
                              style={{
                                position: 'fixed',
                                top: `${criteriaPosition.top}px`,
                                left: `${criteriaPosition.left}px`,
                                zIndex: 100000
                              }}
                              onMouseEnter={() => {
                                if (isMobile) return; // No hover on mobile
                                if (subcategoryTimeoutRef.current) {
                                  clearTimeout(subcategoryTimeoutRef.current);
                                }
                              }}
                              onMouseLeave={() => {
                                if (isMobile) return; // No hover on mobile
                                subcategoryTimeoutRef.current = setTimeout(() => {
                                  setHoveredSubcategory(null);
                                }, 200);
                              }}
                            >
                               {unterkategorie.kriterien.map((kriterium) => (
                               <Link
                                  key={kriterium.slug}
                                  to={`/${kategorie.slug}/${unterkategorie.slug}/${kriterium.slug}`}
                                  className="block px-4 py-2 text-sm text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                                  onClick={(e) => {
                                    if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
                                    if (subcategoryTimeoutRef.current) clearTimeout(subcategoryTimeoutRef.current);
                                    
                                    setClickedCategory(null);
                                    setHoveredCategory(null);
                                    setHoveredSubcategory(null);
                                  }}
                                >
                                  {kriterium.title}
                                </Link>
                              ))}
                            </div>,
                            document.body
                          )}
                          
                          {/* Mobile: Click-based inline criteria */}
                          {isMobile && clickedSubcategory === unterkategorie.slug && 
                           unterkategorie.kriterien && 
                           unterkategorie.kriterien.length > 0 && (
                            <div className="pl-4 bg-accent/30 border-l-2 border-primary/50">
                              {unterkategorie.kriterien.map((kriterium) => (
                                <Link
                                  key={kriterium.slug}
                                  to={`/${kategorie.slug}/${unterkategorie.slug}/${kriterium.slug}`}
                                  className="block px-4 py-2 text-sm text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                                  onClick={(e) => {
                                    console.log('[CategoryNav] Criterion clicked:', kriterium.slug);
                                    
                                    setClickedCategory(null);
                                    setHoveredCategory(null);
                                    setClickedSubcategory(null);
                                  }}
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
                        <div
                          key={kriterium.slug}
                          className="block px-4 py-2 text-sm text-foreground hover:text-primary hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('[CategoryNav] Direct criterion clicked:', kriterium.slug);
                            if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
                            
                            const path = `/${kategorie.slug}/${kriterium.slug}`;
                            console.log('[CategoryNav] Navigating to:', path);
                            
                            if (isMobile) {
                              navigate(path);
                              setTimeout(() => {
                                setClickedCategory(null);
                                setHoveredCategory(null);
                              }, 100);
                            } else {
                              navigate(path);
                              setClickedCategory(null);
                              setHoveredCategory(null);
                            }
                          }}
                        >
                          {kriterium.title}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-2">
                      <div
                        className="block text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
                          
                          // Immediate navigation on mobile, no delays
                          if (isMobile) {
                            setClickedCategory(null);
                            setHoveredCategory(null);
                            setTimeout(() => navigate(`/${kategorie.slug}`), 0);
                          } else {
                            navigate(`/${kategorie.slug}`);
                            setClickedCategory(null);
                            setHoveredCategory(null);
                          }
                        }}
                      >
                        Zur Übersicht →
                      </div>
                    </div>
                  )}
                </div>,
                document.body
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
