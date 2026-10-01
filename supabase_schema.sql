-- SQL Mastery Supabase Cloud Database Schema

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  certificate_name TEXT NOT NULL,
  name_edit_credits INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create User Progress Table with Streak and XP
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  completed_lessons JSONB DEFAULT '[]'::jsonb,
  streak_count INT DEFAULT 0,
  xp INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security on user_progress
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy for user_progress
DROP POLICY IF EXISTS "Allow user_progress access" ON public.user_progress;
CREATE POLICY "Allow user_progress access" ON public.user_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant Permissions
GRANT ALL ON public.users TO anon, authenticated, service_role;
GRANT ALL ON public.user_progress TO anon, authenticated, service_role;
