import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Pencil, Trash2, FolderTree, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type Category = {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parent_id: string | null;
  sort_order: number;
  status: string;
};

const empty: Category = { name: "", slug: "", description: null, image: null, parent_id: null, sort_order: 0, status: "active" };

function CategoriesPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (categories ?? []).filter((c: any) => !q || c.name?.toLowerCase().includes(q.toLowerCase()));
  const parentName = (id: string | null) => categories?.find((c: any) => c.id === id)?.name ?? "—";

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Category deleted");
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  }

  async function handleSave(c: Category) {
    if (!c.name || !c.slug) return toast.error("Name and slug required");
    const payload = { ...c, description: c.description || null, image: c.image || null, parent_id: c.parent_id || null };
    const { error } = c.id
      ? await supabase.from("categories").update(payload).eq("id", c.id)
      : await supabase.from("categories").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(c.id ? "Category updated" : "Category created");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  }

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories?.length ?? 0} categories</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90">
          <Plus className="size-4" /> Add Category
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search categories…"
              className="w-full pl-9 pr-3 h-9 rounded-lg bg-muted/60 border border-transparent focus:bg-background focus:border-border outline-none text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-2.5">Category</th>
                <th className="text-left px-5 py-2.5">Slug</th>
                <th className="text-left px-5 py-2.5">Parent</th>
                <th className="text-right px-5 py-2.5">Order</th>
                <th className="text-left px-5 py-2.5">Status</th>
                <th className="text-right px-5 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-16 text-center">
                  <FolderTree className="mx-auto size-10 text-muted-foreground/50" />
                  <p className="mt-3 font-medium">No categories yet</p>
                </td></tr>
              )}
              {filtered.map((c: any) => (
                <tr key={c.id} className="hover:bg-accent/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-muted overflow-hidden grid place-items-center shrink-0">
                        {c.image ? <img src={c.image} alt="" className="size-full object-cover" /> : <FolderTree className="size-4 text-muted-foreground" />}
                      </div>
                      <div className="font-semibold">{c.name}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs font-mono">{c.slug}</td>
                  <td className="px-5 py-3 text-muted-foreground">{parentName(c.parent_id)}</td>
                  <td className="px-5 py-3 text-right">{c.sort_order}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${
                      c.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-muted text-muted-foreground border-border"
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => setEditing(c)} className="p-2 rounded hover:bg-accent" aria-label="Edit"><Pencil className="size-4" /></button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="p-2 rounded hover:bg-accent text-rose-600" aria-label="Delete"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <CategoryModal
          category={editing}
          allCategories={(categories ?? []) as any}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function CategoryModal({ category, allCategories, onClose, onSave }: { category: Category; allCategories: Category[]; onClose: () => void; onSave: (c: Category) => void }) {
  const [form, setForm] = useState<Category>(category);
  const isEdit = !!category.id;
  const inputCls = "w-full h-10 px-3 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm";
  const labelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block";
  function set<K extends keyof Category>(k: K, v: Category[K]) {
    setForm((f) => ({ ...f, [k]: v, ...(k === "name" && !isEdit ? { slug: slugify(v as string) } : {}) }));
  }
  const parentOptions = allCategories.filter((c) => c.id !== form.id);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{isEdit ? "Edit Category" : "New Category"}</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-accent"><X className="size-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <ImageUpload label="Category Image" value={form.image} onChange={(url) => set("image", url)} />
          </div>
          <div><label className={labelCls}>Name *</label><input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label className={labelCls}>Slug *</label><input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} /></div>
          <div>
            <label className={labelCls}>Parent</label>
            <select className={inputCls} value={form.parent_id ?? ""} onChange={(e) => set("parent_id", e.target.value || null)}>
              <option value="">—</option>
              {parentOptions.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Sort order</label><input type="number" className={inputCls} value={form.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} /></div>
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