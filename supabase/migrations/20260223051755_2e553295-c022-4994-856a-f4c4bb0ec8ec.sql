
CREATE OR REPLACE FUNCTION public.get_survey_stats()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'ggv', SUM(
      CASE
        WHEN project_type_tag = 'ggv' THEN 1
        WHEN project_type_tag IS NULL AND ('ggv' = ANY(project_types) OR 'ggv_oder_mieterstrom' = ANY(project_types)) THEN 1
        ELSE 0
      END
    ),
    'mieterstrom', SUM(
      CASE
        WHEN project_type_tag = 'ms' THEN 1
        WHEN project_type_tag IS NULL AND 'mieterstrom' = ANY(project_types) THEN 1
        ELSE 0
      END
    ),
    'energy_sharing', SUM(
      CASE
        WHEN project_type_tag = 'es' THEN 1
        WHEN project_type_tag IS NULL AND 'energysharing' = ANY(project_types) THEN 1
        ELSE 0
      END
    )
  )
  FROM survey_responses
  WHERE status = 'submitted';
$function$;
