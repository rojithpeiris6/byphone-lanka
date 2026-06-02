import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Plus, Trash2, Loader2 } from "lucide-react";

type Variant = {
  id?: string;
  storage?: string; 
  color?: string; 
  ram?: string; 
  network?: string; 
  model?: string;
  price_diff: number; 
  stock_quantity: number; 
  sku?: string;
};

type ProductFormProps = {
  productId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ProductForm({ productId, onClose, onSuccess }: ProductFormProps) {
  const qc = useQueryClient();
  const isEdit = !!productId;
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const [form, setForm] = useState({
    name: "", slug: "", sku: "", barcode: "",
    brand_id: "", category_id: "", sub_category_id: "",
    description: "", short_description: "",
    price: 0, discount_price: "" as number | "", cost_price: "" as number | "",
    stock_quantity: 0, stock_alert_quantity: 5,
    warranty: "", status: "draft" as "draft" | "active" | "archived",
    featured: false,
  });

  const [images, setImages] = useState<{ id?: string; url: string; sort_order: number }[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  const { data: brands } = useQuery({
    queryKey: ["brands-list"],
    queryFn: async () => (await supabase.from("brands").select("id,name").order("name")).data ?? [],
  });
  const { data: categories } = useQuery({
    queryKey: ["categories-list"],
    queryFn: async () => (await supabase.from("categories").select("id,name").order("name")).data ?? [],
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data, error } = await supabase.from("products").select("*").eq("id", productId).single();
        if (error) throw error;
        if (data) setForm({
          ...form,
          ...data,
          discount_price: data.discount_price ?? "",
          cost_price: data.cost_price ?? "",
        } as any);

        const { data: imgs } = await supabase.from("product_images").select("*").eq("product_id", productId).order("sort_order");
        setImages(imgs ?? []);

        const { data: vars } = await supabase.from("product_variants").select("*").eq("product_id", productId);
        setVariants((vars as any) ?? []);
      } catch (e: any) {
        toast.error("Failed to load product: " + e.message);
        onClose();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isEdit]);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ 
      ...f, 
      [k]: v, 
      ...(k === "name" && !isEdit ? { slug: slugify(v as string) } : {}) 
    }));
  }

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from("products").upload(path, file);
      if (error) { toast.error(error.message); continue; }
      const { data: pub } = supabase.storage.from("products").getPublicUrl(path);
      setImages((prev) => [...prev, { url: pub.publicUrl, sort_order: prev.length }]);
    }
    toast.success("Images uploaded");
  }

  async function submit() {
    if (!form.name || !form.slug) return toast.error("Name and slug are required");
    setSaving(true);
    try {
      const payload: any = {
        name: form.name, slug: form.slug, sku: form.sku || null, barcode: form.barcode || null,
        brand_id: form.brand_id || null, category_id: form.category_id || null,
        sub_category_id: form.sub_category_id || null,
        description: form.description || null, short_description: form.short_description || null,
        price: Number(form.price) || 0,
        discount_price: form.discount_price === "" ? null : Number(form.discount_price),
        cost_price: form.cost_price === "" ? null : Number(form.cost_price),
        stock_quantity: Number(form.stock_quantity) || 0,
        stock_alert_quantity: Number(form.stock_alert_quantity) || 0,
        warranty: form.warranty || null, status: form.status, featured: form.featured,
      };

      let id: string;
      if (isEdit) {
        const { error } = await supabase.from("products").update(payload).eq("id", productId!);
        if (error) throw error;
        id = productId!;
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        id = data.id;
      }

      // Update images
      await supabase.from("product_images").delete().eq("product_id", id);
      if (images.length) {
        const rows = images.map((im, i) => ({ product_id: id, url: im.url, sort_order: i }));
        await supabase.from("product_images").insert(rows);
      }

      // Update variants
      await supabase.from("product_variants").delete().eq("product_id", id);
      if (variants.length) {
        const rows = variants.map((v) => ({
          product_id: id, storage: v.storage || null, color: v.color || null,
          ram: v.ram || null, network: v.network || null, model: v.model || null,
          price_diff: Number(v.price_diff) || 0, stock_quantity: Number(v.stock_quantity) || 0,
          sku: v.sku || null,
        }));
        await supabase.from("product_variants").insert(rows);
      }

      toast.success(isEdit ? "Product updated" : "Product created");
      onSuccess();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full h-10 px-3 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm";
  const labelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block";

  return (
    <div className="max-w-[1200px] mx-auto w-full">
      <div className="bg-card border border-border rounded-2xl w-full shadow-sm flex flex-col mb-8">
        <div className="bg-card border-b border-border px-6 py-5 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">{isEdit ? "Edit Product" : "New Product"}</h2>
            <p className="text-xs text-muted-foreground mt-1">Fill in the details below to {isEdit ? "update" : "create"} the product.</p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading product details...</p>
            </div>
          ) : (
            <>
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Basic Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Name *</label><input className={inputCls} value={form.name} onChange={(e) => update("name", e.target.value)} /></div>
                  <div><label className={labelCls}>Slug *</label><input className={inputCls} value={form.slug} onChange={(e) => update("slug", e.target.value)} /></div>
                  <div><label className={labelCls}>SKU</label><input className={inputCls} value={form.sku} onChange={(e) => update("sku", e.target.value)} /></div>
                  <div><label className={labelCls}>Barcode</label><input className={inputCls} value={form.barcode} onChange={(e) => update("barcode", e.target.value)} /></div>
                  <div>
                    <label className={labelCls}>Brand</label>
                    <select className={inputCls} value={form.brand_id} onChange={(e) => update("brand_id", e.target.value)}>
                      <option value="">— Select Brand —</option>
                      {brands?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select className={inputCls} value={form.category_id} onChange={(e) => update("category_id", e.target.value)}>
                      <option value="">— Select Category —</option>
                      {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Short Description</label>
                  <input className={inputCls} value={form.short_description} onChange={(e) => update("short_description", e.target.value)} placeholder="Brief summary for lists" />
                </div>
                <div>
                  <label className={labelCls}>Full Description</label>
                  <textarea rows={4} className={inputCls + " h-auto py-2 resize-y"} value={form.description} onChange={(e) => update("description", e.target.value)} />
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Pricing & Inventory</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div><label className={labelCls}>Price (LKR) *</label><input type="number" className={inputCls} value={form.price} onChange={(e) => update("price", Number(e.target.value))} /></div>
                  <div><label className={labelCls}>Discount Price</label><input type="number" className={inputCls} value={form.discount_price as any} onChange={(e) => update("discount_price", e.target.value === "" ? "" : Number(e.target.value))} /></div>
                  <div><label className={labelCls}>Cost Price</label><input type="number" className={inputCls} value={form.cost_price as any} onChange={(e) => update("cost_price", e.target.value === "" ? "" : Number(e.target.value))} /></div>
                  <div><label className={labelCls}>Stock Qty</label><input type="number" className={inputCls} value={form.stock_quantity} onChange={(e) => update("stock_quantity", Number(e.target.value))} /></div>
                  <div><label className={labelCls}>Low Stock Alert</label><input type="number" className={inputCls} value={form.stock_alert_quantity} onChange={(e) => update("stock_alert_quantity", Number(e.target.value))} /></div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select className={inputCls} value={form.status} onChange={(e) => update("status", e.target.value as any)}>
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="checkbox" className="size-4 rounded border-border text-primary focus:ring-primary" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
                    Featured product
                  </label>
                  <div>
                    <label className={labelCls}>Warranty</label>
                    <input className={inputCls} placeholder="e.g. 1 Year Official" value={form.warranty} onChange={(e) => update("warranty", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Product Images</h3>
                <label className="border-2 border-dashed border-border rounded-xl p-8 grid place-items-center text-center cursor-pointer hover:border-primary hover:bg-accent/30 transition-all">
                  <Upload className="size-8 text-muted-foreground" />
                  <div className="mt-2 text-sm font-semibold">Click or drop files to upload</div>
                  <div className="text-xs text-muted-foreground">Supports JPG, PNG, WebP</div>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
                </label>
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {images.map((im, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-muted">
                        <img src={im.url} alt="" className="size-full object-cover" />
                        <button 
                          onClick={() => setImages(images.filter((_, j) => j !== i))} 
                          className="absolute top-1.5 right-1.5 size-7 rounded-full bg-black/60 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Variants */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Product Variants</h3>
                  <button 
                    onClick={() => setVariants([...variants, { price_diff: 0, stock_quantity: 0 }])} 
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-primary/30 text-primary text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Plus className="size-4" /> ADD VARIANT
                  </button>
                </div>
                {variants.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-border rounded-xl">
                    <p className="text-sm text-muted-foreground">No variants added for this product.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {variants.map((v, i) => (
                      <div key={i} className="p-4 rounded-xl border border-border bg-muted/30 grid grid-cols-2 sm:grid-cols-8 gap-3 items-end">
                        <div className="sm:col-span-1"><label className={labelCls}>Storage</label><input className={inputCls} value={v.storage ?? ""} onChange={(e) => setVariants(variants.map((x, j) => j === i ? { ...x, storage: e.target.value } : x))} /></div>
                        <div className="sm:col-span-1"><label className={labelCls}>Color</label><input className={inputCls} value={v.color ?? ""} onChange={(e) => setVariants(variants.map((x, j) => j === i ? { ...x, color: e.target.value } : x))} /></div>
                        <div className="sm:col-span-1"><label className={labelCls}>RAM</label><input className={inputCls} value={v.ram ?? ""} onChange={(e) => setVariants(variants.map((x, j) => j === i ? { ...x, ram: e.target.value } : x))} /></div>
                        <div className="sm:col-span-1"><label className={labelCls}>Network</label><input className={inputCls} value={v.network ?? ""} onChange={(e) => setVariants(variants.map((x, j) => j === i ? { ...x, network: e.target.value } : x))} /></div>
                        <div className="sm:col-span-1"><label className={labelCls}>Model</label><input className={inputCls} value={v.model ?? ""} onChange={(e) => setVariants(variants.map((x, j) => j === i ? { ...x, model: e.target.value } : x))} /></div>
                        <div className="sm:col-span-1"><label className={labelCls}>± Price</label><input type="number" className={inputCls} value={v.price_diff} onChange={(e) => setVariants(variants.map((x, j) => j === i ? { ...x, price_diff: Number(e.target.value) } : x))} /></div>
                        <div className="sm:col-span-1"><label className={labelCls}>Stock</label><input type="number" className={inputCls} value={v.stock_quantity} onChange={(e) => setVariants(variants.map((x, j) => j === i ? { ...x, stock_quantity: Number(e.target.value) } : x))} /></div>
                        <div className="sm:col-span-1">
                          <button 
                            onClick={() => setVariants(variants.filter((_, j) => j !== i))} 
                            className="h-10 w-full grid place-items-center rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="bg-card border-t border-border px-6 py-5 flex justify-end gap-3 rounded-b-2xl">
          <button 
            onClick={onClose} 
            className="h-11 px-6 rounded-xl border border-border font-bold text-sm hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={submit} 
            disabled={saving || loading} 
            className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              isEdit ? "Update Product" : "Create Product"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}