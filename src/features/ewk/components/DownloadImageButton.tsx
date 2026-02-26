import { useCallback, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { track } from '@/utils/plausibleTrack';

interface Props {
  targetRef: React.RefObject<HTMLElement>;
  filename?: string;
  className?: string;
}

const LOGO_W = 100;
const LOGO_PAD = 12;
const LOGO_ALPHA = 0.35;

/** Rasterise an SVG to a bitmap so canvas drawImage works reliably */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Fetch SVG source, convert to data-URI blob to avoid cross-origin & <text> issues
    fetch(src)
      .then((r) => r.text())
      .then((svgText) => {
        const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = reject;
        img.src = url;
      })
      .catch(reject);
  });
}

export default function DownloadImageButton({ targetRef, filename = 'chart', className }: Props) {
  const [busy, setBusy] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!targetRef.current || busy) return;
    setBusy(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Stamp watermark logo bottom-right
      try {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const logo = await loadImage('/favicon.svg');
          const ratio = logo.naturalHeight / logo.naturalWidth;
          const w = LOGO_W * 2; // compensate for scale:2
          const h = w * ratio;
          const pad = LOGO_PAD * 2;
          ctx.globalAlpha = LOGO_ALPHA;
          ctx.drawImage(logo, canvas.width - w - pad, canvas.height - h - pad, w, h);
          ctx.globalAlpha = 1;
        }
      } catch (e) {
        console.warn('Watermark failed', e);
      }

      track('EWK Image Download', { filename });

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Image download failed', err);
    } finally {
      setBusy(false);
    }
  }, [targetRef, filename, busy]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      disabled={busy}
      className={`h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground ${className ?? ''}`}
      title="Als Bild herunterladen"
    >
      <Download className="h-3.5 w-3.5" />
      {busy ? '…' : 'Bild'}
    </Button>
  );
}
