import { Link } from "react-router-dom";
const Footer = () => {
  return <footer className="border-t border-border bg-muted mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                <Link to="/erklaerungen" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Erklärungen
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  API & Daten
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
                <Link to="/legal/impressum" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/legal/datenschutz" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} VNB-Transparenz. Keine amtliche Stelle.</p>
          <p className="mt-2 text-xs">Version: {__BUILD_TIME__}</p>
        </div>
      </div>
    </footer>;
};
export default Footer;