import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Timer, X, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/flash-sales")({
  component: FlashSalesPage,
});

type FlashSale = {
  id?: string;
  product_id: string;
  sale_price: number;
  start_at: string;
  end_at: string;
  is_active: boolean;
};

const empty: FlashSale = {
  product_id: "",
  sale_price: 0,
  start_at: new Date().toISOString(),
  end_at: new Date(Date.now() + 86400000).toISOString(),
  is_active: true,
};

function FlashSalesPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<FlashSale | null>(null);

  const { data: sales, isLoading } = useQuery({
    queryKey: ["admin-flash-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flash_sales")
        .select("*, products(name, sku, price)")
        .order("start_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const filtered = (sales ?? []).filter((s: any) => 
    !q || s.products?.name?.toLowerCase().includes(q.toLowerCase()) || s.products?.sku?.toLowerCase().includes(q.toLowerCase())
  );

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove flash sale for "${name}"?`)) return;
    const { error } = await supabase.from("flash_sales").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Flash sale removed");
    qc.invalidateQueries({ queryKey: ["admin-flash-sales"] });
  }

  async function handleSave(s: FlashSale) {
    if (!s.product_id || s.sale_price <= 0) return toast.error("Product and valid price required");
    
    const { error } = s.id
      ? await supabase.from("flash_sales").update(s).eq("id", s.id)
      : await supabase.from("flash_sales").insert(s);

    if (error) return toast.error(error.message);
    toast.success(s.id ? "Sale updated" : "Sale scheduled");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-flash-sales"] });
  }

  const getStatus = (sale: any) => {
    const now = new Date();
    const start = new Date(sale.start_at);
    const end = new Date(sale.end_at);
    if (!sale.is_active) return { label: "Disabled", cls: "bg-slate-100 text-slate-600" };
    if (now < start) return { label: "Scheduled", cls: "bg-sky-100 text-sky-600" };
    if (now > end) return { label: "Expired", cls: "bg-rose-100 text-rose-600" };
    return { label: "Active", cls: "bg-emerald-100 text-emerald-600" };
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Flash Sales</h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule limited-time price drops to drive urgency and sales.</p>
        </div>
        <button 
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="size-5" /> Schedule Sale
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Search by product name or SKU..." 
              className="w-full pl-10 pr-4 h-10 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider font-bold text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-left px-6 py-4">Sale Price</th>
                <th className="text-left px-6 py-4">Period</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">Loading sales...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <Timer className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-bold text-lg">No flash sales found</h3>
                    <p className="text-sm text-muted-foreground">Start driving urgency by scheduling your first deal.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s: any) => {
                  const status = getStatus(s);
                  return (
                    <tr key={s.id} className="group hover:bg-accent/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-muted overflow-hidden border border-border grid place-items-center">
                            <img src={s.products?.image || ""} alt="" className="size-full object-contain p-1" />
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{s.products?.name}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{s.products?.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-primary">Rs. {s.sale_price.toLocaleString()}</span>
                          <span className="text-[10px] text-muted-foreground line-through">Rs. {s.products?.price.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="size-3" /> {new Date(s.start_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Timer className="size-3" /> {new Date(s.end_at).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider", status.cls)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditing(s)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Pencil className="size-4" /></button>
                          <button onClick={() => handleDelete(s.id, s.products?.name)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <FlashSaleModal sale={editing} onClose={() => setEditing(null)} onSave={handleSave} />}
    </div>
  );
}

function FlashSaleModal({ sale, onClose, onSave }: { sale: FlashSale; onClose: () => void; onSave: (s: FlashSale) => void }) {
  const [form, setForm] = useState<FlashSale>(sale);
  const [products] = useState<any[]>([]); // We'll fetch these in a query
  const { data: dbProducts } = useQuery({
    queryKey: ["admin-products-list"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name, price").order("name");
      return data ?? [];
    },
  });

  const isEdit = !!sale.id;
  const inputCls = "w-full h-10 px-3 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm transition-all";
  const labelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{isEdit ? "Edit Flash Sale" : "Schedule Flash Sale"}</h2>
            <p className="text-xs text-muted-foreground">Set a temporary price drop for a specific product.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent transition-colors"><X className="size-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Product *</label>
            <select 
              className={inputCls} 
              value={form.product_id} 
              onChange={(e) => setForm(f => ({ ...f, product_id: e.target.value }))}
            >
              <option value="">Select a product</option>
              {dbProducts?.map(p => <option key={p.id} value={p.id}>{p.name} (Rs. {p.price})</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Sale Price (LKR) *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                type="number" 
                className={cn(inputCls, "pl-9")} 
                value={form.sale_price} 
                onChange={(e) => setForm(f => ({ ...f, sale_price: Number(e.target.value) }))} 
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Start Date & Time</label>
            <input 
              type="datetime-local" 
              className={inputCls} 
              value={form.start_at.slice(0, 16)} 
              onChange={(e) => setForm(f => ({ ...f, start_at: new Date(e.target.value).toISOString() }))} 
            />
          </div>
          <div>
            <label className={labelCls}>End Date & Time</label>
            <input 
              type="datetime-local" 
              className={inputCls} 
              value={form.end_at.slice(0, 16)} 
              onChange={(e) => setForm(f => ({ ...f, end_at: new Date(e.target.value).toISOString() }))} 
            />
          </div>
          <div className="col-span-2 flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
            <input 
              type="checkbox" 
              id="is_active"
              className="size-4 rounded border-border text-primary focus:ring-primary" 
              checked={form.is_active} 
              onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))} 
            />
            <label htmlFor="is_active" className="text-sm font-medium cursor-pointer select-none">Enable this sale immediately</label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="h-11 px-6 rounded-xl border border-border font-bold text-sm hover:bg-accent transition-colors">Cancel</button>
          <button 
            onClick={() => onSave(form)} 
            className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            {isEdit ? "Update Sale" : "Schedule Sale"}
          </button>
        </div>
      </div>
    </div>
  );
}