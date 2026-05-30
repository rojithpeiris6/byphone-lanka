/*
  # Create Admin Panel Schema

  ## Overview
  This migration creates the full schema needed for the byphone.lk admin panel.

  ## New Tables

  ### 1. `admin_products`
  - Mirrors the static product catalog in the database
  - Fields: id, brand, name, price, old_price, rating, reviews, image_url, category, badge, stock, is_active
  - Enables CRUD from admin panel

  ### 2. `admin_orders`
  - Stores customer orders placed via checkout
  - Fields: id, order_number, customer_name, customer_email, customer_phone, address, city, district, postal_code, payment_method, delivery_method, subtotal, delivery_fee, total, status, notes, created_at, updated_at

  ### 3. `admin_order_items`
  - Line items for each order
  - Fields: id, order_id (FK), product_id, product_name, product_brand, quantity, unit_price, total_price

  ### 4. `admin_settings`
  - Key-value store for site configuration
  - Fields: id, key (unique), value, updated_at

  ## Security
  - RLS enabled on all tables
  - Policies restrict access to authenticated users only (admin auth)
  - Public read on products is allowed for storefront use
*/

-- =====================
-- PRODUCTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS admin_products (
  id text PRIMARY KEY,
  brand text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  price integer NOT NULL DEFAULT 0,
  old_price integer,
  rating numeric(3,1) NOT NULL DEFAULT 0,
  reviews integer NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  badge text,
  stock integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  storage_options text[],
  highlights text[],
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read products"
  ON admin_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON admin_products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON admin_products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON admin_products FOR DELETE
  TO authenticated
  USING (true);

-- Public can read active products (for storefront)
CREATE POLICY "Public can read active products"
  ON admin_products FOR SELECT
  TO anon
  USING (is_active = true);

-- =====================
-- ORDERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS admin_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('ORD-' || upper(substring(gen_random_uuid()::text, 1, 8))),
  customer_name text NOT NULL DEFAULT '',
  customer_email text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  payment_method text NOT NULL DEFAULT 'cod',
  delivery_method text NOT NULL DEFAULT 'std',
  subtotal integer NOT NULL DEFAULT 0,
  delivery_fee integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read orders"
  ON admin_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert orders"
  ON admin_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
  ON admin_orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public can insert orders (customers placing orders)
CREATE POLICY "Public can insert orders"
  ON admin_orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- =====================
-- ORDER ITEMS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS admin_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES admin_orders(id) ON DELETE CASCADE,
  product_id text NOT NULL DEFAULT '',
  product_name text NOT NULL DEFAULT '',
  product_brand text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  unit_price integer NOT NULL DEFAULT 0,
  total_price integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read order items"
  ON admin_order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert order items"
  ON admin_order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Public can insert order items (customers placing orders)
CREATE POLICY "Public can insert order items"
  ON admin_order_items FOR INSERT
  TO anon
  WITH CHECK (true);

-- =====================
-- SETTINGS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settings"
  ON admin_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert settings"
  ON admin_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update settings"
  ON admin_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================
-- SEED DEFAULT SETTINGS
-- =====================
INSERT INTO admin_settings (key, value) VALUES
  ('store_name', 'byphone.lk'),
  ('store_email', 'support@byphone.lk'),
  ('store_phone', '011 2 123 456'),
  ('free_shipping_threshold', '50000'),
  ('express_delivery_fee', '490'),
  ('announcement_text', 'FREE DELIVERY ISLANDWIDE · 100% ORIGINAL PRODUCTS · EASY RETURNS')
ON CONFLICT (key) DO NOTHING;

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_admin_orders_status ON admin_orders(status);
CREATE INDEX IF NOT EXISTS idx_admin_orders_created_at ON admin_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_order_items_order_id ON admin_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_admin_products_category ON admin_products(category);
CREATE INDEX IF NOT EXISTS idx_admin_products_is_active ON admin_products(is_active);
