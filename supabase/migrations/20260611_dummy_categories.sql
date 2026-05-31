-- Disable triggers to avoid issues with automated timestamps if any exist
SET session_replication_role = 'replica';

-- Clear existing categories to avoid duplicates during testing
DELETE FROM public.categories;

-- 1. Create Parent Categories first
INSERT INTO public.categories (name, slug, description, image, sort_order, status) VALUES
('Smartphones', 'smartphones', 'The latest flagship and mid-range mobile phones from top brands.', 'https://images.unsplash.com/photo-1511707171634-5f8//9ca44fca?q=80&w=800&auto=format&fit=crop', 1, 'active'),
('Tablets', 'tablets', 'Powerful tablets for productivity, creativity, and entertainment.', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop', 2, 'active'),
('Smartwatches', 'smartwatches', 'Stay connected and track your health with the latest wearables.', 'https://images.unsplash.com/photo-1544117518-30dd56753893?q=80&w=800&auto=format&fit=crop', 3, 'active'),
('Audio & Earbuds', 'audio-earbuds', 'Premium sound experiences with TWS and noise-cancelling headphones.', 'https://images.unsplash.com/photo-1505740420928-5e56471497c8?q=80&w=800&auto=format&fit=crop', 4, 'active'),
('Accessories', 'accessories', 'Essential add-ons including cases, chargers, and screen protectors.', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop', 5, 'active'),
('Gaming Gear', 'gaming-gear', 'High-performance devices and accessories for the ultimate gaming experience.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop', 6, 'active'),
('Pre-Owned', 'pre-owned', 'Certified refurbished devices with warranty and quality checks.', 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800&auto=format&fit=crop', 7, 'active');

-- 2. Create Sub-Categories (Referencing parent IDs)
-- We use a subquery to get the parent_id for each category to ensure consistency
DO $$ 
DECLARE 
    smartphone_id UUID := (SELECT id FROM public.categories WHERE slug = 'smartphones');
    tablet_id UUID := (SELECT id FROM public.categories WHERE slug = 'tablets');
    audio_id UUID := (SELECT id FROM public.categories WHERE slug = 'audio-earbuds');
    acc_id UUID := (SELECT id FROM public.categories WHERE slug = 'accessories');
BEGIN
    -- Smartphones sub-cats
    INSERT INTO public.categories (name, slug, parent_id, sort_order, status) VALUES
    ('iOS Devices', 'ios-devices', smartphone_id, 1, 'active'),
    ('Android Devices', 'android-devices', smartphone_id, 2, 'active'),
    ('Budget Phones', 'budget-phones', smartphone_id, 3, 'active');

    -- Tablets sub-cats
    INSERT INTO public.categories (name, slug, parent_id, sort_order, status) VALUES
    ('iPads', 'ipads', tablet_id, 1, 'active'),
    ('Android Tablets', 'android-tablets', tablet_id, 2, 'active');

    -- Audio sub-cats
    INSERT INTO public.categories (name, slug, parent_id, sort_order, status) VALUES
    ('TWS Earbuds', 'tws-earbuds', audio_id, 1, 'active'),
    ('Over-Ear Headphones', 'over-ear-headphones', audio_id, 2, 'active'),
    ('Earphones', 'earphones', audio_id, 3, 'active');

    -- Accessories sub-cats
    INSERT INTO public.categories (name, slug, parent_id, sort_order, status) VALUES
    ('Phone Cases', 'phone-cases', acc_id, 1, 'active'),
    ('Chargers & Cables', 'chargers-cables', acc_id, 2, 'active'),
    ('Power Banks', 'power-banks', acc_id, 3, 'active'),
    ('Screen Protectors', 'screen-protectors', acc_id, 4, 'active');
END $$;

-- Reset session replication role
SET session_replication_role = 'origin';