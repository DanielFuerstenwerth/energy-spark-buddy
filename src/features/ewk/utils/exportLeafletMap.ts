import type L from 'leaflet';

/**
 * Color scale identical to KarteTab – Blue (220°) → Red (0°).
 */
function getColorScale(value: number, min: number, max: number): string {
  if (max === min) return 'hsl(217, 91%, 60%)';
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const h = (1 - t) * 220;
  return `hsl(${h}, 70%, 50%)`;
}

export interface MapExportContext {
  /** GeoJSON FeatureCollection (same data used in the live map) */
  geoData: any;
  /** Map from vnb_id → numeric value (null = keine Angabe) */
  valueMap: Map<string, { value: number | null; firmenname: string; bnr: string }>;
  min: number;
  max: number;
  validN: number;
  indicatorLabel: string;
}

/**
 * Export a Leaflet map to PNG using an offscreen map so that
 * tiles + canvas-rendered polygons are reliably captured.
 */
export async function exportLeafletMapPng(
  liveMap: L.Map,
  ctx: MapExportContext,
  opts: { watermarkSrc?: string; filename?: string } = {}
): Promise<void> {
  const { watermarkSrc, filename = 'karte.png' } = opts;
  const Leaflet = await import('leaflet');

  // --- 1. Create offscreen container ---
  const container = document.createElement('div');
  const size = liveMap.getSize();
  Object.assign(container.style, {
    position: 'fixed',
    left: '-99999px',
    top: '-99999px',
    width: `${size.x}px`,
    height: `${size.y}px`,
    visibility: 'hidden',
  });
  document.body.appendChild(container);

  let offMap: L.Map | null = null;
  try {
    // --- 2. Offscreen map with preferCanvas ---
    offMap = Leaflet.map(container, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });
    offMap.setView(liveMap.getCenter(), liveMap.getZoom());

    // --- 3. TileLayer (crossOrigin for canvas export) ---
    const tileLayer = Leaflet.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 19, crossOrigin: 'anonymous' } as any
    ).addTo(offMap);

    // Wait for tiles to load
    await new Promise<void>((resolve) => {
      const onLoad = () => {
        tileLayer.off('load', onLoad);
        resolve();
      };
      tileLayer.on('load', onLoad);
      // Fallback
      setTimeout(() => {
        tileLayer.off('load', onLoad);
        resolve();
      }, 5000);
    });

    // --- 4. GeoJSON polygons with canvas renderer ---
    const canvasRenderer = Leaflet.canvas();
    Leaflet.geoJSON(ctx.geoData, {
      renderer: canvasRenderer,
      style: (feature: any) => {
        const vnbId = feature?.id;
        const info = vnbId ? ctx.valueMap.get(vnbId) : null;
        const fillColor =
          info?.value !== null && info?.value !== undefined
            ? getColorScale(info.value, ctx.min, ctx.max)
            : '#e5e7eb';
        return { fillColor, weight: 0.5, opacity: 1, color: '#333', fillOpacity: 1.0 };
      },
    } as any).addTo(offMap);

    // Small extra delay for canvas rendering
    await new Promise((r) => setTimeout(r, 400));

    // --- 5. leaflet-image on offscreen map ---
    const mod = await import('leaflet-image');
    const leafletImage: (m: L.Map, cb: (err: Error | null, c: HTMLCanvasElement) => void) => void =
      typeof mod.default === 'function' ? mod.default : (mod as any);

    const mapCanvas: HTMLCanvasElement = await new Promise((resolve, reject) => {
      leafletImage(offMap!, (err, canvas) => {
        if (err) reject(err);
        else resolve(canvas);
      });
    });

    // Debug: verify polygon rendering
    console.debug('[map-export] canvas size:', mapCanvas.width, mapCanvas.height);

    // --- 6. Final canvas: map + legend + watermark ---
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = mapCanvas.width;
    finalCanvas.height = mapCanvas.height;
    const c = finalCanvas.getContext('2d')!;
    c.drawImage(mapCanvas, 0, 0);

    // 6a) Draw legend bottom-left
    drawLegend(c, ctx, finalCanvas.height);

    // 6b) Draw watermark bottom-right
    if (watermarkSrc) {
      try {
        const img = await loadImage(watermarkSrc);
        const maxW = 100;
        const ratio = img.naturalHeight / img.naturalWidth;
        const w = maxW;
        const h = maxW * ratio;
        const padding = 16;
        c.globalAlpha = 0.3;
        c.drawImage(img, finalCanvas.width - w - padding, finalCanvas.height - h - padding, w, h);
        c.globalAlpha = 1;
      } catch (e) {
        console.warn('Watermark loading failed, exporting without it', e);
      }
    }

    // --- 7. Trigger download ---
    const link = document.createElement('a');
    link.download = filename;
    link.href = finalCanvas.toDataURL('image/png');
    link.click();
  } finally {
    // --- 8. Cleanup ---
    if (offMap) offMap.remove();
    container.remove();
  }
}

/** Draw the 11-step legend + "k. A." swatch onto the canvas. */
function drawLegend(
  ctx: CanvasRenderingContext2D,
  data: MapExportContext,
  canvasH: number
) {
  const steps = 11;
  const swatchW = 28;
  const swatchH = 16;
  const gap = 4;
  const padding = 16;
  const fontSize = 10;
  const labelH = fontSize + 4;
  const totalW = steps * (swatchW + gap) + gap + 50; // extra for k.A.
  const totalH = swatchH + labelH + 24; // label row + title

  const x0 = padding;
  const y0 = canvasH - totalH - padding;

  // Background
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  const bgW = totalW + 16;
  const bgH = totalH + 8;
  ctx.beginPath();
  ctx.roundRect(x0 - 8, y0 - 8, bgW, bgH, 6);
  ctx.fill();
  ctx.stroke();

  // Title
  ctx.fillStyle = '#333';
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillText(data.indicatorLabel.slice(0, 60), x0, y0 + fontSize);

  const swatchY = y0 + fontSize + 6;

  // Swatches
  ctx.font = `${fontSize - 1}px sans-serif`;
  for (let i = 0; i < steps; i++) {
    const val = data.min + (i * (data.max - data.min)) / (steps - 1);
    const color = getColorScale(val, data.min, data.max);
    const sx = x0 + i * (swatchW + gap);

    ctx.fillStyle = color;
    ctx.fillRect(sx, swatchY, swatchW, swatchH);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(sx, swatchY, swatchW, swatchH);

    ctx.fillStyle = '#555';
    ctx.fillText(val.toFixed(1), sx, swatchY + swatchH + labelH - 2);
  }

  // k. A. swatch
  const kaX = x0 + steps * (swatchW + gap) + 8;
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(kaX, swatchY, swatchW, swatchH);
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(kaX, swatchY, swatchW, swatchH);
  ctx.fillStyle = '#555';
  ctx.fillText('k. A.', kaX, swatchY + swatchH + labelH - 2);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
