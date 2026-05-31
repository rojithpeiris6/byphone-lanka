import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Package, Plus, Minus, AlertTriangle, X, History, ArrowUpRight, ArrowDownRight, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/inventory")({
  component: InventoryPage,
});

type StockRow = {
  id: string;
  name: string;
  sku: string | null;
  stock_quantity: number;
  stock_alert_quantity: number;
  status: string;
  product_images: { url: string }[];
};

type InventoryLog = {
  id: string;
  product_id: string;
  type: 'in' | 'out' | 'set';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  note: string | null;
  created_at: string;
  products: { name: string; sku: string | null };
};

function InventoryPage() {
  const qc = useQueryClient();
  const [view, setView] = useState<"stock" | "history">("stock");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [adjusting, setAdjusting] = useState<StockRow | null>(null);

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, stock_quantity, stock_alert_quantity, status, product_images(url)")
        .order("stock_quantity", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any as StockRow[];
    },
  });

  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ["admin-inventory-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_logs")
        .select("*, products(name, sku)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as any as InventoryLog[];
    },
    enabled: view === "history",
  });

  const filteredProducts = (products ?? []).filter((p) => {
    if (q && !p.name?.toLowerCase().includes(q.toLowerCase()) && !p.sku?.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === "out") return p.stock_quantity <= 0;
    if (filter === "low") return p.stock_quantity > 0 && p.stock_quantity <= p.stock_alert_quantity;
    return true;
  });

  const filteredLogs = (logs ?? []).filter((l) => 
    !q || l.products?.name?.toLowerCase().includes(q.toLowerCase()) || l.products?.sku?.toLowerCase().includes(q.toLowerCase())
  );

  async function recordLog(productId: string, type: 'in' | 'out' | 'set', qty: number, prev: number, next: number, note?: string) {
    const { error } = await supabase.from("inventory_logs").insert({
      product_id: productId,
      type,
      quantity: qty,
      previous_stock: prev,
      new_stock: next,
      note: note || null,
    });
    if (error) console.error("Failed to record log:", error);
  }

  async function quickAdjust(p: StockRow, delta: number) {
    const current = p.stock_quantity || 0;
    const next = Math.max(0, current + delta);
    const type = delta > 0 ? 'in' : 'out';
    
    const { error } = await supabase.from("products").update({ stock_quantity: next }).eq("id", p.id);
    if (error) return toast.error(error.message);
    
    await recordLog(p.id, type, Math.abs(delta), current, next, "Quick adjustment");
    
    qc.invalidateQueries({ queryKey: ["admin-inventory"] });
    qc.invalidateQueries({ queryKey: ["admin-inventory-logs"] });
  }

  async function handleAdjust(p: StockRow, type: "in" | "out" | "set", qty: number, note?: string) {
    const current = p.stock_quantity || 0;
    let next = current;
    let logQty = qty;

    if (type === "set") {
      next = Math.max(0, qty);
      logQty = next;
    } else if (type === "in") {
      next = current + qty;
    } else {
      next = Math.max(0, current - qty);
    }

    const { error } = await supabase.from("products").update({ stock_quantity: next }).eq("id", p.id);
    if (error) return toast.error(error.message);
    
    await recordLog(p.id, type, logQty, current, next, note);

    toast.success(`Stock updated to ${next}`);
    setAdjusting(null);
    qc.invalidateQueries({ queryKey: ["admin-inventory"] });
    qc.invalidateQueries({ queryKey: ["admin-inventory-logs"] });
  }

  return (
    <div className="space-y-5 max-w-[1600px]">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">Track stock levels and record movement history.</p>
        </div>
        <div className="flex bg-muted p-1 rounded-xl">
          <button 
            onClick={() => setView("stock")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              view === "stock" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Package className="size-4" /> Stock Levels
          </button>
          <button 
            onClick={() => setView("history")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              view === "history" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <History className="size-4" /> Record History
          </button>
        </div>
      </div>

      {view === "stock" ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total products" value={products?.length ?? 0} tint="" />
            <StatCard label="Total units" value={(products ?? []).reduce((s, p) => s + (p.stock_quantity || 0), 0).toLocaleString()} tint="" />
            <StatCard label="Low stock" value={(products ?? []).filter((p) => p.stock_quantity > 0 && p.stock_quantity <= p.stock_alert_quantity).length} tint="text-amber-600" />
            <StatCard label="Out of stock" value={(products ?? []).filter((p) => p.stock_quantity <= 0).length} tint="text-rose-600" />
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or SKU…"
                  className="w-full pl-9 pr-3 h-9 rounded-lg bg-muted/60 border border-transparent focus:bg-background focus:border-border outline-none text-sm" />
              </div>
              <div className="inline-flex rounded-lg border border-border overflow-hidden text-sm">
                {(["all", "low", "out"] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 h-9 font-medium capitalize ${filter === f ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                    {f === "all" ? "All" : f === "low" ? "Low stock" : "Out of stock"}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-5 py-2.5">Product</th>
                    <th className="text-left px-5 py-2.5">SKU</th>
                    <th className="text-right px-5 py-2.5">Stock</th>
                    <th className="text-right px-5 py-2.5">Low alert</th>
                    <th className="text-left px-5 py-2.5">Status</th>
                    <th className="text-right px-5 py-2.5">Quick</th>
                    <th className="text-right px-5 py-2.5">Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingProducts && <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">Loading…</td></tr>}
                  {!loadingProducts && filteredProducts.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-16 text-center">
                      <Package className="mx-auto size-10 text-muted-foreground/50" />
                      <p className="mt-3 font-medium">No products match</p>
                    </td></tr>
                  )}
                  {filteredProducts.map((p) => {
                    const low = p.stock_quantity > 0 && p.stock_quantity <= p.stock_alert_quantity;
                    const out = p.stock_quantity <= 0;
                    return (
                      <tr key={p.id} className="hover:bg-accent/40">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-muted overflow-hidden grid place-items-center shrink-0">
                              {p.product_images?.[0]?.url
                                ? <img src={p.product_images[0].url} alt="" className="size-full object-cover" />
                                : <Package className="size-4 text-muted-foreground" />}
                            </div>
                            <div className="font-semibold truncate">{p.name}</div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground text-xs font-mono">{p.sku ?? "—"}</td>
                        <td className={`px-5 py-3 text-right font-bold ${out ? "text-rose-600" : low ? "text-amber-600" : ""}`}>
                          <span className="inline-flex items-center gap-1.5 justify-end">
                            {(out || low) && <AlertTriangle className="size-3.5" />}
                            {p.stock_quantity}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-muted-foreground">{p.stock_alert_quantity}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${
                            out ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            : low ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          }`}>{out ? "Out" : low ? "Low" : "In stock"}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button onClick={() => quickAdjust(p, -1)} className="size-8 grid place-items-center rounded border border-border hover:bg-accent" aria-label="Decrease"><Minus className="size-3.5" /></button>
                            <button onClick={() => quickAdjust(p, 1)} className="size-8 grid place-items-center rounded border border-border hover:bg-accent" aria-label="Increase"><Plus className="size-3.5" /></button>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => setAdjusting(p)} className="h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-accent">Adjust</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search history by product…"
                className="w-full pl-9 pr-3 h-9 rounded-lg bg-muted/60 border border-transparent focus:bg-background focus:border-border outline-none text-sm" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-2.5">Date & Time</th>
                  <th className="text-left px-5 py-2.5">Product</th>
                  <th className="text-left px-5 py-2.5">Type</th>
                  <th className="text-right px-5 py-2.5">Quantity</th>
                  <th className="text-right px-5 py-2.5">Stock Change</th>
                  <th className="text-left px-5 py-2.5">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingLogs && <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">Loading history…</td></tr>}
                {!loadingLogs && filteredLogs.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-16 text-center">
                    <Clock className="mx-auto size-10 text-muted-foreground/50" />
                    <p className="mt-3 font-medium">No history records found</p>
                  </td></tr>
                )}
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-accent/40">
                    <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("en-LK", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold">{log.products?.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{log.products?.sku}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                        log.type === 'in' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        log.type === 'out' ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                        "bg-sky-500/10 text-sky-600 border-sky-500/20"
                      )}>
                        {log.type === 'in' ? <ArrowUpRight className="size-3" /> : log.type === 'out' ? <ArrowDownRight className="size-3" /> : null}
                        Stock {log.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold">{log.quantity}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="text-xs text-muted-foreground">{log.previous_stock} → <span className="font-bold text-foreground">{log.new_stock}</span></div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground italic text-xs">{log.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adjusting && <AdjustModal product={adjusting} onClose={() => setAdjusting(null)} onSave={handleAdjust} />}
    </div>
  );
}

function StatCard({ label, value, tint }: { label: string; value: number | string; tint: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">{label}</div>
      <div className={`text-2xl font-extrabold mt-1 ${tint}`}>{value}</div>
    </div>
  );
}

function AdjustModal({ product, onClose, onSave }: { product: StockRow; onClose: () => void; onSave: (p: StockRow, type: "in" | "out" | "set", qty: number, note: string) => void }) {
  const [type, setType] = useState<"in" | "out" | "set">("in");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const inputCls = "w-full h-10 px-3 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm transition-all";
  const labelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Adjust Stock</h2>
            <p className="text-xs text-muted-foreground truncate">{product.name} · current: <span className="font-bold text-foreground">{product.stock_quantity}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent transition-colors"><X className="size-4" /></button>
        </div>
        <div>
          <label className={labelCls}>Action</label>
          <div className="grid grid-cols-3 gap-2">
            {(["in", "out", "set"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={cn(
                  "h-10 rounded-lg border text-sm font-bold capitalize transition-all",
                  type === t ? "bg-primary text-primary-foreground border-primary shadow-md" : "border-border hover:bg-accent text-muted-foreground"
                )}>
                {t === "in" ? "Stock in" : t === "out" ? "Stock out" : "Set to"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>{type === "set" ? "New quantity" : "Quantity"}</label>
          <input type="number" min={0} className={inputCls} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>Note (optional)</label>
          <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Restock, Damaged, Return..." />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="h-10 px-4 rounded-lg border border-border font-bold text-sm hover:bg-accent transition-colors">Cancel</button>
          <button onClick={() => onSave(product, type, qty, note)} className="h-10 px-6 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
            Apply Adjustment
          </button>
        </div>
      </div>
    </div>
  );
}