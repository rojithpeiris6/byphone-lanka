import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Ticket, X, Calendar, Tag, DollarSign, Percent, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/coupons")({
  component: CouponsPage,
});

type Coupon = {
  id?: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  usage_limit: number | null;
  used_count: number;
  status: 'active' | 'inactive' | 'expired';
};

const empty: Coupon = {
  code: "",
  description: null,
  discount_type: 'percentage',
  discount_value: 0,
  min_order_amount: 0,
  max_discount_amount: null,
  start_date: null,
  end_date: null,
  usage_limit: null,
  used_count: 0,
  status: 'active'
};

function CouponsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Coupon | null>(null);

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });

  const filtered = (coupons ?? []).filter((c) => 
    !q || c.code.toLowerCase().includes(q.toLowerCase()) || c.description?.toLowerCase().includes(q.toLowerCase())
  );

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Coupon deleted");
    qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  }

  async function handleSave(c: Coupon) {
    if (!c.code || c.discount_value <= 0) return toast.error("Code and valid discount value required");
    
    const payload = {
      ...c,
      code: c.code.toUpperCase().trim(),
      discount_value: Number(c.discount_value),
      min_order_amount: Number(c.min_order_amount),
      max_discount_amount: c.max_discount_amount ? Number(c.max_discount_amount) : null,
      usage_limit: c.usage_limit ? Number(c.usage_limit) : null,
      updated_at: new Date().toISOString()
    };

    const { error } = c.id
      ? await supabase.from("coupons").update(payload).eq("id", c.id)
      : await supabase.from("coupons").insert(payload);

    if (error) return toast.error(error.message);
    toast.success(c.id ? "Coupon updated" : "Coupon created");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  }

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage discount codes for your customers.</p>
        </div>
        <button 
          onClick={() => setEditing({ ...empty })} 
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="size-4" /> Create Coupon
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Search by code or description…"
              className="w-full pl-9 pr-3 h-9 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm transition-all" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider font-bold text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left px-6 py-4">Coupon Code</th>
                <th className="text-left px-6 py-4">Discount</th>
                <th className="text-left px-6 py-4">Usage</th>
                <th className="text-left px-6 py-4">Validity</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading coupons…</td></tr>}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="size-16 rounded-2xl bg-muted grid place-items-center mx-auto mb-4">
                      <Ticket className="size-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="font-bold text-lg">No coupons found</h3>
                    <p className="text-sm text-muted-foreground">Start by creating your first discount code.</p>
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="group hover:bg-accent/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                        <Tag className="size-5" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground font-mono tracking-wider">{c.code}</div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">{c.description ?? "No description"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-primary">
                      {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `Rs. ${c.discount_value.toLocaleString()} OFF`}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Min. order: Rs. {c.min_order_amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{c.used_count} used</div>
                    <div className="text-[10px] text-muted-foreground">
                      Limit: {c.usage_limit ?? "Unlimited"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      {c.end_date ? new Date(c.end_date).toLocaleDateString() : "No expiry"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {c.start_date ? `From ${new Date(c.start_date).toLocaleDateString()}` : "Started"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                      c.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : c.status === "expired" ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing(c)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Pencil className="size-4" /></button>
                      <button onClick={() => handleDelete(c.id!, c.code)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <CouponModal coupon={editing} onClose={() => setEditing(null)} onSave={handleSave} />}
    </div>
  );
}

function CouponModal({ coupon, onClose, onSave }: { coupon: Coupon; onClose: () => void; onSave: (c: Coupon) => void }) {
  const [form, setForm] = useState<Coupon>(coupon);
  const isEdit = !!coupon.id;
  const inputCls = "w-full h-10 px-3 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm transition-all";
  const labelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block";

  function set<K extends keyof Coupon>(k: K, v: Coupon[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl p-6 space-y-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{isEdit ? "Edit Coupon" : "New Coupon"}</h2>
            <p className="text-xs text-muted-foreground">Configure discount rules and validity.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent transition-colors"><X className="size-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Coupon Code *</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                className={cn(inputCls, "pl-10 font-mono uppercase tracking-widest")} 
                placeholder="SUMMER2024"
                value={form.code} 
                onChange={(e) => set("code", e.target.value)} 
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className={labelCls}>Description</label>
            <input 
              className={inputCls} 
              placeholder="e.g. 10% off on all smartphones"
              value={form.description ?? ""} 
              onChange={(e) => set("description", e.target.value)} 
            />
          </div>

          <div>
            <label className={labelCls}>Discount Type</label>
            <div className="flex bg-muted p-1 rounded-lg">
              <button 
                onClick={() => set("discount_type", "percentage")}
                className={cn(
                  "flex-1 h-8 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all",
                  form.discount_type === "percentage" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                )}
              >
                <Percent className="size-3" /> Percentage
              </button>
              <button 
                onClick={() => set("discount_type", "fixed")}
                className={cn(
                  "flex-1 h-8 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all",
                  form.discount_type === "fixed" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                )}
              >
                <DollarSign className="size-3" /> Fixed Amount
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Discount Value *</label>
            <input 
              type="number" 
              className={inputCls} 
              value={form.discount_value} 
              onChange={(e) => set("discount_value", Number(e.target.value))} 
            />
          </div>

          <div>
            <label className={labelCls}>Min. Order Amount</label>
            <input 
              type="number" 
              className={inputCls} 
              value={form.min_order_amount} 
              onChange={(e) => set("min_order_amount", Number(e.target.value))} 
            />
          </div>

          <div>
            <label className={labelCls}>Max. Discount (Optional)</label>
            <input 
              type="number" 
              className={inputCls} 
              value={form.max_discount_amount ?? ""} 
              onChange={(e) => set("max_discount_amount", e.target.value ? Number(e.target.value) : null)} 
            />
          </div>

          <div>
            <label className={labelCls}>Start Date</label>
            <input 
              type="date" 
              className={inputCls} 
              value={form.start_date ? form.start_date.split('T')[0] : ""} 
              onChange={(e) => set("start_date", e.target.value ? new Date(e.target.value).toISOString() : null)} 
            />
          </div>

          <div>
            <label className={labelCls}>End Date</label>
            <input 
              type="date" 
              className={inputCls} 
              value={form.end_date ? form.end_date.split('T')[0] : ""} 
              onChange={(e) => set("end_date", e.target.value ? new Date(e.target.value).toISOString() : null)} 
            />
          </div>

          <div>
            <label className={labelCls}>Usage Limit</label>
            <input 
              type="number" 
              className={inputCls} 
              placeholder="Unlimited"
              value={form.usage_limit ?? ""} 
              onChange={(e) => set("usage_limit", e.target.value ? Number(e.target.value) : null)} 
            />
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select 
              className={inputCls} 
              value={form.status} 
              onChange={(e) => set("status", e.target.value as any)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="h-11 px-6 rounded-xl border border-border font-bold text-sm hover:bg-accent transition-colors">Cancel</button>
          <button 
            onClick={() => onSave(form)} 
            className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isEdit ? "Update Coupon" : "Create Coupon"}
          </button>
        </div>
      </div>
    </div>
  );
}