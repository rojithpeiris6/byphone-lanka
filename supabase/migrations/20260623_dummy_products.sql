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
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'iPhone 16 Pro Max');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('iPhone 16 Pro', 'iphone-16-pro', 'AP001', apple_id, smartphones_id, ios_devices_id, 460000, 0, 'active', true, 'A18 Pro, 6.3 inch Display') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'iPhone 16 Pro');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('iPhone 16', 'iphone-16', 'AP002', apple_id, smartphones_id, ios_devices_id, 320000, 0, 'active', true, 'A18, Dual Camera') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'iPhone 16');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('iPhone 16 Plus', 'iphone-16-plus', 'AP003', apple_id, smartphones_id, ios_devices_id, 360000, 0, 'active', true, 'A18, Large Display') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'iPhone 16 Plus');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('iPhone 15 Pro', 'iphone-15-pro', 'AP004', apple_id, smartphones_id, ios_devices_id, 390000, 0, 'active', true, 'A17 Pro, Titanium') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'iPhone 15 Pro');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('iPhone 15', 'iphone-15', 'AP005', apple_id, smartphones_id, ios_devices_id, 270000, 0, 'active', true, 'A16 Bionic') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'iPhone 15');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('iPhone 13', 'iphone-13', 'AP006', apple_id, smartphones_id, ios_devices_id, 210000, 0, 'active', true, 'Reliable performance') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'iPhone 13');

    -- Samsung
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy S25 Ultra', 'galaxy-s25-ultra', 'SA007', samsung_id, smartphones_id, android_devices_id, 495000, 0, 'active', true, 'Snapdragon 8 Gen 4, 200MP') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Galaxy S25 Ultra');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy S25+', 'galaxy-s25+', 'SA008', samsung_id, smartphones_id, android_devices_id, 380000, 0, 'active', true, 'Flagship performance') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Galaxy S25+');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy S24 Ultra', 'galaxy-s24-ultra', 'SA009', samsung_id, smartphones_id, android_devices_id, 410000, 0, 'active', true, 'Snapdragon 8 Gen 3') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Galaxy S24 Ultra');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy A56 5G', 'galaxy-a56-5g', 'SA010', samsung_id, smartphones_id, budget_phones_id, 135000, 0, 'active', false, '120Hz AMOLED') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Galaxy A56 5G');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy A55 5G', 'galaxy-a55-5g', 'SA011', samsung_id, smartphones_id, budget_phones_id, 115000, 0, 'active', false, 'Exynos 1480') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Galaxy A55 5G');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy A36 5G', 'galaxy-a36-5g', 'SA012', samsung_id, smartphones_id, budget_phones_id, 95000, 0, 'active', false, 'Great value 5G') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Galaxy A36 5G');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy A16 5G', 'galaxy-a16-5g', 'SA013', samsung_id, smartphones_id, budget_phones_id, 65000, 0, 'active', false, 'Reliable budget 5G') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Galaxy A16 5G');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Galaxy A06', 'galaxy-a06', 'SA014', samsung_id, smartphones_id, budget_phones_id, 45000, 0, 'active', false, 'Entry level') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Galaxy A06');

    -- Xiaomi
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Xiaomi 15 Pro', 'xiaomi-15-pro', 'XI015', xiaomi_id, smartphones_id, android_devices_id, 370000, 0, 'active', false, 'Leica optics, 8 Gen 4') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Xiaomi 15 Pro');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Xiaomi 14', 'xiaomi-14', 'XI016', xiaomi_id, smartphones_id, android_devices_id, 310000, 0, 'active', false, 'Compact flagship') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Xiaomi 14');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Redmi Note 14 Pro+', 'redmi-note-14-pro+', 'XI017', xiaomi_id, smartphones_id, budget_phones_id, 110000, 0, 'active', false, 'High resolution screen') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Redmi Note 14 Pro+');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Redmi Note 13 Pro', 'redmi-note-13-pro', 'XI018', xiaomi_id, smartphones_id, budget_phones_id, 95000, 0, 'active', false, '200MP camera') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Redmi Note 13 Pro');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Redmi Note 13', 'redmi-note-13', 'XI019', xiaomi_id, smartphones_id, budget_phones_id, 75000, 0, 'active', false, 'AMOLED, 120Hz') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Redmi Note 13');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Poco X7 Pro', 'poco-x7-pro', 'XI020', xiaomi_id, smartphones_id, budget_phones_id, 125000, 0, 'active', false, 'Performance beast') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Poco X7 Pro');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Poco M6 Pro', 'poco-m6-pro', 'XI021', xiaomi_id, smartphones_id, budget_phones_id, 65000, 0, 'active', false, 'Value for money') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Poco M6 Pro');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Redmi 14C', 'redmi-14c', 'XI022', xiaomi_id, smartphones_id, budget_phones_id, 40000, 0, 'active', false, 'Basic smartphone') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Redmi 14C');

    -- Oppo
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Oppo Find X8 Pro', 'oppo-find-x8-pro', 'OP023', oppo_id, smartphones_id, android_devices_id, 390000, 0, 'active', false, 'Hasselblad Camera') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Oppo Find X8 Pro');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Oppo Reno 13 Pro', 'oppo-reno-13-pro', 'OP024', oppo_id, smartphones_id, android_devices_id, 160000, 0, 'active', false, 'Portrait expert') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Oppo Reno 13 Pro');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Oppo Reno 12 F', 'oppo-reno-12-f', 'OP025', oppo_id, smartphones_id, android_devices_id, 125000, 0, 'active', false, 'Sleek design') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Oppo Reno 12 F');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Oppo A78', 'oppo-a78', 'OP026', oppo_id, smartphones_id, budget_phones_id, 85000, 0, 'active', false, 'Fast charging') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Oppo A78');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Oppo A60', 'oppo-a60', 'OP027', oppo_id, smartphones_id, budget_phones_id, 65000, 0, 'active', false, 'Durable') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Oppo A60');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Oppo A58', 'oppo-a58', 'OP028', oppo_id, smartphones_id, budget_phones_id, 55000, 0, 'active', false, 'Entry level') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Oppo A58');

    -- Vivo
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Vivo X200 Pro', 'vivo-x200-pro', 'VI029', vivo_id, smartphones_id, android_devices_id, 400000, 0, 'active', false, 'ZEISS optics') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Vivo X200 Pro');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Vivo V40', 'vivo-v40', 'VI030', vivo_id, smartphones_id, android_devices_id, 145000, 0, 'active', false, 'Portrait focus') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Vivo V40');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Vivo V30', 'vivo-v30', 'VI031', vivo_id, smartphones_id, android_devices_id, 120000, 0, 'active', false, 'Slim design') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Vivo V30');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Vivo Y38 5G', 'vivo-y38-5g', 'VI032', vivo_id, smartphones_id, budget_phones_id, 80000, 0, 'active', false, 'Large battery') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Vivo Y38 5G');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Vivo Y28', 'vivo-y28', 'VI033', vivo_id, smartphones_id, budget_phones_id, 60000, 0, 'active', false, '5G budget') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Vivo Y28');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Vivo Y18', 'vivo-y18', 'VI034', vivo_id, smartphones_id, budget_phones_id, 40000, 0, 'active', false, 'Budget choice') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Vivo Y18');

    -- Google
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Google Pixel 9 Pro XL', 'google-pixel-9-pro-xl', 'GO035', google_id, smartphones_id, android_devices_id, 380000, 0, 'active', false, 'AI focus') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Google Pixel 9 Pro XL');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Google Pixel 9', 'google-pixel-9', 'GO036', google_id, smartphones_id, android_devices_id, 310000, 0, 'active', false, 'Tensor G4') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Google Pixel 9');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Google Pixel 8a', 'google-pixel-8a', 'GO037', google_id, smartphones_id, android_devices_id, 220000, 0, 'active', false, 'Best budget Android') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Google Pixel 8a');

    -- Oneplus
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('OnePlus 13', 'oneplus-13', 'ON038', oneplus_id, smartphones_id, android_devices_id, 340000, 0, 'active', false, 'Fastest performance') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'OnePlus 13');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('OnePlus 12', 'oneplus-12', 'ON039', oneplus_id, smartphones_id, android_devices_id, 290000, 0, 'active', false, 'Flagship killer') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'OnePlus 12');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('OnePlus Nord 4', 'oneplus-nord-4', 'ON040', oneplus_id, smartphones_id, android_devices_id, 155000, 0, 'active', false, 'Balanced') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'OnePlus Nord 4');

    -- Nothing
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Nothing Phone (3)', 'nothing-phone-3', 'NO041', nothing_id, smartphones_id, android_devices_id, 230000, 0, 'active', false, 'Unique design') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Nothing Phone (3)');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Nothing Phone (2a)', 'nothing-phone-2a', 'NO042', nothing_id, smartphones_id, android_devices_id, 160000, 0, 'active', false, 'Clean UI') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Nothing Phone (2a)');

    -- Motorola
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Motorola Edge 50 Pro', 'motorola-edge-50-pro', 'MO043', motorola_id, smartphones_id, android_devices_id, 150000, 0, 'active', false, 'Curved display') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Motorola Edge 50 Pro');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Motorola G85', 'motorola-g85', 'MO044', motorola_id, smartphones_id, budget_phones_id, 85000, 0, 'active', false, 'Stock Android') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Motorola G85');

    -- Honor
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Honor Magic 7 Pro', 'honor-magic-7-pro', 'HO045', honor_id, smartphones_id, android_devices_id, 360000, 0, 'active', false, 'Pro cameras') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Honor Magic 7 Pro');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Honor 200', 'honor-200', 'HO046', honor_id, smartphones_id, android_devices_id, 170000, 0, 'active', false, 'Portraits') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Honor 200');

    -- Realme
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Realme 13 Pro+', 'realme-13-pro+', 'RE047', realme_id, smartphones_id, budget_phones_id, 140000, 0, 'active', false, 'High performance') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Realme 13 Pro+');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Realme C67', 'realme-c67', 'RE048', realme_id, smartphones_id, budget_phones_id, 55000, 0, 'active', false, 'Budget') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Realme C67');

    -- Tecno
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Tecno Spark 30 Pro', 'tecno-spark-30-pro', 'TE049', tecno_id, smartphones_id, budget_phones_id, 65000, 0, 'active', false, 'Affordable') RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935133d11?auto=format&fit=crop&w=800&h=800&q=80', 'Tecno Spark 30 Pro');

END $$;
