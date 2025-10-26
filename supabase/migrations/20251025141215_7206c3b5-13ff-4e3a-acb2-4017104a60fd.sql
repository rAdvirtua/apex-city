-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create issues table
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location_address TEXT NOT NULL,
  location_lat NUMERIC,
  location_lng NUMERIC,
  status TEXT DEFAULT 'pending',
  image_url TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for issues
CREATE POLICY "Anyone can view issues"
  ON public.issues FOR SELECT
  USING (true);

CREATE POLICY "Users can create issues"
  ON public.issues FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own issues"
  ON public.issues FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own issues"
  ON public.issues FOR DELETE
  USING (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for issue images
INSERT INTO storage.buckets (id, name, public)
VALUES ('issue-images', 'issue-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view issue images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'issue-images');

CREATE POLICY "Authenticated users can upload issue images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'issue-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'issue-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'issue-images' AND auth.uid()::text = (storage.foldername(name))[1]);