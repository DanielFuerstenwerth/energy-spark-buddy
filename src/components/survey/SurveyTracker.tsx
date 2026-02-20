import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Zap, Home, Share2 } from "lucide-react";

interface SurveyStats {
  total: number;
  ggv: number;
  mieterstrom: number;
  energy_sharing: number;
}

export function SurveyTracker() {
  const [stats, setStats] = useState<SurveyStats | null>(null);

  useEffect(() => {
    supabase.rpc("get_survey_stats").then(({ data }) => {
      if (data) setStats(data as unknown as SurveyStats);
    });
  }, []);

  if (!stats || stats.total === 0) return null;

  const items = [
    { label: "Projekte gesamt", value: stats.total, icon: BarChart3, color: "text-primary" },
    { label: "GGV", value: stats.ggv, icon: Zap, color: "text-amber-600 dark:text-amber-400" },
    { label: "Mieterstrom", value: stats.mieterstrom, icon: Home, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Energy Sharing", value: stats.energy_sharing, icon: Share2, color: "text-sky-600 dark:text-sky-400" },
  ];

  const fmt = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(1);

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-4 mb-6">
      <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
        Bisherige Teilnahme
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            <div className={`shrink-0 ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold leading-tight tabular-nums">{fmt(item.value)}</p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
