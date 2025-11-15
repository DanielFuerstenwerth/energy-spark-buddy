import { Link } from "react-router-dom";
import Logo from "./Logo";

const Header = () => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground rounded-md">
        Zum Hauptinhalt springen
      </a>
      <nav className="container mx-auto px-6 py-5" aria-label="Hauptnavigation">
        <div className="flex items-center justify-between">
          <Logo />
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/news" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              News
            </Link>
            <Link to="/methodik" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Methodik
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Über uns
            </Link>
            <Link to="/impressum" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Kontakt
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
