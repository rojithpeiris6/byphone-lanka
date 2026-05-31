-- Disable triggers to avoid issues with automated timestamps if any exist
SET session_replication_role = 'replica';

-- Clear existing categories to avoid duplicates during testing
DELETE FROM public.categories;

-- 1. Create Parent Categories with clean, verified URLs
INSERT INTO public.categories (name, slug, description, image, sort_order, status) VALUES
('Smartphones', 'smartphones', 'The latest flagship and mid-range mobile phones from top brands.', 'https://images.unsplash.com/photo-1598327105666-5b8935197726?auto=format&fit=crop&w=800&q=80', 1, 'active'),
('Tablets', 'tablets', 'Powerful tablets for productivity, creativity, and entertainment.', 'https://images.unsplash.com/photo-1561154417-15962d77181b?auto=format&fit=crop&w=800&q=80', 2, 'active'),
('Smartwatches', 'smartwatches', 'Stay connected and track your health with the latest wearables.', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80', 3, 'active'),
('Audio & Earbuds', 'audio-earbuds', 'Premium sound experiences with TWS and noise-cancelling headphones.', 'https://images.unsplash.com/photo-1505740420928-5e56471497c8?auto=format&fit=crop&w=800&q=80', 4, 'active'),
('Accessories', 'accessories', 'Essential add-ons including cases, chargers, and screen protectors.', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80', 5, 'active'),
('Gaming Gear', 'gaming-gear', 'High-performance devices and accessories for the ultimate gaming experience.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', 6, 'active'),
('Pre-Owned', 'pre-owned', 'Certified refurbished devices with warranty and quality checks.', 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80', 7, 'active');

-- 2. Create Sub-Categories with clean, verified URLs
DO $$ 
DECLARE 
    smartphone_id UUID := (SELECT id FROM public.categories WHERE slug = 'smartphones');
    tablet_id UUID := (SELECT id FROM public.categories WHERE slug = 'tablets');
    audio_id UUID := (SELECT id FROM public.categories WHERE slug = 'audio-earbuds');
    acc_id UUID := (SELECT id FROM public.categories WHERE slug = 'accessories');
BEGIN
    -- Smartphones sub-cats
    INSERT INTO public.categories (name, slug, parent_id, image, sort_order, status) VALUES
    ('iOS Devices', 'ios-devices', smartphone_id, 'https://images.unsplash.com/photo-1510557880182-3672f97ec671?auto=format&fit=crop&w=800&q=80', 1, 'active'),
    ('Android Devices', 'android-devices', smartphone_id, 'https://images.unsplash.com/photo-1610945265064-785673784867?auto=format&fit=crop&w=800&q=80', 2, 'active'),
    ('Budget Phones', 'budget-phones', smartphone_id, 'https://images.unsplash.com/photo-1565849906451-75c5f7676622?auto=format&fit=crop&w=800&q=80', 3, 'active');

    -- Tablets sub-cats
    INSERT INTO public.categories (name, slug, parent_id, image, sort_order, status) VALUES
    ('iPads', 'ipads', tablet_id, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', 1, 'active'),
    ('Android Tablets', 'android-tablets', tablet_id, 'https://images.unsplash.com/photo-1589739900241-755fbe77c87b?auto=format&fit=crop&w=800&q=80', 2, 'active');

    -- Audio sub-cats
    INSERT INTO public.categories (name, slug, parent_id, image, sort_order, status) VALUES
    ('TWS Earbuds', 'tws-earbuds', audio_id, 'https://images.unsplash.com/photo-1590658268037-6bf127f0d692?auto=format&fit=crop&w=800&q=80', 1, 'active'),
    ('Over-Ear Headphones', 'over-ear-headphones', audio_id, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80', 2, 'active'),
    ('Earphones', 'earphones', audio_id, 'https://images.unsplash.com/photo-1577212033957-6ed667660095?auto=format&fit=crop&w=800&q=80', 3, 'active');

    -- Accessories sub-cats
    INSERT INTO public.categories (name, slug, parent_id, image, sort_order, status) VALUES
    ('Phone Cases', 'phone-cases', acc_id, 'https://images.unsplash.com/photo-1603313011101-37ca37c365f7?auto=format&fit=crop&w=800&q=80', 1, 'active'),
    ('Chargers & Cables', 'chargers-cables', acc_id, 'https://images.unsplash.com/photo-1583863779285-3737676ed25b?auto=format&fit=crop&w=800&q=80', 2, 'active'),
    ('Power Banks', 'power-banks', acc_id, 'https://images.unsplash.com/photo-1609091839311-d5368195571b?auto=format&fit=crop&w=800&q=80', 3, 'active'),
    ('Screen Protectors', 'screen-protectors', acc_id, 'https://images.unsplash.com/photo-1612815154858-60aa4f740731?auto=format&fit=crop&w=800&q=80', 4, 'active');
END $$;

-- Reset session replication role
SET session_replication_role = 'origin';