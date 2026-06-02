import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  DollarSign, TrendingUp, ShoppingBag, Users, Package, AlertTriangle,
  Clock, XCircle, ArrowUpRight, ArrowDownRight, RefreshCcw, Loader2, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function fmtLkr(n: number) {
  return "Rs. " + Number(n).toLocaleString("en-LK");
}

const COLORS = ["hsl(217 91% 60%)", "hsl(160 84% 40%)", "hsl(38 92% 55%)", "hsl(330 81% 60%)", "hsl(262 83% 58%)"];

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  processing: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  shipped: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  cancelled: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

function Kpi({ icon: Icon, label, value, delta, positive = true, tone = "primary", loading = false }: any) {
  const tones: Record<string, string> = {
    primary: "from-primary/15 to-primary/5 text-primary",
    emerald: "from-emerald-500/15 to-emerald-500/5 text-emerald-600",
    amber: "from-amber-500/15 to-amber-500/5 text-amber-600",
    rose: "from-rose-500/15 to-rose-500/5 text-rose-600",
    sky: "from-sky-500/15 to-sky-500/5 text-sky-600",
    violet: "from-violet-500/15 to-violet-500/5 text-violet-600",
  };
  
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:border-primary/20 transition-all">
      <div className="flex items-center justify-between">
        <div className={cn("size-10 rounded-xl bg-gradient-to-br grid place-items-center", tones[tone])}>
          <Icon className="size-5" />
        </div>
        {delta && !loading && (
          <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold", positive ? "text-emerald-600" : "text-rose-600")}>
            {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {delta}
          </span>
        )}
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded-lg" />
        ) : (
          <div className="text-2xl font-extrabold tracking-tight">{value}</div>
        )}
        <div className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</div>
      </div>
    </div>
  );
}

function Dashboard() {
  // 1. Fetch KPI metrics from live database
  const { data: metrics, isLoading: loadingMetrics, refetch: refetchMetrics } = useQuery({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: async () => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      const [
        ordersRes,
        todayOrdersRes,
        customersRes,
        productsRes,
        lowStockRes,
        pendingOrdersRes,
        cancelledOrdersRes,
      ] = await Promise.all([
        supabase.from("orders").select("total"),
        supabase.from("orders").select("total").gte("created_at", startOfDay),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).lte("stock_quantity", 5).gt("stock_quantity", 0),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "cancelled"),
      ]);

      const totalRevenue = (ordersRes.data ?? []).reduce((sum, o) => sum + o.total, 0);
      const todayRevenue = (todayOrdersRes.data ?? []).reduce((sum, o) => sum + o.total, 0);
      const totalOrdersCount = ordersRes.data?.length ?? 0;
      const todayOrdersCount = todayOrdersRes.data?.length ?? 0;

      return {
        totalRevenue,
        todayRevenue,
        totalOrders: totalOrdersCount,
        todayOrders: todayOrdersCount,
        customers: customersRes.count ?? 0,
        products: productsRes.count ?? 0,
        lowStock: lowStockRes.count ?? 0,
        pendingOrders: pendingOrdersRes.count ?? 0,
        cancelledOrders: cancelledOrdersRes.count ?? 0,
      };
    },
  });

  // 2. Fetch Weekly/Daily revenue trend from database orders
  const { data: trend, isLoading: loadingTrend } = useQuery({
    queryKey: ["admin-dashboard-trend"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("total, created_at")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by date (last 7 days or any recorded dates)
      const group: Record<string, number> = {};
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      // Initialize with last 7 days of the week to ensure the chart is populated
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = days[d.getDay()];
        group[label] = 0;
      }

      data?.forEach((o) => {
        const dateObj = new Date(o.created_at);
        const dayLabel = days[dateObj.getDay()];
        if (dayLabel in group) {
          group[dayLabel] += o.total;
        }
      });

      return Object.entries(group).map(([d, v]) => ({ d, v }));
    },
  });

  // 3. Fetch Category Distribution from DB
  const { data: categoriesDistribution } = useQuery({
    queryKey: ["admin-dashboard-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          category_id,
          categories!products_category_id_fkey(name)
        `);

      if (error) return [];

      const map: Record<string, number> = {};
      data?.forEach((p: any) => {
        const name = p.categories?.name || "General";
        map[name] = (map[name] || 0) + 1;
      });

      return Object.entries(map).map(([name, value]) => ({ name, value }));
    },
  });

  // 4. Fetch Recent Orders
  const { data: recentOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ["admin-dashboard-recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, total, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data ?? [];
    },
  });

  // 5. Fetch Recent Customers
  const { data: recentCustomers } = useQuery({
    queryKey: ["admin-dashboard-recent-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("full_name, email, total_spent")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) return [];
      return data ?? [];
    },
  });

  // 6. Fetch Real Low Inventory Items
  const { data: lowInventory } = useQuery({
    queryKey: ["admin-dashboard-low-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("name, stock_quantity, stock_alert_quantity")
        .lte("stock_quantity", 5)
        .gt("stock_quantity", 0)
        .limit(4);

      if (error) return [];
      return data ?? [];
    },
  });

  const handleRefresh = async () => {
    await Promise.all([
      refetchMetrics(),
    ]);
    toast.success("Dashboard reloaded with latest live data");
  };

  const hasChartData = trend && trend.some(item => item.v > 0);

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back — here's what's happening today in your store.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-accent transition-colors flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
            title="Refresh statistics"
          >
            <RefreshCcw className="size-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <div className="text-xs text-muted-foreground bg-muted/40 border border-border rounded-xl px-3 py-2 font-medium">
            {new Date().toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi 
          icon={DollarSign} 
          tone="emerald" 
          label="Total Revenue" 
          value={fmtLkr(metrics?.totalRevenue ?? 0)} 
          delta="+100%" 
          loading={loadingMetrics} 
        />
        <Kpi 
          icon={TrendingUp} 
          tone="primary" 
          label="Today's Revenue" 
          value={fmtLkr(metrics?.todayRevenue ?? 0)} 
          delta={metrics?.todayOrders ? `+${metrics.todayOrders} orders` : undefined} 
          loading={loadingMetrics} 
        />
        <Kpi 
          icon={ShoppingBag} 
          tone="sky" 
          label="Total Orders" 
          value={(metrics?.totalOrders ?? 0).toLocaleString()} 
          loading={loadingMetrics} 
        />
        <Kpi 
          icon={Users} 
          tone="violet" 
          label="Total Customers" 
          value={(metrics?.customers ?? 0).toLocaleString()} 
          loading={loadingMetrics} 
        />
        <Kpi 
          icon={Package} 
          tone="primary" 
          label="Live Products" 
          value={String(metrics?.products ?? 0)} 
          loading={loadingMetrics} 
        />
        <Kpi 
          icon={AlertTriangle} 
          tone="amber" 
          label="Low Stock Alert" 
          value={String(metrics?.lowStock ?? 0)} 
          positive={false} 
          loading={loadingMetrics} 
        />
        <Kpi 
          icon={Clock} 
          tone="amber" 
          label="Pending Orders" 
          value={String(metrics?.pendingOrders ?? 0)} 
          loading={loadingMetrics} 
        />
        <Kpi 
          icon={XCircle} 
          tone="rose" 
          label="Cancelled Orders" 
          value={String(metrics?.cancelledOrders ?? 0)} 
          loading={loadingMetrics} 
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base">Weekly Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">Aggregated order revenue over active days</p>
            </div>
          </div>
          {loadingTrend ? (
            <div className="h-[260px] flex items-center justify-center"><Loader2 className="size-6 text-primary animate-spin" /></div>
          ) : !hasChartData ? (
            <div className="h-[260px] flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/10 rounded-xl">
              <TrendingUp className="size-8 opacity-20 mb-2" />
              <p className="text-sm">No transaction trend data available yet.</p>
              <p className="text-xs">Incoming checkout transactions will appear here.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                <XAxis dataKey="d" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} 
                  formatter={(v: any) => [fmtLkr(v), "Revenue"]} 
                />
                <Area type="monotone" dataKey="v" stroke="hsl(217 91% 60%)" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-base">Category Stock Distribution</h3>
            <p className="text-xs text-muted-foreground">Proportion of product stock across categories</p>
          </div>
          {categoriesDistribution && categoriesDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoriesDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {categoriesDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/10 rounded-xl">
              <Package className="size-8 opacity-20 mb-2" />
              <p className="text-sm">No category distribution data.</p>
            </div>
          )}
        </div>
      </div>

      {/* Tables & Recent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 flex items-center justify-between border-b border-border">
            <div>
              <h3 className="font-bold text-base">Recent Orders</h3>
              <p className="text-xs text-muted-foreground">Latest transactions placed in your store</p>
            </div>
            <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all">
              Manage Orders <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider font-bold text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left px-5 py-3">Order</th>
                  <th className="text-left px-5 py-3">Customer</th>
                  <th className="text-right px-5 py-3">Total</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingOrders ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">Loading recent orders...</td></tr>
                ) : recentOrders?.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">No recent orders yet.</td></tr>
                ) : (
                  recentOrders?.map((o) => (
                    <tr key={o.id} className="hover:bg-accent/40 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-primary">{o.order_number}</td>
                      <td className="px-5 py-3.5 font-medium">{o.customer_name}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-foreground">{fmtLkr(o.total)}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider", statusStyles[o.status] || "bg-muted text-muted-foreground border-border")}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-muted-foreground text-xs font-medium">
                        {new Date(o.created_at).toLocaleDateString("en-LK", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side columns: Customer and Inventory warnings */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <h3 className="font-bold text-sm uppercase tracking-wider text-primary">Recent Customers</h3>
              <Link to="/admin/customers" className="text-[10px] uppercase font-bold text-muted-foreground hover:text-primary transition-colors">All</Link>
            </div>
            <ul className="space-y-3.5">
              {recentCustomers?.length === 0 ? (
                <li className="text-xs text-muted-foreground text-center py-4">No registered customers yet.</li>
              ) : (
                recentCustomers?.map((c, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-primary-foreground text-xs font-bold">
                      {c.full_name?.split(" ").map((s: string) => s[0]).join("").slice(0, 2) || "C"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold truncate text-foreground">{c.full_name}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                    </div>
                    <div className="text-xs font-extrabold text-primary">{fmtLkr(c.total_spent)}</div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <h3 className="font-bold text-sm uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <AlertTriangle className="size-4" /> Low Stock Alerts
              </h3>
              <Link to="/admin/inventory" className="text-[10px] uppercase font-bold text-muted-foreground hover:text-primary transition-colors">Inventory</Link>
            </div>
            <ul className="space-y-3">
              {lowInventory?.length === 0 ? (
                <li className="text-xs text-[color:var(--color-success)] font-semibold text-center py-4">All products are healthy in stock!</li>
              ) : (
                lowInventory?.map((p, i) => (
                  <li key={i} className="flex items-center justify-between text-xs">
                    <span className="font-semibold truncate max-w-[200px] text-foreground">{p.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold border border-amber-500/20">
                      {p.stock_quantity} left
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}