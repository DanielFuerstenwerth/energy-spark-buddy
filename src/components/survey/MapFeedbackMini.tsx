import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface FeedbackEntry {
  vnb_id: string;
  vnb_name: string;
  feedback_count: number;
}

/** More saturated color scale for better gray/blue distinction */
function getColor(count: number): string {
  if (count === 0) return '#E0E0E0';
  if (count === 1) return '#90C2FF';
  if (count === 2) return '#4A9AFF';
  if (count <= 4) return '#1A6FE0';
  return '#0A4DA0';
}

const LEGEND = [
  { color: '#E0E0E0', label: 'Noch offen' },
  { color: '#90C2FF', label: '1' },
  { color: '#4A9AFF', label: '2' },
  { color: '#1A6FE0', label: '3–4' },
  { color: '#0A4DA0', label: '5+' },
];

interface Props {
  feedbackData: Map<string, FeedbackEntry>;
}

export function MapFeedbackMini({ feedbackData }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => mapRef.current?.invalidateSize(false));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const m = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: true,
      keyboard: false,
      minZoom: 5,
      maxZoom: 9,
    }).setView([51.2, 10.4], 6);

    // Move zoom control to top-right for cleaner look
    m.zoomControl.setPosition('topright');
    mapRef.current = m;

    // Minimal light tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 8,
      crossOrigin: 'anonymous',
    } as any).addTo(m);

    fetch('/data/vnb_regions.geojson')
      .then(r => r.json())
      .then(geo => {
        if (!mapRef.current) return;
        L.geoJSON(geo, {
          style: (feature: any) => {
            const entry = feature?.id ? feedbackData.get(feature.id) : null;
            return {
              fillColor: getColor(entry?.feedback_count ?? 0),
              weight: 0.3,
              opacity: 0.6,
              color: '#666',
              fillOpacity: 0.65,
            };
          },
          onEachFeature: (feature: any, layer) => {
            const vnbId = feature?.id;
            const entry = feedbackData.get(vnbId);
            const name = entry?.vnb_name || `VNB ${vnbId}`;
            const count = entry?.feedback_count ?? 0;
            const label = count === 0 ? 'Noch offen' : `${count} Rückmeldung${count > 1 ? 'en' : ''}`;
            layer.bindTooltip(`<strong>${name}</strong><br/>${label}`, { sticky: true });
            layer.on('mouseover', function (this: any) {
              this.setStyle({ weight: 1.5, fillOpacity: 0.8 });
            });
            layer.on('mouseout', function (this: any) {
              this.setStyle({ weight: 0.3, fillOpacity: 0.65 });
            });
          },
        }).addTo(mapRef.current);
        mapRef.current.invalidateSize(true);
      });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [feedbackData]);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="w-full rounded-lg overflow-hidden"
        style={{ height: '260px' }}
        role="img"
        aria-label="Übersichtskarte der Umfrage-Beteiligung"
      />
      {/* Compact inline legend */}
      <div className="flex items-center gap-3 justify-center">
        <span className="text-[10px] text-muted-foreground">Rückmeldungen:</span>
        {LEGEND.map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
