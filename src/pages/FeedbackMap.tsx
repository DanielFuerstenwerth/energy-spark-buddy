import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MapFeedback, { FeedbackEntry } from '@/components/MapFeedback';
import { getVnbIdFromName } from '@/utils/vnbMapping';

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
  const [stats, setStats] = useState({ total: 0, matched: 0, unmatched: 0, unmatchedNames: [] as string[] });

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
      const unmatchedNames: string[] = [];
      let matched = 0;
      let totalFeedback = 0;

      for (const row of rows) {
        const name = row.bnetza_name || '';
        const count = parseInt(row.feedback_count, 10) || 0;
        if (!name) continue;
        totalFeedback += count;

        const vnbId = getVnbIdFromName(name);

        if (vnbId === name) {
          console.warn(`[FeedbackMap] UNMATCHED VNB: "${name}" (${count} Rückmeldungen)`);
          unmatchedNames.push(`${name} (${count}×)`);
        } else {
          matched++;
          const existing = result.get(vnbId);
          result.set(vnbId, {
            vnb_id: vnbId,
            vnb_name: name,
            feedback_count: (existing?.feedback_count || 0) + count,
          });
        }
      }

      console.log(`[FeedbackMap] CSV: ${rows.length} Zeilen, Matched: ${matched}, Unmatched: ${unmatchedNames.length}`);
      if (unmatchedNames.length > 0) {
        console.warn('[FeedbackMap] Unmatched VNBs:', unmatchedNames);
      }

      setFeedbackData(result);
      setStats({ total: totalFeedback, matched, unmatched: unmatchedNames.length, unmatchedNames });
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
        <h1 className="text-2xl font-bold mb-2">Umfrage-Rückmeldungen nach VNB-Gebiet</h1>
        <p className="text-muted-foreground mb-6">
          Übersicht der eingegangenen Rückmeldungen (nur abgeschlossene Umfragen). Grau = keine Rückmeldung, dunkleres Blau = mehr Rückmeldungen.
        </p>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <span className="bg-muted px-3 py-1 rounded-md">
            Gesamt: <strong>{stats.total}</strong> Rückmeldungen
          </span>
          <span className="bg-muted px-3 py-1 rounded-md">
            <strong>{stats.matched}</strong> VNBs zugeordnet
          </span>
          {stats.unmatched > 0 && (
            <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-md">
              <strong>{stats.unmatched}</strong> nicht zugeordnet
            </span>
          )}
        </div>

        {/* Unmatched list */}
        {stats.unmatchedNames.length > 0 && (
          <details className="mb-4 text-sm border border-border rounded-lg p-3">
            <summary className="cursor-pointer font-medium text-destructive">
              {stats.unmatchedNames.length} VNB-Namen ohne Zuordnung anzeigen
            </summary>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {stats.unmatchedNames.map((n) => (
                <li key={n}>• {n}</li>
              ))}
            </ul>
          </details>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            Lade Umfragedaten…
          </div>
        ) : (
          <MapFeedback feedbackData={feedbackData} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FeedbackMap;
