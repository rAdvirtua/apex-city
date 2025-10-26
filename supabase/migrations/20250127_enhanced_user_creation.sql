-- Enhanced user creation function that preserves existing names
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
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    final_name,
    NEW.raw_user_meta_data->>'avatar_url'
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

-- Function to check if email already exists (for client-side validation)
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  email_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO email_count
  FROM auth.users
  WHERE email = email_to_check;
  
  RETURN email_count > 0;
END;
$$;

-- Grant execute permission to anonymous users (for signup validation)
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO authenticated;
