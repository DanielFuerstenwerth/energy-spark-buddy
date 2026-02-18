import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, BarChart3, MessageSquare, ArrowLeft } from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';
import FeedbackStats from '@/components/admin/FeedbackStats';
import ChatHistory from '@/components/admin/ChatHistory';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading, user } = useIsAdmin();
  useSessionTimeout(isAdmin);

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
