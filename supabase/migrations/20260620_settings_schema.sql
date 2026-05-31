-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public to read settings (for frontend configuration)
CREATE POLICY "Allow public read access to settings" ON public.settings
    FOR SELECT USING (true);

-- Allow admins to manage settings
CREATE POLICY "Allow admin to manage settings" ON public.settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Insert some initial default settings
INSERT INTO public.settings (key, value, description)
VALUES 
    ('store_info', '{"name": "byphone.lk", "email": "support@byphone.lk", "phone": "+94 11 234 5678", "address": "123 Tech Lane, Colombo 03", "currency": "LKR"}', 'Basic store contact information'),
    ('shipping_rates', '{"standard": 0, "express": 490, "free_threshold": 50000}', 'Delivery fees and free shipping rules'),
    ('payment_gateways', '{"payhere_enabled": true, "paypal_enabled": true, "cod_enabled": true}', 'Toggle different payment methods'),
    ('social_links', '{"facebook": "", "instagram": "", "whatsapp": "", "tiktok": ""}', 'Links to social media profiles')
ON CONFLICT (key) DO NOTHING;