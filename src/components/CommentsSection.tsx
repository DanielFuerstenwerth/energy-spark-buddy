import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Validation schema for comments
const commentSchema = z.object({
  text: z.string().trim().min(1, 'Kommentar darf nicht leer sein').max(5000, 'Kommentar zu lang (max 5000 Zeichen)'),
  author_name: z.string().trim().max(100, 'Name zu lang (max 100 Zeichen)').optional().or(z.literal('')),
  author_email: z.string().trim().email('Ungültige E-Mail-Adresse').max(255, 'E-Mail zu lang').optional().or(z.literal(''))
});

interface Comment {
  id: string;
  text: string;
  author_name: string | null;
  created_at: string;
  views: number;
  vnb_name: string | null;
  kriterium: string | null;
}

interface CommentsSectionProps {
  route: string;
  vnbName?: string;
  kriterium?: string;
}

const CommentsSection = ({ route, vnbName, kriterium }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
  }, [route, vnbName]);

  const loadComments = async () => {
    // Query from comments_public view which excludes email addresses
    let query = supabase
      .from('comments_public')
      .select('*')
      .eq('route', route)
      .order('created_at', { ascending: false });

    if (vnbName) {
      query = query.eq('vnb_name', vnbName);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading comments:', error);
      return;
    }

    setComments(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    const validation = commentSchema.safeParse({
      text,
      author_name: authorName,
      author_email: authorEmail,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: 'Validierungsfehler',
        description: firstError.message,
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    // Submit via edge function with server-side rate limiting
    const { data, error } = await supabase.functions.invoke('submit-comment', {
      body: {
        route,
        vnb_name: vnbName || null,
        kriterium: kriterium || null,
        text: validation.data.text,
        author_name: validation.data.author_name || null,
        author_email: validation.data.author_email || null,
      },
    });

    setSubmitting(false);

    if (error || !data?.success) {
      console.error('Error submitting comment:', error);
      
      // Check if it's a rate limit error
      if (data?.error === 'Rate limit exceeded' && data?.waitMinutes) {
        toast({
          title: 'Zu viele Kommentare',
          description: `Bitte warten Sie ${data.waitMinutes} Minuten, bevor Sie einen weiteren Kommentar abgeben.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Fehler',
          description: data?.message || 'Kommentar konnte nicht abgeschickt werden. Bitte versuchen Sie es später erneut.',
          variant: 'destructive',
        });
      }
      return;
    }

    toast({
      title: 'Kommentar eingereicht',
      description: 'Ihr Kommentar wird nach Prüfung veröffentlicht.',
    });

    setText('');
    setAuthorName('');
    setAuthorEmail('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6 mt-8 md:mt-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t pt-6 md:pt-8 gap-3">
        <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
          Kommentare {vnbName && `zu ${vnbName}`}
        </h3>
        <Button onClick={() => setShowForm(!showForm)} variant="outline" className="w-full sm:w-auto min-h-[44px]">
          {showForm ? 'Abbrechen' : 'Kommentieren'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Neuer Kommentar</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="comment-text">Ihr Kommentar *</Label>
        <Textarea
          id="comment-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Teilen Sie Ihre Erfahrungen..."
          rows={4}
          required
          className="min-h-[100px]"
        />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author-name">Name (optional)</Label>
                  <Input
                    id="author-name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Anonym"
                  />
                </div>
                <div>
                  <Label htmlFor="author-email">E-Mail (optional, nicht öffentlich)</Label>
                  <Input
                    id="author-email"
                    type="email"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="ihre@email.de"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    * Kommentare werden nach Freigabe sichtbar
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Max. 5 Kommentare pro Stunde
                  </p>
                </div>
                <Button type="submit" disabled={submitting} className="w-full md:w-auto min-h-[44px]">
                  {submitting ? 'Wird gesendet...' : 'Absenden'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Noch keine Kommentare vorhanden. Seien Sie der Erste!
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    {comment.kriterium && (
                      <span className="text-sm font-medium text-primary">
                        {comment.kriterium}:
                      </span>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {comment.author_name || 'Anonym'} •{' '}
                      {new Date(comment.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {comment.views} Ansichten
                  </span>
                </div>
                <p className="text-sm">{comment.text}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
