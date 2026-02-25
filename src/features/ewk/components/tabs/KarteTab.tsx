import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { IndicatorMeta, SourceKey } from '../../types';
import { useCsvData } from '../../hooks/useEwkData';
import { tryParseNum } from '../../utils/csvParser';
import { SOURCE_LABELS, RECOMMENDED_INDICATORS } from '../../types';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  catalog: IndicatorMeta[];
}

function getColorScale(value: number, min: number, max: number): string {
  if (max === min) return 'hsl(217, 91%, 60%)';
  const t = (value - min) / (max - min);
  // blue to red scale
  const h = (1 - t) * 220;
  return `hsl(${h}, 70%, 50%)`;
}

export default function KarteTab({ catalog }: Props) {
  const numericIndicators = useMemo(
    () => catalog.filter((i) => (i.data_type === 'numeric' || i.data_type === 'binary_0_1') && i.non_null_count > 0),
    [catalog]
  );

  const [selectedId, setSelectedId] = useState<string>(
    RECOMMENDED_INDICATORS.find((id) => numericIndicators.some((i) => i.indicator_id === id)) ?? numericIndicators[0]?.indicator_id ?? ''
  );

  const indicator = catalog.find((i) => i.indicator_id === selectedId);
  const source = indicator?.source as SourceKey | null;
  const { data: rows, loading } = useCsvData(source);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const geoLayer = useRef<L.GeoJSON | null>(null);

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    map.current = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([51.1657, 10.4515], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      opacity: 1,
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update choropleth
  useEffect(() => {
    if (!map.current || !indicator) return;

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
            return {
              fillColor,
              weight: 0.5,
              opacity: 1,
              color: '#333',
              fillOpacity: 0.7,
            };
          },
          onEachFeature: (feature: any, layer) => {
            const vnbId = feature?.id;
            const info = valueMap.get(vnbId);
            const name = info?.firmenname ?? vnbId;
            const val =
              info?.value !== null && info?.value !== undefined
                ? info.value
                : 'keine Angabe';
            layer.bindTooltip(
              `<strong>${name}</strong><br/>BNR: ${info?.bnr ?? '–'}<br/>Wert: ${val}<br/>Gültige N: ${validN}`,
              { sticky: true }
            );
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
  }, [indicator, valueMap, min, max, validN]);

  const isNonNumeric = indicator && indicator.data_type === 'text';

  return (
    <div className="space-y-4">
      {/* Indicator selector */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <label className="text-sm font-medium shrink-0">Indikator:</label>
        <select
          className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm max-w-lg"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {numericIndicators.map((i) => (
            <option key={i.indicator_id} value={i.indicator_id}>
              {i.display_label} ({SOURCE_LABELS[i.source as SourceKey]})
            </option>
          ))}
        </select>
      </div>

      {isNonNumeric && (
        <div className="bg-muted/50 border rounded-xl p-4 text-sm text-muted-foreground text-center">
          Für diesen Indikator keine numerische Darstellung.
        </div>
      )}

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
      {indicator && !isNonNumeric && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-3 rounded-sm" style={{ background: getColorScale(min, min, max) }} />
          <span>{min.toFixed(1)}</span>
          <div className="flex-1 h-3 rounded-sm" style={{
            background: `linear-gradient(to right, ${getColorScale(min, min, max)}, ${getColorScale(max, min, max)})`
          }} />
          <span>{max.toFixed(1)}</span>
          <div className="w-4 h-3 rounded-sm bg-gray-200 ml-3" />
          <span>keine Angabe</span>
        </div>
      )}
    </div>
  );
}
