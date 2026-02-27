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
  /** Optional title rendered at the top of the exported image */
  title?: string;
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
    /** If provided, export only this viewport instead of fitting all data */
    viewportBounds?: { south: number; west: number; north: number; east: number };
    /** Fill opacity for polygons (default 1.0) */
    fillOpacity?: number;
  } = {}
): Promise<void> {
  const {
    width = DEFAULT_W,
    height = DEFAULT_H,
    includeBasemap = false,
    filename = `benchmark_karte_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.tif`,
    viewportBounds,
    fillOpacity = 1.0,
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
          fillOpacity,
        };
      },
    } as any).addTo(exportMap);

    // --- 5. Fit bounds (viewport or full extent) ---
    if (viewportBounds) {
      const vb = Leaflet.latLngBounds(
        [viewportBounds.south, viewportBounds.west],
        [viewportBounds.north, viewportBounds.east],
      );
      exportMap.fitBounds(vb, { padding: [0, 0], animate: false });
    } else {
      const bounds = geoLayer.getBounds();
      if (bounds.isValid()) {
        exportMap.fitBounds(bounds, { padding: [60, 60], animate: false });
      } else {
        exportMap.setView([51.1657, 10.4515], 6);
      }
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

    // --- 8. Compose final image: white bg + title + map + legend ---
    const mapW = mapCanvas.width;
    const mapH = mapCanvas.height;

    const titleText = ctx.title || 'Benchmark-Karte';
    const headerHeight = 120;
    const legendHeight = 100;
    const padding = 60;
    const finalW = mapW + padding * 2;
    const finalH = headerHeight + mapH + legendHeight + padding;

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = finalW;
    finalCanvas.height = finalH;
    const fc = finalCanvas.getContext('2d')!;

    // White background
    fc.fillStyle = '#ffffff';
    fc.fillRect(0, 0, finalW, finalH);

    // Title
    fc.fillStyle = '#1a1a1a';
    fc.font = 'bold 64px sans-serif';
    fc.textAlign = 'center';
    fc.fillText(titleText, finalW / 2, headerHeight - 30);

    // Map
    fc.drawImage(mapCanvas, padding, headerHeight);

    // Legend
    const legendY = headerHeight + mapH + 30;
    const legendLabels = ['-100 bis -50', '-50 bis 0', '0', '0 bis 50', '50 bis 100', 'keine Daten'];
    const legendColors = [
      'hsl(350, 80%, 35%)',
      'hsl(20, 85%, 55%)',
      'hsl(220, 13%, 91%)',
      'hsl(142, 76%, 45%)',
      'hsl(158, 64%, 32%)',
      'hsl(220, 14%, 96%)',
    ];
    const swatchSize = 36;
    const legendItemWidth = 260;
    const totalLegendWidth = legendLabels.length * legendItemWidth;
    const legendStartX = (finalW - totalLegendWidth) / 2;

    fc.font = '32px sans-serif';
    fc.textAlign = 'left';
    for (let i = 0; i < legendLabels.length; i++) {
      const x = legendStartX + i * legendItemWidth;
      // Swatch
      fc.fillStyle = legendColors[i];
      fc.fillRect(x, legendY, swatchSize, swatchSize);
      fc.strokeStyle = '#999999';
      fc.lineWidth = 1;
      fc.strokeRect(x, legendY, swatchSize, swatchSize);
      // Label
      fc.fillStyle = '#333333';
      fc.fillText(legendLabels[i], x + swatchSize + 10, legendY + swatchSize - 6);
    }

    // Source line
    fc.font = '24px sans-serif';
    fc.fillStyle = '#888888';
    fc.textAlign = 'center';
    fc.fillText('© vnb-transparenz.de', finalW / 2, finalH - 15);

    const imageData = fc.getImageData(0, 0, finalW, finalH);
    const tiffData = UTIF.encodeImage(new Uint8Array(imageData.data.buffer), finalW, finalH);
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
