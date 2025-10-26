-- 2025-10-26: Make get_issues_with_reporters a SECURITY DEFINER function
-- Reason: anon/public callers (the web app) cannot read from auth.users due to RLS/permissions.
-- A SECURITY DEFINER function runs with the function owner's privileges and allows safe read-only access
-- to protected tables when the function's body is carefully written (read-only, no injected SQL).

-- IMPORTANT: run this as a project owner (Supabase SQL editor runs as a privileged user). Review body before running.

CREATE OR REPLACE FUNCTION public.get_issues_with_reporters(p_admin_area text DEFAULT NULL::text)
RETURNS TABLE(
  id text,
  title text,
  description text,
  category text,
  status text,
  location_address text,
  latitude double precision,
  longitude double precision,
  created_at timestamp with time zone,
  image_url text,
  reporter_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
    COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', u.email)::text AS reporter_name
  FROM public.issues i
  LEFT JOIN public.profiles p ON p.id = i.user_id
  LEFT JOIN auth.users u ON u.id = i.user_id
  WHERE
    (p_admin_area IS NULL)
    OR (i.admin_area IS NOT NULL AND lower(i.admin_area) LIKE '%' || lower(p_admin_area) || '%');
$$;

-- Verification: call via REST or SQL as anon (or use SQL editor):
-- SELECT * FROM public.get_issues_with_reporters(NULL::text) LIMIT 5;

-- SECURITY NOTES:
-- - Because this is SECURITY DEFINER, the function runs with the privileges of its owner. Ensure the function owner is a trusted role.
-- - The function body here is a static SQL SELECT (no dynamic SQL) and is read-only; avoid adding data-modifying statements.
