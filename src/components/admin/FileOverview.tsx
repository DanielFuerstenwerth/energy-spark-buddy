import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileText, Download, Loader2, ChevronDown, ChevronRight, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface SurveyWithFiles {
  id: string;
  created_at: string;
  vnb_name: string | null;
  project_type_tag: string | null;
  contact_email: string | null;
  uploaded_documents: string[];
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  ggv: 'GGV',
  ms: 'Mieterstrom',
  es: 'Energy Sharing',
};

export default function FileOverview() {
  const [surveys, setSurveys] = useState<SurveyWithFiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchSurveysWithFiles();
  }, []);

  const fetchSurveysWithFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('id, created_at, vnb_name, project_type_tag, contact_email, uploaded_documents')
        .eq('status', 'submitted')
        .not('uploaded_documents', 'eq', '{}')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const withFiles = (data ?? []).filter(
        (r) => r.uploaded_documents && r.uploaded_documents.length > 0
      );
      setSurveys(withFiles);
    } catch (err: any) {
      console.error('Error fetching files:', err);
      toast.error('Fehler beim Laden der Dateien');
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownload = async (filePath: string) => {
    setDownloading(filePath);
    try {
      const { data, error } = await supabase.storage
        .from('survey-documents')
        .createSignedUrl(filePath, 300);

      if (error || !data?.signedUrl) {
        throw new Error(error?.message || 'Signed URL konnte nicht erzeugt werden');
      }

      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = filePath.split('/').pop() || 'download';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      console.error('Download error:', err);
      toast.error(`Download fehlgeschlagen: ${err.message}`);
    } finally {
      setDownloading(null);
    }
  };

  const totalFiles = surveys.reduce((sum, s) => sum + (s.uploaded_documents?.length ?? 0), 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Lade Dateien...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          Hochgeladene Dateien
        </CardTitle>
        <CardDescription>
          {surveys.length} Umfrage-Antwort{surveys.length !== 1 ? 'en' : ''} mit insgesamt {totalFiles} Datei{totalFiles !== 1 ? 'en' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {surveys.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Keine hochgeladenen Dateien vorhanden.
          </p>
        ) : (
          surveys.map((survey) => {
            const isOpen = openIds.has(survey.id);
            return (
              <Collapsible key={survey.id} open={isOpen} onOpenChange={() => toggleOpen(survey.id)}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate">
                            {survey.vnb_name || 'Ohne VNB'}
                          </span>
                          {survey.project_type_tag && (
                            <Badge variant="secondary" className="text-xs">
                              {PROJECT_TYPE_LABELS[survey.project_type_tag] || survey.project_type_tag}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {survey.uploaded_documents.length} Datei{survey.uploaded_documents.length !== 1 ? 'en' : ''}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(survey.created_at), 'dd. MMM yyyy, HH:mm', { locale: de })}
                          {' · '}
                          <span className="font-mono">{survey.id.slice(0, 8)}</span>
                        </p>
                      </div>
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-7 mt-2 space-y-2 pb-2">
                    {survey.uploaded_documents.map((filePath, idx) => {
                      const fileName = filePath.split('/').pop() || filePath;
                      const isDownloading = downloading === filePath;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-md border bg-background"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                            <span className="text-sm truncate">{fileName}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(filePath)}
                            disabled={isDownloading}
                            className="shrink-0"
                          >
                            {isDownloading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
