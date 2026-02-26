import { useState, useEffect } from 'react';
import { loadUnitsMap, type UnitsMap } from '../utils/units';

export function useUnitsMap(): UnitsMap {
  const [units, setUnits] = useState<UnitsMap>({});
  useEffect(() => {
    loadUnitsMap().then((map) => {
      console.log('[EWK] units fetch complete, keys:', Object.keys(map).length);
      if (Object.keys(map).length === 0) {
        console.error('[EWK] units json empty or parse failed');
      }
      setUnits(map);
    });
  }, []);
  return units;
}
