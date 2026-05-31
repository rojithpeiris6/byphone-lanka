-- Create product reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Public can view approved reviews
CREATE POLICY "Anyone can view approved reviews" 
ON public.product_reviews FOR SELECT 
USING (status = 'approved');

-- Authenticated users can insert their own reviews
CREATE POLICY "Users can insert reviews" 
ON public.product_reviews FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins have full access to reviews" 
ON public.product_reviews FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS reviews_status_idx ON public.product_reviews(status);