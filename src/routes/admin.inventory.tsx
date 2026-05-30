import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Package, Plus, Minus, AlertTriangle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

function InventoryPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [adjusting, setAdjusting] = useState<StockRow | null>(null);

  const { data: products, isLoading } = useQuery({
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

  const filtered = (products ?? []).filter((p) => {
    if (q && !p.name?.toLowerCase().includes(q.toLowerCase()) && !p.sku?.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === "out") return p.stock_quantity <= 0;
    if (filter === "low") return p.stock_quantity > 0 && p.stock_quantity <= p.stock_alert_quantity;
    return true;
  });

  const totalUnits = (products ?? []).reduce((s, p) => s + (p.stock_quantity || 0), 0);
  const lowCount = (products ?? []).filter((p) => p.stock_quantity > 0 && p.stock_quantity <= p.stock_alert_quantity).length;
  const outCount = (products ?? []).filter((p) => p.stock_quantity <= 0).length;

  async function quickAdjust(p: StockRow, delta: number) {
    const next = Math.max(0, (p.stock_quantity || 0) + delta);
    const { error } = await supabase.from("products").update({ stock_quantity: next }).eq("id", p.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-inventory"] });
  }

  async function handleAdjust(p: StockRow, type: "in" | "out" | "set", qty: number) {
    const current = p.stock_quantity || 0;
    const next = type === "set" ? Math.max(0, qty) : type === "in" ? current + qty : Math.max(0, current - qty);
    const { error } = await supabase.from("products").update({ stock_quantity: next }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(`Stock updated to ${next}`);
    setAdjusting(null);
    qc.invalidateQueries({ queryKey: ["admin-inventory"] });
  }

  const StatCard = ({ label, value, tint }: { label: string; value: number | string; tint: string }) => (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="text-xs uppercase font-semibold text-muted-foreground">{label}</div>
      <div className={`text-2xl font-extrabold mt-1 ${tint}`}>{value}</div>
    </div>
  );

  return (
    <div className="space-y-5 max-w-[1600px]">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">Track stock levels and make quick adjustments.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total products" value={products?.length ?? 0} tint="" />
        <StatCard label="Total units" value={totalUnits.toLocaleString()} tint="" />
        <StatCard label="Low stock" value={lowCount} tint="text-amber-600" />
        <StatCard label="Out of stock" value={outCount} tint="text-rose-600" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
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
              {isLoading && <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-16 text-center">
                  <Package className="mx-auto size-10 text-muted-foreground/50" />
                  <p className="mt-3 font-medium">No products match</p>
                </td></tr>
              )}
              {filtered.map((p) => {
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

      {adjusting && <AdjustModal product={adjusting} onClose={() => setAdjusting(null)} onSave={handleAdjust} />}
    </div>
  );
}

function AdjustModal({ product, onClose, onSave }: { product: StockRow; onClose: () => void; onSave: (p: StockRow, type: "in" | "out" | "set", qty: number) => void }) {
  const [type, setType] = useState<"in" | "out" | "set">("in");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const inputCls = "w-full h-10 px-3 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm";
  const labelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Adjust Stock</h2>
            <p className="text-xs text-muted-foreground truncate">{product.name} · current: {product.stock_quantity}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-accent"><X className="size-4" /></button>
        </div>
        <div>
          <label className={labelCls}>Action</label>
          <div className="grid grid-cols-3 gap-2">
            {(["in", "out", "set"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`h-10 rounded-lg border text-sm font-semibold capitalize ${type === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}>
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
          <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for adjustment" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="h-10 px-4 rounded-lg border border-border font-semibold text-sm hover:bg-accent">Cancel</button>
          <button onClick={() => onSave(product, type, qty)} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
