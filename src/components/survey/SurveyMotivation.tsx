import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Home, Share2, MapPin, Users, Megaphone, ArrowRight } from "lucide-react";
import { getVnbIdFromName } from "@/utils/vnbMapping";
import { MapFeedbackMini, FeedbackEntry } from "./MapFeedbackMini";
import { Link } from "react-router-dom";

interface SurveyStats {
  total: number;
  ggv: number;
  mieterstrom: number;
  energy_sharing: number;
}

function parseCsvRows(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
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

export function SurveyMotivation() {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [feedbackData, setFeedbackData] = useState<Map<string, FeedbackEntry>>(new Map());
  const [vnbCount, setVnbCount] = useState(0);

  useEffect(() => {
    supabase.rpc("get_survey_stats").then(({ data }) => {
      if (data) setStats(data as unknown as SurveyStats);
    });

    fetch('/data/vnb_feedback_map_ready_submitted_only.csv')
      .then(res => res.text())
      .then(text => {
        const rows = parseCsvRows(text);
        const result = new Map<string, FeedbackEntry>();
        for (const row of rows) {
          const name = row.bnetza_name || '';
          const count = parseInt(row.feedback_count, 10) || 0;
          if (!name) continue;
          const vnbId = getVnbIdFromName(name);
          if (vnbId === name) continue;
          const existing = result.get(vnbId);
          result.set(vnbId, {
            vnb_id: vnbId,
            vnb_name: name,
            feedback_count: (existing?.feedback_count || 0) + count,
          });
        }
        setFeedbackData(result);
        setVnbCount(result.size);
      })
      .catch(() => {});
  }, []);

  const hasStats = stats && (stats.ggv > 0 || stats.mieterstrom > 0 || stats.energy_sharing > 0);
  const hasMap = vnbCount > 0;

  if (!hasStats && !hasMap) return null;

  const projectItems = hasStats ? [
    { label: "GGV-Projekte", value: stats!.ggv, icon: Zap, color: "text-amber-600 dark:text-amber-400" },
    { label: "Mieterstrom", value: stats!.mieterstrom, icon: Home, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Energy Sharing", value: stats!.energy_sharing, icon: Share2, color: "text-sky-600 dark:text-sky-400" },
  ].filter(i => i.value > 0) : [];

  return (
    <div className="mb-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5 shadow-lg overflow-hidden">
      {/* Prominent header banner */}
      <div className="bg-primary/10 border-b border-primary/15 px-6 py-4 flex items-center gap-3">
        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/15">
          <Megaphone className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold text-foreground">
            Erste Auswertung ist erfolgt!
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Viele Akteure haben bereits ihre Erfahrungen geteilt – machen Sie mit!
          </p>
        </div>
      </div>

      {/* Links row */}
      <div className="px-6 py-3 flex flex-wrap gap-4 border-b border-border/50 bg-card/40">
        <Link
          to="/TaE/GGV"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Interaktive Karte ansehen
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/news/umfrage-ergebnisse-ggv"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
        >
          <Megaphone className="w-4 h-4" />
          Ergebnisse lesen (PDF)
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats + Map – large layout */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Stats */}
          <div className="flex flex-col gap-5 md:w-56 shrink-0 justify-center">
            {/* Region counter */}
            {hasMap && (
              <div className="flex items-center gap-4">
                <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10">
                  <MapPin className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold leading-tight tabular-nums">{vnbCount}</p>
                  <p className="text-xs text-muted-foreground leading-tight">Netzgebiete</p>
                </div>
              </div>
            )}

            {/* Project type breakdown */}
            {projectItems.map(item => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-muted">
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold leading-tight tabular-nums">{item.value}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{item.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Large mini map */}
          {hasMap && (
            <div className="flex-1 min-w-0 min-h-[350px] md:min-h-[400px]">
              <MapFeedbackMini feedbackData={feedbackData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
