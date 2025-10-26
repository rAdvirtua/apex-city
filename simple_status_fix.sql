-- Simple fix for status constraint violation
-- Run this in your Supabase SQL Editor

-- Step 1: See what's currently in the table
SELECT 'Current status values:' as info;
SELECT DISTINCT status, COUNT(*) as count 
FROM public.issues 
GROUP BY status;

-- Step 2: Drop the problematic constraint
ALTER TABLE public.issues DROP CONSTRAINT IF EXISTS issues_status_check;

-- Step 3: Update any problematic status values
-- (This handles common variations and ensures all values are lowercase)
UPDATE public.issues 
SET status = LOWER(TRIM(status))
WHERE status IS NOT NULL;

-- Step 4: Set any NULL statuses to 'pending'
UPDATE public.issues 
SET status = 'pending'
WHERE status IS NULL;

-- Step 5: Map any non-standard values to standard ones
UPDATE public.issues 
SET status = CASE 
    WHEN status IN ('new', 'open', 'submitted', 'created') THEN 'pending'
    WHEN status IN ('working', 'assigned', 'active', 'in_progress') THEN 'in-progress'
    WHEN status IN ('done', 'fixed', 'closed', 'completed', 'finished') THEN 'resolved'
    ELSE status
END
WHERE status NOT IN ('pending', 'in-progress', 'resolved');

-- Step 6: Add the constraint back
ALTER TABLE public.issues 
ADD CONSTRAINT issues_status_check 
CHECK (status IN ('pending', 'in-progress', 'resolved'));

-- Step 7: Verify everything is working
SELECT 'Final status values:' as info;
SELECT DISTINCT status, COUNT(*) as count 
FROM public.issues 
GROUP BY status
ORDER BY status;

SELECT 'Constraint added successfully!' as result;
