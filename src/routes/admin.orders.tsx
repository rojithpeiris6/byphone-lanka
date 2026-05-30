import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, ListFilter as Filter, Clock, CircleCheck as CheckCircle2, Truck, CircleAlert as AlertCircle, RefreshCw, Eye, X, ChevronDown } from "lucide-react";
import { supabase, type AdminOrder, type OrderStatus } from "@/lib/supabase";
import { formatLKR } from "@/lib/shop";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

const STATUS_OPTIONS: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; Icon: any }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", Icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700", Icon: RefreshCw },
  shipped: { label: "Shipped", color: "bg-sky-100 text-sky-700", Icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700", Icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", Icon: AlertCircle },
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  card: "Card",
  bank: "Bank Transfer",
  koko: "KOKO",
  mint: "MintPay",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${cfg.color}`}>
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: AdminOrder;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("admin_orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", order.id);
    setSaving(false);
    if (!error) {
      onStatusChange(order.id, status);
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
          <div>
            <h2 className="font-extrabold text-slate-800">{order.order_number}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(order.created_at).toLocaleString("en-LK")}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X className="size-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Customer */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer</h3>
            <div className="bg-slate-50 rounded-xl p-4 grid sm:grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-slate-400">Name</p><p className="font-semibold">{order.customer_name}</p></div>
              <div><p className="text-xs text-slate-400">Phone</p><p className="font-semibold">{order.customer_phone}</p></div>
              <div><p className="text-xs text-slate-400">Email</p><p className="font-semibold">{order.customer_email}</p></div>
              <div><p className="text-xs text-slate-400">Payment</p><p className="font-semibold">{PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</p></div>
            </div>
          </section>

          {/* Shipping */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shipping Address</h3>
            <div className="bg-slate-50 rounded-xl p-4 text-sm">
              <p className="font-semibold">{order.address}</p>
              <p className="text-slate-500">{order.city}, {order.district} {order.postal_code}</p>
              <p className="text-xs text-slate-400 mt-1">{order.delivery_method === "exp" ? "Express Delivery" : "Standard Delivery"}</p>
            </div>
          </section>

          {/* Totals */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Total</h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatLKR(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Delivery</span><span>{order.delivery_fee === 0 ? "Free" : formatLKR(order.delivery_fee)}</span></div>
              <div className="flex justify-between font-extrabold text-slate-800 border-t border-slate-200 pt-2 mt-1">
                <span>Total</span><span className="text-blue-600">{formatLKR(order.total)}</span>
              </div>
            </div>
          </section>

          {/* Update status */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Update Status</h3>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            </div>
          </section>
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
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("admin_orders")
        .select("*")
        .order("created_at", { ascending: false });
      setOrders(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  function handleStatusChange(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch =
      !search ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Status pills */}
        {(["all", ...STATUS_OPTIONS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={
              "text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors " +
              (statusFilter === s
                ? "bg-blue-600 text-white border-blue-600"
                : "border-slate-200 text-slate-600 hover:border-slate-400")
            }
          >
            {s === "all" ? "All" : STATUS_CONFIG[s].label}
            {s !== "all" && (
              <span className="ml-1.5 opacity-70">
                {orders.filter((o) => o.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order or customer..."
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
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">Order #</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">Customer</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Payment</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Date</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">Total</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-slate-600 font-semibold">{o.order_number}</td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800">{o.customer_name}</p>
                      <p className="text-xs text-slate-400">{o.customer_phone}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-500 hidden md:table-cell">{PAYMENT_LABELS[o.payment_method] ?? o.payment_method}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs hidden sm:table-cell">
                      {new Date(o.created_at).toLocaleDateString("en-LK", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-800">{formatLKR(o.total)}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setSelected(o)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600"
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center py-12 text-sm text-slate-400 flex flex-col items-center gap-2">
                <Filter className="size-6 text-slate-300" />
                No orders match your filters.
              </p>
            )}
          </div>
        )}
      </div>

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
