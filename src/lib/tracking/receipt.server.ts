import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string | undefined {
  return process.env.TRACKING_RECEIPT_SECRET;
}
export function issueTrackingReceipt(orderId: string): string | null {
  const key = secret();
  if (!key) return null; // Missing tracking configuration must not fail a real order.
  const body = Buffer.from(
    JSON.stringify({ orderId, expires: Date.now() + 7 * 86400000 }),
  ).toString("base64url");
  return body + "." + createHmac("sha256", key).update(body).digest("base64url");
}
export function verifyTrackingReceipt(receipt: string): string | null {
  const key = secret();
  if (!key) return null;
  try {
    const [body, signature, extra] = receipt.split(".");
    if (!body || !signature || extra) return null;
    const expected = createHmac("sha256", key).update(body).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    return typeof payload.orderId === "string" && payload.expires > Date.now()
      ? payload.orderId
      : null;
  } catch {
    return null;
  }
}
