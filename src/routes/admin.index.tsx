import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  DollarSign, TrendingUp, ShoppingBag, Users, Package, AlertTriangle,
  Clock, XCircle, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const revenue = [
  { d: "Mon", v: 120000 }, { d: "Tue", v: 180000 }, { d: "Wed", v: 150000 },
  { d: "Thu", v: 220000 }, { d: "Fri", v: 280000 }, { d: "Sat", v: 340000 }, { d: "Sun", v: 260000 },
];
const sales = [
  { m: "Jan", v: 42 }, { m: "Feb", v: 51 }, { m: "Mar", v: 68 }, { m: "Apr", v: 73 },
  { m: "May", v: 89 }, { m: "Jun", v: 95 }, { m: "Jul", v: 112 }, { m: "Aug", v: 120 },
  { m: "Sep", v: 105 }, { m: "Oct", v: 140 }, { m: "Nov", v: 168 }, { m: "Dec", v: 192 },
];
const topProducts = [
  { name: "iPhone 15 Pro Max", units: 124 },
  { name: "Galaxy S24 Ultra", units: 98 },
  { name: "Pixel 8 Pro", units: 72 },
  { name: "iPhone 15", units: 64 },
  { name: "OnePlus 12", units: 51 },
];
const categorySales = [
  { name: "Smartphones", value: 62 },
  { name: "Tablets", value: 14 },
  { name: "Smartwatches", value: 10 },
  { name: "Earbuds", value: 8 },
  { name: "Accessories", value: 6 },
];
const COLORS = ["hsl(217 91% 60%)", "hsl(160 84% 40%)", "hsl(38 92% 55%)", "hsl(330 81% 60%)", "hsl(262 83% 58%)"];

const recentOrders = [
  { id: "BP-10238", customer: "Kasun Perera", total: 245000, status: "Pending", date: "2m ago" },
  { id: "BP-10237", customer: "Nimal Silva", total: 89500, status: "Shipped", date: "1h ago" },
  { id: "BP-10236", customer: "Anjali Fernando", total: 134900, status: "Delivered", date: "3h ago" },
  { id: "BP-10235", customer: "Roshan De Silva", total: 56000, status: "Processing", date: "5h ago" },
  { id: "BP-10234", customer: "Hashini Jayasuriya", total: 19800, status: "Cancelled", date: "Yesterday" },
];
const recentCustomers = [
  { name: "Kasun Perera", email: "kasun@example.com", spend: 245000 },
  { name: "Anjali Fernando", email: "anjali@example.com", spend: 134900 },
  { name: "Roshan De Silva", email: "roshan@example.com", spend: 56000 },
  { name: "Hashini Jayasuriya", email: "hashini@example.com", spend: 19800 },
];

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Processing: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  Shipped: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  Delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Cancelled: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

function fmtLkr(n: number) {
  return "Rs. " + n.toLocaleString("en-LK");
}

function Kpi({ icon: Icon, label, value, delta, positive = true, tone = "primary" }: any) {
  const tones: Record<string, string> = {
    primary: "from-primary/15 to-primary/5 text-primary",
    emerald: "from-emerald-500/15 to-emerald-500/5 text-emerald-600",
    amber: "from-amber-500/15 to-amber-500/5 text-amber-600",
    rose: "from-rose-500/15 to-rose-500/5 text-rose-600",
    sky: "from-sky-500/15 to-sky-500/5 text-sky-600",
    violet: "from-violet-500/15 to-violet-500/5 text-violet-600",
  };
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`size-10 rounded-xl bg-gradient-to-br ${tones[tone]} grid place-items-center`}>
          <Icon className="size-5" />
        </div>
        {delta && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${positive ? "text-emerald-600" : "text-rose-600"}`}>
            {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {delta}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-extrabold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data: productCount } = useQuery({
    queryKey: ["product-count"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back — here's what's happening today.</p>
        </div>
        <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        <Kpi icon={DollarSign} tone="emerald" label="Total Revenue" value={fmtLkr(18420000)} delta="+12.4%" />
        <Kpi icon={TrendingUp} tone="primary" label="Today's Revenue" value={fmtLkr(342500)} delta="+5.2%" />
        <Kpi icon={ShoppingBag} tone="sky" label="Orders" value="1,284" delta="+8.1%" />
        <Kpi icon={Users} tone="violet" label="Customers" value="3,920" delta="+3.6%" />
        <Kpi icon={Package} tone="primary" label="Products" value={String(productCount ?? 0)} delta="0%" positive />
        <Kpi icon={AlertTriangle} tone="amber" label="Low Stock" value="14" delta="+2" positive={false} />
        <Kpi icon={Clock} tone="amber" label="Pending Orders" value="28" delta="-4" positive />
        <Kpi icon={XCircle} tone="rose" label="Cancelled" value="6" delta="-2" positive />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Revenue</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="d" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: any) => fmtLkr(v)} />
              <Area type="monotone" dataKey="v" stroke="hsl(217 91% 60%)" strokeWidth={2.5} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="font-semibold">Category Sales</h3>
            <p className="text-xs text-muted-foreground">Share of total units</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categorySales} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {categorySales.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="font-semibold">Sales</h3>
            <p className="text-xs text-muted-foreground">Units this year</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="v" stroke="hsl(160 84% 40%)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="font-semibold">Top Products</h3>
            <p className="text-xs text-muted-foreground">Best selling this month</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={110} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="units" fill="hsl(217 91% 60%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="font-semibold">Monthly Orders</h3>
            <p className="text-xs text-muted-foreground">Trend</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="v" fill="hsl(262 83% 58%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Recent Orders</h3>
              <p className="text-xs text-muted-foreground">Latest 5 transactions</p>
            </div>
            <button className="text-xs font-semibold text-primary hover:underline">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-2.5">Order</th>
                  <th className="text-left px-5 py-2.5">Customer</th>
                  <th className="text-right px-5 py-2.5">Total</th>
                  <th className="text-left px-5 py-2.5">Status</th>
                  <th className="text-right px-5 py-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-accent/40">
                    <td className="px-5 py-3 font-semibold">{o.id}</td>
                    <td className="px-5 py-3">{o.customer}</td>
                    <td className="px-5 py-3 text-right font-medium">{fmtLkr(o.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${statusStyles[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground text-xs">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-3">Recent Customers</h3>
            <ul className="space-y-3">
              {recentCustomers.map((c) => (
                <li key={c.email} className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-primary-foreground text-xs font-bold">
                    {c.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                  </div>
                  <div className="text-xs font-semibold">{fmtLkr(c.spend)}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              Low Inventory Alerts
            </h3>
            <ul className="space-y-2.5">
              {[
                { n: "Galaxy S24 Ultra", s: 3 },
                { n: "AirPods Pro 2", s: 4 },
                { n: "iPad Air M2", s: 2 },
                { n: "Pixel Watch 2", s: 5 },
              ].map((p) => (
                <li key={p.n} className="flex items-center justify-between text-sm">
                  <span className="truncate">{p.n}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold border border-amber-500/20">
                    {p.s} left
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
