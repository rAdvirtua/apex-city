-- Create test issues with proper status values
-- Run this in your Supabase SQL Editor

-- 1. Check current issues and their statuses
SELECT 'Current issues:' as info;
SELECT id, title, status, created_at 
FROM public.issues 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check what status values exist
SELECT 'Status distribution:' as info;
SELECT status, COUNT(*) as count 
FROM public.issues 
GROUP BY status 
ORDER BY status;

-- 3. Create some test issues with proper status values if none exist
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
  'This is a test issue created for admin dashboard testing. Description: ' || generate_series,
  CASE (generate_series % 4)
    WHEN 0 THEN 'infrastructure'
    WHEN 1 THEN 'environment'
    WHEN 2 THEN 'safety'
    ELSE 'other'
  END,
  'Test Location ' || generate_series || ', City',
  CASE (generate_series % 3)
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'in-progress'
    ELSE 'resolved'
  END,
  (SELECT id FROM public.profiles WHERE email = 'anurag2006.paul@gmail.com' LIMIT 1),
  NOW() - (generate_series || ' days')::interval,
  NOW() - (generate_series || ' days')::interval
FROM generate_series(1, 8)
WHERE NOT EXISTS (SELECT 1 FROM public.issues WHERE title LIKE 'Test Issue%' LIMIT 1);

-- 4. Verify the test issues were created
SELECT 'Test issues created:' as info;
SELECT id, title, status, created_at 
FROM public.issues 
WHERE title LIKE 'Test Issue%'
ORDER BY created_at DESC;

-- 5. Show final status distribution
SELECT 'Final status distribution:' as info;
SELECT status, COUNT(*) as count 
FROM public.issues 
GROUP BY status 
ORDER BY status;

-- 6. Show pending issues specifically
SELECT 'Pending issues available for assignment:' as info;
SELECT id, title, status, created_at 
FROM public.issues 
WHERE status = 'pending'
ORDER BY created_at DESC;
