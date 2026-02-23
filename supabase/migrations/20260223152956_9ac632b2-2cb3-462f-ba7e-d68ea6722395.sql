
-- 1. Telemetry table for structured logging (debug/info + business events)
CREATE TABLE public.app_telemetry (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  level text NOT NULL DEFAULT 'info',
  event_type text NOT NULL,
  component text,
  message text,
  metadata jsonb,
  session_id text,
  trace_id text,
  user_agent text,
  url text
);

-- Index for efficient querying by event_type and level
CREATE INDEX idx_app_telemetry_event_type ON public.app_telemetry (event_type);
CREATE INDEX idx_app_telemetry_level ON public.app_telemetry (level);
CREATE INDEX idx_app_telemetry_created_at ON public.app_telemetry (created_at DESC);
CREATE INDEX idx_app_telemetry_trace_id ON public.app_telemetry (trace_id) WHERE trace_id IS NOT NULL;

-- RLS
ALTER TABLE public.app_telemetry ENABLE ROW LEVEL SECURITY;

-- Anyone can insert telemetry (anonymous survey users)
CREATE POLICY "Anyone can insert telemetry"
  ON public.app_telemetry FOR INSERT
  WITH CHECK (true);

-- Only admins can read telemetry
CREATE POLICY "Admins can read telemetry"
  ON public.app_telemetry FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-cleanup: keep only 30 days of telemetry
CREATE OR REPLACE FUNCTION public.cleanup_old_telemetry()
  RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
  DELETE FROM public.app_telemetry WHERE created_at < now() - interval '30 days';
$$;

-- 2. Add client_submission_id to survey_responses for idempotency
ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS client_submission_id uuid;

-- Unique constraint for idempotency (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_survey_responses_client_submission_id
  ON public.survey_responses (client_submission_id)
  WHERE client_submission_id IS NOT NULL;
