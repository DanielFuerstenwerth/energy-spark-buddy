import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminHeader from '@/components/AdminHeader';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  text: string;
  author_name: string | null;
  author_email: string | null;
  created_at: string;
  status: string;
  route: string;
  vnb_name: string | null;
  kriterium: string | null;
}

const AdminComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading comments:', error);
      toast({
        title: 'Fehler',
        description: 'Kommentare konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } else {
      setComments(data || []);
    }
    setLoading(false);
  };

  const updateCommentStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('comments')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Status konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Erfolg',
        description: `Kommentar wurde ${status === 'approved' ? 'genehmigt' : 'abgelehnt'}.`,
      });
      loadComments();
    }
  };

  const pendingComments = comments.filter((c) => c.status === 'pending');
  const approvedComments = comments.filter((c) => c.status === 'approved');
  const rejectedComments = comments.filter((c) => c.status === 'rejected');

  const CommentCard = ({ comment }: { comment: Comment }) => (
    <Card key={comment.id} className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {comment.author_name || 'Anonym'}
            </CardTitle>
            <CardDescription>
              {new Date(comment.created_at).toLocaleString('de-DE')}
              {comment.author_email && ` • ${comment.author_email}`}
            </CardDescription>
          </div>
          <Badge variant={
            comment.status === 'approved' ? 'default' :
            comment.status === 'rejected' ? 'destructive' : 'secondary'
          }>
            {comment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Route: <span className="font-medium text-foreground">{comment.route}</span>
            </p>
            {comment.vnb_name && (
              <p className="text-sm text-muted-foreground mb-1">
                VNB: <span className="font-medium text-foreground">{comment.vnb_name}</span>
              </p>
            )}
            {comment.kriterium && (
              <p className="text-sm text-muted-foreground mb-1">
                Kriterium: <span className="font-medium text-foreground">{comment.kriterium}</span>
              </p>
            )}
          </div>
          
          <div className="bg-muted/50 p-4 rounded-md">
            <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
          </div>

          {comment.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => updateCommentStatus(comment.id, 'approved')}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Genehmigen
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateCommentStatus(comment.id, 'rejected')}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Ablehnen
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      
      <main id="main-content" className="flex-1 bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Kommentar-Moderation</h1>
            <p className="text-muted-foreground">
              Verwalten und moderieren Sie Benutzerkommentare
            </p>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="pending" className="relative">
                Ausstehend
                {pendingComments.length > 0 && (
                  <Badge variant="destructive" className="ml-2 px-2 py-0 text-xs">
                    {pendingComments.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">
                Genehmigt ({approvedComments.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Abgelehnt ({rejectedComments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {loading ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Lädt Kommentare...
                  </CardContent>
                </Card>
              ) : pendingComments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Keine ausstehenden Kommentare
                  </CardContent>
                </Card>
              ) : (
                pendingComments.map((comment) => <CommentCard key={comment.id} comment={comment} />)
              )}
            </TabsContent>

            <TabsContent value="approved">
              {approvedComments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Keine genehmigten Kommentare
                  </CardContent>
                </Card>
              ) : (
                approvedComments.map((comment) => <CommentCard key={comment.id} comment={comment} />)
              )}
            </TabsContent>

            <TabsContent value="rejected">
              {rejectedComments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Keine abgelehnten Kommentare
                  </CardContent>
                </Card>
              ) : (
                rejectedComments.map((comment) => <CommentCard key={comment.id} comment={comment} />)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminComments;
