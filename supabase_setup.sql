-- HarvestGuard Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  district TEXT,
  upazila TEXT,
  preferred_lang TEXT DEFAULT 'bn',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, preferred_lang)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'preferred_lang', 'bn')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create batches table for crop batch management (if needed)
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  crop_type TEXT NOT NULL,
  weight_kg DECIMAL(10, 2) NOT NULL,
  storage_method TEXT NOT NULL,
  harvest_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on batches table
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Users can view own batches" ON public.batches;
DROP POLICY IF EXISTS "Users can insert own batches" ON public.batches;
DROP POLICY IF EXISTS "Users can update own batches" ON public.batches;
DROP POLICY IF EXISTS "Users can delete own batches" ON public.batches;

-- Create policy: Users can view their own batches
CREATE POLICY "Users can view own batches"
  ON public.batches
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own batches
CREATE POLICY "Users can insert own batches"
  ON public.batches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own batches
CREATE POLICY "Users can update own batches"
  ON public.batches
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own batches
CREATE POLICY "Users can delete own batches"
  ON public.batches
  FOR DELETE
  USING (auth.uid() = user_id);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_batches_updated_at ON public.batches;

-- Create trigger to update updated_at on batches
CREATE TRIGGER set_batches_updated_at
  BEFORE UPDATE ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

