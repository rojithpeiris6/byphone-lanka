import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag, Package, TrendingUp, Users, ArrowUpRight, Clock, CircleCheck as CheckCircle2, Truck, CircleAlert as AlertCircle, RefreshCw } from "lucide-react";
import { supabase, type AdminOrder, type AdminProduct } from "@/lib/supabase";
import { formatLKR } from "@/lib/shop";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

type Stats = {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  pendingOrders: number;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: any }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", Icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700", Icon: RefreshCw },
  shipped: { label: "Shipped", color: "bg-sky-100 text-sky-700", Icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700", Icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", Icon: AlertCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${cfg.color}`}>
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
}

function StatCard({
  title,
  value,
  sub,
  Icon,
  color,
}: {
  title: string;
  value: string;
  sub: string;
  Icon: any;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm">
      <div className={`size-11 rounded-xl grid place-items-center shrink-0 ${color}`}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-extrabold text-slate-800 mt-0.5 leading-tight">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [lowStock, setLowStock] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ordersRes, productsRes] = await Promise.all([
        supabase
          .from("admin_orders")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("admin_products").select("*").eq("is_active", true),
      ]);

      const orders: AdminOrder[] = ordersRes.data ?? [];
      const products: AdminProduct[] = productsRes.data ?? [];

      const delivered = orders.filter((o) => o.status === "delivered");
      setStats({
        totalRevenue: delivered.reduce((a, o) => a + o.total, 0),
        totalOrders: orders.length,
        activeProducts: products.length,
        pendingOrders: orders.filter((o) => o.status === "pending").length,
      });

      setRecentOrders(orders.slice(0, 6));
      setLowStock(products.filter((p) => p.stock < 20).slice(0, 5));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <RefreshCw className="size-7 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatLKR(stats.totalRevenue)}
          sub="From delivered orders"
          Icon={TrendingUp}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          sub="All time"
          Icon={ShoppingBag}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="Active Products"
          value={stats.activeProducts.toString()}
          sub="Listed in store"
          Icon={Package}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders.toString()}
          sub="Awaiting action"
          Icon={Users}
          color="bg-red-50 text-red-600"
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-800">Recent Orders</h2>
            <a href="/admin/orders" className="text-xs text-blue-600 font-semibold inline-flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="size-3.5" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">Order</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">Customer</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Date</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">Total</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-slate-600 font-semibold">{o.order_number}</td>
                    <td className="px-5 py-3 text-slate-800 font-medium">{o.customer_name}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs hidden sm:table-cell">
                      {new Date(o.created_at).toLocaleDateString("en-LK", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-800">{formatLKR(o.total)}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && (
              <p className="text-center py-10 text-sm text-slate-400">No orders yet.</p>
            )}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-extrabold text-slate-800">Low Stock Alert</h2>
            <p className="text-xs text-slate-400 mt-0.5">Products with less than 20 units</p>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStock.map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.brand} · {p.category}</p>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    p.stock <= 5 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {p.stock} left
                </span>
              </div>
            ))}
            {lowStock.length === 0 && (
              <p className="text-center py-10 text-sm text-slate-400">All products are well stocked.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
