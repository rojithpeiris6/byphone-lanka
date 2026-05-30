import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RefreshCw, Save, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from "lucide-react";
import { supabase, type AdminSetting } from "@/lib/supabase";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

const SETTING_META: Record<string, { label: string; description: string; type?: string }> = {
  store_name: { label: "Store Name", description: "The public name of the store." },
  store_email: { label: "Support Email", description: "Customer support email address.", type: "email" },
  store_phone: { label: "Support Phone", description: "Customer support phone number." },
  free_shipping_threshold: {
    label: "Free Shipping Threshold (Rs.)",
    description: "Minimum order value for free shipping.",
    type: "number",
  },
  express_delivery_fee: {
    label: "Express Delivery Fee (Rs.)",
    description: "Extra charge for express delivery.",
    type: "number",
  },
  announcement_text: { label: "Announcement Bar Text", description: "Text shown in the top announcement bar." },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("admin_settings").select("*");
      const map: Record<string, string> = {};
      (data ?? []).forEach((s: AdminSetting) => {
        map[s.key] = s.value;
      });
      setSettings(map);
      setLoading(false);
    }
    load();
  }, []);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function saveAll() {
    setSaving(true);
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase
        .from("admin_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" }),
    );
    const results = await Promise.all(updates);
    setSaving(false);
    const hasError = results.some((r) => r.error);
    showToast(hasError ? "error" : "success", hasError ? "Failed to save some settings." : "Settings saved successfully.");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <RefreshCw className="size-7 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage store configuration and preferences.</p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60"
        >
          <Save className="size-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Store info */}
      <Section title="Store Information" description="Basic store details shown to customers.">
        {["store_name", "store_email", "store_phone"].map((key) => (
          <SettingField
            key={key}
            meta={SETTING_META[key]}
            value={settings[key] ?? ""}
            onChange={(v) => setSettings((s) => ({ ...s, [key]: v }))}
          />
        ))}
      </Section>

      {/* Shipping */}
      <Section title="Shipping & Delivery" description="Configure delivery costs and thresholds.">
        {["free_shipping_threshold", "express_delivery_fee"].map((key) => (
          <SettingField
            key={key}
            meta={SETTING_META[key]}
            value={settings[key] ?? ""}
            onChange={(v) => setSettings((s) => ({ ...s, [key]: v }))}
          />
        ))}
      </Section>

      {/* Storefront */}
      <Section title="Storefront" description="Content displayed on the store frontend.">
        {["announcement_text"].map((key) => (
          <SettingField
            key={key}
            meta={SETTING_META[key]}
            value={settings[key] ?? ""}
            onChange={(v) => setSettings((s) => ({ ...s, [key]: v }))}
            textarea
          />
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="font-extrabold text-slate-800">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function SettingField({
  meta,
  value,
  onChange,
  textarea,
}: {
  meta: { label: string; description: string; type?: string };
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700 block mb-1">{meta.label}</label>
      <p className="text-xs text-slate-400 mb-2">{meta.description}</p>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
        />
      ) : (
        <input
          type={meta.type ?? "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
        />
      )}
    </div>
  );
}
