-- Add admin field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create an index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Update the handle_new_user function to include is_admin field
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
