import { useCallback, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  targetRef: React.RefObject<HTMLElement>;
  filename?: string;
  className?: string;
}

const LOGO_SRC = '/favicon.svg';
const LOGO_W = 100;
const LOGO_PAD = 12;
const LOGO_ALPHA = 0.3;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
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
          const logo = await loadImage(LOGO_SRC);
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
