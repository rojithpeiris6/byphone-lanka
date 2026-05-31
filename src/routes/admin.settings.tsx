import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Store, Truck, CreditCard, Share2, Save, 
  Loader2, Globe, Mail, Phone, MapPin, 
  Plus, Trash2, Layout, GripVertical
} from "lucide-react";
import { getSettings } from "@/lib/api/settings.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

type SettingsTab = 'general' | 'homepage' | 'shipping' | 'payments' | 'social';

function SettingsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSubmitting] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => getSettings(),
  });

  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (settings) {
      // Ensure homepage_hero is an array
      const initialForm = { ...settings };
      if (initialForm.homepage_hero && !Array.isArray(initialForm.homepage_hero)) {
        initialForm.homepage_hero = [initialForm.homepage_hero];
      } else if (!initialForm.homepage_hero) {
        initialForm.homepage_hero = [];
      }
      setForm(initialForm);
    }
  }, [settings]);

  async function handleSave(key: string) {
    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from("settings")
        .upsert({ 
          key, 
          value: form[key],
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast.success("Settings updated successfully");
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
    } catch (e: any) {
      toast.error("Failed to update settings: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const updateForm = (key: string, subKey: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [subKey]: value
      }
    }));
  };

  const updateHeroSlide = (index: number, subKey: string, value: any) => {
    const newHero = [...(form.homepage_hero || [])];
    newHero[index] = { ...newHero[index], [subKey]: value };
    setForm((prev: any) => ({ ...prev, homepage_hero: newHero }));
  };

  const addHeroSlide = () => {
    const newHero = [...(form.homepage_hero || []), { title: "", description: "", image: "", link: "/shop" }];
    setForm((prev: any) => ({ ...prev, homepage_hero: newHero }));
  };

  const removeHeroSlide = (index: number) => {
    const newHero = (form.homepage_hero || []).filter((_: any, i: number) => i !== index);
    setForm((prev: any) => ({ ...prev, homepage_hero: newHero }));
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1000px]">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Store Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your store information, shipping rules, and integrations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-2 sticky top-24">
            <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={Store} label="General" />
            <TabButton active={activeTab === 'homepage'} onClick={() => setActiveTab('homepage')} icon={Layout} label="Homepage" />
            <TabButton active={activeTab === 'shipping'} onClick={() => setActiveTab('shipping')} icon={Truck} label="Shipping" />
            <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments'} icon={CreditCard} label="Payments" />
            <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon={Share2} label="Social Links" />
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <Section 
              title="Store Information" 
              desc="Update your public store details shown on invoices and contact page."
              onSave={() => handleSave('store_info')}
              isSaving={isSaving}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Store Name" icon={Store}>
                  <input className={inputCls} value={form.store_info?.name || ""} onChange={e => updateForm('store_info', 'name', e.target.value)} />
                </Field>
                <Field label="Public Email" icon={Mail}>
                  <input className={inputCls} value={form.store_info?.email || ""} onChange={e => updateForm('store_info', 'email', e.target.value)} />
                </Field>
                <Field label="Contact Number" icon={Phone}>
                  <input className={inputCls} value={form.store_info?.phone || ""} onChange={e => updateForm('store_info', 'phone', e.target.value)} />
                </Field>
                <Field label="Currency" icon={Globe}>
                  <select className={inputCls} value={form.store_info?.currency || "LKR"} onChange={e => updateForm('store_info', 'currency', e.target.value)}>
                    <option value="LKR">LKR (Rs.)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Store Address" icon={MapPin}>
                    <textarea rows={3} className={cn(inputCls, "h-auto py-2")} value={form.store_info?.address || ""} onChange={e => updateForm('store_info', 'address', e.target.value)} />
                  </Field>
                </div>
              </div>
            </Section>
          )}

          {activeTab === 'homepage' && (
            <Section 
              title="Homepage Hero Slides" 
              desc="Add and manage multiple banners for your homepage carousel."
              onSave={() => handleSave('homepage_hero')}
              isSaving={isSaving}
            >
              <div className="space-y-8">
                {(form.homepage_hero || []).map((slide: any, index: number) => (
                  <div key={index} className="p-5 rounded-2xl border border-border bg-muted/10 relative group">
                    <button 
                      onClick={() => removeHeroSlide(index)}
                      className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove Slide"
                    >
                      <Trash2 className="size-4" />
                    </button>
                    <div className="flex items-center gap-2 mb-4">
                      <GripVertical className="size-4 text-muted-foreground/40" />
                      <h4 className="font-bold text-sm uppercase tracking-wider">Slide #{index + 1}</h4>
                    </div>
                    <div className="space-y-5">
                      <ImageUpload 
                        label="Slide Image" 
                        value={slide.image} 
                        bucket="shop" 
                        onChange={url => updateHeroSlide(index, 'image', url)} 
                      />
                      <div className="grid gap-4">
                        <Field label="Title (Dot '.' triggers blue text)">
                          <input className={inputCls} value={slide.title || ""} onChange={e => updateHeroSlide(index, 'title', e.target.value)} />
                        </Field>
                        <Field label="Description">
                          <textarea rows={2} className={cn(inputCls, "h-auto py-2")} value={slide.description || ""} onChange={e => updateHeroSlide(index, 'description', e.target.value)} />
                        </Field>
                        <Field label="Button Link">
                          <input className={inputCls} placeholder="/shop" value={slide.link || ""} onChange={e => updateHeroSlide(index, 'link', e.target.value)} />
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={addHeroSlide}
                  className="w-full py-4 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all font-bold text-sm"
                >
                  <Plus className="size-4" /> Add New Hero Slide
                </button>
              </div>
            </Section>
          )}

          {activeTab === 'shipping' && (
            <Section 
              title="Shipping & Delivery" 
              desc="Configure shipping rates and free delivery thresholds."
              onSave={() => handleSave('shipping_rates')}
              isSaving={isSaving}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Standard Rate (LKR)">
                  <input type="number" className={inputCls} value={form.shipping_rates?.standard ?? 0} onChange={e => updateForm('shipping_rates', 'standard', Number(e.target.value))} />
                </Field>
                <Field label="Express Rate (LKR)">
                  <input type="number" className={inputCls} value={form.shipping_rates?.express ?? 490} onChange={e => updateForm('shipping_rates', 'express', Number(e.target.value))} />
                </Field>
                <Field label="Free Shipping Threshold (LKR)">
                  <input type="number" className={inputCls} value={form.shipping_rates?.free_threshold ?? 50000} onChange={e => updateForm('shipping_rates', 'free_threshold', Number(e.target.value))} />
                </Field>
              </div>
            </Section>
          )}

          {activeTab === 'payments' && (
            <Section 
              title="Payment Methods" 
              desc="Toggle available payment gateways for customers."
              onSave={() => handleSave('payment_gateways')}
              isSaving={isSaving}
            >
              <div className="space-y-4">
                <ToggleRow 
                  title="PayHere Gateway" 
                  desc="Accept local credit/debit card payments via PayHere."
                  active={form.payment_gateways?.payhere_enabled}
                  onChange={v => updateForm('payment_gateways', 'payhere_enabled', v)}
                />
                <ToggleRow 
                  title="PayPal" 
                  desc="Accept global payments via PayPal."
                  active={form.payment_gateways?.paypal_enabled}
                  onChange={v => updateForm('payment_gateways', 'paypal_enabled', v)}
                />
                <ToggleRow 
                  title="Cash on Delivery" 
                  desc="Allow customers to pay when they receive the order."
                  active={form.payment_gateways?.cod_enabled}
                  onChange={v => updateForm('payment_gateways', 'cod_enabled', v)}
                />
              </div>
            </Section>
          )}

          {activeTab === 'social' && (
            <Section 
              title="Social Media" 
              desc="Manage links to your social media profiles."
              onSave={() => handleSave('social_links')}
              isSaving={isSaving}
            >
              <div className="grid gap-4">
                <Field label="Facebook URL">
                  <input className={inputCls} placeholder="https://facebook.com/..." value={form.social_links?.facebook || ""} onChange={e => updateForm('social_links', 'facebook', e.target.value)} />
                </Field>
                <Field label="Instagram URL">
                  <input className={inputCls} placeholder="https://instagram.com/..." value={form.social_links?.instagram || ""} onChange={e => updateForm('social_links', 'instagram', e.target.value)} />
                </Field>
                <Field label="WhatsApp Number">
                  <input className={inputCls} placeholder="9477..." value={form.social_links?.whatsapp || ""} onChange={e => updateForm('social_links', 'whatsapp', e.target.value)} />
                </Field>
                <Field label="TikTok URL">
                  <input className={inputCls} placeholder="https://tiktok.com/@..." value={form.social_links?.tiktok || ""} onChange={e => updateForm('social_links', 'tiktok', e.target.value)} />
                </Field>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, desc, children, onSave, isSaving }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="p-6 border-b border-border bg-muted/10 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
        <button 
          onClick={onSave} 
          disabled={isSaving}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Save
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent"
      )}
    >
      <Icon className="size-4" /> {label}
    </button>
  );
}

function Field({ label, icon: Icon, children }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="size-3" />} {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({ title, desc, active, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/5">
      <div className="flex-1">
        <h4 className="text-sm font-bold">{title}</h4>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button 
        onClick={() => onChange(!active)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
          active ? "bg-primary" : "bg-muted-foreground/20"
        )}
      >
        <span className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          active ? "translate-x-5" : "translate-x-0"
        )} />
      </button>
    </div>
  );
}

const inputCls = "w-full h-10 px-3 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm transition-all";