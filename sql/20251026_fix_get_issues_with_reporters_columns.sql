-- Fix RPC to be tolerant of different latitude/longitude column names
-- Some environments use `location_lat`/`location_lng` (numeric) while others use `latitude`/`longitude` (double precision).
-- This replacement function coalesces both names so it won't fail if one set is missing.

BEGIN;

CREATE OR REPLACE FUNCTION public.get_issues_with_reporters(p_admin_area text DEFAULT NULL)
RETURNS TABLE(
  id text,
  title text,
  description text,
  category text,
  status text,
  location_address text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz,
  image_url text,
  reporter_name text
)
LANGUAGE sql STABLE
AS $$
  SELECT
    i.id::text,
    i.title,
    i.description,
    i.category,
    i.status,
    i.location_address,
    COALESCE(NULLIF(i.location_lat, '')::double precision, i.latitude::double precision) AS latitude,
    COALESCE(NULLIF(i.location_lng, '')::double precision, i.longitude::double precision) AS longitude,
    i.created_at,
    i.image_url,
    p.full_name AS reporter_name
  FROM public.issues i
  LEFT JOIN public.profiles p ON p.id = i.user_id
  WHERE
    (p_admin_area IS NULL)
    OR (i.admin_area IS NOT NULL AND lower(i.admin_area) LIKE '%' || lower(p_admin_area) || '%');
$$;

COMMIT;

-- Notes:
-- - Use this script when your database has different column names for coordinates.
-- - Apply it via Supabase SQL editor or psql. It is safe to run multiple times.
