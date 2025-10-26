-- Update issue_assignments table to remove phone field
-- Run this in your Supabase SQL Editor

-- Remove the phone field from issue_assignments table
ALTER TABLE public.issue_assignments 
DROP COLUMN IF EXISTS assigned_to_phone;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'issue_assignments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Phone field removed from issue_assignments table' as status;
