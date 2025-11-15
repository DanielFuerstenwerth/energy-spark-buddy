-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comments table with moderation
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  route TEXT NOT NULL,
  vnb_name TEXT,
  kriterium TEXT,
  text TEXT NOT NULL,
  author_name TEXT,
  author_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  views INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved comments
CREATE POLICY "Approved comments are viewable by everyone"
ON public.comments
FOR SELECT
USING (status = 'approved');

-- Policy: Anyone can insert comments (they start as pending)
CREATE POLICY "Anyone can submit comments"
ON public.comments
FOR INSERT
WITH CHECK (status = 'pending');

-- Create index for faster queries
CREATE INDEX idx_comments_route ON public.comments(route);
CREATE INDEX idx_comments_status ON public.comments(status);
CREATE INDEX idx_comments_vnb ON public.comments(vnb_name);

-- Trigger for updated_at
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();