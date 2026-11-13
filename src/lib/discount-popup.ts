export type GiftDesign = "light" | "dark";
export const GIFT_POPUP_OPEN_EVENT = "buyphone:open-sms-offers";
type StorageLike = Pick<Storage, "getItem" | "setItem">;
const DESIGN = "buyphone:discount-gift:design:v1";
const DISMISSED = "buyphone:discount-gift:dismissed:v1";
let memoryDesign: GiftDesign | undefined;
let memoryDismissed = 0;

export function assignGiftDesign(storage: StorageLike, random = Math.random): GiftDesign {
  try {
    const saved = storage.getItem(DESIGN);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* Storage may be blocked. */
  }
  const design = memoryDesign ?? (random() < 0.5 ? "light" : "dark");
  memoryDesign = design;
  try {
    storage.setItem(DESIGN, design);
  } catch {
    /* Keep this tab's choice. */
  }
  return design;
}
export function popupAllowed(path: string): boolean {
  return (
    path === "/" ||
    path === "/shop" ||
    path === "/deals" ||
    path === "/brands" ||
    path === "/categories" ||
    path.startsWith("/product/")
  );
}
export function popupDismissed(storage: StorageLike, now = Date.now()): boolean {
  let dismissed = memoryDismissed;
  try {
    dismissed = Math.max(dismissed, Number(storage.getItem(DISMISSED)) || 0);
  } catch {
    /* Memory fallback. */
  }
  return dismissed > 0 && now - dismissed < 24 * 60 * 60 * 1000;
}
export function dismissGiftPopup(storage: StorageLike, now = Date.now()): void {
  memoryDismissed = now;
  try {
    storage.setItem(DISMISSED, String(now));
  } catch {
    /* Do not interrupt shopping. */
  }
}
export function normalizeGiftPhone(value: string): string | null {
  const phone = value.replace(/[\s+-]/g, "");
  if (/^7\d{8}$/.test(phone)) return "0" + phone;
  if (/^07\d{8}$/.test(phone)) return phone;
  if (/^947\d{8}$/.test(phone)) return "0" + phone.slice(2);
  return null;
}
export function giftStorage(): StorageLike {
  try {
    return window.localStorage;
  } catch {
    return { getItem: () => null, setItem: () => {} };
  }
}
