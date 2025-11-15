import { getColorByIndex, getColorLabel } from "@/utils/dataLoader";

const MapLegend = () => {
  return (
    <div className="bg-background border border-border rounded-lg p-4 shadow-sm" role="region" aria-label="Kartenlegende">
      <h3 className="text-sm font-semibold mb-3">Legende</h3>
      <div className="space-y-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded border border-border flex-shrink-0"
              style={{ backgroundColor: getColorByIndex(index) }}
              aria-hidden="true"
            />
            <span className="text-sm">{getColorLabel(index)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLegend;
