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

// --- Portrait layout constants ---
const EXPORT_W = 1200;
const HEADER_H = 90;
const LEGEND_H = 140;
const FOOTER_H = 10;
const BG_COLOR = '#F8FAFC';
const HEADER_BG = '#FFFFFF';

/**
 * Export a composed portrait "report-like" PNG:
 *   Top: title header
 *   Middle: map (no basemap by default – just polygons on light background)
 *   Bottom: horizontal legend
 *   Bottom-right: logo watermark
 */
export async function exportLeafletMapPng(
  _liveMap: L.Map,
  ctx: MapExportContext,
  opts: { watermarkSrc?: string; filename?: string } = {}
): Promise<void> {
  const { watermarkSrc, filename = 'karte.png' } = opts;
  const Leaflet = await import('leaflet');

  // Portrait: width fixed, height = width * 1.45
  const MAP_H = Math.round(EXPORT_W * 1.05);
  const EXPORT_H = HEADER_H + MAP_H + LEGEND_H + FOOTER_H;

  // --- 1. Offscreen container ---
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    left: '-99999px',
    top: '-99999px',
    width: `${EXPORT_W}px`,
    height: `${MAP_H}px`,
    visibility: 'hidden',
  });
  document.body.appendChild(container);

  let offMap: L.Map | null = null;
  try {
    // --- 2. Offscreen map (NO basemap – clean background) ---
    offMap = Leaflet.map(container, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });

    // --- 3. GeoJSON with canvas renderer ---
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
        return { fillColor, weight: 0.6, opacity: 1, color: '#94A3B8', fillOpacity: 1.0 };
      },
    } as any).addTo(offMap);

    // Fit to Germany
    const bounds = geoLayer.getBounds();
    if (bounds.isValid()) {
      offMap.fitBounds(bounds, { padding: [50, 50], animate: false });
      offMap.setMaxBounds(bounds.pad(0.05));
    } else {
      offMap.setView([51.1657, 10.4515], 6);
    }

    // Wait for map to be ready
    await new Promise<void>((resolve) => {
      offMap!.whenReady(() => resolve());
    });
    await new Promise((r) => setTimeout(r, 400));

    // --- 4. leaflet-image ---
    const mod = await import('leaflet-image');
    const leafletImage: (m: L.Map, cb: (err: Error | null, c: HTMLCanvasElement) => void) => void =
      typeof mod.default === 'function' ? mod.default : (mod as any);

    const mapCanvas: HTMLCanvasElement = await new Promise((resolve, reject) => {
      leafletImage(offMap!, (err, canvas) => {
        if (err) reject(err);
        else resolve(canvas);
      });
    });

    // --- 5. Compose final portrait canvas ---
    const final = document.createElement('canvas');
    final.width = EXPORT_W;
    final.height = EXPORT_H;
    const c = final.getContext('2d')!;

    // 5a) Light background (replaces basemap)
    c.fillStyle = BG_COLOR;
    c.fillRect(0, 0, EXPORT_W, EXPORT_H);

    // 5b) Header
    drawHeader(c, ctx, EXPORT_W);

    // Header bottom border
    c.strokeStyle = '#E2E8F0';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, HEADER_H);
    c.lineTo(EXPORT_W, HEADER_H);
    c.stroke();

    // 5c) Map area – draw into full width below header
    c.drawImage(mapCanvas, 0, 0, mapCanvas.width, mapCanvas.height, 0, HEADER_H, EXPORT_W, MAP_H);

    // Divider above legend
    c.strokeStyle = '#E2E8F0';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, HEADER_H + MAP_H);
    c.lineTo(EXPORT_W, HEADER_H + MAP_H);
    c.stroke();

    // 5d) Legend below map
    c.fillStyle = '#FFFFFF';
    c.fillRect(0, HEADER_H + MAP_H, EXPORT_W, LEGEND_H + FOOTER_H);
    drawBottomLegend(c, ctx, EXPORT_W, HEADER_H + MAP_H);

    // 5e) Watermark logo bottom-right
    if (watermarkSrc) {
      try {
        const img = await loadImage(watermarkSrc);
        const maxW = 100;
        const ratio = img.naturalHeight / img.naturalWidth;
        const w = maxW;
        const h = maxW * ratio;
        const pad = 14;
        c.globalAlpha = 0.3;
        c.drawImage(img, EXPORT_W - w - pad, EXPORT_H - h - pad, w, h);
        c.globalAlpha = 1;
      } catch (e) {
        console.warn('Watermark loading failed', e);
      }
    }

    // --- 6. Download ---
    const link = document.createElement('a');
    link.download = filename;
    link.href = final.toDataURL('image/png');
    link.click();
  } finally {
    if (offMap) offMap.remove();
    container.remove();
  }
}

/** Draw header bar */
function drawHeader(c: CanvasRenderingContext2D, ctx: MapExportContext, W: number) {
  c.fillStyle = HEADER_BG;
  c.fillRect(0, 0, W, HEADER_H);

  const pad = 24;

  // Title
  c.fillStyle = '#1E293B';
  c.font = 'bold 20px system-ui, -apple-system, sans-serif';
  c.fillText('Datenexplorer zur Energiewendekompetenz', pad, 36);

  // Subtitle
  c.fillStyle = '#475569';
  c.font = '14px system-ui, -apple-system, sans-serif';
  const label = ctx.indicatorLabel.length > 100 ? ctx.indicatorLabel.slice(0, 97) + '…' : ctx.indicatorLabel;
  c.fillText(label, pad, 58);

  // N count right
  c.fillStyle = '#94A3B8';
  c.font = '12px system-ui, -apple-system, sans-serif';
  const nText = `Gültige N: ${ctx.validN}`;
  c.fillText(nText, W - pad - c.measureText(nText).width, 36);

  // Source right
  const src = 'Quelle: BNetzA / vnb-transparenz.de';
  c.fillText(src, W - pad - c.measureText(src).width, 56);
}

/** Draw horizontal legend below the map */
function drawBottomLegend(c: CanvasRenderingContext2D, ctx: MapExportContext, W: number, topY: number) {
  const pad = 24;
  let y = topY + 20;

  // "Legende" heading
  c.fillStyle = '#1E293B';
  c.font = 'bold 13px system-ui, -apple-system, sans-serif';
  c.fillText('Legende', pad, y);

  // Indicator name (truncated)
  c.fillStyle = '#475569';
  c.font = '12px system-ui, -apple-system, sans-serif';
  const nameLabel = ctx.indicatorLabel.length > 80 ? ctx.indicatorLabel.slice(0, 77) + '…' : ctx.indicatorLabel;
  c.fillText(nameLabel, pad + c.measureText('Legende').width + 16, y);

  y += 24;

  // Swatches horizontally
  const steps = 11;
  const swatchW = 50;
  const swatchH = 16;
  const totalSwatches = steps + 1; // +1 for k.A.
  const totalW = totalSwatches * (swatchW + 6);
  const startX = Math.max(pad, (W - totalW) / 2); // center

  for (let i = 0; i < steps; i++) {
    const val = ctx.min + (i * (ctx.max - ctx.min)) / (steps - 1);
    const color = getColorScale(val, ctx.min, ctx.max);
    const sx = startX + i * (swatchW + 6);

    c.fillStyle = color;
    c.fillRect(sx, y, swatchW, swatchH);
    c.strokeStyle = '#CBD5E1';
    c.lineWidth = 0.5;
    c.strokeRect(sx, y, swatchW, swatchH);

    c.fillStyle = '#475569';
    c.font = '10px system-ui, -apple-system, sans-serif';
    const valText = val.toFixed(1);
    const tw = c.measureText(valText).width;
    c.fillText(valText, sx + (swatchW - tw) / 2, y + swatchH + 13);
  }

  // k. A. swatch
  const kaX = startX + steps * (swatchW + 6) + 12;
  c.fillStyle = '#e5e7eb';
  c.fillRect(kaX, y, swatchW, swatchH);
  c.strokeStyle = '#CBD5E1';
  c.lineWidth = 0.5;
  c.strokeRect(kaX, y, swatchW, swatchH);
  c.fillStyle = '#475569';
  c.font = '10px system-ui, -apple-system, sans-serif';
  const kaText = 'k. A.';
  const kaW = c.measureText(kaText).width;
  c.fillText(kaText, kaX + (swatchW - kaW) / 2, y + swatchH + 13);
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
