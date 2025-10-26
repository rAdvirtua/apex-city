-- Complete Database Setup Script
-- Run this in your Supabase SQL Editor to fix all remaining issues

-- 1. Add is_admin column to profiles table (if not exists)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- 3. Create issue_assignments table (if not exists)
CREATE TABLE IF NOT EXISTS public.issue_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  assigned_to_name TEXT NOT NULL,
  assigned_to_phone TEXT NOT NULL,
  assigned_to_email TEXT NOT NULL,
  assignment_message TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'in-progress', 'completed', 'rejected')),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for issue_assignments
CREATE INDEX IF NOT EXISTS idx_issue_assignments_issue_id ON public.issue_assignments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_assignments_status ON public.issue_assignments(status);
CREATE INDEX IF NOT EXISTS idx_issue_assignments_assigned_at ON public.issue_assignments(assigned_at);

-- 5. Enable RLS for issue_assignments
ALTER TABLE public.issue_assignments ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for issue_assignments
DROP POLICY IF EXISTS "Admins can manage all assignments" ON public.issue_assignments;
CREATE POLICY "Admins can manage all assignments" ON public.issue_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Users can view assignments for their issues" ON public.issue_assignments;
CREATE POLICY "Users can view assignments for their issues" ON public.issue_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.issues 
      WHERE issues.id = issue_assignments.issue_id 
      AND issues.user_id = auth.uid()
    )
  );

-- 7. Fix status constraint on issues table
ALTER TABLE public.issues DROP CONSTRAINT IF EXISTS issues_status_check;
ALTER TABLE public.issues 
ADD CONSTRAINT issues_status_check 
CHECK (status IN ('pending', 'in-progress', 'resolved'));

-- 8. Update existing status values to be valid
UPDATE public.issues 
SET status = CASE 
    WHEN status IS NULL THEN 'pending'
    WHEN LOWER(status) IN ('new', 'open', 'submitted') THEN 'pending'
    WHEN LOWER(status) IN ('working', 'assigned', 'active') THEN 'in-progress'
    WHEN LOWER(status) IN ('done', 'fixed', 'closed', 'completed') THEN 'resolved'
    WHEN LOWER(status) = 'pending' THEN 'pending'
    WHEN LOWER(status) = 'in-progress' THEN 'in-progress'
    WHEN LOWER(status) = 'resolved' THEN 'resolved'
    ELSE 'pending'
END
WHERE status IS NULL 
   OR LOWER(status) NOT IN ('pending', 'in-progress', 'resolved');

-- 9. Update handle_new_user function to include is_admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  existing_profile RECORD;
  google_name TEXT;
  final_name TEXT;
BEGIN
  -- Check if profile already exists (for OAuth users)
  SELECT * INTO existing_profile 
  FROM public.profiles 
  WHERE id = NEW.id;
  
  -- Get Google name from metadata
  google_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name');
  
  -- Determine final name: preserve existing name if it exists, otherwise use Google name
  IF existing_profile.full_name IS NOT NULL AND existing_profile.full_name != '' THEN
    final_name := existing_profile.full_name;
  ELSE
    final_name := google_name;
  END IF;
  
  -- Insert or update profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    final_name,
    NEW.raw_user_meta_data->>'avatar_url',
    FALSE -- Default to non-admin
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    full_name = CASE 
      WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN final_name
      ELSE profiles.full_name
    END,
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', profiles.avatar_url),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- 10. Create profile for existing user if it doesn't exist
INSERT INTO public.profiles (id, email, full_name, is_admin)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 'User'),
  FALSE
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 11. Make your account an admin (replace with your actual email)
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'anurag2006.paul@gmail.com';

-- 12. Verify the setup
SELECT 'Database setup completed successfully!' as status;

-- Check profiles table
SELECT 'Profiles table:' as info;
SELECT COUNT(*) as total_profiles, 
       COUNT(CASE WHEN is_admin = true THEN 1 END) as admin_profiles
FROM public.profiles;

-- Check issues table
SELECT 'Issues table:' as info;
SELECT COUNT(*) as total_issues,
       COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_issues,
       COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_issues,
       COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_issues
FROM public.issues;

-- Check issue_assignments table
SELECT 'Issue assignments table:' as info;
SELECT COUNT(*) as total_assignments FROM public.issue_assignments;

-- Check your admin status
SELECT 'Your admin status:' as info;
SELECT email, full_name, is_admin, created_at
FROM public.profiles
WHERE email = 'anurag2006.paul@gmail.com';
