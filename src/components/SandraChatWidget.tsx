import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import SandraAvatar from './SandraAvatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  text: string;
  feedback?: 'UP' | 'DOWN' | 'NONE';
}

const SandraChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate or retrieve session ID
    let sid = localStorage.getItem('sandra_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('sandra_session_id', sid);
    }
    setSessionId(sid);

    // Load messages from localStorage
    const savedMessages = localStorage.getItem(`sandra_messages_${sid}`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Error loading messages:', e);
      }
    } else {
      // Welcome message
      setMessages([{
        role: 'assistant',
        text: 'Hallo, ich bin Sandra. Ich bin ganz neu hier und lerne gerade noch sehr viel. Welche Fragen hast du?'
      }]);
    }
  }, []);

  useEffect(() => {
    // Save messages to localStorage
    if (messages.length > 0 && sessionId) {
      localStorage.setItem(`sandra_messages_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          sessionId,
          userMessage: userMessage.text
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: data.messageId,
        role: 'assistant',
        text: data.message,
        feedback: 'NONE'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Fehler beim Senden der Nachricht. Bitte versuche es erneut.');
      
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const sendFeedback = async (messageId: string, feedback: 'UP' | 'DOWN') => {
    try {
      const { error } = await supabase.functions.invoke('feedback', {
        body: { messageId, feedback }
      });

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, feedback } : msg
      ));

      toast.success('Danke für dein Feedback!');
    } catch (error) {
      console.error('Feedback error:', error);
      toast.error('Feedback konnte nicht gespeichert werden.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 rounded-full w-14 h-14 md:w-16 md:h-16 shadow-lg hover:shadow-xl transition-shadow z-50"
        aria-label="Chat mit Sandra öffnen"
      >
        <SandraAvatar width={32} height={32} />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 left-0 md:bottom-6 md:right-6 md:left-auto w-full md:w-96 h-[85vh] md:h-[600px] bg-background border-t md:border border-border md:rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
        <div className="flex items-center gap-3">
          <SandraAvatar width={40} height={40} />
          <div>
            <h3 className="font-semibold text-foreground">Sandra</h3>
            <p className="text-xs text-muted-foreground">KI-Assistentin</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          aria-label="Chat schließen"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.role === 'assistant' && (
                <SandraAvatar width={32} height={32} className="flex-shrink-0" />
              )}
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                
                {/* Feedback buttons for assistant messages */}
                {msg.role === 'assistant' && msg.id && (
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 px-2 ${msg.feedback === 'UP' ? 'text-primary' : 'text-muted-foreground'}`}
                      onClick={() => sendFeedback(msg.id!, 'UP')}
                      disabled={msg.feedback === 'UP'}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 px-2 ${msg.feedback === 'DOWN' ? 'text-destructive' : 'text-muted-foreground'}`}
                      onClick={() => sendFeedback(msg.id!, 'DOWN')}
                      disabled={msg.feedback === 'DOWN'}
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <SandraAvatar width={32} height={32} className="flex-shrink-0" />
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Stelle mir eine Frage..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Drücke Enter zum Senden, Shift+Enter für neue Zeile
        </p>
      </div>
    </div>
  );
};

export default SandraChatWidget;
