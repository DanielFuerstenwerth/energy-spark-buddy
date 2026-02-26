import { useState, useEffect } from 'react';
import { loadUnitsMap, type UnitsMap } from '../utils/units';

export function useUnitsMap(): UnitsMap {
  const [units, setUnits] = useState<UnitsMap>({});
  useEffect(() => {
    loadUnitsMap().then(setUnits);
  }, []);
  return units;
}
