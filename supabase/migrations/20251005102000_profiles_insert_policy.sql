-- Allow authenticated users to insert their own profile row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Ensure authenticated role can insert/select profiles (RLS will still govern row access)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

