-- Create participant_profiles table
CREATE TABLE public.participant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  cellphone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add user_id column to participants table
ALTER TABLE public.participants 
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS on participant_profiles
ALTER TABLE public.participant_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "Users can read own profile" ON public.participant_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.participant_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.participant_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for updated_at on participant_profiles
CREATE TRIGGER update_participant_profiles_updated_at
BEFORE UPDATE ON public.participant_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_participants_user_id ON public.participants(user_id);
CREATE INDEX idx_participant_profiles_user_id ON public.participant_profiles(user_id);