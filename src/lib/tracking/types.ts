export const DEFAULT_CURRENCY = "LKR" as const;
export type CurrencyCode = typeof DEFAULT_CURRENCY;
export type TrackingItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_variant?: string;
  item_variant_id?: string;
  item_brand?: string;
  item_category?: string;
  item_list_name?: string;
  item_list_id?: string;
  discount?: number;
};
export type EcommerceData = {
  currency: CurrencyCode;
  value: number;
  items: TrackingItem[];
  transaction_id?: string;
  shipping?: number;
  coupon?: string;
};
export type EcommerceEventName = "view_item" | "add_to_cart" | "begin_checkout" | "purchase";
export type VirtualPageViewPayload = {
  event: "virtual_page_view";
  page_path: string;
  page_location: string;
  page_title: string;
  page_referrer?: string;
};
export type TrackingPayload =
  | VirtualPageViewPayload
  | { event: EcommerceEventName; ecommerce: EcommerceData }
  | { event: "search"; search_term: string }
  | Record<string, unknown>;
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}
