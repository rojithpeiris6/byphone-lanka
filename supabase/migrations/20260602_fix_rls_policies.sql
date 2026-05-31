-- 1. Ensure the has_role function is robust
CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. BRANDS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public brands access" ON public.brands;
DROP POLICY IF EXISTS "Admin brands management" ON public.brands;
CREATE POLICY "Public brands access" ON public.brands FOR SELECT USING (status = 'active');
CREATE POLICY "Admin brands management" ON public.brands FOR ALL USING (public.has_role('admin'));

-- 3. CATEGORIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public categories access" ON public.categories;
DROP POLICY IF EXISTS "Admin categories management" ON public.categories;
CREATE POLICY "Public categories access" ON public.categories FOR SELECT USING (status = 'active');
CREATE POLICY "Admin categories management" ON public.categories FOR ALL USING (public.has_role('admin'));

-- 4. PRODUCTS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public products access" ON public.products;
DROP POLICY IF EXISTS "Admin products management" ON public.products;
CREATE POLICY "Public products access" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Admin products management" ON public.products FOR ALL USING (public.has_role('admin'));

-- 5. PRODUCT IMAGES
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public product images access" ON public.product_images;
DROP POLICY IF EXISTS "Admin product images management" ON public.product_images;
CREATE POLICY "Public product images access" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admin product images management" ON public.product_images FOR ALL USING (public.has_role('admin'));

-- 6. PRODUCT VARIANTS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public product variants access" ON public.product_variants;
DROP POLICY IF EXISTS "Admin product variants management" ON public.product_variants;
CREATE POLICY "Public product variants access" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admin product variants management" ON public.product_variants FOR ALL USING (public.has_role('admin'));

-- 7. ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admin orders management" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id OR customer_id IS NULL);
CREATE POLICY "Admin orders management" ON public.orders FOR ALL USING (public.has_role('admin'));

-- 8. ORDER ITEMS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admin order items management" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (customer_id = auth.uid() OR customer_id IS NULL))
);
CREATE POLICY "Admin order items management" ON public.order_items FOR ALL USING (public.has_role('admin'));

-- 9. USER ROLES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin user_roles management" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin user_roles management" ON public.user_roles FOR ALL USING (public.has_role('admin'));