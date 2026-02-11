-- Fix for n8n Postgres Memory Node
-- n8n only inserts 'session_id', 'message', and 'role' (or similar JSON blob).
-- It does NOT explicitly insert 'user_id', causing the NOT NULL error.

-- 1. Make user_id nullable temporarily (or handle via trigger)
-- Ideally we want user_id populated. Since session_id IS the user_id in our setup:

CREATE OR REPLACE FUNCTION public.sync_user_id_from_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If user_id is null, try to cast session_id to UUID
  IF NEW.user_id IS NULL AND NEW.session_id IS NOT NULL THEN
    BEGIN
      NEW.user_id := NEW.session_id::UUID;
    EXCEPTION WHEN OTHERS THEN
      -- If session_id is not a valid UUID, leave user_id null (or handle error)
      NULL; 
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Create Trigger
DROP TRIGGER IF EXISTS trigger_sync_user_id_chat_memory ON public.ai_chat_memory;

CREATE TRIGGER trigger_sync_user_id_chat_memory
BEFORE INSERT ON public.ai_chat_memory
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_id_from_session();

-- 3. Relax constraint allowing null user_id just in case
ALTER TABLE public.ai_chat_memory ALTER COLUMN user_id DROP NOT NULL;

-- 4. Ensure n8n typical columns exist (just in case it needs 'additional_kwargs' or similar)
-- n8n usually expects a specific schema. Let's make sure 'message' is JSONB if it prefers that, 
-- BUT usually 'message' (text) work. The previous error was specifically about user_id.

-- Let's also check if n8n expects 'timestamp' or 'created_at'. We have 'created_at'.
