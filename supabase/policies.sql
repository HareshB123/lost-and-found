-- Row Level Security (RLS) and Backend RPC functions for Lost and Found

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Item Reports Policies
CREATE POLICY "Item reports are viewable by authenticated users" 
  ON public.item_reports FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reports" 
  ON public.item_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" 
  ON public.item_reports FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" 
  ON public.item_reports FOR DELETE USING (auth.uid() = user_id);

-- 3. Conversations Policies (Strict membership checks)
CREATE POLICY "Users can view only conversations they participate in" 
  ON public.conversations FOR SELECT 
  USING (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

CREATE POLICY "Users can start conversation if they participate" 
  ON public.conversations FOR INSERT 
  WITH CHECK (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

CREATE POLICY "Participants can update conversation state" 
  ON public.conversations FOR UPDATE 
  USING (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

-- 4. Messages Policies
CREATE POLICY "Users can view messages only in their conversations" 
  ON public.messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = messages.conversation_id 
        AND c.status = 'active'
        AND (c.participant_one_id = auth.uid() OR c.participant_two_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages into their active conversations" 
  ON public.messages FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id 
        AND c.status = 'active'
        AND (c.participant_one_id = auth.uid() OR c.participant_two_id = auth.uid())
    )
  );

-- 5. RPC: Atomic and Permanent Chat Deletion Workflow
-- Ends conversation and permanently deletes all associated messages from active storage
CREATE OR REPLACE FUNCTION end_and_delete_conversation(p_conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_convo RECORD;
BEGIN
  -- Verify membership
  SELECT * INTO v_convo FROM public.conversations WHERE id = p_conversation_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  IF v_convo.participant_one_id <> v_user_id AND v_convo.participant_two_id <> v_user_id THEN
    RAISE EXCEPTION 'Unauthorized to end this conversation';
  END IF;

  -- 1. Permanently delete all messages in this conversation
  DELETE FROM public.messages WHERE conversation_id = p_conversation_id;

  -- 2. Mark conversation as ended and clear active state
  UPDATE public.conversations 
  SET status = 'ended', ended_at = timezone('utc'::text, now())
  WHERE id = p_conversation_id;

  RETURN TRUE;
END;
$$;

-- 6. RPC: Cleanup Inactive / Expired Conversations (Called by cron/scheduler)
CREATE OR REPLACE FUNCTION cleanup_inactive_conversations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
  r RECORD;
BEGIN
  FOR r IN 
    SELECT id FROM public.conversations 
    WHERE status = 'active' AND expires_at < timezone('utc'::text, now())
  LOOP
    -- Permanently delete messages
    DELETE FROM public.messages WHERE conversation_id = r.id;
    -- Mark conversation as expired
    UPDATE public.conversations 
    SET status = 'expired', ended_at = timezone('utc'::text, now()) 
    WHERE id = r.id;
    
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;
