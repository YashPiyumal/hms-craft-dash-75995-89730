-- Add user_id column to store_settings for proper multi-tenant isolation
ALTER TABLE store_settings 
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Delete existing shared record (will be recreated per-user on signup)
DELETE FROM store_settings;

-- Make user_id required
ALTER TABLE store_settings 
  ALTER COLUMN user_id SET NOT NULL;

-- Drop overly permissive RLS policies
DROP POLICY IF EXISTS "Anyone authenticated can view store settings" ON store_settings;
DROP POLICY IF EXISTS "Authenticated users can update store settings" ON store_settings;
DROP POLICY IF EXISTS "Authenticated users can insert store settings" ON store_settings;

-- Create user-scoped RLS policies
CREATE POLICY "Users can view own settings" 
  ON store_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" 
  ON store_settings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" 
  ON store_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Update handle_new_user trigger to create user-specific store settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin')
  );
  
  -- Insert user-specific store settings
  INSERT INTO public.store_settings (user_id, store_name)
  VALUES (NEW.id, 'My Store');
  
  RETURN NEW;
END;
$$;