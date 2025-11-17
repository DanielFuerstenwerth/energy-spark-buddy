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

const CACHE_KEY = 'nav_structure_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useNavigation = () => {
  const [navData, setNavData] = useState<NavigationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNavigation = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setNavData(data);
            setLoading(false);
            return;
          }
        }

        // Load from Google Sheets
        const structure = await loadStructureFromSheet();
        
        // Cache the result
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: structure,
          timestamp: Date.now()
        }));
        
        setNavData(structure);
        setLoading(false);
      } catch (err) {
        console.error('Error loading navigation data:', err);
        
        // Fallback to local nav.json
        try {
          const response = await fetch('/data/nav.json');
          const data = await response.json();
          setNavData(data);
        } catch (fallbackErr) {
          console.error('Fallback failed:', fallbackErr);
        }
        setLoading(false);
      }
    };

    loadNavigation();
  }, []);

  return { navData, loading };
};
