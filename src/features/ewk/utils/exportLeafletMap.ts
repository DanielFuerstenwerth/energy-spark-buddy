import type L from 'leaflet';

/**
 * Export a Leaflet map to PNG with optional watermark.
 * Uses leaflet-image for pixel-accurate tile+overlay rendering.
 */
export async function exportLeafletMapPng(
  map: L.Map,
  opts: { watermarkSrc?: string; filename?: string } = {}
): Promise<void> {
  const { watermarkSrc, filename = 'karte.png' } = opts;

  // Wait for map ready + tiles idle
  await new Promise<void>((resolve) => {
    if ((map as any)._loaded) {
      resolve();
    } else {
      map.whenReady(() => resolve());
    }
  });

  // Small delay to let tiles finish loading
  await new Promise<void>((resolve) => {
    const handler = () => {
      map.off('idle', handler);
      resolve();
    };
    // If already idle, fire after a tick
    if (!(map as any)._tilesToLoad) {
      setTimeout(resolve, 300);
    } else {
      map.on('idle', handler);
      // Fallback timeout
      setTimeout(() => {
        map.off('idle', handler);
        resolve();
      }, 3000);
    }
  });

  // Dynamic import of leaflet-image (CJS module)
  const mod = await import('leaflet-image');
  const leafletImage: (m: L.Map, cb: (err: Error | null, c: HTMLCanvasElement) => void) => void =
    typeof mod.default === 'function' ? mod.default : (mod as any);

  const mapCanvas: HTMLCanvasElement = await new Promise((resolve, reject) => {
    leafletImage(map, (err: Error | null, canvas: HTMLCanvasElement) => {
      if (err) reject(err);
      else resolve(canvas);
    });
  });

  // Create final canvas (same size)
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = mapCanvas.width;
  finalCanvas.height = mapCanvas.height;
  const ctx = finalCanvas.getContext('2d')!;

  // Draw map
  ctx.drawImage(mapCanvas, 0, 0);

  // Draw watermark if provided
  if (watermarkSrc) {
    try {
      const img = await loadImage(watermarkSrc);
      const maxW = 110;
      const ratio = img.naturalHeight / img.naturalWidth;
      const w = maxW;
      const h = maxW * ratio;
      const padding = 16;
      const x = finalCanvas.width - w - padding;
      const y = finalCanvas.height - h - padding;
      ctx.globalAlpha = 0.3;
      ctx.drawImage(img, x, y, w, h);
      ctx.globalAlpha = 1;
    } catch (e) {
      console.warn('Watermark loading failed, exporting without it', e);
    }
  }

  // Trigger download
  const link = document.createElement('a');
  link.download = filename;
  link.href = finalCanvas.toDataURL('image/png');
  link.click();
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
