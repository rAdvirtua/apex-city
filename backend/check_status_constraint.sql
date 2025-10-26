-- Quick check for issues table status constraint
-- Run this in your Supabase SQL Editor

-- Check what status values are currently allowed by the constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.issues'::regclass 
AND contype = 'c'
AND conname LIKE '%status%';

-- Check what status values currently exist in the table
SELECT DISTINCT status, COUNT(*) as count 
FROM public.issues 
GROUP BY status
ORDER BY status;
