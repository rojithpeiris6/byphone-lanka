-- Enable RLS if not already enabled
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Allow public to view approved reviews
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.product_reviews;
CREATE POLICY "Public can view approved reviews"
    ON public.product_reviews FOR SELECT
    USING (status = 'approved');

-- Allow authenticated users to create reviews
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.product_reviews;
CREATE POLICY "Authenticated users can create reviews"
    ON public.product_reviews FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow admins full access to moderate reviews
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.product_reviews;
CREATE POLICY "Admins can manage all reviews"
    ON public.product_reviews FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'manager')
        )
    );