-- SQL Updates for User Blocking and Data Persistence

-- 1. Add is_blocked column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- 2. Ensure likes arrays are correctly typed and handle permanent likes
-- (Assuming likes are stored as arrays of user IDs)
-- If not already arrays, you might need to alter them.
-- For drawings:
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS likes TEXT[] DEFAULT '{}';
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS dislikes TEXT[] DEFAULT '{}';

-- For feedback:
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS likes TEXT[] DEFAULT '{}';
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS dislikes TEXT[] DEFAULT '{}';

-- For site settings (home likes):
-- The site_settings table already has a 'likes' integer column, which is fine for anonymous likes.

-- 3. Add columns for permanent user images (if not already present)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 4. Create an admin role or flag if not exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 5. Update RLS policies to hide content from blocked users
-- For drawings:
DROP POLICY IF EXISTS "Hide blocked users drawings" ON public.drawings;
CREATE POLICY "Hide blocked users drawings" ON public.drawings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = drawings.user_id AND u.is_blocked = FALSE
    )
    OR
    (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
  );

-- For feedback:
DROP POLICY IF EXISTS "Hide blocked users feedback" ON public.feedback;
CREATE POLICY "Hide blocked users feedback" ON public.feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = feedback.user_id AND u.is_blocked = FALSE
    )
    OR
    (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
  );

-- For users (hide blocked profiles from normal users):
DROP POLICY IF EXISTS "Hide blocked users profiles" ON public.users;
CREATE POLICY "Hide blocked users profiles" ON public.users
  FOR SELECT
  USING (
    is_blocked = FALSE
    OR
    auth.uid() = id
    OR
    (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
  );

-- 6. Add site settings column for commissions link
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS commissions_link TEXT;

-- 7. Add recommended users
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS recommended_users JSONB DEFAULT '[]'::jsonb;

-- 8. Add modules states
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS module_states JSONB DEFAULT '{"about": true, "social": true, "commissions": true, "community": true, "masterworks": true, "whiteboard": true}'::jsonb;
