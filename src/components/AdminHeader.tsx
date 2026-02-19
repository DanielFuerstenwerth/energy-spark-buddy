import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Button } from './ui/button';
import { Shield } from 'lucide-react';

const AdminHeader = () => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo variant="mini" />
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">Dashboard</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/comments">Kommentare</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Zurück zur Seite</Link>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default AdminHeader;
