const MapLegendA14 = () => {
  return (
    <div className="bg-background border border-border rounded-lg p-4 shadow-sm" role="region" aria-label="Kartenlegende">
      <h3 className="text-sm font-semibold mb-3">Legende</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded border border-border flex-shrink-0"
            style={{ backgroundColor: '#16A34A' }}
            aria-hidden="true"
          />
          <span className="text-sm">Enercity Netz</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded border border-border flex-shrink-0"
            style={{ backgroundColor: '#DC2626' }}
            aria-hidden="true"
          />
          <span className="text-sm">Andere VNB</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegendA14;
