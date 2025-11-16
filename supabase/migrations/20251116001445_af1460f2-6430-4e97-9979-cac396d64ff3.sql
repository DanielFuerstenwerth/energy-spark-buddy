-- Fix 1: Update the approved comments policy to exclude email from public SELECT
-- Drop the existing policy
DROP POLICY IF EXISTS "Approved comments are viewable by everyone" ON public.comments;

-- Create a new policy that doesn't expose emails
-- We can't exclude columns in RLS, so we'll keep using the view approach
-- But add a note that the view should be used for public queries

-- Fix 2: The comments_public view already has security_invoker=on, which is correct
-- No changes needed for the view itself

-- Fix 3: Restrict audit log INSERT policy to only admins/moderators
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.admin_audit_log;

CREATE POLICY "Only admins and moderators can insert audit logs"
ON public.admin_audit_log
FOR INSERT
WITH CHECK (
  (auth.uid() = admin_user_id) AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
);

-- Add comment to document that comments_public view should be used for public queries
COMMENT ON VIEW public.comments_public IS 'Public view of approved comments. Use this view for public queries to avoid exposing email addresses. The underlying comments table should only be queried by admins/moderators.';

COMMENT ON TABLE public.comments IS 'Internal comments table with RLS. Use comments_public view for public access to avoid exposing author_email field.';