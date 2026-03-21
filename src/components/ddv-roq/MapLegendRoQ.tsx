import { DDV_ROQ_PALETTE, BUCKET_ORDER } from './types';

const legendItems = [
  { buckets: [-100, -90], label: '-100 / -90', color: DDV_ROQ_PALETTE[-100].color },
  { buckets: [-75, -50], label: '-75 / -50', color: DDV_ROQ_PALETTE[-75].color },
  { buckets: [-25], label: '-25', color: DDV_ROQ_PALETTE[-25].color },
  { buckets: [0], label: '0 (Pflicht)', color: DDV_ROQ_PALETTE[0].color },
  { buckets: [25, 50], label: '+25 / +50', color: DDV_ROQ_PALETTE[25].color },
  { buckets: [75, 100], label: '+75 / +100', color: DDV_ROQ_PALETTE[75].color },
  { buckets: [], label: 'Keine Daten', color: '#f0f0f0' },
];

export default function MapLegendRoQ() {
  return (
    <div className="bg-background border border-border rounded-lg px-4 py-3 shadow-sm" role="region" aria-label="Kartenlegende">
      <h3 className="text-sm font-semibold mb-2">Legende (Score)</h3>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {legendItems.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-sm border border-border flex-shrink-0"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className="text-xs whitespace-nowrap">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
