
-- Minimal table for data input submissions
CREATE TABLE public.data_inputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  category TEXT NOT NULL,
  category_other TEXT,
  description TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  uploaded_files TEXT[] DEFAULT '{}'::text[],
  status TEXT NOT NULL DEFAULT 'new'
);

-- Enable RLS
ALTER TABLE public.data_inputs ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "Anyone can submit data inputs"
ON public.data_inputs FOR INSERT
WITH CHECK (true);

-- Only admins can view
CREATE POLICY "Admins can view data inputs"
ON public.data_inputs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update
CREATE POLICY "Admins can update data inputs"
ON public.data_inputs FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete
CREATE POLICY "Admins can delete data inputs"
ON public.data_inputs FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
