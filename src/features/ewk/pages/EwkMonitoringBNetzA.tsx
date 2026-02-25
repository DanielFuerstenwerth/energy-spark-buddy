import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Map, Download, LayoutDashboard } from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import UeberblickTab from '../components/tabs/UeberblickTab';
import ExplorerTab from '../components/tabs/ExplorerTab';
import KarteTab from '../components/tabs/KarteTab';
import DownloadTab from '../components/tabs/DownloadTab';
import { useIndicatorCatalog } from '../hooks/useEwkData';

export default function EwkMonitoringBNetzA() {
  const { catalog, loading } = useIndicatorCatalog();
  const [activeTab, setActiveTab] = useState('ueberblick');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <DisclaimerBanner />

      <main id="main-content" className="flex-1">
        {/* Page header */}
        <div className="border-b border-border bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Datenexplorer zur Energiewendekompetenz
            </h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
              Hier werden die veröffentlichten Daten der Bundesnetzagentur sichtbar und vergleichbar.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-[97px] z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-11 bg-transparent p-0 gap-0 border-0 rounded-none w-full justify-start">
                <TabsTrigger
                  value="ueberblick"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-1.5 text-xs sm:text-sm px-3 sm:px-4"
                >
                  <LayoutDashboard className="h-4 w-4 hidden sm:block" />
                  Überblick
                </TabsTrigger>
                <TabsTrigger
                  value="explorer"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-1.5 text-xs sm:text-sm px-3 sm:px-4"
                >
                  <BarChart3 className="h-4 w-4 hidden sm:block" />
                  Explorer
                </TabsTrigger>
                <TabsTrigger
                  value="karte"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-1.5 text-xs sm:text-sm px-3 sm:px-4"
                >
                  <Map className="h-4 w-4 hidden sm:block" />
                  Karte
                </TabsTrigger>
                <TabsTrigger
                  value="download"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-1.5 text-xs sm:text-sm px-3 sm:px-4"
                >
                  <Download className="h-4 w-4 hidden sm:block" />
                  Download & Methodik
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Tab content */}
        <div className="container mx-auto max-w-7xl px-4 md:px-6 py-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <>
              {activeTab === 'ueberblick' && <UeberblickTab onNavigate={setActiveTab} />}
              {activeTab === 'explorer' && <ExplorerTab catalog={catalog} />}
              {activeTab === 'karte' && <KarteTab catalog={catalog} />}
              {activeTab === 'download' && <DownloadTab />}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
