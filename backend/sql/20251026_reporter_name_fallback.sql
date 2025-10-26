-- 2025-10-26: Replace get_issues_with_reporters to fallback reporter_name from profiles -> auth.users
-- This function returns reporter_name from public.profiles.full_name when available,
-- otherwise falls back to auth.users.raw_user_meta_data->>'full_name' or ->>'name', then to email.

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
LANGUAGE sql STABLE
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
    COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', u.email)::text AS reporter_name
  FROM public.issues i
  LEFT JOIN public.profiles p ON p.id = i.user_id
  LEFT JOIN auth.users u ON u.id = i.user_id
  WHERE
    (p_admin_area IS NULL)
    OR (i.admin_area IS NOT NULL AND lower(i.admin_area) LIKE '%' || lower(p_admin_area) || '%');
$function$;

-- Verification examples:
-- SELECT * FROM public.get_issues_with_reporters(NULL::text) LIMIT 5;
-- SELECT * FROM public.get_issues_with_reporters('Kathmandu') LIMIT 5;
