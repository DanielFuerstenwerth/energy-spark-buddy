import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ScoreData } from '@/utils/dataLoader';

interface MapContainerProps {
  onRegionClick: (vnbId: string, vnbName: string) => void;
  scoreData: Map<string, ScoreData>;
}

export interface MapContainerHandle {
  zoomToVnb: (vnbId: string) => void;
}

const MapContainer = forwardRef<MapContainerHandle, MapContainerProps>(
  ({ onRegionClick, scoreData }, ref) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<L.Map | null>(null);
    const geoLayer = useRef<L.GeoJSON | null>(null);
    const pendingZoomId = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
      zoomToVnb: (vnbId: string) => {
        if (!map.current) return;

        if (!geoLayer.current) {
          pendingZoomId.current = vnbId;
          return;
        }

        let found = false;
        geoLayer.current.eachLayer((layer: any) => {
          if (layer.feature?.id === vnbId) {
            const bounds = layer.getBounds();
            map.current?.fitBounds(bounds, {
              padding: [24, 24],
              maxZoom: 13,
              animate: true,
            });
            found = true;
          }
        });

        if (!found) {
          console.warn('VNB not found on map for id:', vnbId);
        }
      },
    }));

    useEffect(() => {
      if (!mapContainer.current || map.current) return;

      // Initialize map
      map.current = L.map(mapContainer.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([51.1657, 10.4515], 6);

      // Add OSM tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        opacity: 1,
      }).addTo(map.current);

      // Load GeoJSON
      fetch('/data/vnb_regions.geojson')
        .then((r) => r.json())
        .then((geoData) => {
          if (!map.current) return;

          geoLayer.current = L.geoJSON(geoData, {
            style: (feature: any) => {
              const vnbId = feature?.id;
              const data = vnbId ? scoreData.get(vnbId) : null;
              const score = data?.score;

              let fillColor = 'hsl(var(--score-unknown))';
              if (score !== null && score !== undefined) {
                if (score <= -50) fillColor = 'hsl(var(--score-critical))';
                else if (score <= -25) fillColor = 'hsl(var(--score-poor))';
                else if (score < 25) fillColor = 'hsl(var(--score-moderate))';
                else if (score < 50) fillColor = 'hsl(var(--score-good))';
                else fillColor = 'hsl(var(--score-excellent))';
              }

              return {
                fillColor,
                weight: 1,
                opacity: 1,
                color: '#333333',
                fillOpacity: 0.7,
              };
            },
            onEachFeature: (feature: any, layer) => {
              const vnbId = feature?.id;
              const data = scoreData.get(vnbId);
              const vnbName = data?.vnb_name || vnbId;

              layer.bindTooltip(
                data
                  ? `${vnbName}: ${
                      data.score !== null
                        ? (data.score > 0 ? '+' : '') + data.score
                        : 'N/A'
                    }`
                  : `VNB ${vnbId}`,
                { sticky: true, className: 'custom-tooltip' }
              );

              layer.on('click', () => onRegionClick(vnbId, vnbName));
              layer.on('mouseover', function (this: any) {
                this.setStyle({ weight: 2, fillOpacity: 0.9 });
              });
              layer.on('mouseout', function (this: any) {
                this.setStyle({ weight: 1, fillOpacity: 0.7 });
              });
            },
          }).addTo(map.current);

          map.current.fitBounds(geoLayer.current.getBounds());

          if (pendingZoomId.current) {
            const targetId = pendingZoomId.current;
            let found = false;
            geoLayer.current.eachLayer((layer: any) => {
              if (layer.feature?.id === targetId) {
                const bounds = layer.getBounds();
                map.current?.fitBounds(bounds, {
                  padding: [24, 24],
                  maxZoom: 13,
                  animate: true,
                });
                found = true;
              }
            });
            pendingZoomId.current = null;
          }
        })
        .catch((err) => console.error('Error loading map data:', err));

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    }, [scoreData, onRegionClick]);

    return (
      <div
        ref={mapContainer}
        className="w-full h-full min-h-[500px] rounded-lg overflow-hidden shadow-sm"
      />
    );
  }
);

MapContainer.displayName = 'MapContainer';

export default MapContainer;
