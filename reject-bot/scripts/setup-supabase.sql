-- Create extension for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a table for storing resume analyses
CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  resume_name text NOT NULL,
  job_position text,
  job_field text,
  intensity text NOT NULL,
  rejection_letter text NOT NULL,
  feedback_points jsonb NOT NULL,
  score integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable the RLS (Row Level Security)
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to see only their own resume analyses
CREATE POLICY "Users can view their own resume analyses"
  ON public.resume_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create a policy that allows users to insert their own resume analyses
CREATE POLICY "Users can insert their own resume analyses"
  ON public.resume_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update their own resume analyses
CREATE POLICY "Users can update their own resume analyses"
  ON public.resume_analyses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create a policy that allows users to delete their own resume analyses
CREATE POLICY "Users can delete their own resume analyses"
  ON public.resume_analyses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to get the current user's profile
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'id', auth.uid(),
    'email', email,
    'name', raw_user_meta_data->>'name'
  )::jsonb
  FROM auth.users
  WHERE id = auth.uid();
$$; 