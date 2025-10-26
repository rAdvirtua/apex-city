-- Fix existing data before updating constraint
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what status values currently exist
SELECT DISTINCT status, COUNT(*) as count 
FROM public.issues 
GROUP BY status
ORDER BY status;

-- 2. Check if there are any NULL or invalid status values
SELECT id, title, status 
FROM public.issues 
WHERE status IS NULL 
   OR status NOT IN ('pending', 'in-progress', 'resolved');

-- 3. Update any invalid status values to valid ones
-- This will map common variations to our standard values
UPDATE public.issues 
SET status = CASE 
    WHEN status IS NULL THEN 'pending'
    WHEN LOWER(status) IN ('new', 'open', 'submitted') THEN 'pending'
    WHEN LOWER(status) IN ('working', 'assigned', 'active') THEN 'in-progress'
    WHEN LOWER(status) IN ('done', 'fixed', 'closed', 'completed') THEN 'resolved'
    WHEN LOWER(status) = 'pending' THEN 'pending'
    WHEN LOWER(status) = 'in-progress' THEN 'in-progress'
    WHEN LOWER(status) = 'resolved' THEN 'resolved'
    ELSE 'pending'  -- Default fallback
END
WHERE status IS NULL 
   OR LOWER(status) NOT IN ('pending', 'in-progress', 'resolved');

-- 4. Verify all status values are now valid
SELECT DISTINCT status, COUNT(*) as count 
FROM public.issues 
GROUP BY status
ORDER BY status;

-- 5. Now drop the old constraint if it exists
ALTER TABLE public.issues DROP CONSTRAINT IF EXISTS issues_status_check;

-- 6. Add the new constraint
ALTER TABLE public.issues 
ADD CONSTRAINT issues_status_check 
CHECK (status IN ('pending', 'in-progress', 'resolved'));

-- 7. Verify the constraint was added successfully
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.issues'::regclass 
AND contype = 'c'
AND conname = 'issues_status_check';

-- 8. Test that the constraint works by checking all rows
SELECT 'All status values are now valid:' as message;
SELECT DISTINCT status, COUNT(*) as count 
FROM public.issues 
GROUP BY status
ORDER BY status;
