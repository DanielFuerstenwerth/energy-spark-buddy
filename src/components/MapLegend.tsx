import { getColorByIndex, getColorLabel } from "@/utils/dataLoader";

const MapLegend = () => {
  return (
    <div className="bg-background border border-border rounded-lg px-4 py-3 shadow-sm" role="region" aria-label="Kartenlegende">
      <h3 className="text-sm font-semibold mb-2">Legende</h3>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div 
              className="w-4 h-4 rounded-sm border border-border flex-shrink-0"
              style={{ backgroundColor: getColorByIndex(index) }}
              aria-hidden="true"
            />
            <span className="text-xs whitespace-nowrap">{getColorLabel(index)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLegend;
