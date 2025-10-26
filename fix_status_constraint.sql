-- Check and fix issues table status constraint
-- Run this in your Supabase SQL Editor

-- 1. Check the current constraint on the issues table
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.issues'::regclass 
AND contype = 'c';

-- 2. Check what status values currently exist in the issues table
SELECT DISTINCT status, COUNT(*) as count 
FROM public.issues 
GROUP BY status;

-- 3. Check the current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'issues' 
AND table_schema = 'public'
AND column_name = 'status';

-- 4. Drop the existing constraint if it exists
ALTER TABLE public.issues DROP CONSTRAINT IF EXISTS issues_status_check;

-- 5. Add a new constraint that matches our application's status values
ALTER TABLE public.issues 
ADD CONSTRAINT issues_status_check 
CHECK (status IN ('pending', 'in-progress', 'resolved'));

-- 6. Verify the constraint was added
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.issues'::regclass 
AND contype = 'c'
AND conname = 'issues_status_check';

-- 7. Test the constraint by trying to update a status
-- (This will show if the constraint is working properly)
SELECT 'Constraint updated successfully' as status;
