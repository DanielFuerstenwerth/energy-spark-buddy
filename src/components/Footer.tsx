import { Link } from "react-router-dom";
const Footer = () => {
  return <footer className="border-t border-border bg-muted mt-8 md:mt-16">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div>
            <h3 className="font-bold text-foreground mb-3">VNB-Transparenz</h3>
            <p className="text-sm text-muted-foreground">Transparenz über  Verteilnetzbetreiber</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-3">Information</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/methodik" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Methodik
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Über uns
                </Link>
              </li>
              <li>
                <Link to="/erklaerungen" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Erklärungen
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-3">Mitmachen</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/mitmachen" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Daten liefern
                </Link>
              </li>
              <li>
                <Link to="/reply" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Right to Reply
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-3">Rechtliches</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/impressum" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Impressum & Kontakt
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} VNB-Transparenz. Keine amtliche Stelle.</p>
          <p className="mt-2 text-xs">Version: {__BUILD_TIME__}</p>
        </div>
      </div>
    </footer>;
};
export default Footer;