import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MapFeedback, { FeedbackEntry } from '@/components/MapFeedback';
import { supabase } from '@/integrations/supabase/client';
import { getVnbIdFromName, normalizeVnbName } from '@/utils/vnbMapping';

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
      // Query submitted survey responses, get vnb_name
      const { data, error } = await supabase
        .from('survey_responses')
        .select('vnb_name')
        .eq('status', 'submitted');

      if (error) {
        console.error('[FeedbackMap] DB query error:', error);
        setLoading(false);
        return;
      }

      // Count feedbacks per vnb_name
      const countByName = new Map<string, number>();
      for (const row of data || []) {
        const name = (row.vnb_name || '').trim();
        if (!name) continue;
        countByName.set(name, (countByName.get(name) || 0) + 1);
      }

      console.log(`[FeedbackMap] ${countByName.size} unique VNB names from ${data?.length || 0} submitted responses`);

      // Map vnb_name → vnb_id (GeoJSON join key)
      const result = new Map<string, FeedbackEntry>();
      const unmatchedNames: string[] = [];
      let matched = 0;

      for (const [name, count] of countByName) {
        const vnbId = getVnbIdFromName(name);

        // If getVnbIdFromName returns the name itself, it's unmatched
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

      console.log(`[FeedbackMap] Matched: ${matched}, Unmatched: ${unmatchedNames.length}`);
      if (unmatchedNames.length > 0) {
        console.warn('[FeedbackMap] Unmatched VNBs:', unmatchedNames);
      }

      setFeedbackData(result);
      setStats({
        total: data?.length || 0,
        matched,
        unmatched: unmatchedNames.length,
        unmatchedNames,
      });
    } catch (err) {
      console.error('[FeedbackMap] Error:', err);
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
