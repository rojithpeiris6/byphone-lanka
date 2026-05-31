-- Ensure 'status' column exists in orders table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='status') THEN
        ALTER TABLE public.orders ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
    END IF;
END $$;

-- Ensure 'status' column exists in product_reviews table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_reviews' AND column_name='status') THEN
        ALTER TABLE public.product_reviews ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
    END IF;
END $$;

-- Add check constraints if they don't exist
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));
    EXCEPTION WHEN duplicate_object THEN 
        -- Constraint already exists
    END;

    BEGIN
        ALTER TABLE public.product_reviews ADD CONSTRAINT product_reviews_status_check CHECK (status IN ('pending', 'approved', 'rejected'));
    EXCEPTION WHEN duplicate_object THEN 
        -- Constraint already exists
    END;
END $$;