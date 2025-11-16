-- Create public view for comments that excludes email addresses
CREATE VIEW public.comments_public AS
SELECT 
  id, 
  text, 
  author_name, 
  created_at, 
  updated_at,
  views, 
  vnb_name, 
  kriterium, 
  status, 
  route
FROM public.comments
WHERE status = 'approved';

-- Grant access to the view
ALTER VIEW public.comments_public OWNER TO postgres;
GRANT SELECT ON public.comments_public TO anon, authenticated;

-- Add DELETE policy for admins and moderators
CREATE POLICY "Admins and moderators can delete comments"
ON public.comments
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Create audit log table for admin actions
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs (via service role or triggers)
CREATE POLICY "Authenticated users can insert audit logs"
ON public.admin_audit_log
FOR INSERT
WITH CHECK (auth.uid() = admin_user_id);

-- Add database constraints for input validation (defense in depth)
ALTER TABLE public.comments
ADD CONSTRAINT comments_text_length CHECK (char_length(text) <= 5000);

ALTER TABLE public.comments
ADD CONSTRAINT comments_author_name_length CHECK (
  author_name IS NULL OR char_length(author_name) <= 100
);

ALTER TABLE public.comments
ADD CONSTRAINT comments_author_email_length CHECK (
  author_email IS NULL OR char_length(author_email) <= 255
);

-- Create index on audit log for faster queries
CREATE INDEX idx_admin_audit_log_admin_user_id ON public.admin_audit_log(admin_user_id);
CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);