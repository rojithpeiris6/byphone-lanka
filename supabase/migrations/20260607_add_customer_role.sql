-- Add 'customer' to the app_role enum
-- Note: In PostgreSQL, adding to an enum cannot be done inside a transaction block in some versions, 
-- but for Supabase migrations, this is the standard approach.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';

-- Enable RLS on user_roles if not already enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to insert their own 'customer' role during signup
CREATE POLICY "Users can assign themselves customer role" 
ON public.user_roles FOR INSERT 
WITH CHECK (
    auth.uid() = user_id 
    AND role = 'customer'
);

-- Policy: Allow users to view their own role
CREATE POLICY "Users can view own role" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);