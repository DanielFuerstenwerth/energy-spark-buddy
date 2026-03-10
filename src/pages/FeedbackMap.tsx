import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MapFeedback, { FeedbackEntry } from '@/components/MapFeedback';
import { getVnbIdFromName } from '@/utils/vnbMapping';
import { Button } from '@/components/ui/button';

/** Simple CSV parser that handles quoted fields */
function parseCsvRows(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (vals[i] ?? '').trim(); });
    return row;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { result.push(current); current = ''; }
      else { current += ch; }
    }
  }
  result.push(current);
  return result;
}

const FeedbackMap = () => {
  const [feedbackData, setFeedbackData] = useState<Map<string, FeedbackEntry>>(new Map());
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [vnbCount, setVnbCount] = useState(0);

  useEffect(() => {
    loadFeedbackData();
  }, []);

  async function loadFeedbackData() {
    setLoading(true);
    try {
      const res = await fetch('/data/vnb_feedback_map_ready_submitted_only.csv');
      const text = await res.text();
      const rows = parseCsvRows(text);

      const result = new Map<string, FeedbackEntry>();
      let total = 0;

      for (const row of rows) {
        const name = row.bnetza_name || '';
        const count = parseInt(row.feedback_count, 10) || 0;
        if (!name) continue;
        total += count;

        const vnbId = getVnbIdFromName(name);
        if (vnbId === name) {
          console.warn(`[FeedbackMap] UNMATCHED: "${name}" (${count})`);
          continue;
        }
        const existing = result.get(vnbId);
        result.set(vnbId, {
          vnb_id: vnbId,
          vnb_name: name,
          feedback_count: (existing?.feedback_count || 0) + count,
        });
      }

      setFeedbackData(result);
      setTotalCount(total);
      setVnbCount(result.size);
    } catch (err) {
      console.error('[FeedbackMap] CSV load error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Motivational header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">Wer hat schon mitgemacht?</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Auf der Karte siehst du, aus welchen Netzgebieten bereits Rückmeldungen eingegangen sind – und wo noch Lücken bestehen.
          </p>
        </div>

        {/* Gamification counter */}
        {!loading && (
          <div className="flex flex-col items-center mb-8 gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-primary tabular-nums">{totalCount}</span>
              <span className="text-lg text-muted-foreground">Rückmeldungen</span>
            </div>
            <p className="text-sm text-muted-foreground">
              aus <strong className="text-foreground">{vnbCount}</strong> verschiedenen Netzgebieten
            </p>
            <div className="w-full max-w-md mt-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000"
                  style={{ width: `${Math.min((vnbCount / 100) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Jede Rückmeldung zählt – hilf uns, die grauen Flächen zu füllen!
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            Lade Kartendaten…
          </div>
        ) : (
          <MapFeedback feedbackData={feedbackData} />
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Dein Netzgebiet ist noch grau? Dann teile jetzt deine Erfahrungen!
          </p>
          <Button asChild size="lg">
            <Link to="/umfrage">
              Zur Umfrage
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeedbackMap;
