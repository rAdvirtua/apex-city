-- Complete Admin Setup Script
-- Run this in your Supabase SQL Editor

-- Step 1: Check if profiles table exists and what's in it
SELECT 'Checking profiles table...' as status;
SELECT * FROM public.profiles LIMIT 5;

-- Step 2: Check your user in auth.users
SELECT 'Checking auth.users...' as status;
SELECT id, email, created_at, raw_user_meta_data 
FROM auth.users 
WHERE email = 'anurag2006.paul@gmail.com';

-- Step 3: Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Add is_admin column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 5: Create an index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Step 6: Insert your profile if it doesn't exist
INSERT INTO public.profiles (id, email, full_name, is_admin)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 'Admin User'),
  TRUE  -- Set as admin immediately
FROM auth.users au
WHERE au.email = 'anurag2006.paul@gmail.com'
AND au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Step 7: Update existing profile to make you admin
UPDATE public.profiles 
SET 
  is_admin = TRUE,
  email = 'anurag2006.paul@gmail.com',
  full_name = COALESCE(full_name, 'Admin User'),
  updated_at = NOW()
WHERE email = 'anurag2006.paul@gmail.com';

-- Step 8: Verify the setup
SELECT 'Final verification...' as status;
SELECT 
  email, 
  full_name, 
  is_admin,
  created_at,
  updated_at
FROM public.profiles 
WHERE email = 'anurag2006.paul@gmail.com';

-- Step 9: Check if there are any issues in the issues table
SELECT 'Checking issues table...' as status;
SELECT COUNT(*) as total_issues FROM public.issues;
SELECT status, COUNT(*) as count FROM public.issues GROUP BY status;
