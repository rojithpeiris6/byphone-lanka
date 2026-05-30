import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Package, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/admin/products")({
  component: ProductsList,
});

function fmtLkr(n: number | null) {
  return n == null ? "—" : "Rs. " + Number(n).toLocaleString("en-LK");
}

function ProductsList() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editingId, setEditingId] = useState<string | null | undefined>(undefined);

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
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your inventory, pricing, and variants.</p>
        </div>
        <button
          onClick={() => setEditingId(null)}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="size-5" /> Add Product
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, SKU or brand..."
              className="w-full pl-10 pr-4 h-10 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all"
            />
          </div>
          <div className="text-xs font-medium text-muted-foreground px-2">
            Showing {filtered.length} of {products?.length ?? 0} products
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider font-bold text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left px-6 py-4">Product Details</th>
                <th className="text-left px-6 py-4">SKU</th>
                <th className="text-left px-6 py-4">Category / Brand</th>
                <th className="text-right px-6 py-4">Price</th>
                <th className="text-right px-6 py-4">Stock</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="size-8 text-primary animate-spin" />
                      <p className="text-muted-foreground font-medium">Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="size-16 rounded-2xl bg-muted grid place-items-center mx-auto mb-4">
                        <Package className="size-8 text-muted-foreground/50" />
                      </div>
                      <h3 className="font-bold text-lg">No products found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {q ? "Try adjusting your search filters." : "Get started by adding your first product to the store."}
                      </p>
                      {!q && (
                        <button 
                          onClick={() => setEditingId(null)}
                          className="mt-4 text-primary font-bold text-sm hover:underline"
                        >
                          Add your first product
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p: any) => (
                  <tr key={p.id} className="group hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-muted overflow-hidden border border-border grid place-items-center shrink-0 group-hover:border-primary/30 transition-colors">
                          {p.product_images?.[0]?.url
                            ? <img src={p.product_images[0].url} alt="" className="size-full object-contain p-1" />
                            : <Package className="size-5 text-muted-foreground/40" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{p.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {p.featured && (
                              <span className="text-[9px] uppercase font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Featured</span>
                            )}
                            <span className="text-[10px] text-muted-foreground">Added {new Date(p.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{p.sku ?? "—"}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold">{p.categories?.name ?? "Uncategorized"}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{p.brands?.name ?? "No Brand"}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-primary">{fmtLkr(p.discount_price ?? p.price)}</div>
                      {p.discount_price && (
                        <div className="text-[10px] text-muted-foreground line-through">{fmtLkr(p.price)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={cn(
                        "font-bold",
                        p.stock_quantity <= 0 ? "text-destructive" : p.stock_quantity <= 5 ? "text-amber-600" : "text-foreground"
                      )}>
                        {p.stock_quantity}
                      </div>
                      <div className="text-[10px] text-muted-foreground">units</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                        p.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : p.status === "draft" ? "bg-slate-100 text-slate-600 border-slate-200"
                        : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      )}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingId(p.id)} 
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors" 
                          title="Edit Product"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id, p.name)} 
                          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" 
                          title="Delete Product"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingId !== undefined && (
        <ProductForm 
          productId={editingId} 
          onClose={() => setEditingId(undefined)} 
          onSuccess={() => {
            setEditingId(undefined);
            qc.invalidateQueries({ queryKey: ["admin-products"] });
          }}
        />
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}