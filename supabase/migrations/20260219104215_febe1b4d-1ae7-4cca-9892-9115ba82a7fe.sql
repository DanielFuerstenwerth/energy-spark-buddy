
ALTER TABLE public.survey_responses
  ADD COLUMN actor_dienstleister_category text[] DEFAULT '{}'::text[],
  ADD COLUMN actor_dienstleister_category_other text;
