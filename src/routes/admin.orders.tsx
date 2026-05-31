import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, ShoppingBag, Eye, Truck, CheckCircle2, XCircle, Clock, Filter, Download, MoreVertical, User, MapPin, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

function fmtLkr(n: number) {
  return "Rs. " + n.toLocaleString("en-LK");
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-600", icon: Clock },
  processing: { bg: "bg-sky-500/10", text: "text-sky-600", icon: Filter },
  shipped: { bg: "bg-violet-500/10", text: "text-violet-600", icon: Truck },
  delivered: { bg: "bg-emerald-500/10", text: "text-emerald-600", icon: CheckCircle2 },
  cancelled: { bg: "bg-rose-500/10", text: "text-rose-600", icon: XCircle },
};

function OrdersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders", statusFilter],
    queryFn: async () => {
      let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (orders ?? []).filter((o: any) => 
    !q || o.order_number?.toLowerCase().includes(q.toLowerCase()) || o.customer_name?.toLowerCase().includes(q.toLowerCase())
  );

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Order marked as ${status}`);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    if (selectedOrder?.id === id) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage customer orders, fulfillment, and payments.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold hover:bg-accent transition-colors">
            <Download className="size-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by order # or customer..."
              className="w-full pl-10 pr-4 h-10 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-background border border-border text-sm font-medium outline-none focus:border-primary"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider font-bold text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left px-6 py-4">Order</th>
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-right px-6 py-4">Total</th>
                <th className="text-left px-6 py-4">Payment</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-20 text-center text-muted-foreground">Loading orders...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <ShoppingBag className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-bold text-lg">No orders found</h3>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((o: any) => {
                  const style = STATUS_STYLES[o.status] || STATUS_STYLES.pending;
                  const StatusIcon = style.icon;
                  return (
                    <tr key={o.id} className="group hover:bg-accent/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-primary">{o.order_number}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{o.customer_name}</div>
                        <div className="text-[11px] text-muted-foreground">{o.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("en-LK", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-right font-bold">{fmtLkr(o.total)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">{o.payment_method}</span>
                          <span className={cn(
                            "size-1.5 rounded-full",
                            o.payment_status === "paid" ? "bg-emerald-500" : "bg-amber-500"
                          )} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                          style.bg, style.text, "border-current/20"
                        )}>
                          <StatusIcon className="size-3" />
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(o)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        >
                          <Eye className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onUpdateStatus={updateStatus}
        />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, onUpdateStatus }: { order: any; onClose: () => void; onUpdateStatus: (id: string, s: string) => void }) {
  const { data: items, isLoading } = useQuery({
    queryKey: ["order-items", order.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("order_items").select("*").eq("order_id", order.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Order {order.order_number}</h2>
            <p className="text-xs text-muted-foreground">Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent transition-colors"><XCircle className="size-5" /></button>
        </div>

        <div className="p-6 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Order Items</h3>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-[10px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2">Product</th>
                      <th className="text-center px-4 py-2">Qty</th>
                      <th className="text-right px-4 py-2">Price</th>
                      <th className="text-right px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading items...</td></tr>
                    ) : items?.map((it: any) => (
                      <tr key={it.id}>
                        <td className="px-4 py-3">
                          <div className="font-semibold">{it.product_name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{it.sku}</div>
                        </td>
                        <td className="px-4 py-3 text-center">{it.quantity}</td>
                        <td className="px-4 py-3 text-right">{fmtLkr(it.price)}</td>
                        <td className="px-4 py-3 text-right font-bold">{fmtLkr(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/10 font-bold">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">Subtotal</td>
                      <td className="px-4 py-2 text-right">{fmtLkr(order.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">Shipping</td>
                      <td className="px-4 py-2 text-right">{fmtLkr(order.shipping_fee)}</td>
                    </tr>
                    <tr className="text-lg text-primary">
                      <td colSpan={3} className="px-4 py-3 text-right">Total</td>
                      <td className="px-4 py-3 text-right">{fmtLkr(order.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Timeline / Actions */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdateStatus(order.id, s)}
                    disabled={order.status === s}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all",
                      order.status === s 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-background border-border hover:border-primary hover:text-primary"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-muted/30 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <User className="size-4 text-primary" /> Customer
              </h3>
              <div className="space-y-1">
                <div className="font-bold">{order.customer_name}</div>
                <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-muted/30 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <MapPin className="size-4 text-primary" /> Shipping Address
              </h3>
              <div className="text-sm leading-relaxed">
                {order.shipping_address}<br />
                {order.city}, {order.district}<br />
                {order.postal_code}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-muted/30 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="size-4 text-primary" /> Payment
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-bold uppercase">{order.payment_method}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={cn(
                    "font-bold uppercase",
                    order.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"
                  )}>{order.payment_status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="h-11 px-6 rounded-xl border border-border font-bold text-sm hover:bg-accent transition-colors">Close</button>
          <button className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all">Print Invoice</button>
        </div>
      </div>
    </div>
  );
}