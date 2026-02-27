import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { loadScoresFromGoogleSheets } from '@/utils/googleSheetsLoader';
import { ScoreData, getColor } from '@/utils/dataLoader';
import { getVnbNameFromId } from '@/utils/vnbMapping';

interface MapGgvProps {
  onRegionClick: (vnbId: string, vnbName: string) => void;
  scoreData?: Map<string, ScoreData>;
}

export interface MapGgvHandle {
  zoomToVnb: (vnbId: string) => void;
}

const MapGgv = forwardRef<MapGgvHandle, MapGgvProps>(({ onRegionClick, scoreData: externalScoreData }, ref) => {
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

  // ResizeObserver to keep tiles aligned with polygons
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

    // Initialize map
    const m = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: true
    }).setView([51.1657, 10.4515], 6);
    map.current = m;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      crossOrigin: 'anonymous',
    } as any).addTo(m);

    // Load real GeoJSON and scores (use external if provided)
    const scoresPromise = externalScoreData 
      ? Promise.resolve(externalScoreData)
      : loadScoresFromGoogleSheets();
    
    Promise.all([
      fetch('/data/vnb_regions.geojson').then(r => r.json()),
      scoresPromise
    ]).then(([geoData, scoresMap]) => {
      if (!map.current) return;

      geoLayer.current = L.geoJSON(geoData, {
        style: (feature: any) => {
          const vnbId = feature?.id;
          const scoreData = vnbId ? scoresMap.get(vnbId) : null;
          const score = scoreData?.score;
          
          // 6-category system: null ≠ 0
          const fillColor = getColor(score ?? null);
          return {
            fillColor,
            weight: 0.5,
            opacity: 1,
            color: '#333333',
            fillOpacity: 0.55
          };
        },
        onEachFeature: (feature: any, layer) => {
          const vnbId = feature?.id;
          const scoreData = scoresMap.get(vnbId);
          // Use scoreData.vnb_name first, then lookup by ID, then fall back to showing the ID
          const vnbName = scoreData?.vnb_name || getVnbNameFromId(vnbId) || `VNB ${vnbId}`;

          layer.bindTooltip(
            scoreData 
              ? `${vnbName}: ${scoreData.score !== null ? (scoreData.score > 0 ? '+' : '') + scoreData.score : 'N/A'}` 
              : vnbName,
            { sticky: true, className: 'custom-tooltip' }
          );

          layer.on('click', () => onRegionClick(vnbId, vnbName));
          layer.on('mouseover', function(this: any) {
            this.setStyle({ weight: 1.5, fillOpacity: 0.7 });
          });
          layer.on('mouseout', function(this: any) {
            this.setStyle({ weight: 0.5, fillOpacity: 0.55 });
          });
        }
      }).addTo(map.current);

      // Ensure container size is correct before fitting bounds
      map.current.invalidateSize(true);
      requestAnimationFrame(() => {
        if (map.current && geoLayer.current) {
          map.current.invalidateSize(true);
          map.current.fitBounds(geoLayer.current.getBounds());
        }
      });

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
