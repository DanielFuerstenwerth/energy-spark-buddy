import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { loadScoresFromGoogleSheets } from '@/utils/googleSheetsLoader';

interface MapGgvProps {
  onRegionClick: (vnbId: string, vnbName: string) => void;
}

export interface MapGgvHandle {
  zoomToVnb: (vnbId: string) => void;
}

const MapGgv = forwardRef<MapGgvHandle, MapGgvProps>(({ onRegionClick }, ref) => {
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
            animate: true
          });
          found = true;
        }
      });

      if (!found) {
        console.warn('VNB not found on map for id:', vnbId);
      }
    }
  }));

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: true
    }).setView([51.1657, 10.4515], 6);

    // Add OSM tile layer
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      opacity: 1
    }).addTo(map.current);

    // Load real GeoJSON and scores from Google Sheets
    Promise.all([
      fetch('/data/vnb_regions.geojson').then(r => r.json()),
      loadScoresFromGoogleSheets()
    ]).then(([geoData, scoresMap]) => {
      if (!map.current) return;

      geoLayer.current = L.geoJSON(geoData, {
        style: (feature: any) => {
          const vnbId = feature?.id;
          const scoreData = vnbId ? scoresMap.get(vnbId) : null;
          const score = scoreData?.score;
          
          let fillColor = '#E5E7EB';
          if (score !== null && score !== undefined) {
            if (score <= -50) fillColor = '#7F1D1D';
            else if (score <= -25) fillColor = '#DC2626';
            else if (score < 25) fillColor = '#9CA3AF';
            else if (score < 50) fillColor = '#16A34A';
            else fillColor = '#065F46';
          }

          return {
            fillColor,
            weight: 1,
            opacity: 1,
            color: '#333333',
            fillOpacity: 0.35
          };
        },
        onEachFeature: (feature: any, layer) => {
          const vnbId = feature?.id;
          const scoreData = scoresMap.get(vnbId);
          const vnbName = scoreData?.vnb_name || vnbId;

          layer.bindTooltip(
            scoreData ? `${vnbName}: ${scoreData.score !== null ? (scoreData.score > 0 ? '+' : '') + scoreData.score : 'N/A'}` : `VNB ${vnbId}`,
            { sticky: true, className: 'custom-tooltip' }
          );

          layer.on('click', () => onRegionClick(vnbId, vnbName));
          layer.on('mouseover', function(this: any) {
            this.setStyle({ weight: 2, fillOpacity: 0.55 });
          });
          layer.on('mouseout', function(this: any) {
            this.setStyle({ weight: 1, fillOpacity: 0.35 });
          });
        }
      }).addTo(map.current);

      map.current.fitBounds(geoLayer.current.getBounds());

      if (pendingZoomId.current) {
        const targetId = pendingZoomId.current;
        let found = false;
        geoLayer.current.eachLayer((layer: any) => {
          if (layer.feature?.id === targetId) {
            const bounds = layer.getBounds();
            map.current?.fitBounds(bounds, { padding: [20, 20], animate: true, maxZoom: 19 });
            const center = bounds.getCenter();
            const current = map.current?.getZoom() ?? 8;
            const targetZoom = Math.min(current + 2, 13);
            map.current?.flyTo(center, targetZoom, { animate: true, duration: 0.6 });
            found = true;
          }
        });
        if (!found) {
          console.warn('Pending VNB not found on map for id:', targetId);
        }
        pendingZoomId.current = null;
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onRegionClick]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full rounded-lg border border-border shadow-sm"
      style={{ height: '70vh', minHeight: '500px' }}
      role="img"
      aria-label="Karte der Verteilnetzbetreiber"
    />
  );
});

MapGgv.displayName = 'MapGgv';

export default MapGgv;
