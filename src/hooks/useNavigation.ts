import { useState, useEffect } from 'react';

interface NavigationKriterium {
  slug: string;
  title: string;
}

interface NavigationUnterkategorie {
  slug: string;
  title: string;
  kriterien: NavigationKriterium[];
}

interface NavigationItem {
  slug: string;
  title: string;
  tabs: string[];
  unterkategorien?: NavigationUnterkategorie[];
  kriterien?: NavigationKriterium[];
}

interface NavigationData {
  kategorien: NavigationItem[];
  anliegen: NavigationItem[];
}

export const useNavigation = () => {
  const [navData, setNavData] = useState<NavigationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/nav.json')
      .then((res) => res.json())
      .then((data) => {
        setNavData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading navigation data:', err);
        setLoading(false);
      });
  }, []);

  return { navData, loading };
};
