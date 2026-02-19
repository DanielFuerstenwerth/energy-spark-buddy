
-- Table to track GGV export approvals
CREATE TABLE public.ggv_exports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending_review',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  remote_project_id text,
  remote_feedback_id text,
  error_message text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX idx_ggv_exports_status ON public.ggv_exports (status);
CREATE INDEX idx_ggv_exports_survey_id ON public.ggv_exports (survey_id);

-- Auto-update updated_at
CREATE TRIGGER update_ggv_exports_updated_at
  BEFORE UPDATE ON public.ggv_exports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.ggv_exports ENABLE ROW LEVEL SECURITY;

-- Only admins can view
CREATE POLICY "Admins can view ggv exports"
  ON public.ggv_exports FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update (approve/reject)
CREATE POLICY "Admins can update ggv exports"
  ON public.ggv_exports FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Edge functions insert via service role (no anon insert policy needed)
-- But we need insert for service role which bypasses RLS anyway

-- Only admins can delete
CREATE POLICY "Admins can delete ggv exports"
  ON public.ggv_exports FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));
