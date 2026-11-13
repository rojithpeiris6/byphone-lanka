import { useCallback, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouterState } from "@tanstack/react-router";
import { Check, Loader2, LockKeyhole, X } from "lucide-react";
import { requestOtpFn, verifyOtpFn } from "@/lib/api/ideamart.functions";
import { getTrackingConsent } from "@/lib/tracking/consent";
import { pushDataLayer } from "@/lib/tracking/dataLayer";
import { useAuthModalStore } from "@/lib/auth-modal-store";
import {
  assignGiftDesign,
  popupAllowed,
  popupDismissed,
  dismissGiftPopup,
  normalizeGiftPhone,
  giftStorage,
  GIFT_POPUP_OPEN_EVENT,
  type GiftDesign,
} from "@/lib/discount-popup";
import "./DiscountGiftPopup.css";

const PRICE = "Rs. 5 + tax/day";
type Step = "phone" | "otp" | "done";

function recordAttempt(step: "phone_submitted" | "otp_submitted", design: GiftDesign) {
  const consent = getTrackingConsent();
  if (!consent.analytics && !consent.marketing) return;
  pushDataLayer({ ecommerce: null });
  pushDataLayer({
    event: step === "phone_submitted" ? "ideamart_phone_submitted" : "ideamart_otp_submitted",
    event_label: "Ideamart Subscription 1",
    funnel_step: step,
    method: "sms_otp",
    placement: "discount_gift_popup",
    popup_design: design,
  });
}

export function DiscountGiftPopup() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const [design, setDesign] = useState<GiftDesign>("light");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(300);
  const [closeDelay, setCloseDelay] = useState(5);
  const shownAt = useRef(0);
  const active = useRef(false);
  const lock = useRef(false);
  const pendingClose = useRef(false);
  const receipt = useRef<{ referenceNo: string; applicationId: string } | null>(null);
  const title = useRef<HTMLHeadingElement>(null);

  const dismiss = useCallback(() => {
    active.current = false;
    pendingClose.current = true;
    setOpen(false);
    setPhone("");
    setOtp("");
    setError("");
    dismissGiftPopup(giftStorage());
  }, []);

  useEffect(() => {
    if (!popupAllowed(path)) {
      if (active.current) dismiss();
      return;
    }
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let visibleStarted = 0;
    let viewed = 0;
    const preview = ["localhost", "127.0.0.1"].includes(location.hostname)
      ? new URLSearchParams(location.search).get("gift_preview")
      : null;
    const forced = preview === "light" || preview === "dark" ? preview : null;
    const show = (manual = false) => {
      if (cancelled || active.current || (!manual && !forced && popupDismissed(giftStorage()))) return;
      if (
        !forced &&
        (document.visibilityState !== "visible" ||
          useAuthModalStore.getState().isOpen ||
          document.querySelector('[role="dialog"][data-state="open"]'))
      ) {
        timeout = setTimeout(() => show(manual), 3000);
        return;
      }
      active.current = true;
      pendingClose.current = false;
      setDesign(forced ?? assignGiftDesign(giftStorage()));
      setStep("phone");
      setPhone("");
      setOtp("");
      setError("");
      receipt.current = null;
      shownAt.current = Date.now();
      setRemaining(300);
      setCloseDelay(5);
      setOpen(true);
    };
    const stop = () => {
      if (visibleStarted) {
        viewed += Date.now() - visibleStarted;
        visibleStarted = 0;
      }
      clearTimeout(timeout);
    };
    const resume = () => {
      stop();
      if (!path.startsWith("/product/") || document.visibilityState !== "visible") return;
      visibleStarted = Date.now();
      timeout = setTimeout(show, Math.max(0, 20_000 - viewed));
    };
    const exit = (event: MouseEvent) => {
      if (
        !event.relatedTarget &&
        event.clientY <= 0 &&
        matchMedia("(hover: hover) and (pointer: fine)").matches
      )
        show();
    };
    const reopen = () => show(true);
    if (forced) timeout = setTimeout(show, 300);
    else resume();
    document.addEventListener("visibilitychange", resume);
    document.addEventListener("mouseout", exit);
    window.addEventListener(GIFT_POPUP_OPEN_EVENT, reopen);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", resume);
      document.removeEventListener("mouseout", exit);
      window.removeEventListener(GIFT_POPUP_OPEN_EVENT, reopen);
    };
  }, [path, dismiss]);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const elapsed = (Date.now() - shownAt.current) / 1000;
      setCloseDelay(Math.max(0, Math.ceil(5 - elapsed)));
      setRemaining(Math.max(0, Math.ceil(300 - elapsed)));
    };
    const timer = setInterval(update, 250);
    return () => clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (open && remaining === 0 && step === "phone" && !busy) dismiss();
  }, [remaining, open, step, busy, dismiss]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    setError("");
    const subscriberId = normalizeGiftPhone(phone);
    if (step === "phone" && !subscriberId) {
      setError("Enter a valid Sri Lankan mobile number.");
      return;
    }
    if (step === "otp" && !/^\d{4,6}$/.test(otp)) {
      setError("Enter the 4–6 digit OTP from your SMS.");
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      if (step === "phone") {
        recordAttempt("phone_submitted", design);
        const response = await requestOtpFn({ data: { subscriberId: subscriberId! } });
        if (!response.success || !response.referenceNo || !response.applicationId)
          throw new Error("We couldn't send an OTP. Please try again.");
        if (!pendingClose.current) {
          receipt.current = response;
          setStep("otp");
        }
      } else if (step === "otp" && receipt.current) {
        recordAttempt("otp_submitted", design);
        const response = await verifyOtpFn({ data: { otp, ...receipt.current } });
        if (!response.success) throw new Error("We couldn't verify that OTP. Please try again.");
        if (!pendingClose.current) {
          setStep("done");
          setPhone("");
          setOtp("");
          receipt.current = null;
          dismissGiftPopup(giftStorage());
        }
      }
    } catch (err) {
      if (!pendingClose.current)
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) dismiss();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="bp-promo-overlay" />
        <Dialog.Content
          className={`bp-promo bp-promo--${design}`}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            title.current?.focus();
          }}
          onPointerDownOutside={(event) => {
            if (closeDelay > 0 || busy) event.preventDefault();
          }}
          onEscapeKeyDown={() => dismiss()}
        >
          <div className="bp-promo-hero">
            <span className="bp-promo-brand">
              buyphone<span>.lk</span>
            </span>
            {closeDelay === 0 ? (
              <Dialog.Close className="bp-promo-close" aria-label="Close discount offer">
                <X size={20} />
              </Dialog.Close>
            ) : (
              <span className="bp-promo-close-delay">Close in {closeDelay}s</span>
            )}
            <div className="bp-promo-gift" aria-hidden="true">
              <span className="bp-promo-glow" />
              <span className="bp-promo-gift-base" />
              <span className="bp-promo-flying bp-promo-flying--phone" />
              <span className="bp-promo-flying bp-promo-flying--headphones" />
              {Array.from({ length: 8 }, (_, i) => (
                <i key={i} className={`bp-promo-particle bp-promo-particle--${i}`} />
              ))}
              <span className="bp-promo-gift-lid" />
            </div>
          </div>
          <div className="bp-promo-content">
            {step === "done" ? (
              <div className="bp-promo-done">
                <span className="bp-promo-check">
                  <Check size={28} />
                </span>
                <Dialog.Title ref={title} tabIndex={-1}>
                  Mobile number verified
                </Dialog.Title>
                <Dialog.Description>
                  Watch for the SMS service confirmation and offers on your phone.
                </Dialog.Description>
                <p className="bp-promo-price">Paid SMS service: {PRICE}.</p>
                <button type="button" className="bp-promo-submit" onClick={dismiss}>
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <div className="bp-promo-offer">
                  <span>EXCLUSIVE MOBILE OFFER</span>
                </div>
                <Dialog.Title className="bp-promo-title" ref={title} tabIndex={-1}>
                  {step === "phone" ? (
                    <><span>Unlock up to</span><strong>50% OFF</strong></>
                  ) : "Enter your OTP"}
                </Dialog.Title>
                <Dialog.Description className="bp-promo-description">
                  {step === "phone"
                    ? "Request a verification code to join our paid SMS offers service. Discounts depend on the selected product and available offers."
                    : "Enter the code sent to your phone. Verification activates the paid SMS subscription."}
                </Dialog.Description>
                <form onSubmit={submit} className="bp-promo-form">
                  <label className="bp-promo-label" htmlFor="bp-promo-input">
                    {step === "phone" ? "Mobile number" : "SMS verification code"}
                  </label>
                  <div className="bp-promo-input-wrap">
                    {step === "phone" && <span className="bp-promo-prefix">+94</span>}
                    <input
                      id="bp-promo-input"
                      name={step === "phone" ? "mobile" : "otp"}
                      type={step === "phone" ? "tel" : "text"}
                      inputMode="numeric"
                      autoComplete={step === "phone" ? "tel-national" : "one-time-code"}
                      placeholder={step === "phone" ? "7X XXX XXXX" : "Enter OTP"}
                      maxLength={step === "phone" ? 14 : 6}
                      value={step === "phone" ? phone : otp}
                      onChange={(event) =>
                        step === "phone"
                          ? setPhone(event.target.value.replace(/[^\d+\s-]/g, ""))
                          : setOtp(event.target.value.replace(/\D/g, ""))
                      }
                      disabled={busy}
                      aria-invalid={!!error}
                      aria-describedby="bp-promo-error bp-promo-fee"
                    />
                  </div>
                  {error && (
                    <p id="bp-promo-error" role="alert" className="bp-promo-error">
                      {error}
                    </p>
                  )}
                  <button
                    className="bp-promo-submit"
                    type="submit"
                    disabled={
                      busy ||
                      (step === "phone" && !phone.trim()) ||
                      (step === "otp" && !otp.trim())
                    }
                  >
                    {busy ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Please wait…
                      </>
                    ) : step === "phone" ? (
                      "Get code"
                    ) : (
                      "Verify & subscribe"
                    )}
                  </button>
                  {step === "phone" && (
                    <p className="bp-promo-verification"><LockKeyhole size={16} aria-hidden="true" /> Verification code sent by SMS</p>
                  )}
                  <p id="bp-promo-fee" className="bp-promo-price">
                    Paid SMS service: {PRICE}. Renews daily.
                    {step === "phone" && " Activate after OTP verification."}
                  </p>
                  {step === "otp" && (
                    <button
                      type="button"
                      className="bp-promo-change"
                      disabled={busy}
                      onClick={() => {
                        setStep("phone");
                        setOtp("");
                        setError("");
                        receipt.current = null;
                      }}
                    >
                      Change mobile number
                    </button>
                  )}
                </form>
                <div className="bp-promo-countdown">
                  <span>
                    {remaining ? "Time left in this window" : "You can finish OTP verification"}
                  </span>
                  {remaining > 0 && (
                    <b>
                      {String(Math.floor(remaining / 60)).padStart(2, "0")}:
                      {String(remaining % 60).padStart(2, "0")}
                    </b>
                  )}
                </div>
                <p className="bp-promo-terms">
                  Selected products and available offers only. <a href="/terms">Terms apply</a>.{" "}
                  <a href="/privacy">Privacy policy</a>.
                </p>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
