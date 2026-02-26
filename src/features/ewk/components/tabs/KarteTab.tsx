import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { IndicatorMeta, VnbRow } from '../../types';
import { tryParseNum } from '../../utils/csvParser';
import type { UnitsMap } from '../../utils/units';
import { getUnit } from '../../utils/units';
import { formatDisplay } from '../../utils/format';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { exportLeafletMapPng, type MapExportContext } from '../../utils/exportLeafletMap';

interface Props {
  catalog: IndicatorMeta[];
  indicator: IndicatorMeta | null;
  rows: VnbRow[];
  loading: boolean;
  unitsMap: UnitsMap;
}

function getColorScale(value: number, min: number, max: number): string {
  if (max === min) return 'hsl(217, 91%, 60%)';
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  // Blue (220°) → Red (0°)
  const h = (1 - t) * 220;
  return `hsl(${h}, 70%, 50%)`;
}

export default function KarteTab({ catalog, indicator, rows, loading, unitsMap }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const karteRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const geoLayer = useRef<L.GeoJSON | null>(null);
  const [exporting, setExporting] = useState(false);

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
    map.current = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([51.1657, 10.4515], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      crossOrigin: 'anonymous',
    } as any).addTo(map.current);

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
            return { fillColor, weight: 0.5, opacity: 1, color: '#333', fillOpacity: 1.0 };
          },
          onEachFeature: (feature: any, layer) => {
            const vnbId = feature?.id;
            const info = valueMap.get(vnbId);
            const name = info?.firmenname ?? vnbId;
            const u = indicator ? getUnit(unitsMap, indicator.indicator_id) : '';
            const valStr = info?.value !== null && info?.value !== undefined
              ? formatDisplay(info.value, u)
              : 'keine Angabe';
            layer.bindTooltip(`<strong>${name}</strong><br/>Wert: ${valStr}`, { sticky: true });
            layer.on('mouseover', function (this: any) {
              this.setStyle({ weight: 1.5, fillOpacity: 1.0 });
            });
            layer.on('mouseout', function (this: any) {
              this.setStyle({ weight: 0.5, fillOpacity: 1.0 });
            });
          },
        }).addTo(map.current);

        // Ensure alignment after adding layer
        map.current.invalidateSize(true);
        requestAnimationFrame(() => {
          map.current?.invalidateSize(true);
        });
      })
      .catch(console.error);
  }, [indicator, valueMap, min, max, isNumeric, unitsMap]);

  const handleExport = useCallback(async () => {
    if (!map.current || exporting) return;
    setExporting(true);
    try {
      const geoRes = await fetch('/data/vnb_regions.geojson');
      const geoData = await geoRes.json();
      await exportLeafletMapPng(
        map.current,
        { geoData, valueMap, min, max, validN, indicatorLabel: indicator?.display_label ?? 'Export' },
        { watermarkSrc: '/favicon.svg', filename: `EWK_Karte_${(indicator?.column_key ?? 'export').replace(/[^a-zA-Z0-9_-]/g, '_')}.png` }
      );
    } catch (e) {
      console.error('Map export failed', e);
    } finally {
      setExporting(false);
    }
  }, [exporting, indicator, valueMap, min, max, validN]);

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
    <div ref={karteRef} className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">Karte:</span>
        <Badge variant="outline" className="text-xs">{indicator.display_label}{(() => { const u = getUnit(unitsMap, indicator.indicator_id); return u ? ` (${u})` : ''; })()}</Badge>
        <span className="text-xs text-muted-foreground">Gültige N: {validN}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          disabled={exporting}
          className="ml-auto h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          title="Karte als Bild herunterladen"
        >
          {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          {exporting ? 'Export…' : 'Bild'}
        </Button>
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

      {/* Legend: 11 discrete swatches using getColorScale */}
      {(() => {
        const steps = Array.from({ length: 11 }, (_, i) => {
          const val = min + (i * (max - min)) / 10;
          return { val, color: getColorScale(val, min, max) };
        });
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-1 flex-wrap text-xs text-muted-foreground">
              {steps.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div className="w-6 h-4 rounded-sm border border-border" style={{ backgroundColor: s.color }} />
                  <span className="text-[10px]">{s.val.toFixed(1)}</span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-0.5 ml-3">
                <div className="w-6 h-4 rounded-sm border border-border bg-muted" />
                <span className="text-[10px]">k. A.</span>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground">
              Debug: min={min.toFixed(2)}, max={max.toFixed(2)}, gültige N={validN}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
