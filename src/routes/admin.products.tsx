import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/admin/products")({
  component: ProductsList,
});

function fmtLkr(n: number | null) {
  return n == null ? "—" : "Rs. " + Number(n).toLocaleString("en-LK");
}

function ProductsList() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, price, discount_price, stock_quantity, status, featured, created_at, brands(name), categories!products_category_id_fkey(name), product_images(url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (products ?? []).filter((p: any) =>
    !q || p.name?.toLowerCase().includes(q.toLowerCase()) || p.sku?.toLowerCase().includes(q.toLowerCase()),
  );

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  return (
    <div className="space-y-5 max-w-[1600px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products?.length ?? 0} total products</p>
        </div>
        <button
          onClick={() => navigate({ to: "/admin/products/new" })}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90"
        >
          <Plus className="size-4" /> Add Product
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or SKU…"
              className="w-full pl-9 pr-3 h-9 rounded-lg bg-muted/60 border border-transparent focus:bg-background focus:border-border outline-none text-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-2.5">Product</th>
                <th className="text-left px-5 py-2.5">SKU</th>
                <th className="text-left px-5 py-2.5">Brand</th>
                <th className="text-left px-5 py-2.5">Category</th>
                <th className="text-right px-5 py-2.5">Price</th>
                <th className="text-right px-5 py-2.5">Stock</th>
                <th className="text-left px-5 py-2.5">Status</th>
                <th className="text-right px-5 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-16 text-center">
                  <Package className="mx-auto size-10 text-muted-foreground/50" />
                  <p className="mt-3 font-medium">No products yet</p>
                  <p className="text-xs text-muted-foreground">Click "Add Product" to create your first one.</p>
                </td></tr>
              )}
              {filtered.map((p: any) => (
                <tr key={p.id} className="hover:bg-accent/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-muted overflow-hidden grid place-items-center shrink-0">
                        {p.product_images?.[0]?.url
                          ? <img src={p.product_images[0].url} alt="" className="size-full object-cover" />
                          : <Package className="size-4 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{p.name}</div>
                        {p.featured && <span className="text-[10px] uppercase font-bold text-amber-600">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs font-mono">{p.sku ?? "—"}</td>
                  <td className="px-5 py-3">{p.brands?.name ?? "—"}</td>
                  <td className="px-5 py-3">{p.categories?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="font-semibold">{fmtLkr(p.discount_price ?? p.price)}</div>
                    {p.discount_price && <div className="text-xs text-muted-foreground line-through">{fmtLkr(p.price)}</div>}
                  </td>
                  <td className="px-5 py-3 text-right font-medium">{p.stock_quantity}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${
                      p.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : p.status === "draft" ? "bg-muted text-muted-foreground border-border"
                      : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link to="/admin/products/$id" params={{ id: p.id }} className="p-2 rounded hover:bg-accent" aria-label="Edit">
                        <Pencil className="size-4" />
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-2 rounded hover:bg-accent text-rose-600" aria-label="Delete">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
