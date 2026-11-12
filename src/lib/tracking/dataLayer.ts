/**
 * Buyphone.lk Centralized DataLayer Utility
 * Handles window.dataLayer.push() with safety checks, PII redaction, and typing.
 */

import type {
  TrackingPayload,
  VirtualPageViewPayload,
} from "./types";

const FORBIDDEN_PII_KEYS = new Set([
  "email",
  "phone",
  "telephone",
  "mobile",
  "password",
  "address",
  "street",
  "customer_name",
  "full_name",
  "first_name",
  "last_name",
  "credit_card",
  "card_number",
  "cvv",
]);

/**
 * Strips accidental Personally Identifiable Information (PII) before dispatching to GTM dataLayer.
 */
function sanitizePayload<T extends Record<string, unknown>>(data: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(data)) {
    if (FORBIDDEN_PII_KEYS.has(key.toLowerCase())) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[Tracking] Stripped prohibited PII key from dataLayer push: "${key}"`);
      }
      continue;
    }

    if (val && typeof val === "object" && !Array.isArray(val)) {
      sanitized[key] = sanitizePayload(val as Record<string, unknown>);
    } else if (Array.isArray(val)) {
      sanitized[key] = val.map((item) =>
        item && typeof item === "object" ? sanitizePayload(item as Record<string, unknown>) : item
      );
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized as T;
}

/**
 * Push an event object directly to the GTM dataLayer.
 * Safe for SSR (no-op on server).
 */
export function pushDataLayer(payload: TrackingPayload): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  const cleanPayload = sanitizePayload(payload);
  window.dataLayer.push(cleanPayload);
}

/**
 * Tracks a virtual page view for SPA route transitions.
 */
export function trackVirtualPageView(params: {
  page_path: string;
  page_location: string;
  page_title: string;
}): void {
  const payload: VirtualPageViewPayload = {
    event: "virtual_page_view",
    page_path: params.page_path,
    page_location: params.page_location,
    page_title: params.page_title,
  };

  pushDataLayer(payload);
}

