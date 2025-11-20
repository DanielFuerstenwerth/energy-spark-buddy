/**
 * Navigation Wrapper - Loads nav data and renders Nav component
 */

import { useEffect, useState } from "react";
import Nav from "./Nav";
import { buildNavItems, type NavItem } from "@/lib/nav";

export default function NavWrapper() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buildNavItems()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-8 w-64 bg-muted animate-pulse rounded hidden md:block" />
        </div>
      </nav>
    );
  }

  return <Nav items={items} />;
}
