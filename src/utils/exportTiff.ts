import UTIF from 'utif2';
import { track } from '@/utils/plausibleTrack';

/**
 * Export a Leaflet-style GeoJSON map as a high-resolution TIFF.
 *
 * Uses an **offscreen Leaflet map** + `leaflet-image` to render polygons
 * directly to a canvas, completely bypassing html2canvas / dom-to-image.
 * This eliminates CSS `translate3d` offset issues.
 */

export interface TiffExportContext {
  /** GeoJSON FeatureCollection */
  geoData: any;
  /** Map vnb_id → score info */
  scoreData: Map<string, { score: number | null }>;
  /** Function to convert a score to a fill color string */
  getColor: (score: number | null) => string;
}

// A0 @ 300 DPI ≈ 9933 × 14043 px – we use a practical subset
const DEFAULT_W = 4000;
const DEFAULT_H = 5000;

export async function exportLeafletToTiff(
  ctx: TiffExportContext,
  opts: {
    width?: number;
    height?: number;
    includeBasemap?: boolean;
    filename?: string;
  } = {}
): Promise<void> {
  const {
    width = DEFAULT_W,
    height = DEFAULT_H,
    includeBasemap = false,
    filename = `benchmark_karte_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.tif`,
  } = opts;

  track('TIFF Download', { filename });

  const Leaflet = await import('leaflet');

  // --- 1. Offscreen container ---
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0px',
    width: `${width}px`,
    height: `${height}px`,
    visibility: 'hidden',
    transform: 'none',
    zoom: '1',
  });
  document.body.appendChild(container);

  let exportMap: L.Map | null = null;
  try {
    // --- 2. Offscreen Leaflet map ---
    exportMap = Leaflet.map(container, {
      preferCanvas: true,
      zoomControl: false,
      attributionControl: false,
    });

    // --- 3. Optional basemap ---
    let tileLayer: L.TileLayer | null = null;
    if (includeBasemap) {
      tileLayer = Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        crossOrigin: 'anonymous',
      } as any).addTo(exportMap);
    }

    // --- 4. GeoJSON layer with canvas renderer ---
    const canvasRenderer = Leaflet.canvas();
    const geoLayer = Leaflet.geoJSON(ctx.geoData, {
      renderer: canvasRenderer,
      style: (feature: any) => {
        const vnbId = feature?.id;
        const info = vnbId ? ctx.scoreData.get(vnbId) : null;
        const fillColor = ctx.getColor(info?.score ?? null);
        return {
          fillColor,
          weight: 0.6,
          opacity: 1,
          color: '#333333',
          fillOpacity: 1.0,
        };
      },
    } as any).addTo(exportMap);

    // --- 5. Fit bounds ---
    const bounds = geoLayer.getBounds();
    if (bounds.isValid()) {
      exportMap.fitBounds(bounds, { padding: [60, 60], animate: false });
    } else {
      exportMap.setView([51.1657, 10.4515], 6);
    }

    // --- 6. Wait for Leaflet to finish ---
    exportMap.invalidateSize(true);

    // Wait for moveend/zoomend
    await new Promise<void>((resolve) => {
      let moveReady = false;
      let zoomReady = false;
      const check = () => { if (moveReady && zoomReady) resolve(); };
      exportMap!.once('moveend', () => { moveReady = true; check(); });
      exportMap!.once('zoomend', () => { zoomReady = true; check(); });
      // In case events already fired (static map)
      setTimeout(() => { moveReady = true; zoomReady = true; check(); }, 500);
    });

    // Wait for tiles if basemap is active
    if (tileLayer) {
      await new Promise<void>((resolve) => {
        tileLayer!.once('load', () => resolve());
        setTimeout(resolve, 3000); // fallback timeout
      });
    }

    // Extra rAF cycles for canvas renderer to flush
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    await new Promise((r) => setTimeout(r, 300));

    // --- 7. Render via leaflet-image ---
    const mod = await import('leaflet-image');
    const leafletImage: (m: L.Map, cb: (err: Error | null, c: HTMLCanvasElement) => void) => void =
      typeof mod.default === 'function' ? mod.default : (mod as any);

    const mapCanvas: HTMLCanvasElement = await new Promise((resolve, reject) => {
      leafletImage(exportMap!, (err, canvas) => {
        if (err) reject(err);
        else resolve(canvas);
      });
    });

    // --- 8. Canvas → TIFF ---
    const c = mapCanvas.getContext('2d')!;
    const w = mapCanvas.width;
    const h = mapCanvas.height;
    const imageData = c.getImageData(0, 0, w, h);

    const tiffData = UTIF.encodeImage(new Uint8Array(imageData.data.buffer), w, h);
    const blob = new Blob([tiffData], { type: 'image/tiff' });
    const url = URL.createObjectURL(blob);

    // --- 9. Download ---
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } finally {
    // --- 10. Cleanup ---
    if (exportMap) exportMap.remove();
    container.remove();
  }
}
