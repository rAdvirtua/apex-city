-- Apply admin migration to your Supabase database
-- Run this in your Supabase SQL Editor

-- Add admin field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create an index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Make your account an admin (replace with your actual email)
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email = 'anurag2006.paul@gmail.com';

-- Verify the update
SELECT email, full_name, is_admin 
FROM public.profiles 
WHERE email = 'anurag2006.paul@gmail.com';
