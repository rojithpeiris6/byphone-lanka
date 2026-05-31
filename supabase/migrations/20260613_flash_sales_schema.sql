-- Table for managing Flash Sales
CREATE TABLE public.flash_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sale_price NUMERIC NOT NULL,
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT price_positive CHECK (sale_price > 0),
    CONSTRAINT dates_valid CHECK (end_at > start_at)
);

-- Enable RLS
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins have full access to flash sales" 
ON public.flash_sales 
FOR ALL 
TO authenticated 
USING ( (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin' );

-- Public can view active flash sales
CREATE POLICY "Public can view active flash sales" 
ON public.flash_sales 
FOR SELECT 
TO anon, authenticated 
USING (
    is_active = true 
    AND now() >= start_at 
    AND now() <= end_at
);

-- Index for performance
CREATE INDEX idx_flash_sales_dates ON public.flash_sales (start_at, end_at);