import { useState, useEffect } from 'react';
import { loadStructureFromSheet } from '@/utils/structureLoader';

export interface NavigationKriterium {
  slug: string;
  title: string;
  hasData?: boolean;
}

export interface NavigationUnterkategorie {
  slug: string;
  title: string;
  kriterien: NavigationKriterium[];
}

export interface NavigationItem {
  slug: string;
  title: string;
  tabs: string[];
  unterkategorien?: NavigationUnterkategorie[];
  kriterien?: NavigationKriterium[];
}

export interface NavigationData {
  kategorien: NavigationItem[];
  anliegen?: NavigationItem[];
}

const CACHE_KEY = 'nav_structure_cache_v2';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useNavigation = () => {
  const [navData, setNavData] = useState<NavigationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNavigation = async () => {
      try {
        // Invalidate old cache key
        localStorage.removeItem('nav_structure_cache');

        // Check cache first (versioned)
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
              setNavData(data);
              setLoading(false);
              return;
            }
          } catch (cacheError) {
            console.error('[useNavigation] Cache parse error:', cacheError);
            localStorage.removeItem(CACHE_KEY);
          }
        }

        // loadStructureFromSheet handles its own timeout and nav.json fallback internally
        const structure = await loadStructureFromSheet();
        
        // Cache the result
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: structure,
            timestamp: Date.now()
          }));
        } catch (storageError) {
          console.warn('[useNavigation] Could not cache navigation:', storageError);
        }
        
        setNavData(structure as any);
      } catch (err) {
        console.error('[useNavigation] Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNavigation();
  }, []);

  return { navData, loading };
};
