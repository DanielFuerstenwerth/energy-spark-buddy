
-- Create a table for persistent IP-based rate limiting
CREATE TABLE public.chat_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_ip text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast lookups by IP and time
CREATE INDEX idx_chat_rate_limits_ip_time ON public.chat_rate_limits (client_ip, created_at DESC);

-- Enable RLS
ALTER TABLE public.chat_rate_limits ENABLE ROW LEVEL SECURITY;

-- No public access - only service role (edge functions) can read/write
-- No policies needed since edge functions use service role key

-- Auto-cleanup: delete entries older than 2 hours
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.chat_rate_limits WHERE created_at < now() - interval '2 hours';
$$;
