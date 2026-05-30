import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type AdminProduct = {
  id: string;
  brand: string;
  name: string;
  price: number;
  old_price: number | null;
  rating: number;
  reviews: number;
  image_url: string;
  category: string;
  badge: string | null;
  stock: number;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  district: string;
  postal_code: string;
  payment_method: string;
  delivery_method: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_brand: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type AdminSetting = {
  id: string;
  key: string;
  value: string;
  updated_at: string;
};
