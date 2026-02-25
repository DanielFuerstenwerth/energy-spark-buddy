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
  geoData: any;
  valueMap: Map<string, { value: number | null; firmenname: string; bnr: string }>;
  min: number;
  max: number;
  validN: number;
  indicatorLabel: string;
}

// --- Layout constants ---
const EXPORT_W = 1600;
const EXPORT_H = 900;
const HEADER_H = 90;
const SIDEBAR_W = 340;
const MAP_W = EXPORT_W - SIDEBAR_W;
const MAP_H = EXPORT_H - HEADER_H;
const SIDEBAR_BG = '#F8FAFC';
const HEADER_BG = '#FFFFFF';

/**
 * Export a composed "report-like" PNG:
 *   Top: title header
 *   Left: map fitted to Germany
 *   Right: vertical legend sidebar
 *   Bottom-right: logo watermark
 */
export async function exportLeafletMapPng(
  _liveMap: L.Map,
  ctx: MapExportContext,
  opts: { watermarkSrc?: string; filename?: string } = {}
): Promise<void> {
  const { watermarkSrc, filename = 'karte.png' } = opts;
  const Leaflet = await import('leaflet');

  // --- 1. Offscreen container sized to map region ---
  const container = document.createElement('div');
  // Use 2x for sharper tiles on the map portion
  Object.assign(container.style, {
    position: 'fixed',
    left: '-99999px',
    top: '-99999px',
    width: `${MAP_W}px`,
    height: `${MAP_H}px`,
    visibility: 'hidden',
  });
  document.body.appendChild(container);

  let offMap: L.Map | null = null;
  try {
    // --- 2. Offscreen map ---
    offMap = Leaflet.map(container, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });

    // --- 3. Tiles ---
    const tileLayer = Leaflet.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 19, crossOrigin: 'anonymous' } as any
    ).addTo(offMap);

    // --- 4. GeoJSON with canvas renderer, fit to DE ---
    const canvasRenderer = Leaflet.canvas();
    const geoLayer = Leaflet.geoJSON(ctx.geoData, {
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

    // Fit to Germany (polygon bounds) with padding
    const bounds = geoLayer.getBounds();
    if (bounds.isValid()) {
      offMap.fitBounds(bounds, { padding: [30, 30], animate: false });
    } else {
      offMap.setView([51.1657, 10.4515], 6);
    }

    // Wait for tiles
    await new Promise<void>((resolve) => {
      const onLoad = () => { tileLayer.off('load', onLoad); resolve(); };
      tileLayer.on('load', onLoad);
      setTimeout(() => { tileLayer.off('load', onLoad); resolve(); }, 6000);
    });

    // Extra delay for canvas polygons
    await new Promise((r) => setTimeout(r, 500));

    // --- 5. leaflet-image ---
    const mod = await import('leaflet-image');
    const leafletImage: (m: L.Map, cb: (err: Error | null, c: HTMLCanvasElement) => void) => void =
      typeof mod.default === 'function' ? mod.default : (mod as any);

    const mapCanvas: HTMLCanvasElement = await new Promise((resolve, reject) => {
      leafletImage(offMap!, (err, canvas) => {
        if (err) reject(err);
        else resolve(canvas);
      });
    });

    // --- 6. Compose final canvas ---
    const final = document.createElement('canvas');
    final.width = EXPORT_W;
    final.height = EXPORT_H;
    const c = final.getContext('2d')!;

    // 6a) White background
    c.fillStyle = '#FFFFFF';
    c.fillRect(0, 0, EXPORT_W, EXPORT_H);

    // 6b) Header
    drawHeader(c, ctx);

    // 6c) Map (draw into left region)
    c.drawImage(mapCanvas, 0, 0, mapCanvas.width, mapCanvas.height, 0, HEADER_H, MAP_W, MAP_H);

    // 6d) Sidebar border
    c.strokeStyle = '#E2E8F0';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(MAP_W, HEADER_H);
    c.lineTo(MAP_W, EXPORT_H);
    c.stroke();

    // 6e) Sidebar background
    c.fillStyle = SIDEBAR_BG;
    c.fillRect(MAP_W, HEADER_H, SIDEBAR_W, MAP_H);

    // 6f) Legend in sidebar
    drawSidebarLegend(c, ctx);

    // 6g) Header bottom border
    c.strokeStyle = '#E2E8F0';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, HEADER_H);
    c.lineTo(EXPORT_W, HEADER_H);
    c.stroke();

    // 6h) Watermark logo
    if (watermarkSrc) {
      try {
        const img = await loadImage(watermarkSrc);
        const maxW = 110;
        const ratio = img.naturalHeight / img.naturalWidth;
        const w = maxW;
        const h = maxW * ratio;
        const pad = 16;
        c.globalAlpha = 0.3;
        c.drawImage(img, EXPORT_W - w - pad, EXPORT_H - h - pad, w, h);
        c.globalAlpha = 1;
      } catch (e) {
        console.warn('Watermark loading failed', e);
      }
    }

    // --- 7. Download ---
    const link = document.createElement('a');
    link.download = filename;
    link.href = final.toDataURL('image/png');
    link.click();
  } finally {
    if (offMap) offMap.remove();
    container.remove();
  }
}

/** Draw the header bar with title + subtitle + N */
function drawHeader(c: CanvasRenderingContext2D, ctx: MapExportContext) {
  c.fillStyle = HEADER_BG;
  c.fillRect(0, 0, EXPORT_W, HEADER_H);

  const pad = 28;

  // Title
  c.fillStyle = '#1E293B';
  c.font = 'bold 22px system-ui, -apple-system, sans-serif';
  c.fillText('Datenexplorer zur Energiewendekompetenz', pad, 38);

  // Subtitle (indicator)
  c.fillStyle = '#475569';
  c.font = '15px system-ui, -apple-system, sans-serif';
  const label = ctx.indicatorLabel.length > 90 ? ctx.indicatorLabel.slice(0, 87) + '…' : ctx.indicatorLabel;
  c.fillText(label, pad, 62);

  // N count right-aligned
  c.fillStyle = '#94A3B8';
  c.font = '13px system-ui, -apple-system, sans-serif';
  const nText = `Gültige N: ${ctx.validN}`;
  const nW = c.measureText(nText).width;
  c.fillText(nText, EXPORT_W - pad - nW, 38);

  // Source
  c.fillText('Quelle: BNetzA / vnb-transparenz.de', EXPORT_W - pad - c.measureText('Quelle: BNetzA / vnb-transparenz.de').width, 58);
}

/** Draw vertical legend in the right sidebar */
function drawSidebarLegend(c: CanvasRenderingContext2D, ctx: MapExportContext) {
  const x0 = MAP_W + 24;
  let y = HEADER_H + 28;

  // "Legende" heading
  c.fillStyle = '#1E293B';
  c.font = 'bold 16px system-ui, -apple-system, sans-serif';
  c.fillText('Legende', x0, y);
  y += 28;

  // Indicator name (wrap to 2 lines max)
  c.fillStyle = '#475569';
  c.font = '13px system-ui, -apple-system, sans-serif';
  const maxLabelW = SIDEBAR_W - 48;
  const lines = wrapText(c, ctx.indicatorLabel, maxLabelW, 2);
  for (const line of lines) {
    c.fillText(line, x0, y);
    y += 18;
  }
  y += 12;

  // Swatches
  const steps = 11;
  const swatchSize = 18;
  const gap = 6;

  for (let i = 0; i < steps; i++) {
    const val = ctx.min + (i * (ctx.max - ctx.min)) / (steps - 1);
    const color = getColorScale(val, ctx.min, ctx.max);

    c.fillStyle = color;
    c.fillRect(x0, y, swatchSize, swatchSize);
    c.strokeStyle = '#CBD5E1';
    c.lineWidth = 0.5;
    c.strokeRect(x0, y, swatchSize, swatchSize);

    c.fillStyle = '#475569';
    c.font = '12px system-ui, -apple-system, sans-serif';
    c.fillText(val.toFixed(1), x0 + swatchSize + 10, y + 14);

    y += swatchSize + gap;
  }

  // k. A. swatch
  y += 6;
  c.fillStyle = '#e5e7eb';
  c.fillRect(x0, y, swatchSize, swatchSize);
  c.strokeStyle = '#CBD5E1';
  c.lineWidth = 0.5;
  c.strokeRect(x0, y, swatchSize, swatchSize);
  c.fillStyle = '#475569';
  c.font = '12px system-ui, -apple-system, sans-serif';
  c.fillText('keine Angabe', x0 + swatchSize + 10, y + 14);
}

/** Simple text wrapper */
function wrapText(c: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (c.measureText(test).width > maxW && current) {
      lines.push(current);
      if (lines.length >= maxLines) {
        lines[lines.length - 1] += '…';
        return lines;
      }
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
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
