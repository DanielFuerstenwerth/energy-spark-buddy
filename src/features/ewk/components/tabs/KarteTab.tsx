import { useMemo, useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { IndicatorMeta, VnbRow } from '../../types';
import { tryParseNum } from '../../utils/csvParser';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Props {
  catalog: IndicatorMeta[];
  indicator: IndicatorMeta | null;
  rows: VnbRow[];
  loading: boolean;
}

function getColorScale(value: number, min: number, max: number): string {
  if (max === min) return 'hsl(217, 91%, 60%)';
  const t = (value - min) / (max - min);
  const h = (1 - t) * 220;
  return `hsl(${h}, 70%, 50%)`;
}

export default function KarteTab({ catalog, indicator, rows, loading }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const geoLayer = useRef<L.GeoJSON | null>(null);

  const isNumeric = indicator && (indicator.data_type === 'numeric' || indicator.data_type === 'binary_0_1');

  const valueMap = useMemo(() => {
    if (!indicator) return new Map<string, { value: number | null; firmenname: string; bnr: string }>();
    const m = new Map<string, { value: number | null; firmenname: string; bnr: string }>();
    for (const r of rows) {
      m.set(r.vnb_id, {
        value: tryParseNum(r[indicator.column_key]),
        firmenname: r.firmenname,
        bnr: r.bnr,
      });
    }
    return m;
  }, [rows, indicator]);

  const { min, max, validN } = useMemo(() => {
    const values: number[] = [];
    valueMap.forEach((v) => {
      if (v.value !== null) values.push(v.value);
    });
    return {
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 1,
      validN: values.length,
    };
  }, [valueMap]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    map.current = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([51.1657, 10.4515], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !indicator || !isNumeric) return;

    if (geoLayer.current) {
      geoLayer.current.remove();
      geoLayer.current = null;
    }

    fetch('/data/vnb_regions.geojson')
      .then((r) => r.json())
      .then((geoData) => {
        if (!map.current) return;
        geoLayer.current = L.geoJSON(geoData, {
          style: (feature: any) => {
            const vnbId = feature?.id;
            const info = vnbId ? valueMap.get(vnbId) : null;
            const fillColor =
              info?.value !== null && info?.value !== undefined
                ? getColorScale(info.value, min, max)
                : '#e5e7eb';
            return { fillColor, weight: 0.5, opacity: 1, color: '#333', fillOpacity: 0.7 };
          },
          onEachFeature: (feature: any, layer) => {
            const vnbId = feature?.id;
            const info = valueMap.get(vnbId);
            const name = info?.firmenname ?? vnbId;
            const val = info?.value !== null && info?.value !== undefined ? info.value : 'keine Angabe';
            layer.bindTooltip(`<strong>${name}</strong><br/>Wert: ${val}`, { sticky: true });
            layer.on('mouseover', function (this: any) {
              this.setStyle({ weight: 1.5, fillOpacity: 0.9 });
            });
            layer.on('mouseout', function (this: any) {
              this.setStyle({ weight: 0.5, fillOpacity: 0.7 });
            });
          },
        }).addTo(map.current);
      })
      .catch(console.error);
  }, [indicator, valueMap, min, max, isNumeric]);

  if (!indicator) {
    return (
      <div className="bg-muted/50 rounded-xl p-8 text-center text-sm text-muted-foreground">
        Wählen Sie im Explorer einen Indikator aus – die Karte zeigt dann den gleichen Indikator.
      </div>
    );
  }

  if (!isNumeric) {
    return (
      <div className="space-y-3">
        <Badge variant="outline">{indicator.display_label}</Badge>
        <div className="bg-muted/50 border rounded-xl p-6 text-sm text-muted-foreground text-center">
          Für diesen Indikator keine numerische Darstellung verfügbar.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">Karte:</span>
        <Badge variant="outline" className="text-xs">{indicator.display_label}</Badge>
        <span className="text-xs text-muted-foreground">Gültige N: {validN}</span>
      </div>

      {loading ? (
        <Skeleton className="h-[500px] w-full rounded-xl" />
      ) : (
        <div
          ref={mapContainer}
          className="w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden border shadow-sm"
          style={{ zIndex: 1 }}
        />
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="w-4 h-3 rounded-sm" style={{ background: getColorScale(min, min, max) }} />
        <span>{min.toFixed(1)}</span>
        <div
          className="flex-1 h-3 rounded-sm"
          style={{
            background: `linear-gradient(to right, ${getColorScale(min, min, max)}, ${getColorScale(max, min, max)})`,
          }}
        />
        <span>{max.toFixed(1)}</span>
        <div className="w-4 h-3 rounded-sm bg-muted ml-3" />
        <span>keine Angabe</span>
      </div>
    </div>
  );
}
