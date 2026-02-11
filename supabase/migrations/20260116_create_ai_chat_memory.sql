-- Create a specific table for AI Chat Memory
-- This replaces Zep/LangChain external memory with a local Postgres table
CREATE TABLE IF NOT EXISTS public.ai_chat_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast retrieval by user (for loading chat history)
CREATE INDEX IF NOT EXISTS idx_ai_chat_memory_user_created 
ON public.ai_chat_memory(user_id, created_at ASC);

-- RLS Policies
ALTER TABLE public.ai_chat_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chat memory"
ON public.ai_chat_memory
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Explicit function to clean memory (useful for the 'Limpiar' button)
CREATE OR REPLACE FUNCTION public.clear_chat_memory(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.ai_chat_memory WHERE user_id = p_user_id;
END;
$$;
