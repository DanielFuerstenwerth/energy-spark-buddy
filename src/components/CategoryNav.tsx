import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const CategoryNav = () => {
  const { navData, loading } = useNavigation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    <nav ref={navRef} className="border-b border-border bg-background backdrop-blur sticky top-0 z-[99999] touch-pan-y shadow-sm">
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
              <button
                ref={(el) => buttonRefs.current[kategorie.slug] = el}
                onClick={(e) => {
                  e.stopPropagation();
                  setClickedCategory(clickedCategory === kategorie.slug ? null : kategorie.slug);
                }}
                className="flex items-center gap-1 md:gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors py-2 whitespace-nowrap"
              >
                {kategorie.title}
                <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown - Portal für alle Geräte damit es über der Karte ist */}
              {isOpen && dropdownPosition && createPortal(
                <div 
                  className="min-w-[280px] bg-background border border-border rounded-md shadow-lg py-2 max-h-[70vh] overflow-y-auto" 
                  style={{ position: 'fixed', top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px`, zIndex: 999999 }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseEnter={() => {
                    if (isMobile) return;
                    if (categoryTimeoutRef.current) {
                      clearTimeout(categoryTimeoutRef.current);
                    }
                  }}
                  onMouseLeave={() => {
                    if (isMobile) return;
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
                        <div key={unterkategorie.slug}>
                          <button
                            className="w-full text-left px-4 py-2 text-sm font-semibold text-foreground hover:text-primary hover:bg-accent/50 transition-colors flex items-center justify-between"
                            onClick={() => {
                              console.log('[Mobile] Unterkategorie clicked:', unterkategorie.slug);
                              console.log('[Mobile] Has kriterien?', unterkategorie.kriterien?.length || 0);
                              console.log('[Mobile] Current clickedSubcategory:', clickedSubcategory);
                              
                              if (unterkategorie.kriterien && unterkategorie.kriterien.length > 0) {
                                const newValue = clickedSubcategory === unterkategorie.slug ? null : unterkategorie.slug;
                                console.log('[Mobile] Setting clickedSubcategory to:', newValue);
                                setClickedSubcategory(newValue);
                              } else {
                                console.log('[Mobile] Navigating to:', `/${kategorie.slug}/${unterkategorie.slug}`);
                                navigate(`/${kategorie.slug}/${unterkategorie.slug}`);
                                setClickedCategory(null);
                              }
                            }}
                          >
                            <span>{unterkategorie.title}</span>
                            {unterkategorie.kriterien && unterkategorie.kriterien.length > 0 && (
                              <ChevronDown className={`w-3 h-3 transition-transform ${clickedSubcategory === unterkategorie.slug ? 'rotate-180' : ''}`} />
                            )}
                          </button>
                          
                          {clickedSubcategory === unterkategorie.slug && 
                           unterkategorie.kriterien && 
                           unterkategorie.kriterien.length > 0 && (
                            <div className="bg-accent/20 border-l-2 border-primary/40 ml-2">
                              {unterkategorie.kriterien.map((kriterium) => (
                                <button
                                  key={kriterium.slug}
                                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                                  onClick={() => {
                                    console.log('[Mobile] Kriterium clicked:', kriterium.slug);
                                    navigate(`/${kategorie.slug}/${unterkategorie.slug}/${kriterium.slug}`);
                                    setClickedCategory(null);
                                    setClickedSubcategory(null);
                                  }}
                                >
                                  {kriterium.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : kategorie.kriterien && kategorie.kriterien.length > 0 ? (
                    <div>
                      {kategorie.kriterien.map((kriterium) => (
                        <button
                          key={kriterium.slug}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                          onClick={() => {
                            navigate(`/${kategorie.slug}/${kriterium.slug}`);
                            setClickedCategory(null);
                          }}
                        >
                          {kriterium.title}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:text-primary transition-colors"
                      onClick={() => {
                        navigate(`/${kategorie.slug}`);
                        setClickedCategory(null);
                      }}
                    >
                      Zur Übersicht →
                    </button>
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
                          <div
                            className="block px-4 py-2 text-sm font-semibold text-foreground hover:text-primary hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('[CategoryNav] Subcategory clicked:', unterkategorie.slug, 'isMobile:', isMobile);
                              
                              if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
                              if (subcategoryTimeoutRef.current) clearTimeout(subcategoryTimeoutRef.current);
                              
                              // On mobile: toggle criteria if they exist, otherwise navigate
                              if (isMobile) {
                                if (unterkategorie.kriterien && unterkategorie.kriterien.length > 0) {
                                  console.log('[CategoryNav] Toggling criteria for:', unterkategorie.slug);
                                  setClickedSubcategory(
                                    clickedSubcategory === unterkategorie.slug ? null : unterkategorie.slug
                                  );
                                } else {
                                  console.log('[CategoryNav] Navigating to:', `/${kategorie.slug}/${unterkategorie.slug}`);
                                  const path = `/${kategorie.slug}/${unterkategorie.slug}`;
                                  navigate(path);
                                  // Clear states after navigation
                                  setTimeout(() => {
                                    setClickedCategory(null);
                                    setHoveredCategory(null);
                                  }, 100);
                                }
                              } else {
                                navigate(`/${kategorie.slug}/${unterkategorie.slug}`);
                                setClickedCategory(null);
                                setHoveredCategory(null);
                                setHoveredSubcategory(null);
                              }
                            }}
                          >
                            {unterkategorie.title}
                          </div>
                          
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
                               <div
                                  key={kriterium.slug}
                                  className="block px-4 py-2 text-sm text-foreground hover:text-primary hover:bg-accent/50 transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
                                    if (subcategoryTimeoutRef.current) clearTimeout(subcategoryTimeoutRef.current);
                                    
                                    // Immediate navigation on mobile, no delays
                                    if (isMobile) {
                                      setClickedCategory(null);
                                      setHoveredCategory(null);
                                      setHoveredSubcategory(null);
                                      // Use setTimeout to ensure state updates before navigation
                                      setTimeout(() => navigate(`/${kategorie.slug}/${unterkategorie.slug}/${kriterium.slug}`), 0);
                                    } else {
                                      navigate(`/${kategorie.slug}/${unterkategorie.slug}/${kriterium.slug}`);
                                      setClickedCategory(null);
                                      setHoveredCategory(null);
                                      setHoveredSubcategory(null);
                                    }
                                  }}
                                >
                                  {kriterium.title}
                                </div>
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
                                <div
                                  key={kriterium.slug}
                                  className="block px-4 py-2 text-sm text-foreground hover:text-primary hover:bg-accent/50 transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('[CategoryNav] Criterion clicked:', kriterium.slug);
                                    const path = `/${kategorie.slug}/${unterkategorie.slug}/${kriterium.slug}`;
                                    console.log('[CategoryNav] Navigating to:', path);
                                    navigate(path);
                                    // Clear states after navigation
                                    setTimeout(() => {
                                      setClickedCategory(null);
                                      setHoveredCategory(null);
                                      setClickedSubcategory(null);
                                    }, 100);
                                  }}
                                >
                                  {kriterium.title}
                                </div>
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
