import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Tags, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/brands")({
  component: BrandsPage,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type Brand = {
  id?: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  description: string | null;
  status: string;
};

const empty: Brand = { name: "", slug: "", logo: null, website: null, description: null, status: "active" };

function BrandsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Brand | null>(null);

  const { data: brands, isLoading } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => {
      const { data, error } = await supabase.from("brands").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (brands ?? []).filter((b: any) => !q || b.name?.toLowerCase().includes(q.toLowerCase()));

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Brand deleted");
    qc.invalidateQueries({ queryKey: ["admin-brands"] });
  }

  async function handleSave(b: Brand) {
    if (!b.name || !b.slug) return toast.error("Name and slug required");
    const payload = { ...b, logo: b.logo || null, website: b.website || null, description: b.description || null };
    const { error } = b.id
      ? await supabase.from("brands").update(payload).eq("id", b.id)
      : await supabase.from("brands").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(b.id ? "Brand updated" : "Brand created");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-brands"] });
  }

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Brands</h1>
          <p className="text-sm text-muted-foreground mt-1">{brands?.length ?? 0} brands</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90">
          <Plus className="size-4" /> Add Brand
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brands…"
              className="w-full pl-9 pr-3 h-9 rounded-lg bg-muted/60 border border-transparent focus:bg-background focus:border-border outline-none text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-2.5">Brand</th>
                <th className="text-left px-5 py-2.5">Slug</th>
                <th className="text-left px-5 py-2.5">Website</th>
                <th className="text-left px-5 py-2.5">Status</th>
                <th className="text-right px-5 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-16 text-center">
                  <Tags className="mx-auto size-10 text-muted-foreground/50" />
                  <p className="mt-3 font-medium">No brands yet</p>
                </td></tr>
              )}
              {filtered.map((b: any) => (
                <tr key={b.id} className="hover:bg-accent/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-muted overflow-hidden grid place-items-center shrink-0">
                        {b.logo ? <img src={b.logo} alt="" className="size-full object-cover" /> : <Tags className="size-4 text-muted-foreground" />}
                      </div>
                      <div className="font-semibold">{b.name}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs font-mono">{b.slug}</td>
                  <td className="px-5 py-3 text-muted-foreground">{b.website ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${
                      b.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-muted text-muted-foreground border-border"
                    }`}>{b.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => setEditing(b)} className="p-2 rounded hover:bg-accent" aria-label="Edit"><Pencil className="size-4" /></button>
                      <button onClick={() => handleDelete(b.id, b.name)} className="p-2 rounded hover:bg-accent text-rose-600" aria-label="Delete"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <BrandModal brand={editing} onClose={() => setEditing(null)} onSave={handleSave} />}
    </div>
  );
}

function BrandModal({ brand, onClose, onSave }: { brand: Brand; onClose: () => void; onSave: (b: Brand) => void }) {
  const [form, setForm] = useState<Brand>(brand);
  const isEdit = !!brand.id;
  const inputCls = "w-full h-10 px-3 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm";
  const labelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block";
  function set<K extends keyof Brand>(k: K, v: Brand[K]) {
    setForm((f) => ({ ...f, [k]: v, ...(k === "name" && !isEdit ? { slug: slugify(v as string) } : {}) }));
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{isEdit ? "Edit Brand" : "New Brand"}</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-accent"><X className="size-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Name *</label><input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label className={labelCls}>Slug *</label><input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} /></div>
          <div className="col-span-2"><label className={labelCls}>Logo URL</label><input className={inputCls} value={form.logo ?? ""} onChange={(e) => set("logo", e.target.value)} /></div>
          <div className="col-span-2"><label className={labelCls}>Website</label><input className={inputCls} value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} /></div>
          <div className="col-span-2">
            <label className={labelCls}>Description</label>
            <textarea rows={3} className={inputCls + " h-auto py-2 resize-y"} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="h-10 px-4 rounded-lg border border-border font-semibold text-sm hover:bg-accent">Cancel</button>
          <button onClick={() => onSave(form)} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90">
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
