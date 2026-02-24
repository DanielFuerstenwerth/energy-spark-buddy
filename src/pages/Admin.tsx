import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, BarChart3, MessageSquare, ArrowLeft, Download, Loader2, Globe, MessageCircle, FolderOpen, RefreshCw } from 'lucide-react';
import { invalidateMapsConfigCache } from '@/utils/structureLoader';
import { lazy, Suspense } from 'react';

const AdminCommentsPanel = lazy(() => import('@/pages/AdminComments').then(m => ({ default: m.AdminCommentsPanel })));
import AdminHeader from '@/components/AdminHeader';
import FeedbackStats from '@/components/admin/FeedbackStats';
import ChatHistory from '@/components/admin/ChatHistory';
import GgvExportManager from '@/components/admin/GgvExportManager';
import FileOverview from '@/components/admin/FileOverview';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading, user } = useIsAdmin();
  useSessionTimeout(isAdmin);
  const [exporting, setExporting] = useState(false);
  const [exportingCodebook, setExportingCodebook] = useState(false);

  const handleCodebookExport = async () => {
    setExportingCodebook(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Nicht eingeloggt'); return; }
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/export-survey-codebook`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || `HTTP ${res.status}`); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'umfrage-codebook.csv';
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      toast.success('Codebook heruntergeladen');
    } catch (error: any) {
      console.error('Codebook export error:', error);
      toast.error(`Codebook-Export fehlgeschlagen: ${error.message}`);
    } finally { setExportingCodebook(false); }
  };
  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Nicht eingeloggt');
        return;
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/export-survey`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'umfrage-export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Export erfolgreich heruntergeladen');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Export fehlgeschlagen: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      // Not logged in
      navigate('/auth?redirect=/admin');
    } else if (!loading && !isAdmin) {
      // Logged in but not admin
      navigate('/');
    }
  }, [isAdmin, loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Prüfe Berechtigungen...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Startseite
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="mb-4 ml-2"
            onClick={() => {
              localStorage.removeItem('nav_structure_cache_v2');
              localStorage.removeItem('nav_structure_cache');
              invalidateMapsConfigCache();
              toast.success('Alle Caches gelöscht – Seite wird neu geladen…');
              setTimeout(() => window.location.reload(), 500);
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Nav-Cache zurücksetzen
          </Button>
          <Tabs defaultValue="survey" className="space-y-6">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-5">
              <TabsTrigger value="survey" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Umfrage-Daten
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Dateien
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Kommentare
              </TabsTrigger>
              <TabsTrigger value="ggv-export" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                GGV-Export
              </TabsTrigger>
              <TabsTrigger value="chatbot" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Sandra Chatbot
              </TabsTrigger>
            </TabsList>

            <TabsContent value="survey" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Umfrage GGV & Co – Datenexport</CardTitle>
                  <CardDescription>
                    Exportiere alle eingegangenen Umfrage-Antworten als CSV-Datei.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleExport}
                    disabled={exporting}
                    variant="outline"
                    className="gap-2"
                  >
                    {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {exporting ? 'Exportiere...' : 'Umfrage-Daten als CSV exportieren'}
                  </Button>
                   <p className="text-xs text-muted-foreground mt-2">
                     CSV mit Semikolon-Trennung, UTF-8 BOM – öffnet direkt in Excel. Antworten werden als Klartext (nicht IDs) exportiert.
                   </p>
                   <div className="mt-4 pt-4 border-t">
                     <Button
                       onClick={handleCodebookExport}
                       disabled={exportingCodebook}
                       variant="outline"
                       size="sm"
                       className="gap-2"
                     >
                       {exportingCodebook ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                       {exportingCodebook ? 'Exportiere...' : 'Codebook (alle Fragen & Antwortoptionen) herunterladen'}
                     </Button>
                     <p className="text-xs text-muted-foreground mt-1">
                       Referenzdatei mit allen Fragen, DB-Spalten und möglichen Antworten – versioniert.
                     </p>
                   </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="space-y-6">
              <FileOverview />
            </TabsContent>

            <TabsContent value="comments" className="space-y-6">
              <Suspense fallback={<Card><CardContent className="py-12 text-center text-muted-foreground">Lädt Kommentare...</CardContent></Card>}>
                <AdminCommentsPanel />
              </Suspense>
            </TabsContent>

            <TabsContent value="ggv-export" className="space-y-6">
              <GgvExportManager />
            </TabsContent>

            <TabsContent value="chatbot" className="space-y-6">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Sandra Chatbot – Dashboard
                  </CardTitle>
                  <CardDescription>
                    Chat-Statistiken und Konversationsverläufe
                  </CardDescription>
                </CardHeader>
              </Card>

              <Tabs defaultValue="stats" className="space-y-6">
                <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2">
                  <TabsTrigger value="stats" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Statistiken
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Chat-Verläufe
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="stats" className="space-y-6">
                  <FeedbackStats />
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                  <ChatHistory />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
