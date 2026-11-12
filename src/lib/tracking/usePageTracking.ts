/**
 * TanStack Router Page View Tracking Hook for Buyphone.lk
 * Synchronizes client-side navigation with GTM dataLayer.
 *
 * Rules:
 * - Excludes admin routes (/admin/*).
 * - Fires on initial page load and on SPA transitions.
 * - Captures query string changes when representing distinct views (e.g. search, filters).
 * - Prevents duplicates from StrictMode, hydration, and re-renders.
 */

import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackVirtualPageView } from "./dataLayer";

export function usePageTracking(): void {
  const location = useRouterState({ select: (s) => s.location });
  const lastTrackedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const pathname = location.pathname;

    // Exclude all admin panel routes
    if (pathname.startsWith("/admin")) {
      lastTrackedKeyRef.current = null;
      return;
    }

    const currentKey = location.href;

    // Prevent duplicate firing on identical path + search re-renders
    if (lastTrackedKeyRef.current === currentKey) {
      return;
    }

    // Schedule microtask/timeout to allow TanStack Router <HeadContent />
    // to apply the route's document.title before reading it.
    const timeoutId = window.setTimeout(() => {
      lastTrackedKeyRef.current = currentKey;

      const pageLocation = window.location.origin + location.href;
      const pageTitle = document.title || "buyphone.lk";

      trackVirtualPageView({
        page_path: pathname,
        page_location: pageLocation,
        page_title: pageTitle,
      });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [location.pathname, location.href]);
}
