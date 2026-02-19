import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Check, X, Eye, RefreshCw, Loader2, Send, Globe } from 'lucide-react';

interface GgvExport {
  id: string;
  survey_id: string;
  status: string;
  payload: Record<string, unknown>;
  remote_project_id: string | null;
  remote_feedback_id: string | null;
  error_message: string | null;
  reviewed_at: string | null;
  sent_at: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending_review: { label: 'Ausstehend', variant: 'default' },
  approved: { label: 'Freigegeben (dry run)', variant: 'secondary' },
  rejected: { label: 'Abgelehnt', variant: 'destructive' },
  sent: { label: 'Gesendet', variant: 'outline' },
  failed: { label: 'Fehlgeschlagen', variant: 'destructive' },
};

export default function GgvExportManager() {
  const [exports, setExports] = useState<GgvExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchExports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ggv_exports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      toast.error('Fehler beim Laden der Exporte');
      console.error(error);
    } else {
      setExports((data as unknown as GgvExport[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchExports(); }, []);

  const handleAction = async (action: 'approve' | 'reject', ids?: string[]) => {
    const exportIds = ids || Array.from(selected);
    if (exportIds.length === 0) {
      toast.warning('Keine Einträge ausgewählt');
      return;
    }

    setActing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Nicht eingeloggt'); return; }

      const res = await supabase.functions.invoke('approve-ggv-export', {
        body: { export_ids: exportIds, action },
      });

      if (res.error) throw new Error(res.error.message);

      const result = res.data;
      if (result?.error) throw new Error(result.error);

      toast.success(
        action === 'approve'
          ? `${exportIds.length} Export(e) freigegeben und gesendet`
          : `${exportIds.length} Export(e) abgelehnt`
      );
      setSelected(new Set());
      await fetchExports();
    } catch (err: any) {
      toast.error(`Fehler: ${err.message}`);
    } finally {
      setActing(false);
    }
  };

  const pendingExports = exports.filter(e => e.status === 'pending_review');
  const allPendingSelected = pendingExports.length > 0 && pendingExports.every(e => selected.has(e.id));

  const toggleAll = () => {
    if (allPendingSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingExports.map(e => e.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getProjectName = (payload: Record<string, unknown>): string => {
    const project = payload.project as Record<string, unknown> | undefined;
    if (project?.name) return project.name as string;
    const feedback = payload.provider_feedback as Record<string, unknown> | undefined;
    if (feedback?.provider_name) return `Dienstleister: ${feedback.provider_name}`;
    return '–';
  };

  const getExportType = (payload: Record<string, unknown>): string => {
    if (payload.project) return 'Projekt';
    if (payload.provider_feedback) return 'Dienstleister-Feedback';
    return '–';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            GGV-Export Freigaben
          </CardTitle>
          <CardDescription>
            Prüfen und genehmigen Sie Datenexporte an ggv-transparenz.de
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleAction('approve')}
                    disabled={acting}
                    className="gap-1"
                  >
                    {acting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    {selected.size} freigeben
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAction('reject')}
                    disabled={acting}
                    className="gap-1"
                  >
                    <X className="w-3 h-3" />
                    Ablehnen
                  </Button>
                </>
              )}
            </div>
            <Button size="sm" variant="ghost" onClick={fetchExports} disabled={loading} className="gap-1">
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Aktualisieren
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : exports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Noch keine Export-Einträge vorhanden. Diese entstehen automatisch bei Umfrage-Einsendungen mit GGV-Opt-In oder Dienstleister-Daten.
            </p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allPendingSelected && pendingExports.length > 0}
                        onCheckedChange={toggleAll}
                        aria-label="Alle auswählen"
                      />
                    </TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Projektname</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exports.map((exp) => {
                    const statusInfo = STATUS_LABELS[exp.status] || { label: exp.status, variant: 'outline' as const };
                    const isPending = exp.status === 'pending_review';
                    return (
                      <TableRow key={exp.id}>
                        <TableCell>
                          {isPending && (
                            <Checkbox
                              checked={selected.has(exp.id)}
                              onCheckedChange={() => toggleOne(exp.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(exp.created_at)}</TableCell>
                        <TableCell className="text-sm">{getExportType(exp.payload)}</TableCell>
                        <TableCell className="text-sm font-medium max-w-[200px] truncate">
                          {getProjectName(exp.payload)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          {exp.error_message && (
                            <span className="block text-xs text-destructive mt-1 truncate max-w-[150px]" title={exp.error_message}>
                              {exp.error_message}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="icon" variant="ghost" title="Vorschau">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Export-Payload Vorschau</DialogTitle>
                                </DialogHeader>
                                <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                                  {JSON.stringify(exp.payload, null, 2)}
                                </pre>
                                {isPending && (
                                  <div className="flex gap-2 justify-end mt-4">
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleAction('reject', [exp.id])}
                                      disabled={acting}
                                    >
                                      <X className="w-3 h-3 mr-1" />Ablehnen
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleAction('approve', [exp.id])}
                                      disabled={acting}
                                    >
                                      <Send className="w-3 h-3 mr-1" />Freigeben & Senden
                                    </Button>
                                  </div>
                                )}
                                {exp.status === 'failed' && (
                                  <div className="flex gap-2 justify-end mt-4">
                                    <Button
                                      size="sm"
                                      onClick={() => handleAction('approve', [exp.id])}
                                      disabled={acting}
                                    >
                                      <RefreshCw className="w-3 h-3 mr-1" />Erneut senden
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            {isPending && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  title="Freigeben"
                                  onClick={() => handleAction('approve', [exp.id])}
                                  disabled={acting}
                                >
                                  <Check className="w-4 h-4 text-primary" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  title="Ablehnen"
                                  onClick={() => handleAction('reject', [exp.id])}
                                  disabled={acting}
                                >
                                  <X className="w-4 h-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
