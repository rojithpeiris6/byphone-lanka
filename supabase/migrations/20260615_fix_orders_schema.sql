-- Ensure the orders table exists and has user_id
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'user_id') THEN
            ALTER TABLE public.orders ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Notify PostgREST to reload its schema cache immediately
NOTIFY pgrst, 'reload schema';