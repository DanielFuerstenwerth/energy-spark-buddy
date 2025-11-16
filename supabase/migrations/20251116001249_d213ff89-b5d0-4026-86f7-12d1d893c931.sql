-- Fix security definer issue by recreating view with security_invoker
DROP VIEW IF EXISTS public.comments_public;

CREATE VIEW public.comments_public 
WITH (security_invoker=on) AS
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