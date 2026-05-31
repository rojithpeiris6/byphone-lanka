-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('shop', 'shop', true),
  ('products', 'products', true),
  ('brands', 'brands', true),
  ('categories', 'categories', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access policies for 'shop' bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'shop');
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shop' AND (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')));
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'shop' AND (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')));
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'shop' AND (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')));

-- Set up access policies for 'products' bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')));
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'products' AND (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')));
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')));

-- Set up access policies for 'brands' bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'brands');
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'brands' AND (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')));
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'brands' AND (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')));
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'brands' AND (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')));

-- Set up access policies for 'categories' bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'categories');
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'categories' AND (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')));
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'categories' AND (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')));
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'categories' AND (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')));