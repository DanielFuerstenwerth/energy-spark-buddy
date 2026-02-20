
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  user_agent TEXT,
  url TEXT,
  component TEXT,
  metadata JSONB
);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can insert error logs (anonymous users too)
CREATE POLICY "Anyone can insert error logs"
  ON public.error_logs FOR INSERT
  WITH CHECK (true);

-- Only admins can read error logs
CREATE POLICY "Admins can read error logs"
  ON public.error_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
