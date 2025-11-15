import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    let query = supabase
      .from('comments')
      .select('*')
      .eq('route', route)
      .eq('status', 'approved')
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
    if (!text.trim()) return;

    setSubmitting(true);

    const { error } = await supabase.from('comments').insert({
      route,
      vnb_name: vnbName || null,
      kriterium: kriterium || null,
      text: text.trim(),
      author_name: authorName.trim() || null,
      author_email: authorEmail.trim() || null,
      status: 'pending',
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Kommentar konnte nicht gespeichert werden.',
        variant: 'destructive',
      });
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Kommentare {vnbName && `zu ${vnbName}`}
        </h3>
        <Button onClick={() => setShowForm(!showForm)} variant="outline">
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
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
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
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  * Kommentare werden nach Freigabe sichtbar
                </p>
                <Button type="submit" disabled={submitting}>
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
