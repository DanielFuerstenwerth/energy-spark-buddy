import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getVnbNameFromId } from '@/utils/vnbMapping';

export interface FeedbackEntry {
  vnb_id: string;
  vnb_name: string;
  feedback_count: number;
}

interface MapFeedbackProps {
  feedbackData: Map<string, FeedbackEntry>;
}

/** Choropleth color by feedback count */
function getFeedbackColor(count: number): string {
  if (count === 0) return '#D9D9D9';
  if (count === 1) return '#CFE8FF';
  if (count === 2) return '#9DCCFF';
  if (count <= 4) return '#5AA9FF';
  return '#0B5CAD';
}

function getFeedbackLabel(count: number): string {
  if (count === 0) return 'Keine Rückmeldung';
  return `${count} Rückmeldung${count > 1 ? 'en' : ''}`;
}

const LEGEND_ITEMS = [
  { color: '#D9D9D9', label: '0 Rückmeldungen' },
  { color: '#CFE8FF', label: '1 Rückmeldung' },
  { color: '#9DCCFF', label: '2 Rückmeldungen' },
  { color: '#5AA9FF', label: '3–4 Rückmeldungen' },
  { color: '#0B5CAD', label: '5+ Rückmeldungen' },
];

const MapFeedback = ({ feedbackData }: MapFeedbackProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  // ResizeObserver for tile alignment
  useEffect(() => {
    const el = mapContainer.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      map.current?.invalidateSize(false);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const m = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([51.1657, 10.4515], 6);
    map.current = m;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      crossOrigin: 'anonymous',
    } as any).addTo(m);

    fetch('/data/vnb_regions.geojson')
      .then((r) => r.json())
      .then((geoData) => {
        if (!map.current) return;

        L.geoJSON(geoData, {
          style: (feature: any) => {
            const vnbId = feature?.id;
            const entry = vnbId ? feedbackData.get(vnbId) : null;
            const count = entry?.feedback_count ?? 0;
            return {
              fillColor: getFeedbackColor(count),
              weight: 0.5,
              opacity: 1,
              color: '#333333',
              fillOpacity: 0.55,
            };
          },
          onEachFeature: (feature: any, layer) => {
            const vnbId = feature?.id;
            const entry = feedbackData.get(vnbId);
            const vnbName = entry?.vnb_name || getVnbNameFromId(vnbId) || `VNB ${vnbId}`;
            const count = entry?.feedback_count ?? 0;

            layer.bindTooltip(
              `<strong>${vnbName}</strong><br/>${getFeedbackLabel(count)}`,
              { sticky: true, className: 'custom-tooltip' }
            );

            layer.on('mouseover', function (this: any) {
              this.setStyle({ weight: 1.5, fillOpacity: 0.7 });
            });
            layer.on('mouseout', function (this: any) {
              this.setStyle({ weight: 0.5, fillOpacity: 0.55 });
            });
          },
        }).addTo(map.current);

        map.current.invalidateSize(true);
        requestAnimationFrame(() => {
          if (map.current) {
            map.current.invalidateSize(true);
          }
        });
      });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [feedbackData]);

  return (
    <div className="space-y-3">
      <div
        ref={mapContainer}
        className="w-full rounded-lg border border-border shadow-sm"
        style={{ height: '70vh', minHeight: '500px' }}
        role="img"
        aria-label="Karte der VNB-Gebiete nach Umfrage-Rückmeldungen"
      />
      {/* Legend */}
      <div className="bg-background border border-border rounded-lg px-4 py-3 shadow-sm" role="region" aria-label="Kartenlegende">
        <h3 className="text-sm font-semibold mb-2">Legende – Anzahl Rückmeldungen</h3>
        <p className="text-xs text-muted-foreground mb-2">Dunkleres Blau = mehr Rückmeldungen</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
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
    </div>
  );
};

export default MapFeedback;
