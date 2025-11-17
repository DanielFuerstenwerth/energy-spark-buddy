import { useState, useEffect } from 'react';
import { ScoreData, loadScores } from '@/utils/dataLoader';

interface MapConfig {
  [key: string]: {
    sheet: string;
    criterion_column?: string;
  };
}

// Create dummy data with all VNBs having score null (Keine Daten)
const createDummyScoreData = async (): Promise<Map<string, ScoreData>> => {
  const dummyData = new Map<string, ScoreData>();
  
  // Load VNB regions to get all VNB IDs and names
  const response = await fetch('/data/vnb_regions.json');
  const vnbRegions = await response.json();
  
  vnbRegions.features.forEach((feature: any) => {
    const vnbId = feature.properties.VNB_ID;
    const vnbName = feature.properties.VNB_NAME;
    
    dummyData.set(vnbId, {
      vnb_id: vnbId,
      vnb_name: vnbName,
      score: null,  // null = "Keine Daten"
      updated_at: new Date().toISOString()
    });
  });
  
  return dummyData;
};

export const useMapData = (route: string) => {
  const [scoreData, setScoreData] = useState<Map<string, ScoreData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    console.log(`[useMapData] Loading data for route: ${route}`);

    // Load maps config from dynamic structure loader
    import('@/utils/structureLoader')
      .then(({ buildMapsConfig }) => buildMapsConfig())
      .then(async (config: MapConfig) => {
        console.log(`[useMapData] Maps config loaded, checking route: ${route}`);
        const routeConfig = config[route];
        
        // If route not found in config or sheet is null, create zero data
        if (!routeConfig || !routeConfig.sheet) {
          console.warn(`[useMapData] No sheet configured for route: ${route}, using zero data`);
          console.log(`[useMapData] Available routes:`, Object.keys(config));
          const zeroData = await createZeroScoreData();
          setScoreData(zeroData);
          setLoading(false);
          return;
        }

        console.log(`[useMapData] Loading scores from: ${routeConfig.sheet}`);
        
        // Load score data from Google Sheets
        const data = await loadScores(routeConfig.sheet, {
          aggregatedColumn: 'aggregated_score',
          requestedColumn: routeConfig.criterion_column,
        });
        console.log(`[useMapData] Loaded ${data.size} VNB scores`);
        
        // If this is a criterion-level route, extract only that criterion's column
        if (routeConfig.criterion_column) {
          const criterionData = await extractCriterionData(data, routeConfig.criterion_column);
          setScoreData(criterionData);
        } else {
          setScoreData(data);
        }
        
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

// Create data with all scores as 0 instead of null
const createZeroScoreData = async (): Promise<Map<string, ScoreData>> => {
  const zeroData = new Map<string, ScoreData>();
  
  try {
    const response = await fetch('/data/vnb_regions.json');
    if (!response.ok) throw new Error('Failed to load VNB regions');
    const vnbRegions = await response.json();
    
    if (!vnbRegions?.features) {
      console.warn('No features found in vnb_regions.json');
      return zeroData;
    }
    
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

// Extract a specific criterion column from the full score data
const extractCriterionData = async (
  fullData: Map<string, ScoreData>,
  criterionColumn: string
): Promise<Map<string, ScoreData>> => {
  // For now, return the aggregated score as the criterion score
  // In a full implementation, this would parse the individual criterion columns
  return fullData;
};
