import { useState, useEffect } from 'react';
import { ScoreData, loadScores } from '@/utils/dataLoader';

interface MapConfig {
  [key: string]: {
    sheet: string;
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

    // Load maps config
    fetch('/data/maps.json')
      .then((res) => res.json())
      .then(async (config: MapConfig) => {
        const routeConfig = config[route];
        
        // If route not found in config or sheet is null, use dummy data
        if (!routeConfig || !routeConfig.sheet) {
          console.log(`No sheet configured for route: ${route}, using dummy data`);
          const dummyData = await createDummyScoreData();
          setScoreData(dummyData);
          setLoading(false);
          return;
        }

        // Load score data from Google Sheets
        return loadScores(routeConfig.sheet);
      })
      .then((data) => {
        if (data) {
          setScoreData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading map data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [route]);

  return { scoreData, loading, error };
};
