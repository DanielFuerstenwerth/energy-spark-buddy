import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut, Shield } from "lucide-react";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdmin, user } = useIsAdmin();
  const navigate = useNavigate();

  const navLinks = [
    { to: "/news", label: "News" },
    { to: "/Umfrage-GGV", label: "Umfrage GGV & Co" },
    { to: "/impressum", label: "Kontakt" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground rounded-md">
        Zum Hauptinhalt springen
      </a>
      <nav className="container mx-auto px-4 md:px-6 py-3 md:py-5" aria-label="Hauptnavigation">
        <div className="flex items-center justify-between">
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Admin Badge + Logout (nur für Admins) */}
            {isAdmin && user && (
              <div className="flex items-center gap-3 ml-2 pl-6 border-l border-border">
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

          {/* Mobile Navigation */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menü öffnen</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Admin Badge + Logout (Mobile, nur für Admins) */}
                {isAdmin && user && (
                  <>
                    <div className="border-t border-border pt-6 mt-2" />
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="h-5 w-5" />
                      Admin-Bereich
                    </Link>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="gap-2 justify-start"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Header;
