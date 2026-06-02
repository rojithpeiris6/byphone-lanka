-- Dummy data for Products based on user provided dataset
DO $$
DECLARE
    -- Brands
    apple_id UUID := (SELECT id FROM public.brands WHERE slug = 'apple');
    samsung_id UUID := (SELECT id FROM public.brands WHERE slug = 'samsung');
    xiaomi_id UUID := (SELECT id FROM public.brands WHERE slug = 'xiaomi');
    oneplus_id UUID := (SELECT id FROM public.brands WHERE slug = 'oneplus');
    nothing_id UUID := (SELECT id FROM public.brands WHERE slug = 'nothing');
    google_id UUID := (SELECT id FROM public.brands WHERE slug = 'google');
    honor_id UUID := (SELECT id FROM public.brands WHERE slug = 'honor');
    vivo_id UUID := (SELECT id FROM public.brands WHERE slug = 'vivo');
    oppo_id UUID := (SELECT id FROM public.brands WHERE slug = 'oppo');
    motorola_id UUID := (SELECT id FROM public.brands WHERE slug = 'motorola');
    realme_id UUID := (SELECT id FROM public.brands WHERE slug = 'realme');
    tecno_id UUID := (SELECT id FROM public.brands WHERE slug = 'tecno');

    -- Categories
    smartphones_id UUID := (SELECT id FROM public.categories WHERE slug = 'smartphones');
    
    -- Sub-categories
    ios_devices_id UUID := (SELECT id FROM public.categories WHERE slug = 'ios-devices');
    android_devices_id UUID := (SELECT id FROM public.categories WHERE slug = 'android-devices');
    budget_phones_id UUID := (SELECT id FROM public.categories WHERE slug = 'budget-phones');

    -- Product variables
    p_id UUID;
BEGIN
    -- Clear existing related data to avoid foreign key constraints during seeding
    -- Only delete from tables that we know exist and are strictly referencing products
    DELETE FROM public.order_items;
    DELETE FROM public.product_images;
    DELETE FROM public.products;

    -- Apple
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('iPhone 16 Pro Max', 'iphone-16-pro-max', 'AP000', apple_id, smartphones_id, ios_devices_id, 520000, 0, 'active', true, 'A18 Pro, Titanium, 48MP') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16_Pro_Max/Apple_iPhone_16_Pro_Max_Back.jpg', 'iPhone 16 Pro Max - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16_Pro_Max/Apple_iPhone_16_Pro_Max_Front.jpg', 'iPhone 16 Pro Max - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16_Pro_Max/Apple_iPhone_16_Pro_Max_Perspective.jpg', 'iPhone 16 Pro Max - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16_Pro_Max/Apple_iPhone_16_Pro_Max_Side.jpg', 'iPhone 16 Pro Max - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('iPhone 16 Pro', 'iphone-16-pro', 'AP001', apple_id, smartphones_id, ios_devices_id, 460000, 0, 'active', true, 'A18 Pro, 6.3 inch Display') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16_Pro/Apple_iPhone_16_Pro_Back.jpg', 'iPhone 16 Pro - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16_Pro/Apple_iPhone_16_Pro_Front.jpg', 'iPhone 16 Pro - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16_Pro/Apple_iPhone_16_Pro_Perspective.jpg', 'iPhone 16 Pro - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16_Pro/Apple_iPhone_16_Pro_Side.jpg', 'iPhone 16 Pro - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('iPhone 16', 'iphone-16', 'AP002', apple_id, smartphones_id, ios_devices_id, 320000, 0, 'active', true, 'A18, Dual Camera') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16/Apple_iPhone_16_Back.jpg', 'iPhone 16 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16/Apple_iPhone_16_Front.jpg', 'iPhone 16 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16/Apple_iPhone_16_Perspective.jpg', 'iPhone 16 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16/Apple_iPhone_16_Side.jpg', 'iPhone 16 - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('iPhone 16 Plus', 'iphone-16-plus', 'AP003', apple_id, smartphones_id, ios_devices_id, 360000, 0, 'active', true, 'A18, Large Display') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16_Plus/Apple_iPhone_16_Plus_Back.jpg', 'iPhone 16 Plus - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16_Plus/Apple_iPhone_16_Plus_Front.jpg', 'iPhone 16 Plus - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16_Plus/Apple_iPhone_16_Plus_Perspective.jpg', 'iPhone 16 Plus - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_16_Plus/Apple_iPhone_16_Plus_Side.jpg', 'iPhone 16 Plus - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('iPhone 15 Pro', 'iphone-15-pro', 'AP004', apple_id, smartphones_id, ios_devices_id, 390000, 0, 'active', true, 'A17 Pro, Titanium') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_15_Pro/Apple_iPhone_15_Pro_Back.jpg', 'iPhone 15 Pro - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_15_Pro/Apple_iPhone_15_Pro_Front.jpg', 'iPhone 15 Pro - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_15_Pro/Apple_iPhone_15_Pro_Perspective.jpg', 'iPhone 15 Pro - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_15_Pro/Apple_iPhone_15_Pro_Side.jpg', 'iPhone 15 Pro - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('iPhone 15', 'iphone-15', 'AP005', apple_id, smartphones_id, ios_devices_id, 270000, 0, 'active', true, 'A16 Bionic') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_15/Apple_iPhone_15_Back.jpg', 'iPhone 15 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_15/Apple_iPhone_15_Front.jpg', 'iPhone 15 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_15/Apple_iPhone_15_Perspective.jpg', 'iPhone 15 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_15/Apple_iPhone_15_Side.jpg', 'iPhone 15 - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('iPhone 13', 'iphone-13', 'AP006', apple_id, smartphones_id, ios_devices_id, 210000, 0, 'active', true, 'Reliable performance') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_13/Apple_iPhone_13_Back.jpg', 'iPhone 13 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_13/Apple_iPhone_13_Front.jpg', 'iPhone 13 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_13/Apple_iPhone_13_Perspective.jpg', 'iPhone 13 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Apple_iPhone_13/Apple_iPhone_13_Side.jpg', 'iPhone 13 - Side');

    -- Samsung
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy S25 Ultra', 'galaxy-s25-ultra', 'SA007', samsung_id, smartphones_id, android_devices_id, 495000, 0, 'active', true, 'Snapdragon 8 Gen 4, 200MP') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_S25_Ultra/Samsung_Galaxy_S25_Ultra_Back.jpg', 'Galaxy S25 Ultra - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_S25_Ultra/Samsung_Galaxy_S25_Ultra_Front.jpg', 'Galaxy S25 Ultra - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_S25_Ultra/Samsung_Galaxy_S25_Ultra_Perspective.jpg', 'Galaxy S25 Ultra - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_S25_Ultra/Samsung_Galaxy_S25_Ultra_Side.jpg', 'Galaxy S25 Ultra - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy S25+', 'galaxy-s25+', 'SA008', samsung_id, smartphones_id, android_devices_id, 380000, 0, 'active', true, 'Flagship performance') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_S25%2B/Samsung_Galaxy_S25%2B_Back.jpg', 'Galaxy S25+ - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_S25%2B/Samsung_Galaxy_S25%2B_Front.jpg', 'Galaxy S25+ - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_S25%2B/Samsung_Galaxy_S25%2B_Perspective.jpg', 'Galaxy S25+ - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_S25%2B/Samsung_Galaxy_S25%2B_Side.jpg', 'Galaxy S25+ - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy S24 Ultra', 'galaxy-s24-ultra', 'SA009', samsung_id, smartphones_id, android_devices_id, 410000, 0, 'active', true, 'Snapdragon 8 Gen 3') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_S24_Ultra/Samsung_Galaxy_S24_Ultra_Back.jpg', 'Galaxy S24 Ultra - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_S24_Ultra/Samsung_Galaxy_S24_Ultra_Front.jpg', 'Galaxy S24 Ultra - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_S24_Ultra/Samsung_Galaxy_S24_Ultra_Perspective.jpg', 'Galaxy S24 Ultra - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_S24_Ultra/Samsung_Galaxy_S24_Ultra_Side.jpg', 'Galaxy S24 Ultra - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy A56 5G', 'galaxy-a56-5g', 'SA010', samsung_id, smartphones_id, budget_phones_id, 135000, 0, 'active', false, '120Hz AMOLED') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A56_5G/Samsung_Galaxy_A56_5G_Back.jpg', 'Galaxy A56 5G - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A56_5G/Samsung_Galaxy_A56_5G_Front.jpg', 'Galaxy A56 5G - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A56_5G/Samsung_Galaxy_A56_5G_Perspective.jpg', 'Galaxy A56 5G - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A56_5G/Samsung_Galaxy_A56_5G_Side.jpg', 'Galaxy A56 5G - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy A55 5G', 'galaxy-a55-5g', 'SA011', samsung_id, smartphones_id, budget_phones_id, 115000, 0, 'active', false, 'Exynos 1480') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A55_5G/Samsung_Galaxy_A55_5G_Back.jpg', 'Galaxy A55 5G - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A55_5G/Samsung_Galaxy_A55_5G_Front.jpg', 'Galaxy A55 5G - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A55_5G/Samsung_Galaxy_A55_5G_Perspective.jpg', 'Galaxy A55 5G - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A55_5G/Samsung_Galaxy_A55_5G_Side.jpg', 'Galaxy A55 5G - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy A36 5G', 'galaxy-a36-5g', 'SA012', samsung_id, smartphones_id, budget_phones_id, 95000, 0, 'active', false, 'Great value 5G') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A36_5G/Samsung_Galaxy_A36_5G_Back.jpg', 'Galaxy A36 5G - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A36_5G/Samsung_Galaxy_A36_5G_Front.jpg', 'Galaxy A36 5G - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A36_5G/Samsung_Galaxy_A36_5G_Perspective.jpg', 'Galaxy A36 5G - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A36_5G/Samsung_Galaxy_A36_5G_Side.jpg', 'Galaxy A36 5G - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy A16 5G', 'galaxy-a16-5g', 'SA013', samsung_id, smartphones_id, budget_phones_id, 65000, 0, 'active', false, 'Reliable budget 5G') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A16_5G/Samsung_Galaxy_A16_5G_Back.jpg', 'Galaxy A16 5G - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A16_5G/Samsung_Galaxy_A16_5G_Front.jpg', 'Galaxy A16 5G - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A16_5G/Samsung_Galaxy_A16_5G_Perspective.jpg', 'Galaxy A16 5G - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A16_5G/Samsung_Galaxy_A16_5G_Side.jpg', 'Galaxy A16 5G - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy A06', 'galaxy-a06', 'SA014', samsung_id, smartphones_id, budget_phones_id, 45000, 0, 'active', false, 'Entry level') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A06/Samsung_Galaxy_A06_Back.jpg', 'Galaxy A06 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A06/Samsung_Galaxy_A06_Front.jpg', 'Galaxy A06 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A06/Samsung_Galaxy_A06_Perspective.jpg', 'Galaxy A06 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Samsung_Galaxy_A06/Samsung_Galaxy_A06_Side.jpg', 'Galaxy A06 - Side');

    -- Xiaomi
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Xiaomi 15 Pro', 'xiaomi-15-pro', 'XI015', xiaomi_id, smartphones_id, android_devices_id, 370000, 0, 'active', false, 'Leica optics, 8 Gen 4') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Xiaomi_15_Pro/Xiaomi_Xiaomi_15_Pro_Back.jpg', 'Xiaomi 15 Pro - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Xiaomi_15_Pro/Xiaomi_Xiaomi_15_Pro_Front.jpg', 'Xiaomi 15 Pro - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Xiaomi_15_Pro/Xiaomi_Xiaomi_15_Pro_Perspective.jpg', 'Xiaomi 15 Pro - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Xiaomi_15_Pro/Xiaomi_Xiaomi_15_Pro_Side.jpg', 'Xiaomi 15 Pro - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Xiaomi 14', 'xiaomi-14', 'XI016', xiaomi_id, smartphones_id, android_devices_id, 310000, 0, 'active', false, 'Compact flagship') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Xiaomi_14/Xiaomi_Xiaomi_14_Back.jpg', 'Xiaomi 14 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Xiaomi_14/Xiaomi_Xiaomi_14_Front.jpg', 'Xiaomi 14 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Xiaomi_14/Xiaomi_Xiaomi_14_Perspective.jpg', 'Xiaomi 14 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Xiaomi_14/Xiaomi_Xiaomi_14_Side.jpg', 'Xiaomi 14 - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Redmi Note 14 Pro+', 'redmi-note-14-pro+', 'XI017', xiaomi_id, smartphones_id, budget_phones_id, 110000, 0, 'active', false, 'High resolution screen') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_Note_14_Pro%2B/Xiaomi_Redmi_Note_14_Pro%2B_Back.jpg', 'Redmi Note 14 Pro+ - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_Note_14_Pro%2B/Xiaomi_Redmi_Note_14_Pro%2B_Front.jpg', 'Redmi Note 14 Pro+ - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_Note_14_Pro%2B/Xiaomi_Redmi_Note_14_Pro%2B_Perspective.jpg', 'Redmi Note 14 Pro+ - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_Note_14_Pro%2B/Xiaomi_Redmi_Note_14_Pro%2B_Side.jpg', 'Redmi Note 14 Pro+ - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Redmi Note 13 Pro', 'redmi-note-13-pro', 'XI018', xiaomi_id, smartphones_id, budget_phones_id, 95000, 0, 'active', false, '200MP camera') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_Note_13_Pro/Xiaomi_Redmi_Note_13_Pro_Back.jpg', 'Redmi Note 13 Pro - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_Note_13_Pro/Xiaomi_Redmi_Note_13_Pro_Front.jpg', 'Redmi Note 13 Pro - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_Note_13_Pro/Xiaomi_Redmi_Note_13_Pro_Perspective.jpg', 'Redmi Note 13 Pro - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_Note_13_Pro/Xiaomi_Redmi_Note_13_Pro_Side.jpg', 'Redmi Note 13 Pro - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Redmi Note 13', 'redmi-note-13', 'XI019', xiaomi_id, smartphones_id, budget_phones_id, 75000, 0, 'active', false, 'AMOLED, 120Hz') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_Note_13/Xiaomi_Redmi_Note_13_Back.jpg', 'Redmi Note 13 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_Note_13/Xiaomi_Redmi_Note_13_Front.jpg', 'Redmi Note 13 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_Note_13/Xiaomi_Redmi_Note_13_Perspective.jpg', 'Redmi Note 13 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_Note_13/Xiaomi_Redmi_Note_13_Side.jpg', 'Redmi Note 13 - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Poco X7 Pro', 'poco-x7-pro', 'XI020', xiaomi_id, smartphones_id, budget_phones_id, 125000, 0, 'active', false, 'Performance beast') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Poco_X7_Pro/Xiaomi_Poco_X7_Pro_Back.jpg', 'Poco X7 Pro - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Poco_X7_Pro/Xiaomi_Poco_X7_Pro_Front.jpg', 'Poco X7 Pro - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Poco_X7_Pro/Xiaomi_Poco_X7_Pro_Perspective.jpg', 'Poco X7 Pro - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Poco_X7_Pro/Xiaomi_Poco_X7_Pro_Side.jpg', 'Poco X7 Pro - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Poco M6 Pro', 'poco-m6-pro', 'XI021', xiaomi_id, smartphones_id, budget_phones_id, 65000, 0, 'active', false, 'Value for money') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Poco_M6_Pro/Xiaomi_Poco_M6_Pro_Back.jpg', 'Poco M6 Pro - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Poco_M6_Pro/Xiaomi_Poco_M6_Pro_Front.jpg', 'Poco M6 Pro - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Poco_M6_Pro/Xiaomi_Poco_M6_Pro_Perspective.jpg', 'Poco M6 Pro - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Poco_M6_Pro/Xiaomi_Poco_M6_Pro_Side.jpg', 'Poco M6 Pro - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Redmi 14C', 'redmi-14c', 'XI022', xiaomi_id, smartphones_id, budget_phones_id, 40000, 0, 'active', false, 'Basic smartphone') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_14C/Xiaomi_Redmi_14C_Back.jpg', 'Redmi 14C - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_14C/Xiaomi_Redmi_14C_Front.jpg', 'Redmi 14C - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_14C/Xiaomi_Redmi_14C_Perspective.jpg', 'Redmi 14C - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Xiaomi_Redmi_14C/Xiaomi_Redmi_14C_Side.jpg', 'Redmi 14C - Side');

    -- Oppo
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Oppo Find X8 Pro', 'oppo-find-x8-pro', 'OP023', oppo_id, smartphones_id, android_devices_id, 390000, 0, 'active', false, 'Hasselblad Camera') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_Find_X8_Pro/Oppo_Oppo_Find_X8_Pro_Back.jpg', 'Oppo Find X8 Pro - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_Find_X8_Pro/Oppo_Oppo_Find_X8_Pro_Front.jpg', 'Oppo Find X8 Pro - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_Find_X8_Pro/Oppo_Oppo_Find_X8_Pro_Perspective.jpg', 'Oppo Find X8 Pro - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_Find_X8_Pro/Oppo_Oppo_Find_X8_Pro_Side.jpg', 'Oppo Find X8 Pro - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Oppo Reno 13 Pro', 'oppo-reno-13-pro', 'OP024', oppo_id, smartphones_id, android_devices_id, 160000, 0, 'active', false, 'Portrait expert') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_Reno_13_Pro/Oppo_Oppo_Reno_13_Pro_Back.jpg', 'Oppo Reno 13 Pro - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_Reno_13_Pro/Oppo_Oppo_Reno_13_Pro_Front.jpg', 'Oppo Reno 13 Pro - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_Reno_13_Pro/Oppo_Oppo_Reno_13_Pro_Perspective.jpg', 'Oppo Reno 13 Pro - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_Reno_13_Pro/Oppo_Oppo_Reno_13_Pro_Side.jpg', 'Oppo Reno 13 Pro - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Oppo Reno 12 F', 'oppo-reno-12-f', 'OP025', oppo_id, smartphones_id, android_devices_id, 125000, 0, 'active', false, 'Sleek design') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_Reno_12_F/Oppo_Oppo_Reno_12_F_Back.jpg', 'Oppo Reno 12 F - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_Reno_12_F/Oppo_Oppo_Reno_12_F_Front.jpg', 'Oppo Reno 12 F - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_Reno_12_F/Oppo_Oppo_Reno_12_F_Perspective.jpg', 'Oppo Reno 12 F - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_Reno_12_F/Oppo_Oppo_Reno_12_F_Side.jpg', 'Oppo Reno 12 F - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Oppo A78', 'oppo-a78', 'OP026', oppo_id, smartphones_id, budget_phones_id, 85000, 0, 'active', false, 'Fast charging') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_A78/Oppo_Oppo_A78_Back.jpg', 'Oppo A78 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_A78/Oppo_Oppo_A78_Front.jpg', 'Oppo A78 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_A78/Oppo_Oppo_A78_Perspective.jpg', 'Oppo A78 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_A78/Oppo_Oppo_A78_Side.jpg', 'Oppo A78 - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Oppo A60', 'oppo-a60', 'OP027', oppo_id, smartphones_id, budget_phones_id, 65000, 0, 'active', false, 'Durable') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_A60/Oppo_Oppo_A60_Back.jpg', 'Oppo A60 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_A60/Oppo_Oppo_A60_Front.jpg', 'Oppo A60 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_A60/Oppo_Oppo_A60_Perspective.jpg', 'Oppo A60 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_A60/Oppo_Oppo_A60_Side.jpg', 'Oppo A60 - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Oppo A58', 'oppo-a58', 'OP028', oppo_id, smartphones_id, budget_phones_id, 55000, 0, 'active', false, 'Entry level') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_A58/Oppo_Oppo_A58_Back.jpg', 'Oppo A58 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_A58/Oppo_Oppo_A58_Front.jpg', 'Oppo A58 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_A58/Oppo_Oppo_A58_Perspective.jpg', 'Oppo A58 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oppo_Oppo_A58/Oppo_Oppo_A58_Side.jpg', 'Oppo A58 - Side');

    -- Vivo
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Vivo X200 Pro', 'vivo-x200-pro', 'VI029', vivo_id, smartphones_id, android_devices_id, 400000, 0, 'active', false, 'ZEISS optics') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_X200_Pro/Vivo_Vivo_X200_Pro_Back.jpg', 'Vivo X200 Pro - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_X200_Pro/Vivo_Vivo_X200_Pro_Front.jpg', 'Vivo X200 Pro - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_X200_Pro/Vivo_Vivo_X200_Pro_Perspective.jpg', 'Vivo X200 Pro - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_X200_Pro/Vivo_Vivo_X200_Pro_Side.jpg', 'Vivo X200 Pro - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Vivo V40', 'vivo-v40', 'VI030', vivo_id, smartphones_id, android_devices_id, 145000, 0, 'active', false, 'Portrait focus') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_V40/Vivo_Vivo_V40_Back.jpg', 'Vivo V40 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_V40/Vivo_Vivo_V40_Front.jpg', 'Vivo V40 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_V40/Vivo_Vivo_V40_Perspective.jpg', 'Vivo V40 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_V40/Vivo_Vivo_V40_Side.jpg', 'Vivo V40 - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Vivo V30', 'vivo-v30', 'VI031', vivo_id, smartphones_id, android_devices_id, 120000, 0, 'active', false, 'Slim design') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_V30/Vivo_Vivo_V30_Back.jpg', 'Vivo V30 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_V30/Vivo_Vivo_V30_Front.jpg', 'Vivo V30 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_V30/Vivo_Vivo_V30_Perspective.jpg', 'Vivo V30 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_V30/Vivo_Vivo_V30_Side.jpg', 'Vivo V30 - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Vivo Y38 5G', 'vivo-y38-5g', 'VI032', vivo_id, smartphones_id, budget_phones_id, 80000, 0, 'active', false, 'Large battery') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_Y38_5G/Vivo_Vivo_Y38_5G_Back.jpg', 'Vivo Y38 5G - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_Y38_5G/Vivo_Vivo_Y38_5G_Front.jpg', 'Vivo Y38 5G - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_Y38_5G/Vivo_Vivo_Y38_5G_Perspective.jpg', 'Vivo Y38 5G - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_Y38_5G/Vivo_Vivo_Y38_5G_Side.jpg', 'Vivo Y38 5G - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Vivo Y28', 'vivo-y28', 'VI033', vivo_id, smartphones_id, budget_phones_id, 60000, 0, 'active', false, '5G budget') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_Y28/Vivo_Vivo_Y28_Back.jpg', 'Vivo Y28 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_Y28/Vivo_Vivo_Y28_Front.jpg', 'Vivo Y28 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_Y28/Vivo_Vivo_Y28_Perspective.jpg', 'Vivo Y28 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_Y28/Vivo_Vivo_Y28_Side.jpg', 'Vivo Y28 - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Vivo Y18', 'vivo-y18', 'VI034', vivo_id, smartphones_id, budget_phones_id, 40000, 0, 'active', false, 'Budget choice') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_Y18/Vivo_Vivo_Y18_Back.jpg', 'Vivo Y18 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_Y18/Vivo_Vivo_Y18_Front.jpg', 'Vivo Y18 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_Y18/Vivo_Vivo_Y18_Perspective.jpg', 'Vivo Y18 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Vivo_Vivo_Y18/Vivo_Vivo_Y18_Side.jpg', 'Vivo Y18 - Side');

    -- Google
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Google Pixel 9 Pro XL', 'google-pixel-9-pro-xl', 'GO035', google_id, smartphones_id, android_devices_id, 380000, 0, 'active', false, 'AI focus') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Google_Google_Pixel_9_Pro_XL/Google_Google_Pixel_9_Pro_XL_Back.jpg', 'Google Pixel 9 Pro XL - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Google_Google_Pixel_9_Pro_XL/Google_Google_Pixel_9_Pro_XL_Front.jpg', 'Google Pixel 9 Pro XL - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Google_Google_Pixel_9_Pro_XL/Google_Google_Pixel_9_Pro_XL_Perspective.jpg', 'Google Pixel 9 Pro XL - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Google_Google_Pixel_9_Pro_XL/Google_Google_Pixel_9_Pro_XL_Side.jpg', 'Google Pixel 9 Pro XL - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Google Pixel 9', 'google-pixel-9', 'GO036', google_id, smartphones_id, android_devices_id, 310000, 0, 'active', false, 'Tensor G4') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Google_Google_Pixel_9/Google_Google_Pixel_9_Back.jpg', 'Google Pixel 9 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Google_Google_Pixel_9/Google_Google_Pixel_9_Front.jpg', 'Google Pixel 9 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Google_Google_Pixel_9/Google_Google_Pixel_9_Perspective.jpg', 'Google Pixel 9 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Google_Google_Pixel_9/Google_Google_Pixel_9_Side.jpg', 'Google Pixel 9 - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Google Pixel 8a', 'google-pixel-8a', 'GO037', google_id, smartphones_id, android_devices_id, 220000, 0, 'active', false, 'Best budget Android') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Google_Google_Pixel_8a/Google_Google_Pixel_8a_Back.jpg', 'Google Pixel 8a - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Google_Google_Pixel_8a/Google_Google_Pixel_8a_Front.jpg', 'Google Pixel 8a - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Google_Google_Pixel_8a/Google_Google_Pixel_8a_Perspective.jpg', 'Google Pixel 8a - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Google_Google_Pixel_8a/Google_Google_Pixel_8a_Side.jpg', 'Google Pixel 8a - Side');

    -- Oneplus
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('OnePlus 13', 'oneplus-13', 'ON038', oneplus_id, smartphones_id, android_devices_id, 340000, 0, 'active', false, 'Fastest performance') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oneplus_OnePlus_13/Oneplus_OnePlus_13_Back.jpg', 'OnePlus 13 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oneplus_OnePlus_13/Oneplus_OnePlus_13_Front.jpg', 'OnePlus 13 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oneplus_OnePlus_13/Oneplus_OnePlus_13_Perspective.jpg', 'OnePlus 13 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oneplus_OnePlus_13/Oneplus_OnePlus_13_Side.jpg', 'OnePlus 13 - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('OnePlus 12', 'oneplus-12', 'ON039', oneplus_id, smartphones_id, android_devices_id, 290000, 0, 'active', false, 'Flagship killer') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oneplus_OnePlus_12/Oneplus_OnePlus_12_Back.jpg', 'OnePlus 12 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oneplus_OnePlus_12/Oneplus_OnePlus_12_Front.jpg', 'OnePlus 12 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oneplus_OnePlus_12/Oneplus_OnePlus_12_Perspective.jpg', 'OnePlus 12 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oneplus_OnePlus_12/Oneplus_OnePlus_12_Side.jpg', 'OnePlus 12 - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('OnePlus Nord 4', 'oneplus-nord-4', 'ON040', oneplus_id, smartphones_id, android_devices_id, 155000, 0, 'active', false, 'Balanced') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oneplus_OnePlus_Nord_4/Oneplus_OnePlus_Nord_4_Back.jpg', 'OnePlus Nord 4 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oneplus_OnePlus_Nord_4/Oneplus_OnePlus_Nord_4_Front.jpg', 'OnePlus Nord 4 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oneplus_OnePlus_Nord_4/Oneplus_OnePlus_Nord_4_Perspective.jpg', 'OnePlus Nord 4 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Oneplus_OnePlus_Nord_4/Oneplus_OnePlus_Nord_4_Side.jpg', 'OnePlus Nord 4 - Side');

    -- Nothing
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Nothing Phone (3)', 'nothing-phone-3', 'NO041', nothing_id, smartphones_id, android_devices_id, 230000, 0, 'active', false, 'Unique design') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Nothing_Nothing_Phone_%283%29/Nothing_Nothing_Phone_%283%29_Back.jpg', 'Nothing Phone (3) - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Nothing_Nothing_Phone_%283%29/Nothing_Nothing_Phone_%283%29_Front.jpg', 'Nothing Phone (3) - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Nothing_Nothing_Phone_%283%29/Nothing_Nothing_Phone_%283%29_Perspective.jpg', 'Nothing Phone (3) - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Nothing_Nothing_Phone_%283%29/Nothing_Nothing_Phone_%283%29_Side.jpg', 'Nothing Phone (3) - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Nothing Phone (2a)', 'nothing-phone-2a', 'NO042', nothing_id, smartphones_id, android_devices_id, 160000, 0, 'active', false, 'Clean UI') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Nothing_Nothing_Phone_%282a%29/Nothing_Nothing_Phone_%282a%29_Back.jpg', 'Nothing Phone (2a) - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Nothing_Nothing_Phone_%282a%29/Nothing_Nothing_Phone_%282a%29_Front.jpg', 'Nothing Phone (2a) - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Nothing_Nothing_Phone_%282a%29/Nothing_Nothing_Phone_%282a%29_Perspective.jpg', 'Nothing Phone (2a) - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Nothing_Nothing_Phone_%282a%29/Nothing_Nothing_Phone_%282a%29_Side.jpg', 'Nothing Phone (2a) - Side');

    -- Motorola
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Motorola Edge 50 Pro', 'motorola-edge-50-pro', 'MO043', motorola_id, smartphones_id, android_devices_id, 150000, 0, 'active', false, 'Curved display') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Motorola_Motorola_Edge_50_Pro/Motorola_Motorola_Edge_50_Pro_Back.jpg', 'Motorola Edge 50 Pro - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Motorola_Motorola_Edge_50_Pro/Motorola_Motorola_Edge_50_Pro_Front.jpg', 'Motorola Edge 50 Pro - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Motorola_Motorola_Edge_50_Pro/Motorola_Motorola_Edge_50_Pro_Perspective.jpg', 'Motorola Edge 50 Pro - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Motorola_Motorola_Edge_50_Pro/Motorola_Motorola_Edge_50_Pro_Side.jpg', 'Motorola Edge 50 Pro - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Motorola G85', 'motorola-g85', 'MO044', motorola_id, smartphones_id, budget_phones_id, 85000, 0, 'active', false, 'Stock Android') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Motorola_Motorola_G85/Motorola_Motorola_G85_Back.jpg', 'Motorola G85 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Motorola_Motorola_G85/Motorola_Motorola_G85_Front.jpg', 'Motorola G85 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Motorola_Motorola_G85/Motorola_Motorola_G85_Perspective.jpg', 'Motorola G85 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Motorola_Motorola_G85/Motorola_Motorola_G85_Side.jpg', 'Motorola G85 - Side');

    -- Honor
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Honor Magic 7 Pro', 'honor-magic-7-pro', 'HO045', honor_id, smartphones_id, android_devices_id, 360000, 0, 'active', false, 'Pro cameras') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Honor_Honor_Magic_7_Pro/Honor_Honor_Magic_7_Pro_Back.jpg', 'Honor Magic 7 Pro - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Honor_Honor_Magic_7_Pro/Honor_Honor_Magic_7_Pro_Front.jpg', 'Honor Magic 7 Pro - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Honor_Honor_Magic_7_Pro/Honor_Honor_Magic_7_Pro_Perspective.jpg', 'Honor Magic 7 Pro - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Honor_Honor_Magic_7_Pro/Honor_Honor_Magic_7_Pro_Side.jpg', 'Honor Magic 7 Pro - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Honor 200', 'honor-200', 'HO046', honor_id, smartphones_id, android_devices_id, 170000, 0, 'active', false, 'Portraits') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Honor_Honor_200/Honor_Honor_200_Back.jpg', 'Honor 200 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Honor_Honor_200/Honor_Honor_200_Front.jpg', 'Honor 200 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Honor_Honor_200/Honor_Honor_200_Perspective.jpg', 'Honor 200 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Honor_Honor_200/Honor_Honor_200_Side.jpg', 'Honor 200 - Side');

    -- Realme
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Realme 13 Pro+', 'realme-13-pro+', 'RE047', realme_id, smartphones_id, budget_phones_id, 140000, 0, 'active', false, 'High performance') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Realme_Realme_13_Pro%2B/Realme_Realme_13_Pro%2B_Back.jpg', 'Realme 13 Pro+ - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Realme_Realme_13_Pro%2B/Realme_Realme_13_Pro%2B_Front.jpg', 'Realme 13 Pro+ - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Realme_Realme_13_Pro%2B/Realme_Realme_13_Pro%2B_Perspective.jpg', 'Realme 13 Pro+ - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Realme_Realme_13_Pro%2B/Realme_Realme_13_Pro%2B_Side.jpg', 'Realme 13 Pro+ - Side');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Realme C67', 'realme-c67', 'RE048', realme_id, smartphones_id, budget_phones_id, 55000, 0, 'active', false, 'Budget') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Realme_Realme_C67/Realme_Realme_C67_Back.jpg', 'Realme C67 - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Realme_Realme_C67/Realme_Realme_C67_Front.jpg', 'Realme C67 - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Realme_Realme_C67/Realme_Realme_C67_Perspective.jpg', 'Realme C67 - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Realme_Realme_C67/Realme_Realme_C67_Side.jpg', 'Realme C67 - Side');

    -- Tecno
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Tecno Spark 30 Pro', 'tecno-spark-30-pro', 'TE049', tecno_id, smartphones_id, budget_phones_id, 65000, 0, 'active', false, 'Affordable') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Tecno_Tecno_Spark_30_Pro/Tecno_Tecno_Spark_30_Pro_Back.jpg', 'Tecno Spark 30 Pro - Back');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Tecno_Tecno_Spark_30_Pro/Tecno_Tecno_Spark_30_Pro_Front.jpg', 'Tecno Spark 30 Pro - Front');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Tecno_Tecno_Spark_30_Pro/Tecno_Tecno_Spark_30_Pro_Perspective.jpg', 'Tecno Spark 30 Pro - Perspective');
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://rtsufrrkmrzyoloxnhxv.supabase.co/storage/v1/object/public/products/Tecno_Tecno_Spark_30_Pro/Tecno_Tecno_Spark_30_Pro_Side.jpg', 'Tecno Spark 30 Pro - Side');

END $$;
