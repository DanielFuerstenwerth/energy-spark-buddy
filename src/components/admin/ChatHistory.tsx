import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThumbsUp, ThumbsDown, Minus, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Message {
  id: string;
  role: string;
  text: string;
  feedback: string;
  created_at: string;
}

interface Conversation {
  id: string;
  session_id: string;
  created_at: string;
  messages?: Message[];
}

const PAGE_SIZE = 50;

const ChatHistory = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadConversations(0);
  }, []);

  const loadConversations = async (pageNum: number) => {
    try {
      setLoading(true);
      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from('conversations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setConversations(data || []);
      setTotalCount(count || 0);
      setHasMore((count || 0) > to + 1);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
      setSelectedConversation(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const getFeedbackIcon = (feedback: string) => {
    switch (feedback) {
      case 'UP':
        return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case 'DOWN':
        return <ThumbsDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Lade Konversationen...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Konversationen ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="space-y-2 p-4">
              {conversations.map((conv) => (
                <Button
                  key={conv.id}
                  variant={selectedConversation === conv.id ? 'default' : 'outline'}
                  className="w-full justify-between"
                  onClick={() => loadMessages(conv.id)}
                >
                  <div className="text-left">
                    <div className="text-sm font-medium truncate">
                      Session: {conv.session_id.substring(0, 20)}...
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(conv.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </ScrollArea>
          {totalCount > PAGE_SIZE && (
            <div className="flex items-center justify-between p-4 border-t">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => loadConversations(page - 1)}>
                Zurück
              </Button>
              <span className="text-xs text-muted-foreground">
                Seite {page + 1} von {Math.ceil(totalCount / PAGE_SIZE)}
              </span>
              <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => loadConversations(page + 1)}>
                Weiter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages Detail */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Nachrichten</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedConversation ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-2 p-4 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary/10 ml-12'
                        : 'bg-muted mr-12'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        {msg.role === 'user' ? 'Benutzer' : 'Sandra'}
                      </span>
                      <div className="flex items-center gap-2">
                        {msg.role === 'assistant' && getFeedbackIcon(msg.feedback)}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(msg.created_at), 'HH:mm', { locale: de })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Wähle eine Konversation aus, um die Nachrichten anzuzeigen
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatHistory;
