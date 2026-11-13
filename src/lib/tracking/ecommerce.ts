import { pushDataLayer } from "./dataLayer";
import { getTrackingConsent } from "./consent";
import type { TrackingItem, EcommerceData, EcommerceEventName } from "./types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type ProductForTracking = {
  id: string;
  name: string;
  price: number;
  brand?: string;
  category?: string;
};
type VariantForTracking = {
  id?: string;
  storage?: string | null;
  color?: string | null;
  ram?: string | null;
  network?: string | null;
  model?: string | null;
};

export function trackingItem(
  product: ProductForTracking,
  quantity = 1,
  price = product.price,
  variant?: VariantForTracking,
): TrackingItem {
  return {
    item_id: product.id,
    item_name: product.name,
    item_brand: product.brand,
    item_category: product.category,
    price: Number(price),
    quantity,
    ...(variant
      ? {
          item_variant: [
            variant.storage,
            variant.color,
            variant.ram,
            variant.network,
            variant.model,
          ]
            .filter(Boolean)
            .join(" / "),
          item_variant_id: variant.id,
        }
      : {}),
  };
}

export function validTrackingItems(items: TrackingItem[]): boolean {
  return (
    items.length > 0 &&
    items.every(
      (item) =>
        UUID.test(item.item_id) &&
        typeof item.item_name === "string" &&
        item.item_name.length > 0 &&
        Number.isFinite(item.price) &&
        item.price >= 0 &&
        Number.isInteger(item.quantity) &&
        (item.quantity ?? 0) > 0,
    )
  );
}

/** Value excludes shipping/tax and is calculated from the exact item prices. */
export function ecommerceData(
  items: TrackingItem[],
  extras: Pick<EcommerceData, "transaction_id" | "shipping" | "coupon"> = {},
): EcommerceData | null {
  if (!validTrackingItems(items)) return null;
  if (extras.shipping !== undefined && (!Number.isFinite(extras.shipping) || extras.shipping < 0))
    return null;
  return {
    currency: "LKR",
    value:
      Math.round(items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0) * 100) /
      100,
    items,
    ...extras,
  };
}

export function trackEcommerce(
  event: EcommerceEventName,
  items: TrackingItem[],
  extras: Pick<EcommerceData, "transaction_id" | "shipping" | "coupon"> = {},
): boolean {
  const consent = getTrackingConsent();
  if (!consent.analytics && !consent.marketing) return false;
  const ecommerce = ecommerceData(items, extras);
  if (!ecommerce || (event === "purchase" && !extras.transaction_id)) return false;
  pushDataLayer({ ecommerce: null });
  pushDataLayer({ event, ecommerce });
  return true;
}

export function trackSearch(searchTerm: string): void {
  const consent = getTrackingConsent();
  if (!consent.analytics && !consent.marketing) return;
  pushDataLayer({ ecommerce: null });
  pushDataLayer({ event: "search", search_term: searchTerm.trim().slice(0, 100) });
}

const sentPurchases = new Set<string>();
export function trackPurchaseOnce(ecommerce: EcommerceData): boolean {
  const id = ecommerce.transaction_id;
  if (!id || sentPurchases.has(id)) return false;
  const key = "buyphone:tracked-purchase:" + id;
  try {
    if (localStorage.getItem(key)) return false;
  } catch {
    /* Use memory if storage is unavailable. */
  }
  if (
    !trackEcommerce("purchase", ecommerce.items, {
      transaction_id: id,
      shipping: ecommerce.shipping,
      coupon: ecommerce.coupon,
    })
  )
    return false;
  sentPurchases.add(id);
  try {
    localStorage.setItem(key, new Date().toISOString());
  } catch {
    /* GA4 also deduplicates transaction IDs. */
  }
  return true;
}
