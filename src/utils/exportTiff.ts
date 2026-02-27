import html2canvas from 'html2canvas';
import UTIF from 'utif2';

/**
 * Export a DOM element (map container + legend) as a TIFF file.
 */
export async function exportMapContainerAsTiff(
  containerEl: HTMLElement,
  filename?: string
): Promise<void> {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fname = filename ?? `benchmark_karte_${ts}.tif`;

  // 1. Render to canvas via html2canvas
  const canvas = await html2canvas(containerEl, {
    useCORS: true,
    allowTaint: true,
    scale: 6, // A0 print quality (~300 DPI)
    backgroundColor: '#ffffff',
    logging: false,
  });

  // 2. Get raw RGBA pixel data
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);

  // 3. Encode as TIFF using UTIF2
  const tiffData = UTIF.encodeImage(new Uint8Array(imageData.data.buffer), w, h);
  // 4. Download
  const blob = new Blob([tiffData], { type: 'image/tiff' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = fname;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
