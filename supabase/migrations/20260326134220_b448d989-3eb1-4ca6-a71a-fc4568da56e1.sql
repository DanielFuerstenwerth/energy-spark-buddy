
-- Question catalog: stores canonical question metadata derived from survey schema SSOT
CREATE TABLE public.survey_question_catalog (
  field_key text PRIMARY KEY,
  question_number text,
  question_text text NOT NULL,
  section_key text,
  project_scope text,
  sort_order integer,
  schema_version text,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: admins can read/write, public can read
ALTER TABLE public.survey_question_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read question catalog"
  ON public.survey_question_catalog
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Admins can manage question catalog"
  ON public.survey_question_catalog
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
