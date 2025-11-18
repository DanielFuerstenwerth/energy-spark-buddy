import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, MessageCircle, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Stats {
  total: number;
  upvotes: number;
  downvotes: number;
  noFeedback: number;
}

const FeedbackStats = () => {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    upvotes: 0,
    downvotes: 0,
    noFeedback: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('feedback')
        .eq('role', 'assistant');

      if (error) throw error;

      const stats: Stats = {
        total: data?.length || 0,
        upvotes: data?.filter(m => m.feedback === 'UP').length || 0,
        downvotes: data?.filter(m => m.feedback === 'DOWN').length || 0,
        noFeedback: data?.filter(m => m.feedback === 'NONE').length || 0
      };

      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Positiv', value: stats.upvotes, color: 'hsl(var(--score-4))' },
    { name: 'Negativ', value: stats.downvotes, color: 'hsl(var(--score-2))' },
    { name: 'Kein Feedback', value: stats.noFeedback, color: 'hsl(var(--muted))' }
  ];

  if (loading) {
    return <div className="text-center py-8">Lade Statistiken...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt-Antworten</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positives Feedback</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.upvotes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.upvotes / stats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negatives Feedback</CardTitle>
            <ThumbsDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.downvotes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.downvotes / stats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ohne Feedback</CardTitle>
            <Minus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.noFeedback}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.noFeedback / stats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback-Verteilung</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackStats;
