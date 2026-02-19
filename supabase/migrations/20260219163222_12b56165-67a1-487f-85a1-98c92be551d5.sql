
-- Add admin reply columns to comments table
ALTER TABLE public.comments 
ADD COLUMN admin_reply text,
ADD COLUMN admin_reply_at timestamp with time zone;

-- Recreate comments_public view to include admin_reply, admin_reply_at, and vnb_name
DROP VIEW IF EXISTS public.comments_public;

CREATE VIEW public.comments_public
WITH (security_invoker=on) AS
SELECT 
  id,
  created_at,
  updated_at,
  views,
  text,
  author_name,
  vnb_name,
  kriterium,
  status,
  route,
  admin_reply,
  admin_reply_at
FROM public.comments
WHERE status = 'approved';
