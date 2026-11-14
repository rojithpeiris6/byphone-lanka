export const CONSENT_KEY = "buyphone:tracking-consent:v1";
export const CONSENT_EVENT = "buyphone:tracking-consent";
export type TrackingConsent = { analytics: boolean; marketing: boolean };
const DEFAULT_TRACKING: TrackingConsent = { analytics: true, marketing: true };
let memory: TrackingConsent | undefined;

export function savedTrackingConsent(): TrackingConsent | null {
  if (typeof window === "undefined") return null;
  if (memory) return memory;
  try {
    const value = JSON.parse(window.localStorage.getItem(CONSENT_KEY) ?? "null");
    if (typeof value?.analytics === "boolean" && typeof value?.marketing === "boolean")
      return value;
  } catch {
    /* When a saved choice is unavailable, use the configured site default. */
  }
  return null;
}
export function getTrackingConsent(): TrackingConsent {
  if (typeof window === "undefined") return { analytics: false, marketing: false };
  return savedTrackingConsent() ?? { ...DEFAULT_TRACKING };
}
export function saveTrackingConsent(value: TrackingConsent): void {
  memory = { analytics: value.analytics === true, marketing: value.marketing === true };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(memory));
  } catch {
    /* Retain this tab's explicit choice. */
  }
  const settings = {
    analytics_storage: memory.analytics ? "granted" : "denied",
    ad_storage: memory.marketing ? "granted" : "denied",
    ad_user_data: memory.marketing ? "granted" : "denied",
    ad_personalization: memory.marketing ? "granted" : "denied",
  };
  window.dataLayer = window.dataLayer || [];
  // GTM consent commands use the standard gtag IArguments queue contract.
  function command(..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments as unknown as Record<string, unknown>);
  }
  command("consent", "update", settings);
  window.dataLayer.push({
    event: "tracking_consent_update",
    analytics_allowed: memory.analytics,
    marketing_allowed: memory.marketing,
  });
  if (memory.analytics) window.dataLayer.push({ event: "tracking_analytics_granted" });
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** Runs before the app's GTM loader, including on SSR output. */
export const CONSENT_BOOTSTRAP = `(function(w){if(w.__buyphoneConsentInitialized)return;w.__buyphoneConsentInitialized=true;w.dataLayer=w.dataLayer||[];var c=${JSON.stringify(DEFAULT_TRACKING)};try{var s=JSON.parse(w.localStorage.getItem('${CONSENT_KEY}')||'null');if(s&&typeof s.analytics==='boolean'&&typeof s.marketing==='boolean')c=s;}catch(e){}function g(){w.dataLayer.push(arguments);}g('consent','default',{analytics_storage:c.analytics?'granted':'denied',ad_storage:c.marketing?'granted':'denied',ad_user_data:c.marketing?'granted':'denied',ad_personalization:c.marketing?'granted':'denied'});})(window);`;
