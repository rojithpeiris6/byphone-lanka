import { pushDataLayer } from "./dataLayer";
import { getTrackingConsent } from "./consent";

const tracked = new Set<string>();
/** OTP references stay in memory for deduplication and never enter analytics. */
export function trackIdeamartSubscription(productId: string, reference: string): boolean {
  const consent = getTrackingConsent();
  if ((!consent.analytics && !consent.marketing) || !reference || tracked.has(reference))
    return false;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId))
    return false;
  pushDataLayer({ ecommerce: null });
  pushDataLayer({
    event: "ideamart_subscription_1",
    event_label: "Ideamart Subscription 1",
    item_id: productId,
    method: "sms_otp",
    verification_status: "otp_verified",
    placement: "product_notify_me",
  });
  tracked.add(reference);
  return true;
}
