import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  DollarSign, Users, ShoppingBag, TrendingUp,
  AlertTriangle, Package, CheckCircle2, XCircle,
  BarChart3, LayoutDashboard
} from "lucide-react";
import { 
  getReportSummary, 
  getRevenueTrend, 
  getCategorySales, 
  getTopProducts, 
  getInventoryStats 
} from "@/lib/api/admin-reports.functions";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsDashboard,
});

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];

function KpiCard({ icon: Icon, label, value, description, colorClass }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`size-12 rounded-xl ${colorClass} grid place-items-center`}>
          <Icon className="size-6" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-extrabold mt-1">{value}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

function ChartContainer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-6">{title}</h3>
      <div className="h-[300px] w-full">
        {children}
      </div>
    </div>
  );
}

function ReportsDashboard() {
  // Summary Data
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["admin-report-summary"],
    queryFn: () => getReportSummary(),
  });

  // Revenue Trend
  const { data: trendData, isLoading: loadingTrend } = useQuery({
    queryKey: ["admin-report-trend"],
    queryFn: () => getRevenueTrend(),
  });

  // Category Sales
  const { data: categoryData, isLoading: loadingCategory } = useQuery({
    queryKey: ["admin-report-categories"],
    queryFn: () => getCategorySales(),
  });

  // Top Products
  const { data: topProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-report-top-products"],
    queryFn: () => getTopProducts(),
  });

  // Inventory Stats
  const { data: inventory, isLoading: loadingInventory } = useQuery({
    queryKey: ["admin-report-inventory"],
    queryFn: () => getInventoryStats(),
  });

  if (loadingSummary) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground font-medium">Generating reports...</p>
        </div>
      </div>
    );
  }

  const fmtCurrency = (n: number) => "Rs. " + n.toLocaleString("en-LK");

  return (
    <div className="space-y-8 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Comprehensive overview of your store's performance.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Data
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          icon={DollarSign} 
          label="Total Revenue" 
          value={fmtCurrency(summary?.totalRevenue || 0)} 
          description="Gross sales to date" 
          colorClass="bg-emerald-500/10 text-emerald-600" 
        />
        <KpiCard 
          icon={ShoppingBag} 
          label="Total Orders" 
          value={summary?.totalOrders || 0} 
          description="Completed transactions" 
          colorClass="bg-primary/10 text-primary" 
        />
        <KpiCard 
          icon={Users} 
          label="Total Customers" 
          value={summary?.totalCustomers || 0} 
          description="Registered users" 
          colorClass="bg-violet-500/10 text-violet-600" 
        />
        <KpiCard 
          icon={TrendingUp} 
          label="Avg. Order Value" 
          value={fmtCurrency(summary?.avgOrderValue || 0)} 
          description="Revenue per transaction" 
          colorClass="bg-amber-500/10 text-amber-600" 
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Revenue Trend (Daily)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
                formatter={(v: number) => [fmtCurrency(v), "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Sales by Category">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
                 formatter={(v: number) => [v.toString(), "Units Sold"]}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products Bar Chart */}
        <div className="lg:col-span-2">
          <ChartContainer title="Top 10 Products (Units Sold)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 40, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
                />
                <Bar dataKey="sales" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Inventory Status Cards */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Inventory Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-600 grid place-items-center">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <span className="text-sm font-medium">In Stock</span>
                </div>
                <span className="font-bold">{inventory?.inStock || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-amber-500/10 text-amber-600 grid place-items-center">
                    <AlertTriangle className="size-5" />
                  </div>
                  <span className="text-sm font-medium">Low Stock</span>
                </div>
                <span className="font-bold text-amber-600">{inventory?.lowStock || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-rose-500/10 text-rose-600 grid place-items-center">
                    <XCircle className="size-5" />
                  </div>
                  <span className="text-sm font-medium">Out of Stock</span>
                </div>
                <span className="font-bold text-rose-600">{inventory?.outOfStock || 0}</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <button className="w-full py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-accent transition-colors">
                View Full Inventory
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-primary-foreground shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <LayoutDashboard className="size-5 opacity-80" />
              <h3 className="font-bold">Quick Insights</h3>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              {inventory?.outOfStock ? `Warning: You have ${inventory.outOfStock} products currently out of stock. Consider restocking immediately.` : "Your inventory levels look healthy."}
            </p>
            {inventory?.lowStock && (
              <p className="mt-3 text-sm font-bold text-amber-300 animate-pulse">
                Action Required: {inventory.lowStock} items are low on stock.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsDashboard;