import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, BarChart3, MessageSquare, ArrowLeft, Download, Loader2 } from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';
import FeedbackStats from '@/components/admin/FeedbackStats';
import ChatHistory from '@/components/admin/ChatHistory';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading, user } = useIsAdmin();
  useSessionTimeout(isAdmin);
  const [exporting, setExporting] = useState(false);

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
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Sandra Chatbot - Admin Dashboard
              </CardTitle>
              <CardDescription>
                Verwalte Chat-Statistiken und schaue dir die Konversationen an
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
                CSV mit Semikolon-Trennung, UTF-8 BOM – öffnet direkt in Excel mit korrekten Umlauten.
              </p>
            </CardContent>
          </Card>
        </div>

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
      </main>
    </div>
  );
};

export default Admin;
