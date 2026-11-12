/**
 * Buyphone.lk Centralized Tracking Types
 * Framework: TanStack Start / TanStack Router + Google Tag Manager
 * Currency: LKR (Default)
 * Canonical Product ID: Supabase products.id (UUID)
 */

export const DEFAULT_CURRENCY = "LKR" as const;
export type CurrencyCode = typeof DEFAULT_CURRENCY;

/**
 * Canonical product item structure for future e-commerce tracking (GA4 / Meta / TikTok).
 * PII (customer email, phone, name, address) is strictly prohibited.
 */
export type TrackingItem = {
  item_id: string; // Canonical Supabase products.id (UUID)
  item_variant_id?: string; // Optional Supabase product_variants.id (UUID)
  item_name: string;
  item_brand?: string;
  item_category?: string;
  price: number;
  quantity?: number;
  item_list_name?: string;
  item_list_id?: string;
  discount?: number;
};

/**
 * Payload for virtual_page_view on SPA transitions
 */
export type VirtualPageViewPayload = {
  event: "virtual_page_view";
  page_path: string;
  page_location: string;
  page_title: string;
};

/**
 * Future e-commerce event types (Stages 2-4 extensibility)
 */
export type ViewItemPayload = {
  event: "view_item";
  currency: CurrencyCode;
  value: number;
  items: TrackingItem[];
};

export type ViewItemListPayload = {
  event: "view_item_list";
  item_list_id?: string;
  item_list_name?: string;
  items: TrackingItem[];
};

export type SelectItemPayload = {
  event: "select_item";
  item_list_id?: string;
  item_list_name?: string;
  items: TrackingItem[];
};

export type AddToCartPayload = {
  event: "add_to_cart";
  currency: CurrencyCode;
  value: number;
  items: TrackingItem[];
};

export type RemoveFromCartPayload = {
  event: "remove_from_cart";
  currency: CurrencyCode;
  value: number;
  items: TrackingItem[];
};

export type ViewCartPayload = {
  event: "view_cart";
  currency: CurrencyCode;
  value: number;
  items: TrackingItem[];
};

export type BeginCheckoutPayload = {
  event: "begin_checkout";
  currency: CurrencyCode;
  value: number;
  coupon?: string;
  items: TrackingItem[];
};

export type PurchasePayload = {
  event: "purchase";
  currency: CurrencyCode;
  transaction_id: string; // BP-XXXXX-XXXX order number
  value: number;
  shipping?: number;
  coupon?: string;
  items: TrackingItem[];
};

export type SearchPayload = {
  event: "search";
  search_term: string;
};

export type TrackingPayload =
  | VirtualPageViewPayload
  | ViewItemPayload
  | ViewItemListPayload
  | SelectItemPayload
  | AddToCartPayload
  | RemoveFromCartPayload
  | ViewCartPayload
  | BeginCheckoutPayload
  | PurchasePayload
  | SearchPayload
  | Record<string, unknown>;

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

