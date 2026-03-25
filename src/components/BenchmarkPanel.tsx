import { useEffect, useState, useCallback, useMemo, useRef, RefObject } from "react";
import { Download, Loader2, Map } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { VnbCombobox } from "./VnbCombobox";
import { getColor, ScoreData, loadAllVnbNames } from "@/utils/dataLoader";
import { exportLeafletToTiff } from "@/utils/exportTiff";
import type { MapGgvHandle } from "./MapGgv";
import BenchmarkBarChart from "./BenchmarkBarChart";

interface BenchmarkPanelProps {
  scoreData: Map<string, ScoreData>;
  selectedVnb: { id: string; name: string } | null;
  onVnbSelect: (vnbId: string, vnbName: string) => void;
  mapRef?: RefObject<MapGgvHandle | null>;
}

interface VnbItem {
  id: string;
  name: string;
  score: number | null;
}

const BenchmarkPanel = ({ scoreData, selectedVnb, onVnbSelect, mapRef }: BenchmarkPanelProps) => {
  const [allVnbs, setAllVnbs] = useState<VnbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportingView, setExportingView] = useState(false);

  useEffect(() => {
    const loadAllVnbs = async () => {
      try {
        const vnbNamesMap = await loadAllVnbNames();
        const completeList: VnbItem[] = [];
        vnbNamesMap.forEach((name, id) => {
          const scoreInfo = scoreData.get(id);
          completeList.push({ id, name, score: scoreInfo?.score ?? null });
        });
        const sorted = completeList.sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity));
        setAllVnbs(sorted);
        setLoading(false);
      } catch (error) {
        console.error('Error loading all VNBs:', error);
        setLoading(false);
      }
    };
    loadAllVnbs();
  }, [scoreData]);

  const handleExportTiff = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const geoRes = await fetch('/data/vnb_regions.geojson');
      const geoData = await geoRes.json();
      await exportLeafletToTiff(
        { geoData, scoreData, getColor, title: 'Gemeinschaftliche Gebäudeversorgung (GGV)' },
        { width: 4000, height: 5000, includeBasemap: false }
      );
    } catch (e) {
      console.error('TIFF export failed', e);
    } finally {
      setExporting(false);
    }
  }, [exporting, scoreData]);

  const handleExportViewTiff = useCallback(async () => {
    if (exportingView) return;
    setExportingView(true);
    try {
      const geoRes = await fetch('/data/vnb_regions.geojson');
      const geoData = await geoRes.json();
      const viewportBounds = mapRef?.current?.getViewportBounds() ?? undefined;
      await exportLeafletToTiff(
        { geoData, scoreData, getColor, title: 'Gemeinschaftliche Gebäudeversorgung (GGV)' },
        { width: 4000, height: 5000, includeBasemap: true, fillOpacity: 0.55, viewportBounds }
      );
    } catch (e) {
      console.error('TIFF view export failed', e);
    } finally {
      setExportingView(false);
    }
  }, [exportingView, scoreData, mapRef]);

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Benchmarking mit anderen VNB</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Lade VNB-Daten…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Benchmarking mit anderen VNB</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportTiff}
              disabled={exporting}
              className="h-7 gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              title="Karte als TIFF herunterladen"
            >
              {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
              TIFF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportViewTiff}
              disabled={exportingView}
              className="h-7 gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              title="Aktuelle Kartenansicht als TIFF inkl. Basemap"
            >
              {exportingView ? <Loader2 className="h-3 w-3 animate-spin" /> : <Map className="h-3 w-3" />}
              TIFF inkl. Karte
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <VnbCombobox
          vnbList={allVnbs}
          selectedVnbId={selectedVnb?.id || null}
          onVnbSelect={(vnbId: string) => {
            const vnb = allVnbs.find(v => v.id === vnbId);
            if (vnb) onVnbSelect(vnbId, vnb.name);
          }}
          disabled={false}
        />

        <BenchmarkBarChart
          vnbs={allVnbs}
          selectedVnbId={selectedVnb?.id ?? null}
          onBarClick={(vnbId) => {
            const vnb = allVnbs.find(v => v.id === vnbId);
            if (vnb) onVnbSelect(vnbId, vnb.name);
          }}
        />
      </CardContent>
    </Card>
  );
};

export default BenchmarkPanel;
