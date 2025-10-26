-- Safe replacement for get_issues_with_reporters
-- This PL/pgSQL function will join `auth.users` for reporter_name and
-- will attempt to use `issues.admin_area` for filtering if the column exists.
-- If `admin_area` does not exist it will fall back to filtering on `location_address` when a parameter is provided.

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
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  has_admin_area boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'issues' AND column_name = 'admin_area'
  ) INTO has_admin_area;

  IF has_admin_area THEN
    IF p_admin_area IS NULL THEN
      RETURN QUERY
      SELECT
        i.id::text,
        i.title,
        i.description,
        i.category,
        i.status,
        i.location_address,
        i.latitude::double precision,
        i.longitude::double precision,
        i.created_at,
        i.image_url,
        COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'fullName', u.email)::text
      FROM public.issues i
      LEFT JOIN auth.users u ON u.id = i.user_id;
    ELSE
      RETURN QUERY
      SELECT
        i.id::text,
        i.title,
        i.description,
        i.category,
        i.status,
        i.location_address,
        i.latitude::double precision,
        i.longitude::double precision,
        i.created_at,
        i.image_url,
        COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'fullName', u.email)::text
      FROM public.issues i
      LEFT JOIN auth.users u ON u.id = i.user_id
      WHERE i.admin_area IS NOT NULL
        AND lower(i.admin_area) LIKE '%' || lower(p_admin_area) || '%';
    END IF;
  ELSE
    -- admin_area column is not present; fall back to using location_address for best-effort filtering
    IF p_admin_area IS NULL THEN
      RETURN QUERY
      SELECT
        i.id::text,
        i.title,
        i.description,
        i.category,
        i.status,
        i.location_address,
        i.latitude::double precision,
        i.longitude::double precision,
        i.created_at,
        i.image_url,
        COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'fullName', u.email)::text
      FROM public.issues i
      LEFT JOIN auth.users u ON u.id = i.user_id;
    ELSE
      RETURN QUERY
      SELECT
        i.id::text,
        i.title,
        i.description,
        i.category,
        i.status,
        i.location_address,
        i.latitude::double precision,
        i.longitude::double precision,
        i.created_at,
        i.image_url,
        COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'fullName', u.email)::text
      FROM public.issues i
      LEFT JOIN auth.users u ON u.id = i.user_id
      WHERE i.location_address IS NOT NULL
        AND lower(i.location_address) LIKE '%' || lower(p_admin_area) || '%';
    END IF;
  END IF;

END;
$$;

COMMIT;

-- Notes:
-- - This function prefers the `auth.users` table to obtain reporter names. It uses `raw_user_meta_data->>'full_name'` if present,
--   falls back to `raw_user_meta_data->>'fullName'` and finally to `email`.
-- - If you later add/populate `issues.admin_area` (recommended), the function will automatically use that column for filtering.
-- - For production-scale filtering consider normalizing admin_area values and adding an index on lower(admin_area) or a trigram index for substrings.
