import { useState, useEffect } from 'react';
import { ScoreData, loadScores } from '@/utils/dataLoader';

interface MapConfig {
  [key: string]: {
    sheet: string;
  };
}

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
      .then((config: MapConfig) => {
        const routeConfig = config[route];
        if (!routeConfig) {
          throw new Error(`No map configuration found for route: ${route}`);
        }

        // Load score data from Google Sheets
        return loadScores(routeConfig.sheet);
      })
      .then((data) => {
        setScoreData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading map data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [route]);

  return { scoreData, loading, error };
};
