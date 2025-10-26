-- 2025-10-26: Remove ambiguous no-arg overload of get_issues_with_reporters
-- Reason: the no-argument overload conflicts with the text-arg overload (which has a DEFAULT NULL),
-- causing Postgres to be unable to choose a candidate when called without arguments.
-- This migration drops the no-arg overload and ensures the single canonical function (text arg with DEFAULT NULL) exists.

BEGIN;

-- Backup: previous no-arg function definition (for reference)
--
-- CREATE OR REPLACE FUNCTION public.get_issues_with_reporters()
--  RETURNS TABLE(id uuid, created_at timestamp with time zone, user_id uuid, title text, description text, category text, location_address text, latitude double precision, longitude double precision, image_url text, status text, reporter_name text)
--  LANGUAGE sql
--  SECURITY DEFINER
-- AS $function$
--   SELECT
--     i.id,
--     i.created_at,
--     i.user_id,
--     i.title,
--     i.description,
--     i.category,
--     i.location_address,
--     i.latitude,
--     i.longitude,
--     i.image_url,
--     i.status,
--     u.raw_user_meta_data->>'full_name' as reporter_name
--   FROM
--     public.issues i
--     LEFT JOIN auth.users u ON i.user_id = u.id
--   ORDER BY
--     i.created_at DESC;
-- $function$
--
-- Drop the ambiguous no-arg overload.
DROP FUNCTION IF EXISTS public.get_issues_with_reporters();

-- Ensure canonical function (accepts text with DEFAULT NULL) is present.
CREATE OR REPLACE FUNCTION public.get_issues_with_reporters(p_admin_area text DEFAULT NULL::text)
 RETURNS TABLE(id text, title text, description text, category text, status text, location_address text, latitude double precision, longitude double precision, created_at timestamp with time zone, image_url text, reporter_name text)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT
    i.id::text,
    i.title,
    i.description,
    i.category,
    i.status,
    i.location_address,
    i.latitude::double precision AS latitude,
    i.longitude::double precision AS longitude,
    i.created_at,
    i.image_url,
    p.full_name AS reporter_name
  FROM public.issues i
  LEFT JOIN public.profiles p ON p.id = i.user_id
  WHERE
    (p_admin_area IS NULL)
    OR (i.admin_area IS NOT NULL AND lower(i.admin_area) LIKE '%' || lower(p_admin_area) || '%');
$function$;

COMMIT;

-- Verification:
-- SELECT * FROM public.get_issues_with_reporters(NULL::text) LIMIT 5;
-- SELECT pg_get_functiondef(p.oid) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE p.proname = 'get_issues_with_reporters' AND n.nspname = 'public';
