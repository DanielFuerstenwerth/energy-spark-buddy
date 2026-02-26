import { useState, useEffect } from 'react';
import { ScoreData, loadScores } from '@/utils/dataLoader';
import { buildMapsConfig, loadNavJsonFallback } from '@/utils/structureLoader';

interface MapConfig {
  [key: string]: {
    sheet: string;
    criterion_column?: string;
  };
}

/** Resolve a criterion slug (e.g. "K16") to its human-readable sheet column name
 *  by looking it up in the navigation structure. */
async function resolveColumnName(
  category: string,
  subcategory: string,
  criterionSlug: string
): Promise<string> {
  try {
    const nav = await loadNavJsonFallback();
    const cat = nav.kategorien?.find((k: any) => k.slug === category);
    const sub = cat?.unterkategorien?.find((u: any) => u.slug === subcategory);
    const crit = sub?.kriterien?.find((k: any) => k.slug === criterionSlug);
    if (crit?.title) {
      console.log(`[resolveColumnName] ${criterionSlug} → "${crit.title}"`);
      return crit.title;
    }
  } catch (e) {
    console.warn('[resolveColumnName] Could not resolve:', e);
  }
  return criterionSlug; // fallback to slug itself
}

export const useMapData = (route: string) => {
  const [scoreData, setScoreData] = useState<Map<string, ScoreData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    console.log(`[useMapData] Loading data for route: "${route}" (pathname: ${window.location.pathname})`);

    // buildMapsConfig is now cached — no re-fetch on every route change
    buildMapsConfig()
      .then(async (config: MapConfig) => {
        // Case-insensitive route lookup: try exact, then lowercase
        let routeConfig = config[route] || config[route.toLowerCase()];
        
        console.log(`[useMapData] Maps config loaded (${Object.keys(config).length} keys), route "${route}" → ${routeConfig ? 'found' : 'NOT found'}`);

        // Fallback: if criterion route not found, inherit from parent subcategory
        if (!routeConfig || !routeConfig.sheet) {
          const parts = route.split('/');
          if (parts.length === 3) {
            const parentRoute = `${parts[0]}/${parts[1]}`;
            const parentConfig = config[parentRoute] || config[parentRoute.toLowerCase()];
            if (parentConfig?.sheet) {
              console.log(`[useMapData] Criterion route not found, inheriting from parent: ${parentRoute}, column: ${parts[2]}`);
              routeConfig = {
                ...parentConfig,
                criterion_column: parts[2],
              };
            }
          }
        }

        if (!routeConfig || !routeConfig.sheet) {
          console.warn(`[useMapData] No sheet configured for route: "${route}", available keys:`, Object.keys(config).slice(0, 20));
          const zeroData = await createZeroScoreData();
          setScoreData(zeroData);
          setLoading(false);
          return;
        }

        // Resolve criterion slug to actual sheet column name
        let columnName = routeConfig.criterion_column;
        if (columnName) {
          const parts = route.split('/');
          if (parts.length >= 2) {
            columnName = await resolveColumnName(parts[0], parts[1], columnName);
          }
        }

        console.log(`[useMapData] Loading scores from: ${routeConfig.sheet}`);
        
        const data = await loadScores(routeConfig.sheet, {
          aggregatedColumn: 'aggregated_score',
          requestedColumn: columnName,
        });
        console.log(`[useMapData] Loaded ${data.size} VNB scores for route "${route}"`);
        
        setScoreData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[useMapData] Error loading map data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [route]);

  return { scoreData, loading, error };
};

const createZeroScoreData = async (): Promise<Map<string, ScoreData>> => {
  const zeroData = new Map<string, ScoreData>();
  
  try {
    const response = await fetch('/data/vnb_regions.json');
    if (!response.ok) throw new Error('Failed to load VNB regions');
    const vnbRegions = await response.json();
    
    if (!vnbRegions?.features) return zeroData;
    
    vnbRegions.features.forEach((feature: any) => {
      const vnbId = feature.properties.VNB_ID;
      const vnbName = feature.properties.VNB_NAME;
      
      zeroData.set(vnbId, {
        vnb_id: vnbId,
        vnb_name: vnbName,
        score: 0,
        updated_at: new Date().toISOString()
      });
    });
  } catch (err) {
    console.error('Error loading VNB regions:', err);
  }
  
  return zeroData;
};
