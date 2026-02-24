import { useState, useEffect } from 'react';
import { ScoreData, loadScores } from '@/utils/dataLoader';
import { buildMapsConfig } from '@/utils/structureLoader';

interface MapConfig {
  [key: string]: {
    sheet: string;
    criterion_column?: string;
    fallback?: string;
  };
}

export const useMapData = (route: string) => {
  const [scoreData, setScoreData] = useState<Map<string, ScoreData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    console.log(`[useMapData] Loading data for route: ${route}`);

    // buildMapsConfig is now cached — no re-fetch on every route change
    buildMapsConfig()
      .then(async (config: MapConfig) => {
        console.log(`[useMapData] Maps config loaded, checking route: ${route}`);
        const routeConfig = config[route];
        
        if (!routeConfig || !routeConfig.sheet) {
          console.warn(`[useMapData] No sheet configured for route: ${route}, using zero data`);
          const zeroData = await createZeroScoreData();
          setScoreData(zeroData);
          setLoading(false);
          return;
        }

        console.log(`[useMapData] Loading scores from: ${routeConfig.sheet}`);
        
        const data = await loadScores(routeConfig.sheet, {
          aggregatedColumn: 'aggregated_score',
          requestedColumn: routeConfig.criterion_column,
          fallbackUrl: routeConfig.fallback,
        });
        console.log(`[useMapData] Loaded ${data.size} VNB scores`);
        
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
