import { useState, useEffect } from 'react';
import { loadStructureFromSheet } from '@/utils/structureLoader';

export interface NavigationKriterium {
  slug: string;
  title: string;
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
      // Set a timeout to ensure loading state doesn't block the app indefinitely
      const timeoutId = setTimeout(() => {
        console.warn('[useNavigation] Loading timeout reached, using fallback');
        setLoading(false);
      }, 5000); // 5 second timeout

      try {
        // Invalidate old cache key to force reload after updates
        localStorage.removeItem('nav_structure_cache');
        // Check cache first (versioned)
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
              clearTimeout(timeoutId);
              setNavData(data);
              setLoading(false);
              return;
            }
          } catch (cacheError) {
            console.error('[useNavigation] Cache parse error:', cacheError);
            localStorage.removeItem(CACHE_KEY);
          }
        }

        // Load from Google Sheets with timeout
        const structure = await Promise.race([
          loadStructureFromSheet(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Google Sheets load timeout')), 4000)
          )
        ]);
        
        // Cache the result
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: structure,
            timestamp: Date.now()
          }));
        } catch (storageError) {
          console.warn('[useNavigation] Could not cache navigation:', storageError);
        }
        
        clearTimeout(timeoutId);
        setNavData(structure as any);
        setLoading(false);
      } catch (err) {
        console.error('[useNavigation] Error loading navigation data:', err);
        
        // Fallback to local nav.json
        try {
          const response = await fetch('/data/nav.json');
          if (!response.ok) throw new Error(`Failed to load nav.json: ${response.status}`);
          const data = await response.json();
          clearTimeout(timeoutId);
          setNavData(data);
          setLoading(false);
        } catch (fallbackErr) {
          console.error('[useNavigation] Fallback failed:', fallbackErr);
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    loadNavigation();
  }, []);

  return { navData, loading };
};
