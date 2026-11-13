import { pushDataLayer } from "./dataLayer";
import { getTrackingConsent } from "./consent";

export type IdeamartStage = "phone_submitted" | "otp_submitted" | "registration_success";
const tracked = new Set<string>();
const events: Record<IdeamartStage, string> = {
  phone_submitted: "ideamart_phone_submitted",
  otp_submitted: "ideamart_otp_submitted",
  registration_success: "ideamart_subscription_1",
};
/** Accept only fixed metadata. Never pass a phone number, OTP, or provider reference. */
export function trackIdeamartStage(productId: string, stage: IdeamartStage): boolean {
  const consent = getTrackingConsent();
  if ((!consent.analytics && !consent.marketing) || !Object.hasOwn(events, stage)) return false;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId))
    return false;
  pushDataLayer({ ecommerce: null });
  pushDataLayer({
    event: events[stage],
    event_label: "Ideamart Subscription 1",
    funnel_step: stage,
    item_id: productId,
    method: "sms_otp",
    placement: "product_notify_me",
  });
  return true;
}
/** Provider references are used only for in-memory duplicate suppression. */
export function trackIdeamartSubscription(
  productId: string,
  reference: string,
  registered = false,
): boolean {
  if (!registered || !reference || tracked.has(reference)) return false;
  if (!trackIdeamartStage(productId, "registration_success")) return false;
  tracked.add(reference);
  return true;
}
