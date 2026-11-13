import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { getTrackingConsent, CONSENT_EVENT } from "./consent";
import { sanitizeTrackedUrl, trackVirtualPageView } from "./dataLayer";

/** Track committed public routes after HeadContent has applied the destination title. */
export function usePageTracking(): void {
  const state = useRouterState({
    select: (s) => ({
      href: s.location.href,
      pathname: s.location.pathname,
      ready: s.status === "idle" && !s.isLoading,
      // Match HeadContent's deepest/last title precedence in the installed router.
      title: s.matches
        .flatMap((match) => match.meta ?? [])
        .filter((meta) => meta?.title)
        .at(-1)?.title,
    }),
  });
  const lastTrackedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (state.pathname === "/admin" || state.pathname.startsWith("/admin/")) {
      lastTrackedKeyRef.current = null;
      return;
    }
    if (!state.ready) return;
    const location = sanitizeTrackedUrl(state.href);
    if (!location) return;

    let cancelled = false;
    let frame = 0;
    const sendWhenReady = () => {
      if (cancelled) return;
      const consent = getTrackingConsent();
      if (!consent.analytics && !consent.marketing) {
        lastTrackedKeyRef.current = null;
        return;
      }
      // A route change or title update cancels/replaces this effect.
      if (state.title && document.title !== state.title) return;
      if (lastTrackedKeyRef.current === location) return;
      lastTrackedKeyRef.current = location;
      trackVirtualPageView({
        page_path: state.pathname,
        page_location: location,
        page_title: document.title || "buyphone.lk",
      });
      // Keep observing until cleanup so privacy choices can restart tracking.
    };
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sendWhenReady);
    });
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    const consentChanged = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sendWhenReady);
    };
    window.addEventListener(CONSENT_EVENT, consentChanged);
    frame = requestAnimationFrame(sendWhenReady);
    return () => {
      cancelled = true;
      window.removeEventListener(CONSENT_EVENT, consentChanged);
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [state.href, state.pathname, state.ready, state.title]);
}
