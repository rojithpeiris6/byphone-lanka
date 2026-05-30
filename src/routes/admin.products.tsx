import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  ChevronDown,
  Package,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { supabase, type AdminProduct } from "@/lib/supabase";
import { formatLKR } from "@/lib/shop";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
});

const CATEGORIES = ["Smartphones", "Earbuds", "Smartwatches", "Tablets", "Cases", "Chargers"];

type ProductForm = {
  id: string;
  brand: string;
  name: string;
  price: string;
  old_price: string;
  category: string;
  badge: string;
  stock: string;
  image_url: string;
  description: string;
  is_active: boolean;
};

function emptyForm(): ProductForm {
  return {
    id: "",
    brand: "",
    name: "",
    price: "",
    old_price: "",
    category: "Smartphones",
    badge: "",
    stock: "0",
    image_url: "",
    description: "",
    is_active: true,
  };
}

function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: AdminProduct | null;
  onClose: () => void;
  onSave: (p: AdminProduct) => void;
}) {
  const editing = !!product;
  const [form, setForm] = useState<ProductForm>(
    product
      ? {
          id: product.id,
          brand: product.brand,
          name: product.name,
          price: product.price.toString(),
          old_price: product.old_price?.toString() ?? "",
          category: product.category,
          badge: product.badge ?? "",
          stock: product.stock.toString(),
          image_url: product.image_url,
          description: product.description ?? "",
          is_active: product.is_active,
        }
      : emptyForm(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof ProductForm, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (!form.name || !form.brand || !form.price) {
      setError("Name, brand and price are required.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      id: editing ? form.id : form.id || form.name.toLowerCase().replace(/\s+/g, "-"),
      brand: form.brand,
      name: form.name,
      price: parseInt(form.price) || 0,
      old_price: form.old_price ? parseInt(form.old_price) : null,
      category: form.category,
      badge: form.badge || null,
      stock: parseInt(form.stock) || 0,
      image_url: form.image_url,
      description: form.description || null,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    const { data, error: err } = editing
      ? await supabase
          .from("admin_products")
          .update(payload)
          .eq("id", form.id)
          .select()
          .single()
      : await supabase
          .from("admin_products")
          .insert(payload)
          .select()
          .single();

    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      onSave(data as AdminProduct);
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-800">{editing ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X className="size-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[72vh]">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Brand *" value={form.brand} onChange={(v) => set("brand", v)} placeholder="e.g. Apple" />
            <Field label="Category" value={form.category} onChange={(v) => set("category", v)} select options={CATEGORIES} />
          </div>
          <Field label="Product Name *" value={form.name} onChange={(v) => set("name", v)} placeholder="e.g. iPhone 15 Pro 256GB" />
          {!editing && (
            <Field label="Product ID" value={form.id} onChange={(v) => set("id", v)} placeholder="e.g. iphone-15-pro (auto from name)" />
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Price (Rs.) *" value={form.price} onChange={(v) => set("price", v)} placeholder="e.g. 499999" type="number" />
            <Field label="Old Price (Rs.)" value={form.old_price} onChange={(v) => set("old_price", v)} placeholder="optional" type="number" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Stock" value={form.stock} onChange={(v) => set("stock", v)} placeholder="0" type="number" />
            <Field label="Badge" value={form.badge} onChange={(v) => set("badge", v)} placeholder="e.g. NEW, -10%" />
          </div>
          <Field label="Image URL" value={form.image_url} onChange={(v) => set("image_url", v)} placeholder="/assets/..." />
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Short product description..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => set("is_active", !form.is_active)}>
              {form.is_active ? (
                <ToggleRight className="size-8 text-blue-600" />
              ) : (
                <ToggleLeft className="size-8 text-slate-400" />
              )}
            </button>
            <span className="text-sm font-semibold text-slate-700">
              {form.is_active ? "Active (visible in store)" : "Inactive (hidden from store)"}
            </span>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 text-sm font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : editing ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  select,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  select?: boolean;
  options?: string[];
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{label}</label>
      {select ? (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          >
            {options?.map((o) => <option key={o}>{o}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
        />
      )}
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [editProduct, setEditProduct] = useState<AdminProduct | null | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("admin_products")
        .select("*")
        .order("created_at", { ascending: false });
      setProducts(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function toggleActive(p: AdminProduct) {
    await supabase
      .from("admin_products")
      .update({ is_active: !p.is_active, updated_at: new Date().toISOString() })
      .eq("id", p.id);
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_active: !p.is_active } : x)));
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await supabase.from("admin_products").delete().eq("id", deleteId);
    setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
  }

  function handleSave(saved: AdminProduct) {
    setProducts((prev) => {
      const exists = prev.find((p) => p.id === saved.id);
      return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
    });
  }

  const cats = ["all", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchCat = catFilter === "all" || p.category === catFilter;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} total products</p>
        </div>
        <button
          onClick={() => setEditProduct(null)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700"
        >
          <Plus className="size-4" /> Add Product
        </button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={
              "text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors " +
              (catFilter === c
                ? "bg-blue-600 text-white border-blue-600"
                : "border-slate-200 text-slate-600 hover:border-slate-400")
            }
          >
            {c === "all" ? "All Categories" : c}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="size-7 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">Product</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Category</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">Price</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Stock</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.brand}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-500 hidden md:table-cell">{p.category}</td>
                    <td className="px-5 py-3 font-bold text-slate-800">
                      {formatLKR(p.price)}
                      {p.old_price && (
                        <span className="ml-2 text-xs text-slate-400 line-through font-normal">{formatLKR(p.old_price)}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          p.stock <= 5
                            ? "bg-red-100 text-red-700"
                            : p.stock <= 20
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleActive(p)}>
                        {p.is_active ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">Active</span>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">Inactive</span>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditProduct(p)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center py-12 text-sm text-slate-400 flex flex-col items-center gap-2">
                <Package className="size-6 text-slate-300" />
                No products found.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {editProduct !== undefined && (
        <ProductModal
          product={editProduct}
          onClose={() => setEditProduct(undefined)}
          onSave={handleSave}
        />
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="size-12 rounded-full bg-red-100 grid place-items-center mx-auto mb-4">
              <Trash2 className="size-6 text-red-600" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">Delete Product?</h3>
            <p className="text-sm text-slate-500 mt-2">This action cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
