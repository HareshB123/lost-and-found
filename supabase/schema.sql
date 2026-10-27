-- LOST AND FOUND - Supabase PostgreSQL Schema
-- Run this migration in the Supabase SQL Editor

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  college_email TEXT NOT NULL UNIQUE,
  department TEXT,
  year_of_study TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Item Reports table
CREATE TABLE IF NOT EXISTS public.item_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT CHECK (report_type IN ('lost', 'found')) NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  location TEXT NOT NULL,
  date_lost_or_found DATE NOT NULL,
  approximate_time TEXT,
  custody_status TEXT,
  status TEXT CHECK (status IN ('Active', 'Possible Match', 'Returned', 'Resolved', 'Closed')) DEFAULT 'Active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMPTZ
);

-- 3. Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_report_id UUID REFERENCES public.item_reports(id) ON DELETE CASCADE NOT NULL,
  participant_one_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  participant_two_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('active', 'ended', 'expired')) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours') NOT NULL,
  ended_at TIMESTAMPTZ,
  CONSTRAINT different_participants CHECK (participant_one_id <> participant_two_id)
);

-- 4. Messages table (Active messages deleted when conversation is ended/expired)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  related_report_id UUID REFERENCES public.item_reports(id) ON DELETE SET NULL,
  related_conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_item_reports_user ON public.item_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_item_reports_category ON public.item_reports(category);
CREATE INDEX IF NOT EXISTS idx_item_reports_status ON public.item_reports(status);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_one_id, participant_two_id);
CREATE INDEX IF NOT EXISTS idx_conversations_expires ON public.conversations(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_messages_convo ON public.messages(conversation_id);
