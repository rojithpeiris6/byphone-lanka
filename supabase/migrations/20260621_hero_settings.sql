-- Insert default hero settings
INSERT INTO public.settings (key, value, description)
VALUES 
    ('homepage_hero', '{"title": "Latest Phones. Best Prices.", "description": "Discover the newest smartphones from top brands at unbeatable prices. 100% original with official warranty.", "image": "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c0378aa7-8161-48b0-bdf0-02bd64dc9528/id-preview-337c86a0--c593d638-2684-4a0d-b57b-762e0c4eaf6c.lovable.app-1780113721935.png"}', 'Controls the main hero banner on the home page')
ON CONFLICT (key) DO NOTHING;