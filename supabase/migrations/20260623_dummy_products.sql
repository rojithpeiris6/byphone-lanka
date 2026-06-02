-- Dummy data for Products covering each category and brand with approximate Sri Lanka prices (LKR)
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

    -- Parent Categories
    smartphones_id UUID := (SELECT id FROM public.categories WHERE slug = 'smartphones');
    tablets_id UUID := (SELECT id FROM public.categories WHERE slug = 'tablets');
    smartwatches_id UUID := (SELECT id FROM public.categories WHERE slug = 'smartwatches');
    audio_id UUID := (SELECT id FROM public.categories WHERE slug = 'audio-earbuds');
    acc_id UUID := (SELECT id FROM public.categories WHERE slug = 'accessories');
    gaming_id UUID := (SELECT id FROM public.categories WHERE slug = 'gaming-gear');
    pre_owned_id UUID := (SELECT id FROM public.categories WHERE slug = 'pre-owned');

    -- Sub-categories
    ios_devices_id UUID := (SELECT id FROM public.categories WHERE slug = 'ios-devices');
    android_devices_id UUID := (SELECT id FROM public.categories WHERE slug = 'android-devices');
    budget_phones_id UUID := (SELECT id FROM public.categories WHERE slug = 'budget-phones');
    ipads_id UUID := (SELECT id FROM public.categories WHERE slug = 'ipads');
    android_tablets_id UUID := (SELECT id FROM public.categories WHERE slug = 'android-tablets');
    tws_id UUID := (SELECT id FROM public.categories WHERE slug = 'tws-earbuds');
    chargers_id UUID := (SELECT id FROM public.categories WHERE slug = 'chargers-cables');

    -- Product variables
    p_id UUID;
BEGIN
    -- Clear existing products to avoid duplicates during seeding
    DELETE FROM public.products;
    DELETE FROM public.product_images;

    -----------------------------------------
    -- 1. SMARTPHONES
    -----------------------------------------
    -- Apple
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('iPhone 15 Pro Max (256GB)', 'iphone-15-pro-max-256', 'IP15PM-256', apple_id, smartphones_id, ios_devices_id, 440000.00, 20, 'active', true, 'The ultimate iPhone with Titanium frame and A17 Pro chip.')
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80', 'iPhone 15 Pro Max');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('iPhone 15 (128GB)', 'iphone-15-128', 'IP15-128', apple_id, smartphones_id, ios_devices_id, 285000.00, 35, 'active', false, 'Dynamic Island and 48MP main camera in a sleek design.')
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', 'iPhone 15');

    -- Samsung
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Samsung Galaxy S24 Ultra (512GB)', 'samsung-galaxy-s24-ultra-512', 'SGS24U-512', samsung_id, smartphones_id, android_devices_id, 410000.00, 15, 'active', true, 'Galaxy AI, Titanium frame, and a built-in S-Pen.')
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1610945265064-785673784867?auto=format&fit=crop&w=800&q=80', 'Samsung Galaxy S24 Ultra');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Samsung Galaxy A54 5G', 'samsung-galaxy-a54', 'SGA54-256', samsung_id, smartphones_id, budget_phones_id, 115000.00, 50, 'active', false, 'Awesome screen, awesome camera, long-lasting battery.')
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1533228100845-08145b01de14?auto=format&fit=crop&w=800&q=80', 'Samsung Galaxy A54');

    -- Xiaomi
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Xiaomi 14 Ultra', 'xiaomi-14-ultra', 'MI14U-512', xiaomi_id, smartphones_id, android_devices_id, 350000.00, 10, 'active', true, 'Leica optics, Snapdragon 8 Gen 3.')
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935197726?auto=format&fit=crop&w=800&q=80', 'Xiaomi 14 Ultra');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Redmi Note 13 Pro+ 5G', 'redmi-note-13-pro-plus', 'RN13PP-256', xiaomi_id, smartphones_id, budget_phones_id, 125000.00, 60, 'active', false, '200MP OIS camera, 120Hz curved AMOLED.')
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=800&q=80', 'Redmi Note 13 Pro+');

    -- OnePlus
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('OnePlus 12 (16GB/512GB)', 'oneplus-12', 'OP12-512', oneplus_id, smartphones_id, android_devices_id, 290000.00, 20, 'active', true, 'Smooth Beyond Belief. Hasselblad Camera for Mobile.')
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&w=800&q=80', 'OnePlus 12');

    -- Nothing
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Nothing Phone (2) (256GB)', 'nothing-phone-2', 'NP2-256', nothing_id, smartphones_id, android_devices_id, 230000.00, 30, 'active', false, 'Come to the bright side. New Glyph Interface.')
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1690299863832-72bc61e5f8cc?auto=format&fit=crop&w=800&q=80', 'Nothing Phone 2');

    -- Google
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Google Pixel 8 Pro (256GB)', 'google-pixel-8-pro', 'GP8P-256', google_id, smartphones_id, android_devices_id, 320000.00, 15, 'active', true, 'The all-pro Google phone, powered by Google Tensor G3.')
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1612442449764-a6c3f350c388?auto=format&fit=crop&w=800&q=80', 'Google Pixel 8 Pro');

    -- Honor
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Honor Magic 6 Pro', 'honor-magic-6-pro', 'HM6P-512', honor_id, smartphones_id, android_devices_id, 310000.00, 12, 'active', false, 'Discover the Magic. Excellent camera system.')
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1598327105666-5b8935197726?auto=format&fit=crop&w=800&q=80', 'Honor Magic 6 Pro');

    -- Vivo
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Vivo X100 Pro', 'vivo-x100-pro', 'VX100P-256', vivo_id, smartphones_id, android_devices_id, 315000.00, 10, 'active', false, 'Zeiss Co-engineered Imaging System.')
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', 'Vivo X100 Pro');

    -- Oppo
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Oppo Find X7 Ultra', 'oppo-find-x7-ultra', 'OFX7U-256', oppo_id, smartphones_id, android_devices_id, 340000.00, 8, 'active', true, 'Master every scene with Hasselblad Camera.')
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=800&q=80', 'Oppo Find X7 Ultra');


    -----------------------------------------
    -- 2. TABLETS
    -----------------------------------------
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured) VALUES
    ('iPad Pro 11-inch (M4, 256GB)', 'ipad-pro-11-m4', 'IPADPM4-11-256', apple_id, tablets_id, ipads_id, 410000.00, 15, 'active', true)
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', 'iPad Pro 11-inch');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured) VALUES
    ('Samsung Galaxy Tab S9 (128GB)', 'samsung-galaxy-tab-s9', 'SGTABS9-128', samsung_id, tablets_id, android_tablets_id, 280000.00, 18, 'active', false)
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1589739900241-755fbe77c87b?auto=format&fit=crop&w=800&q=80', 'Samsung Galaxy Tab S9');


    -----------------------------------------
    -- 3. SMARTWATCHES
    -----------------------------------------
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, price, stock_quantity, status, featured) VALUES
    ('Apple Watch Series 9 (45mm)', 'apple-watch-series-9-45mm', 'AWS9-45', apple_id, smartwatches_id, 155000.00, 25, 'active', true)
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80', 'Apple Watch Series 9');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, price, stock_quantity, status, featured) VALUES
    ('Samsung Galaxy Watch 6 Classic', 'samsung-galaxy-watch-6-classic', 'SGW6C-47', samsung_id, smartwatches_id, 120000.00, 30, 'active', false)
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80', 'Samsung Galaxy Watch 6');


    -----------------------------------------
    -- 4. AUDIO & EARBUDS
    -----------------------------------------
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured) VALUES
    ('AirPods Pro (2nd Gen) with USB-C', 'airpods-pro-2-usbc', 'APP2-USBC', apple_id, audio_id, tws_id, 82000.00, 45, 'active', true)
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80', 'AirPods Pro');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured) VALUES
    ('Samsung Galaxy Buds 2 Pro', 'samsung-galaxy-buds-2-pro', 'SGB2P-B', samsung_id, audio_id, tws_id, 60000.00, 40, 'active', false)
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1590658268037-6bf127f0d692?auto=format&fit=crop&w=800&q=80', 'Galaxy Buds 2 Pro');


    -----------------------------------------
    -- 5. ACCESSORIES
    -----------------------------------------
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured) VALUES
    ('Apple 20W USB-C Power Adapter', 'apple-20w-adapter', 'A20W-ADAPT', apple_id, acc_id, chargers_id, 8500.00, 100, 'active', false)
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1583863779285-3737676ed25b?auto=format&fit=crop&w=800&q=80', 'Apple 20W Adapter');

    INSERT INTO public.products (name, slug, sku, brand_id, category_id, sub_category_id, price, stock_quantity, status, featured) VALUES
    ('Samsung 25W Power Adapter', 'samsung-25w-adapter', 'S25W-ADAPT', samsung_id, acc_id, chargers_id, 6500.00, 150, 'active', false)
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1612815154858-60aa4f740731?auto=format&fit=crop&w=800&q=80', 'Samsung 25W Adapter');


    -----------------------------------------
    -- 6. GAMING GEAR
    -----------------------------------------
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, price, stock_quantity, status, featured) VALUES
    ('Xiaomi Black Shark FunCooler 3 Pro', 'black-shark-funcooler-3', 'BSFC3P', xiaomi_id, gaming_id, 14500.00, 30, 'active', false)
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', 'Gaming Cooler');


    -----------------------------------------
    -- 7. PRE-OWNED
    -----------------------------------------
    INSERT INTO public.products (name, slug, sku, brand_id, category_id, price, stock_quantity, status, featured, short_description) VALUES
    ('Pre-Owned iPhone 13 (128GB) - Excellent', 'pre-owned-iphone-13-128', 'PO-IP13-128', apple_id, pre_owned_id, 160000.00, 10, 'active', false, 'Fully tested and refurbished. Includes 3-month warranty.')
    RETURNING id INTO p_id;
    INSERT INTO public.product_images (product_id, url, alt) VALUES 
    (p_id, 'https://images.unsplash.com/photo-1510557880182-3672f97ec671?auto=format&fit=crop&w=800&q=80', 'Pre-Owned iPhone 13');

END $$;
