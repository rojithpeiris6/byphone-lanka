-- Create the product_reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to reviews" ON public.product_reviews
    FOR SELECT USING (true);

CREATE POLICY "Allow users to insert reviews for their own accounts" ON public.product_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);