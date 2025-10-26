-- 2025-10-26: Add admin_area to issues and update get_issues_with_reporters RPC
-- Paste this into Supabase -> SQL editor (or run via psql) to apply the migration.

BEGIN;

-- 1) Add admin_area column (if missing)
ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS admin_area text;

-- 2) Index to speed up case-insensitive searches on admin_area
CREATE INDEX IF NOT EXISTS idx_issues_admin_area_lower ON public.issues (lower(admin_area));

-- Optional: consider trigram index for substring searches (uncomment to create)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS idx_issues_admin_area_trgm ON public.issues USING gin (admin_area gin_trgm_ops);

-- 3) Replace / create RPC get_issues_with_reporters with optional admin_area argument
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
    i.location_lat::double precision AS latitude,
    i.location_lng::double precision AS longitude,
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

