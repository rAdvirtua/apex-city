-- Quick fix for the loading issue
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what's in your profiles table
SELECT * FROM public.profiles LIMIT 5;

-- 2. Check if your user exists in auth.users
SELECT id, email, created_at FROM auth.users WHERE email = 'anurag2006.paul@gmail.com';

-- 3. Create the profiles table if it doesn't exist (it should, but let's be safe)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add is_admin column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 5. Create profile for your user if it doesn't exist
INSERT INTO public.profiles (id, email, full_name, is_admin)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 'User'),
  FALSE
FROM auth.users au
WHERE au.email = 'anurag2006.paul@gmail.com'
AND au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 6. Make yourself admin
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email = 'anurag2006.paul@gmail.com';

-- 7. Verify everything is set up correctly
SELECT 
  email, 
  full_name, 
  is_admin,
  created_at
FROM public.profiles 
WHERE email = 'anurag2006.paul@gmail.com';
