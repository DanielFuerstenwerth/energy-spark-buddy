-- Remove all JSONB columns: convert to TEXT for better Excel/CSV compatibility
-- Record<string,string> fields → stored as serialized text
ALTER TABLE survey_responses 
  ALTER COLUMN actor_text_fields TYPE text USING 
    CASE WHEN actor_text_fields IS NULL OR actor_text_fields = '{}'::jsonb THEN NULL
    ELSE actor_text_fields::text END,
  ALTER COLUMN challenges_details TYPE text USING 
    CASE WHEN challenges_details IS NULL OR challenges_details = '{}'::jsonb THEN NULL
    ELSE challenges_details::text END,
  ALTER COLUMN vnb_rejection_response_details TYPE text USING 
    CASE WHEN vnb_rejection_response_details IS NULL OR vnb_rejection_response_details = '{}'::jsonb THEN NULL
    ELSE vnb_rejection_response_details::text END;

-- Location JSONB fields → no longer used (multi-row approach instead)
ALTER TABLE survey_responses 
  ALTER COLUMN project_locations TYPE text USING 
    CASE WHEN project_locations IS NULL OR project_locations = '[]'::jsonb THEN NULL
    ELSE project_locations::text END,
  ALTER COLUMN mieterstrom_project_locations TYPE text USING 
    CASE WHEN mieterstrom_project_locations IS NULL THEN NULL
    ELSE mieterstrom_project_locations::text END,
  ALTER COLUMN es_project_locations TYPE text USING 
    CASE WHEN es_project_locations IS NULL OR es_project_locations = '[]'::jsonb THEN NULL
    ELSE es_project_locations::text END;

-- Update defaults (no longer JSONB defaults)
ALTER TABLE survey_responses 
  ALTER COLUMN actor_text_fields SET DEFAULT NULL,
  ALTER COLUMN challenges_details SET DEFAULT NULL,
  ALTER COLUMN vnb_rejection_response_details SET DEFAULT NULL,
  ALTER COLUMN project_locations SET DEFAULT NULL,
  ALTER COLUMN mieterstrom_project_locations SET DEFAULT NULL,
  ALTER COLUMN es_project_locations SET DEFAULT NULL;
