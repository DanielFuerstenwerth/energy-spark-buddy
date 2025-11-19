-- Create sources table for imported pages and PDFs
CREATE TABLE public.sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  topic TEXT,
  priority INTEGER DEFAULT 2,
  source_type TEXT DEFAULT 'unbekannt',
  pdf_urls JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public insert (for edge function with anon key)
CREATE POLICY "Allow public insert of sources"
ON public.sources
FOR INSERT
WITH CHECK (true);

-- Policy: Admins can view all sources
CREATE POLICY "Admins can view all sources"
ON public.sources
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Admins can manage sources
CREATE POLICY "Admins can manage sources"
ON public.sources
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_sources_url ON public.sources(url);
CREATE INDEX idx_sources_created_at ON public.sources(created_at DESC);