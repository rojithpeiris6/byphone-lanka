-- Create payment_records table
CREATE TABLE public.payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    transaction_id TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'paddle',
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'LKR',
    status TEXT NOT NULL DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own payment records"
ON public.payment_records FOR SELECT
TO authenticated
USING (
    order_id IN (
        SELECT id FROM public.orders WHERE customer_id IN (
            SELECT id FROM public.customers WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Admins have full access to payment records"
ON public.payment_records FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.customers WHERE user_id = auth.uid() AND role = 'admin'
    )
);
