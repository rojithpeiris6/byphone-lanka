import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Package, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/admin/products/")({
  component: ProductsList,
});

function fmtLkr(n: number | null) {
  return n == null ? "—" : "Rs. " + Number(n).toLocaleString("en-LK");
}

function ProductsList() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page, q],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("id, name, sku, price, discount_price, stock_quantity, status, featured, created_at, brands(name), categories!products_category_id_fkey(name), product_images(url)", { count: "exact" });
      
      if (q) {
        query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
      }

      const { data: productsData, error, count } = await query
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
        
      if (error) throw error;
      return { products: productsData ?? [], total: count ?? 0 };
    },
  });

  const products = data?.products ?? [];
  const totalProducts = data?.total ?? 0;
  const totalPages = Math.ceil(totalProducts / PAGE_SIZE) || 1;

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
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="size-5" /> Add Product
        </Link>
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
            Showing {products.length} of {totalProducts} products
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
              ) : products.length === 0 ? (
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
                        <Link 
                          to="/admin/products/new"
                          className="mt-4 text-primary font-bold text-sm hover:underline"
                        >
                          Add your first product
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p: any) => (
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
                        <Link 
                          to="/admin/products/$productId"
                          params={{ productId: p.id }}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors block" 
                          title="Edit Product"
                        >
                          <Pencil className="size-4" />
                        </Link>
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
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border bg-card flex items-center justify-between">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 text-xs font-bold uppercase rounded-lg border border-border disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                // Show first, last, and pages around current page
                if (totalPages > 7 && p !== 1 && p !== totalPages && Math.abs(page - p) > 1) {
                  // Only show one ellipsis
                  if (p === 2 && page > 3) return <span key={p} className="px-2 text-muted-foreground">...</span>;
                  if (p === totalPages - 1 && page < totalPages - 2) return <span key={p} className="px-2 text-muted-foreground">...</span>;
                  return null;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "size-8 flex items-center justify-center text-xs font-bold rounded-lg transition-colors border",
                      page === p 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 text-xs font-bold uppercase rounded-lg border border-border disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}