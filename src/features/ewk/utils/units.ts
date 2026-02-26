export interface UnitEntry {
  unit: string;
  code?: string;
  display_label?: string;
  unit_source?: string;
}

export type UnitsMap = Record<string, UnitEntry>;

let cache: UnitsMap | null = null;

export async function loadUnitsMap(): Promise<UnitsMap> {
  if (cache) return cache;
  try {
    const res = await fetch('/data/ewk/indicator_units_for_lovable.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: UnitsMap = await res.json();
    cache = data;
    console.info(`Units loaded: ${Object.keys(data).length}`);
    return data;
  } catch {
    console.warn('Units file could not be loaded – proceeding without units.');
    return {};
  }
}

export function getUnit(unitsMap: UnitsMap, indicatorId: string): string {
  return unitsMap[indicatorId]?.unit ?? '';
}
