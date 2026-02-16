-- Convert vnb_support_portal from boolean to text for consistency with single-select schema
ALTER TABLE public.survey_responses 
  ALTER COLUMN vnb_support_portal TYPE text 
  USING CASE 
    WHEN vnb_support_portal = true THEN 'ja' 
    WHEN vnb_support_portal = false THEN 'nein' 
    ELSE NULL 
  END;