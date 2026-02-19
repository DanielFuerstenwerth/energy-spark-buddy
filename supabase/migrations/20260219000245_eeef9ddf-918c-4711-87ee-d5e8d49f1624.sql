
-- New columns for GGV-Transparenz integration
ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS ggv_transparenz_opt_in TEXT,
  ADD COLUMN IF NOT EXISTS ggv_project_city TEXT,
  ADD COLUMN IF NOT EXISTS ggv_project_website TEXT,
  ADD COLUMN IF NOT EXISTS ggv_experience_notes TEXT,
  ADD COLUMN IF NOT EXISTS sp_quality_rating INTEGER,
  ADD COLUMN IF NOT EXISTS sp_price_rating INTEGER,
  ADD COLUMN IF NOT EXISTS sp_rating_comment TEXT;
