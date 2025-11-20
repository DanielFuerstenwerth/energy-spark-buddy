/**
 * Fixed Navigation Component
 * DO NOT MODIFY - This component is designed to be stable and should not be automatically refactored
 */

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import Logo from "./Logo";
import type { NavItem, NavSection } from "@/lib/nav";

export default function Nav({ items }: { items: NavItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCat, setOpenCat] = useState<number | null>(null);
  const [openSub, setOpenSub] = useState<{ [catIdx: number]: number | null }>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const { isAdmin, user } = useIsAdmin();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setOpenCat(null);
        setOpenSub({});
      }
    };
    const onClick = (e: MouseEvent) => {
      if (mobileOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
        setOpenCat(null);
        setOpenSub({});
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [mobileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50" aria-label="Hauptnavigation">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground rounded-md">
        Zum Hauptinhalt springen
      </a>
      <div className="container mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-6 items-center">
          {items.map((it, i) => (
            <li key={i} className="relative group">
              {it.sections?.length ? (
                <>
                  <Link 
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2" 
                    to={it.href || "#"} 
                    aria-haspopup="menu" 
                    aria-expanded="false"
                  >
                    {it.label}
                  </Link>
                  <div
                    role="menu"
                    className="invisible opacity-0 group-hover:visible group-hover:opacity-100 focus-within:visible focus-within:opacity-100 transition-all duration-200
                               absolute top-full left-0 mt-2 min-w-[32rem] border border-border rounded-lg bg-popover shadow-lg p-3 z-50 grid grid-cols-2 gap-3"
                  >
                    {it.sections.map((sec: NavSection, k) => (
                      <div key={k} className="min-w-56">
                        <Link 
                          role="menuitem" 
                          className="block px-2 py-1 font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded transition-colors" 
                          to={sec.href}
                        >
                          {sec.label}
                        </Link>
                        <div className="mt-1 space-y-0.5">
                          {(sec.items || []).map((c, kk) => (
                            <Link 
                              key={kk} 
                              role="menuitem" 
                              to={c.href}
                              className="block rounded px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                              {c.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <Link className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2" to={it.href || "#"}>
                  {it.label}
                </Link>
              )}
            </li>
          ))}
          
          {/* Admin Controls - Desktop */}
          {isAdmin && user && (
            <li className="ml-2 pl-6 border-l border-border flex items-center gap-3">
              <Link 
                to="/admin" 
                className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin-Modus</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-8 gap-2 text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </li>
          )}
        </ul>

        {/* Mobile Menu Trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10"
          aria-controls="mobile-nav"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menü öffnen</span>
        </Button>
      </div>

      {/* Mobile Drawer */}
      <div
        id="mobile-nav"
        ref={panelRef}
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="absolute inset-0 bg-black/25" />
        <div className="ml-auto h-full w-80 max-w-[85%] bg-background shadow-xl overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-lg">Navigation</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Schließen"
                className="h-8 w-8"
              >
                <span className="text-xl">✕</span>
              </Button>
            </div>
            
            <ul className="space-y-2">
              {items.map((it, i) => {
                const hasSections = !!it.sections?.length;
                const expanded = openCat === i;
                return (
                  <li key={i} className="border-b border-border pb-2">
                    {hasSections ? (
                      <>
                        <button
                          className="w-full flex items-center justify-between py-2 text-left font-medium text-foreground hover:text-primary transition-colors"
                          aria-expanded={expanded}
                          aria-controls={`cat-${i}`}
                          onClick={() => setOpenCat(expanded ? null : i)}
                        >
                          <span>{it.label}</span>
                          <span aria-hidden className="text-lg">{expanded ? "▾" : "▸"}</span>
                        </button>
                        <div id={`cat-${i}`} hidden={!expanded} className="space-y-2 mt-2">
                          {(it.sections || []).map((sec, k) => {
                            const secOpen = openSub[i] === k;
                            return (
                              <div key={k} className="pl-3">
                                <button
                                  className="w-full flex items-center justify-between py-2 text-left font-medium text-foreground hover:text-primary transition-colors"
                                  aria-expanded={secOpen}
                                  aria-controls={`sec-${i}-${k}`}
                                  onClick={() => setOpenSub(s => ({ ...s, [i]: secOpen ? null : k }))}
                                >
                                  <span className="text-sm">{sec.label}</span>
                                  <span aria-hidden className="text-sm">{secOpen ? "▾" : "▸"}</span>
                                </button>
                                <div id={`sec-${i}-${k}`} hidden={!secOpen} className="pl-3 space-y-1 mt-1">
                                  <Link 
                                    className="block py-1.5 rounded text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors px-2" 
                                    to={sec.href} 
                                    onClick={() => setMobileOpen(false)}
                                  >
                                    Übersicht
                                  </Link>
                                  {(sec.items || []).map((c, kk) => (
                                    <Link 
                                      key={kk} 
                                      className="block py-1.5 rounded text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors px-2" 
                                      to={c.href} 
                                      onClick={() => setMobileOpen(false)}
                                    >
                                      {c.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <Link 
                        className="block py-2 font-medium text-foreground hover:text-primary transition-colors" 
                        to={it.href || "#"} 
                        onClick={() => setMobileOpen(false)}
                      >
                        {it.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            
            {/* Admin Controls - Mobile */}
            {isAdmin && user && (
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <Link
                  to="/admin"
                  className="flex items-center gap-2 py-2 font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin-Modus</span>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
