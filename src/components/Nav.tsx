/**
 * Fixed Navigation Component - Standard Shadcn Implementation
 * DO NOT MODIFY - This component uses standard Shadcn components for stability
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut, Shield, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import Logo from "./Logo";
import type { NavItem, NavSection } from "@/lib/nav";

export default function Nav({ items }: { items: NavItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAdmin, user } = useIsAdmin();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50" aria-label="Hauptnavigation">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground rounded-md">
        Zum Hauptinhalt springen
      </a>
      <div className="container mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation - Standard NavigationMenu */}
        <div className="hidden md:flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList>
              {items.map((it, i) => (
                <NavigationMenuItem key={i}>
                  {it.sections?.length ? (
                    <>
                      <NavigationMenuTrigger className="h-9 bg-transparent hover:bg-accent data-[state=open]:bg-accent text-sm font-medium">
                        {it.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-[600px] grid-cols-2 gap-3 p-4 bg-popover">
                          <div className="col-span-2 border-b border-border pb-2 mb-1">
                            <NavigationMenuLink asChild>
                              <Link 
                                to={it.href || "#"}
                                className="block px-3 py-2 font-bold text-sm text-primary hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                              >
                                {it.label} – Übersicht
                              </Link>
                            </NavigationMenuLink>
                          </div>
                          {it.sections.map((sec: NavSection, k) => (
                            <div key={k} className="space-y-1">
                              <NavigationMenuLink asChild>
                                <Link 
                                  to={sec.href}
                                  className="block px-3 py-2 font-semibold text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                                >
                                  {sec.label}
                                </Link>
                              </NavigationMenuLink>
                              <div className="space-y-0.5 pl-2">
                                {(sec.items || []).map((c, kk) => (
                                  <NavigationMenuLink key={kk} asChild>
                                    <Link 
                                      to={c.href}
                                      className="block px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                                    >
                                      {c.label}
                                    </Link>
                                  </NavigationMenuLink>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link 
                        to={it.href || "#"}
                        className="inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                      >
                        {it.label}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          
          {/* Admin Controls - Desktop */}
          {isAdmin && user && (
            <div className="ml-4 pl-4 border-l border-border flex items-center gap-3">
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
            </div>
          )}
        </div>

        {/* Mobile Menu - Standard Sheet with Accordion */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menü öffnen</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto">
            <div className="mt-6 space-y-4">
              {items.map((it, i) => {
                const hasSections = !!it.sections?.length;
                return (
                  <div key={i}>
                    {hasSections ? (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value={`item-${i}`} className="border-0">
                          <AccordionTrigger className="py-2 hover:no-underline font-semibold text-foreground">
                            {it.label}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-2">
                              <Link 
                                to={it.href || "#"}
                                className="block py-2 px-3 font-medium text-primary hover:bg-accent rounded-md transition-colors"
                                onClick={() => setMobileOpen(false)}
                              >
                                {it.label} – Übersicht
                              </Link>
                              <Accordion type="single" collapsible className="w-full">
                                {(it.sections || []).map((sec, k) => (
                                  <AccordionItem key={k} value={`sec-${i}-${k}`} className="border-0">
                                    <AccordionTrigger className="py-2 text-sm hover:no-underline font-medium text-foreground">
                                      {sec.label}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="space-y-1 pl-3">
                                        <Link 
                                          to={sec.href}
                                          className="block py-2 px-3 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors"
                                          onClick={() => setMobileOpen(false)}
                                        >
                                          {sec.label} – Übersicht
                                        </Link>
                                        {(sec.items || []).map((c, kk) => (
                                          <Link 
                                            key={kk}
                                            to={c.href}
                                            className="block py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-3 transition-colors"
                                            onClick={() => setMobileOpen(false)}
                                          >
                                            {c.label}
                                          </Link>
                                        ))}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ) : (
                      <Link 
                        to={it.href || "#"}
                        className="block py-2 font-semibold text-foreground hover:text-primary transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {it.label}
                      </Link>
                    )}
                  </div>
                );
              })}
              
              {/* Admin Controls - Mobile */}
              {isAdmin && user && (
                <div className="pt-6 mt-6 border-t border-border space-y-3">
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
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
