-- Check and create test issues for admin dashboard
-- Run this in your Supabase SQL Editor

-- 1. Check if issues table exists and what's in it
SELECT 'Checking issues table...' as status;
SELECT COUNT(*) as total_issues FROM public.issues;

-- 2. Check if there are any issues
SELECT 'Current issues:' as status;
SELECT id, title, status, created_at FROM public.issues ORDER BY created_at DESC LIMIT 5;

-- 3. Check if profiles table has your user
SELECT 'Your profile:' as status;
SELECT id, email, full_name, is_admin FROM public.profiles WHERE email = 'anurag2006.paul@gmail.com';

-- 4. Create some test issues if none exist
INSERT INTO public.issues (
  id,
  title,
  description,
  category,
  location_address,
  status,
  user_id,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  'Test Issue ' || generate_series,
  'This is a test issue created for admin dashboard testing.',
  CASE (generate_series % 4)
    WHEN 0 THEN 'infrastructure'
    WHEN 1 THEN 'environment'
    WHEN 2 THEN 'safety'
    ELSE 'other'
  END,
  'Test Location ' || generate_series,
  CASE (generate_series % 3)
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'in-progress'
    ELSE 'resolved'
  END,
  (SELECT id FROM public.profiles WHERE email = 'anurag2006.paul@gmail.com' LIMIT 1),
  NOW() - (generate_series || ' days')::interval,
  NOW() - (generate_series || ' days')::interval
FROM generate_series(1, 5)
WHERE NOT EXISTS (SELECT 1 FROM public.issues LIMIT 1);

-- 5. Verify the test issues were created
SELECT 'Test issues created:' as status;
SELECT id, title, status, created_at FROM public.issues ORDER BY created_at DESC LIMIT 10;
