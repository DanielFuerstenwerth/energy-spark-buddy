import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminHeader from '@/components/AdminHeader';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, MessageCircle, Trash2, Reply } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  admin_reply: string | null;
  admin_reply_at: string | null;
}

interface CommentCardProps {
  comment: Comment;
  replyingTo: string | null;
  replyText: string;
  submittingReply: boolean;
  onReplyTextChange: (text: string) => void;
  onStartReply: (id: string, existingReply: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (id: string) => void;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
  onDelete: (id: string) => void;
}

const CommentCard = ({
  comment,
  replyingTo,
  replyText,
  submittingReply,
  onReplyTextChange,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onUpdateStatus,
  onDelete,
}: CommentCardProps) => (
  <Card className="mb-4">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            {comment.author_name || 'Anonym'}
            {comment.vnb_name && (
              <Badge variant="outline" className="ml-1 text-xs">{comment.vnb_name}</Badge>
            )}
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

        {comment.admin_reply && (
          <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-md">
            <p className="text-xs font-medium text-primary mb-1">
              Antwort vom {comment.admin_reply_at ? new Date(comment.admin_reply_at).toLocaleString('de-DE') : ''}
            </p>
            <p className="text-sm whitespace-pre-wrap">{comment.admin_reply}</p>
          </div>
        )}

        {replyingTo === comment.id && (
          <div className="space-y-2 border-t pt-3">
            <Textarea
              value={replyText}
              onChange={(e) => onReplyTextChange(e.target.value)}
              placeholder="Öffentliche Antwort verfassen..."
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onSubmitReply(comment.id)} disabled={submittingReply || !replyText.trim()}>
                {submittingReply ? 'Wird gespeichert...' : 'Antwort veröffentlichen'}
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancelReply}>
                Abbrechen
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {comment.status === 'pending' && (
            <>
              <Button size="sm" onClick={() => onUpdateStatus(comment.id, 'approved')} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Genehmigen
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onUpdateStatus(comment.id, 'rejected')} className="flex-1">
                <XCircle className="w-4 h-4 mr-2" />
                Ablehnen
              </Button>
            </>
          )}
          
          {comment.status === 'approved' && replyingTo !== comment.id && (
            <Button size="sm" variant="outline" onClick={() => onStartReply(comment.id, comment.admin_reply || '')}>
              <Reply className="w-4 h-4 mr-2" />
              {comment.admin_reply ? 'Antwort bearbeiten' : 'Antworten'}
            </Button>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t mt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Löschen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Kommentar löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Diese Aktion kann nicht rückgängig gemacht werden. Der Kommentar wird permanent gelöscht.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(comment.id)}>Löschen</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Shared hook for comment management logic
function useCommentManagement() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  const loadComments = async () => {
    if (!user || !isAdmin) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading comments:', error);
      toast({ title: 'Fehler', description: 'Kommentare konnten nicht geladen werden.', variant: 'destructive' });
    } else {
      setComments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadComments();
    }
  }, [user, isAdmin]);

  const updateCommentStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    const { error } = await supabase.from('comments').update({ status }).eq('id', id);
    if (error) {
      toast({ title: 'Fehler', description: 'Status konnte nicht aktualisiert werden.', variant: 'destructive' });
    } else {
      await supabase.from('admin_audit_log').insert({
        admin_user_id: user.id,
        action: status === 'approved' ? 'comment_approved' : 'comment_rejected',
        entity_type: 'comment',
        entity_id: id,
        details: { status, timestamp: new Date().toISOString() }
      });
      toast({ title: 'Erfolg', description: `Kommentar wurde ${status === 'approved' ? 'genehmigt' : 'abgelehnt'}.` });
      loadComments();
    }
  };

  const deleteComment = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) {
      toast({ title: 'Fehler', description: 'Kommentar konnte nicht gelöscht werden.', variant: 'destructive' });
    } else {
      await supabase.from('admin_audit_log').insert({
        admin_user_id: user.id,
        action: 'comment_deleted',
        entity_type: 'comment',
        entity_id: id,
        details: { timestamp: new Date().toISOString() }
      });
      toast({ title: 'Erfolg', description: 'Kommentar wurde gelöscht.' });
      loadComments();
    }
  };

  const submitReply = async (id: string) => {
    if (!user || !replyText.trim()) return;
    setSubmittingReply(true);
    const { error } = await supabase
      .from('comments')
      .update({ admin_reply: replyText.trim(), admin_reply_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({ title: 'Fehler', description: 'Antwort konnte nicht gespeichert werden.', variant: 'destructive' });
    } else {
      await supabase.from('admin_audit_log').insert({
        admin_user_id: user.id,
        action: 'comment_replied',
        entity_type: 'comment',
        entity_id: id,
        details: { reply: replyText.trim(), timestamp: new Date().toISOString() }
      });
      toast({ title: 'Erfolg', description: 'Antwort wurde veröffentlicht.' });
      setReplyingTo(null);
      setReplyText('');
      loadComments();
    }
    setSubmittingReply(false);
  };

  const startReply = (id: string, existingReply: string) => {
    setReplyingTo(id);
    setReplyText(existingReply);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const pendingComments = comments.filter((c) => c.status === 'pending');
  const approvedComments = comments.filter((c) => c.status === 'approved');
  const rejectedComments = comments.filter((c) => c.status === 'rejected');

  return {
    comments, loading, replyingTo, replyText, submittingReply,
    setReplyText, startReply, cancelReply,
    updateCommentStatus, deleteComment, submitReply,
    pendingComments, approvedComments, rejectedComments,
  };
}

// Shared tab content renderer
function CommentTabs({
  loading, pendingComments, approvedComments, rejectedComments,
  replyingTo, replyText, submittingReply,
  setReplyText, startReply, cancelReply, submitReply,
  updateCommentStatus, deleteComment,
}: ReturnType<typeof useCommentManagement>) {
  return (
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
        <TabsTrigger value="approved">Genehmigt ({approvedComments.length})</TabsTrigger>
        <TabsTrigger value="rejected">Abgelehnt ({rejectedComments.length})</TabsTrigger>
      </TabsList>

      {(['pending', 'approved', 'rejected'] as const).map((tab) => {
        const filtered = tab === 'pending' ? pendingComments : tab === 'approved' ? approvedComments : rejectedComments;
        const emptyLabel = tab === 'pending' ? 'Keine ausstehenden Kommentare' : tab === 'approved' ? 'Keine genehmigten Kommentare' : 'Keine abgelehnten Kommentare';
        return (
          <TabsContent key={tab} value={tab}>
            {loading && tab === 'pending' ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Lädt Kommentare...</CardContent></Card>
            ) : filtered.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">{emptyLabel}</CardContent></Card>
            ) : (
              filtered.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  replyingTo={replyingTo}
                  replyText={replyText}
                  submittingReply={submittingReply}
                  onReplyTextChange={setReplyText}
                  onStartReply={startReply}
                  onCancelReply={cancelReply}
                  onSubmitReply={submitReply}
                  onUpdateStatus={updateCommentStatus}
                  onDelete={deleteComment}
                />
              ))
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

// Extracted panel for embedding in Admin.tsx
export const AdminCommentsPanel = () => {
  const mgmt = useCommentManagement();

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Kommentar-Moderation
          </CardTitle>
          <CardDescription>
            Verwalten, moderieren und beantworten Sie Benutzerkommentare
          </CardDescription>
        </CardHeader>
      </Card>

      <CommentTabs {...mgmt} />
    </div>
  );
};

const AdminComments = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const mgmt = useCommentManagement();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <main id="main-content" className="flex-1 bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Kommentar-Moderation</h1>
            <p className="text-muted-foreground">
              Verwalten, moderieren und beantworten Sie Benutzerkommentare
            </p>
          </div>

          <CommentTabs {...mgmt} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminComments;
