ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS mieterstrom_foerderung text,
  ADD COLUMN IF NOT EXISTS mieterstrom_foerderung_nein_grund text,
  ADD COLUMN IF NOT EXISTS mieterstrom_foerderung_nein_grund_text text;