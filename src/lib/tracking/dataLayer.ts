/** Shared browser tracking boundary. Tracking must never break the storefront. */
import type { TrackingPayload, VirtualPageViewPayload } from "./types";

const SAFE_QUERY_KEYS = new Set([
  "q", "query", "search", "page", "brand", "category", "sort",
  "minprice", "maxprice", "min_price", "max_price",
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
]);

function containsPersonalText(value: string): boolean {
  return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value) ||
    /(?:\+?\d[\s().-]*){9,}/.test(value);
}

function isPrivateKey(key: string): boolean {
  const normalized = key.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
  return /(^|_)(email|phone|telephone|mobile|password|address|street|token|secret|cvv)(_|$)/.test(normalized) ||
    /(^|_)(customer_name|full_name|first_name|last_name|credit_card|card_number)(_|$)/.test(normalized) ||
    normalized === "name";
}

/** Keep only known public browsing parameters; never retain credentials or fragments. */
export function sanitizeTrackedUrl(value: string): string | null {
  try {
    const url = new URL(value, typeof window === "undefined" ? "https://buyphone.lk" : window.location.origin);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.username = "";
    url.password = "";
    url.hash = "";
    for (const [key, entry] of Array.from(url.searchParams.entries())) {
      if (!SAFE_QUERY_KEYS.has(key.toLowerCase()) || containsPersonalText(entry)) {
        url.searchParams.delete(key);
      }
    }
    return url.href;
  } catch {
    return null;
  }
}

function sanitizePayload(value: unknown, ancestors = new WeakSet<object>()): unknown {
  if (value === null || typeof value !== "object") return value;
  if (ancestors.has(value)) return undefined;
  ancestors.add(value);
  try {
    if (Array.isArray(value)) return value.map((entry) => sanitizePayload(entry, ancestors));
    const clean: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (isPrivateKey(key)) continue;
      if ((key === "search_term" || key === "page_title") && typeof entry === "string" && containsPersonalText(entry)) {
        clean[key] = "[redacted]";
      } else {
        clean[key] = sanitizePayload(entry, ancestors);
      }
    }
    return clean;
  } finally {
    ancestors.delete(value);
  }
}

/** SSR-safe and fail-open: a malformed event must not crash a page or checkout. */
export function pushDataLayer(payload: TrackingPayload): void {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    const clean = sanitizePayload(payload) as Record<string, unknown>;
    window.dataLayer.push(clean);
  } catch {
    // Do not log potentially private event payloads or interrupt the user action.
  }
}

export function trackVirtualPageView(params: {
  page_path: string;
  page_location: string;
  page_title: string;
}): void {
  const location = sanitizeTrackedUrl(params.page_location);
  if (!location) return;
  const url = new URL(location);
  const payload: VirtualPageViewPayload = {
    event: "virtual_page_view",
    page_path: url.pathname,
    page_location: location,
    page_title: params.page_title,
  };
  pushDataLayer(payload);
}
