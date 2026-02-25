import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Map, Download } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown, ExternalLink } from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import ExplorerLayout from '../components/ExplorerLayout';
import KarteTab from '../components/tabs/KarteTab';
import DownloadTab from '../components/tabs/DownloadTab';
import { useIndicatorCatalog, useCsvData } from '../hooks/useEwkData';
import type { SourceKey } from '../types';
import { RECOMMENDED_INDICATORS } from '../types';

export default function EwkMonitoringBNetzA() {
  const { catalog, loading } = useIndicatorCatalog();
  const [activeTab, setActiveTab] = useState('explorer');

  // Shared indicator state — used by Explorer + Karte
  const [selectedId, setSelectedId] = useState<string>(RECOMMENDED_INDICATORS[0]);
  const [selectedBnrs, setSelectedBnrs] = useState<string[]>([]);
  const [activeSources, setActiveSources] = useState<SourceKey[]>([
    'Anschlussdauer_2024',
    'Digitalisierungsindex_2024',
  ]);
  const [scatterYId, setScatterYId] = useState<string | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const selectedIndicator = useMemo(
    () => catalog.find((i) => i.indicator_id === selectedId) ?? null,
    [catalog, selectedId]
  );

  const source = selectedIndicator?.source as SourceKey | null;
  const { data: rows, loading: rowsLoading } = useCsvData(source);

  const handleSelectIndicator = (id: string) => {
    setSelectedId(id);
    setRecentIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)];
      return next.slice(0, 5);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main id="main-content" className="flex-1">
        {/* Page header */}
        <div className="border-b border-border bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Datenexplorer zur Energiewendekompetenz
            </h1>
            <p className="mt-1.5 text-sm md:text-base text-muted-foreground max-w-2xl">
              Hier werden die veröffentlichten Daten der Bundesnetzagentur sichtbar und vergleichbar.
            </p>
            <DisclaimerBanner />
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-[97px] z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-11 bg-transparent p-0 gap-0 border-0 rounded-none w-full justify-start">
              {[
                  { value: 'explorer', label: 'Explorer', icon: BarChart3 },
                  { value: 'karte', label: 'Karte', icon: Map },
                  { value: 'download', label: 'Download & Methodik', icon: Download },
                ].map((t) => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-1.5 text-xs sm:text-sm px-3 sm:px-4"
                  >
                    <t.icon className="h-4 w-4 hidden sm:block" />
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Tab content */}
        <div className="container mx-auto max-w-7xl px-4 md:px-6 py-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <>
              {activeTab === 'explorer' && (
                <ExplorerLayout
                  catalog={catalog}
                  selectedIndicator={selectedIndicator}
                  selectedId={selectedId}
                  onSelectIndicator={handleSelectIndicator}
                  rows={rows}
                  rowsLoading={rowsLoading}
                  selectedBnrs={selectedBnrs}
                  onSelectedBnrsChange={setSelectedBnrs}
                  activeSources={activeSources}
                  onSourcesChange={setActiveSources}
                  scatterYId={scatterYId}
                  onScatterYChange={setScatterYId}
                  recentIds={recentIds}
                />
              )}
              {activeTab === 'karte' && (
                <KarteTab
                  catalog={catalog}
                  indicator={selectedIndicator}
                  rows={rows}
                  loading={rowsLoading}
                />
              )}
              {activeTab === 'download' && <DownloadTab />}
            </>
          )}
        </div>

        {/* Dezente Fußnote: Quelle & Hintergrund */}
        <div className="container mx-auto max-w-7xl px-4 md:px-6 pb-8 pt-4">
          <Collapsible>
            <CollapsibleTrigger className="group flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
              Quelle &amp; Hintergrund
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 max-w-2xl space-y-3 text-xs text-muted-foreground leading-relaxed">
                <p>
                  Die Bundesnetzagentur hat Verteilnetzbetreiber zu Netzanschlüssen und digitalen Prozessen abgefragt.
                  Die Werte auf dieser Seite sind die Antworten der Netzbetreiber; sie wurden nicht von uns erhoben oder geprüft.
                </p>
                <p>Berichtsjahr: 2024. Datenstand der Veröffentlichung: 22.12.2025.</p>
                <div className="space-y-1.5">
                  <p>
                    Download-Seite, abgerufen am 25.02.2026:{' '}
                    <a
                      href="https://www.bundesnetzagentur.de/DE/Beschlusskammern/GBK/GBK_Aktuell/start.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      bundesnetzagentur.de/…/GBK_Aktuell <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </p>
                  <p>
                    Datenerhebung / Erhebungsbogen:{' '}
                    <a
                      href="https://www.bundesnetzagentur.de/1052876"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      bundesnetzagentur.de/1052876 <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </main>

      <Footer />
    </div>
  );
}
