-- Create the customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    district TEXT,
    postal_code TEXT,
    order_count INTEGER DEFAULT 0,
    total_spent NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can view their own profile
CREATE POLICY "Customers can view own profile" 
ON public.customers FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Customers can update their own profile
CREATE POLICY "Customers can update own profile" 
ON public.customers FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Admins can do everything (assuming a 'role' check or service role)
-- This policy allows any user with 'admin' role in user_roles table to manage customers
CREATE POLICY "Admins can manage all customers" 
ON public.customers FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();