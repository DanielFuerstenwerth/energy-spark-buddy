-- Migrate any existing location data into flat columns before dropping
UPDATE survey_responses
SET project_plz = (project_locations::jsonb->0->>'plz'),
    project_address = (project_locations::jsonb->0->>'address')
WHERE project_locations IS NOT NULL 
  AND project_locations != ''
  AND project_plz IS NULL;

UPDATE survey_responses
SET project_plz = (mieterstrom_project_locations::jsonb->0->>'plz'),
    project_address = (mieterstrom_project_locations::jsonb->0->>'address')
WHERE mieterstrom_project_locations IS NOT NULL 
  AND mieterstrom_project_locations != ''
  AND project_plz IS NULL;

-- Drop unused location columns
ALTER TABLE survey_responses DROP COLUMN IF EXISTS project_locations;
ALTER TABLE survey_responses DROP COLUMN IF EXISTS mieterstrom_project_locations;
ALTER TABLE survey_responses DROP COLUMN IF EXISTS es_project_locations;

-- Add project_type_tag column to distinguish row types
ALTER TABLE survey_responses ADD COLUMN project_type_tag text;