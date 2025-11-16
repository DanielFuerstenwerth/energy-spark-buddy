-- Actually, for this specific case, we need SECURITY DEFINER (not INVOKER)
-- because we want to expose a filtered subset of columns without requiring
-- a SELECT policy on the base table that would expose all columns including email.

-- Recreate the view with default SECURITY DEFINER behavior
DROP VIEW IF EXISTS public.comments_public;

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

-- The view runs as the owner (postgres), which has full access
-- But the view itself acts as the security filter:
-- 1. Only returns approved comments (WHERE status = 'approved')
-- 2. Excludes author_email column from SELECT
-- This is a safe use of SECURITY DEFINER

ALTER VIEW public.comments_public OWNER TO postgres;
GRANT SELECT ON public.comments_public TO anon, authenticated;

-- Update comments to remove the view column
COMMENT ON VIEW public.comments_public IS 'Public view of approved comments with email addresses excluded. This view uses SECURITY DEFINER to provide controlled access without exposing sensitive columns from the underlying table.';

-- Ensure no direct anonymous access to the comments table
-- (All existing policies require admin/moderator role or specific conditions)