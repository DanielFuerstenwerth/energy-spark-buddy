
CREATE OR REPLACE FUNCTION public.get_survey_stats()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH sessions AS (
    SELECT DISTINCT ON (session_group_id)
      session_group_id,
      project_types,
      ggv_or_mieterstrom_decision
    FROM survey_responses
    WHERE status = 'submitted'
      AND session_group_id IS NOT NULL
      AND project_types IS NOT NULL
      AND array_length(project_types, 1) > 0
  )
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'ggv', SUM(
      CASE
        WHEN ('ggv' = ANY(project_types) OR 'ggv_oder_mieterstrom' = ANY(project_types))
             AND ggv_or_mieterstrom_decision = 'beides' THEN 0.5
        WHEN 'ggv' = ANY(project_types) THEN 1
        ELSE 0
      END
    ),
    'mieterstrom', SUM(
      CASE
        WHEN ('mieterstrom' = ANY(project_types) OR 'ggv_oder_mieterstrom' = ANY(project_types))
             AND ggv_or_mieterstrom_decision = 'beides' THEN 0.5
        WHEN 'mieterstrom' = ANY(project_types) THEN 1
        ELSE 0
      END
    ),
    'energy_sharing', SUM(
      CASE
        WHEN 'energy_sharing' = ANY(project_types) OR 'energysharing' = ANY(project_types) THEN 1
        ELSE 0
      END
    )
  )
  FROM sessions;
$function$;
