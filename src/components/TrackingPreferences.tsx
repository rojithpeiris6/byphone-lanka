import { useEffect, useState } from "react";
import { savedTrackingConsent, saveTrackingConsent } from "@/lib/tracking/consent";

export function TrackingPreferences() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  useEffect(() => {
    const saved = savedTrackingConsent();
    setAnalytics(saved?.analytics ?? false);
    setMarketing(saved?.marketing ?? false);
    setOpen(!saved);
    setReady(true);
  }, []);
  if (!ready) return null;
  function save(analyticsChoice: boolean, marketingChoice: boolean) {
    setAnalytics(analyticsChoice);
    setMarketing(marketingChoice);
    saveTrackingConsent({ analytics: analyticsChoice, marketing: marketingChoice });
    setOpen(false);
  }
  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-3 z-50 rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-sm"
      >
        Privacy choices
      </button>
    );
  return (
    <section
      aria-label="Privacy choices"
      className="fixed bottom-20 left-3 right-3 z-50 max-w-md rounded-xl border border-border bg-background p-5 shadow-xl"
    >
      <h2 className="text-base font-bold">Your privacy choices</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Essential storage keeps your cart working. Choose whether to allow optional analytics and
        marketing. You can change this anytime.
      </p>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={analytics}
          onChange={(e) => setAnalytics(e.target.checked)}
        />
        Allow analytics
      </label>
      <label className="mt-2 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
        />
        Allow marketing
      </label>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => save(analytics, marketing)}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Save choices
        </button>
        <button
          type="button"
          onClick={() => save(false, false)}
          className="rounded-lg border border-border px-4 py-2 text-sm"
        >
          Reject optional
        </button>
      </div>
    </section>
  );
}
