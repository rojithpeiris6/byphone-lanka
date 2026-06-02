import { Link, Outlet, useRouterState, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutDashboard, Package, FolderTree, Tags, Boxes, ShoppingBag, Users, Ticket, Star, Zap, CreditCard, Truck, ChartBar as BarChart3, Megaphone, Bell, UserCog, Settings, ScrollText, Search, Menu, X, ChevronDown, LogOut, Loader as Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/lib/admin-auth";

const NAV: { to: string; label: string; Icon: any }[] = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/categories", label: "Categories", Icon: FolderTree },
  { to: "/admin/brands", label: "Brands", Icon: Tags },
  { to: "/admin/inventory", label: "Inventory", Icon: Boxes },
  { to: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", Icon: Users },
  { to: "/admin/coupons", label: "Coupons", Icon: Ticket },
  { to: "/admin/reviews", label: "Reviews", Icon: Star },
  { to: "/admin/flash-sales", label: "Flash Sales", Icon: Zap },
  { to: "/admin/payments", label: "Payments", Icon: CreditCard },
  { to: "/admin/shipping", label: "Shipping", Icon: Truck },
  { to: "/admin/reports", label: "Reports", Icon: BarChart3 },
  { to: "/admin/marketing", label: "Marketing", Icon: Megaphone },
  { to: "/admin/notifications", label: "Notifications", Icon: Bell },
  { to: "/admin/users", label: "Users", Icon: UserCog },
  { to: "/admin/settings", label: "Settings", Icon: Settings },
  { to: "/admin/logs", label: "Logs", Icon: ScrollText },
];

const NOTIFICATIONS = [
  { id: 1, type: "order", title: "New order #BP-10238", desc: "Rs. 245,000 · iPhone 15 Pro Max", time: "2m ago", dot: "bg-emerald-500" },
  { id: 2, type: "stock", title: "Low stock alert", desc: "Galaxy S24 Ultra | only 3 left", time: "12m ago", dot: "bg-amber-500" },
  { id: 3, type: "review", title: "New 5â˜… review", desc: "Pixel 8 Pro received a glowing review", time: "1h ago", dot: "bg-sky-500" },
  { id: 4, type: "payment", title: "Payout processed", desc: "Rs. 1,820,000 sent to bank", time: "3h ago", dot: "bg-violet-500" },
  { id: 5, type: "order", title: "Order cancelled #BP-10220", desc: "Customer requested refund", time: "Yesterday", dot: "bg-rose-500" },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading, signOut } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const isLoginPage = path === "/admin/login";

  // Redirect to login if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user && !isLoginPage) {
    return <Navigate to="/admin/login" />;
  }

  if (isLoginPage) {
    return <Outlet />;
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() || "A";

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-border shrink-0">
          <Link to="/admin" className="text-lg font-extrabold tracking-tight text-primary">
            buyphone<span className="text-foreground">.admin</span>
          </Link>
          <button className="lg:hidden p-1 rounded hover:bg-accent" onClick={() => setSidebarOpen(false)}><X className="size-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV.map(({ to, label, Icon }) => {
            const active = to === "/admin" ? path === "/admin" : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 my-0.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border text-xs text-muted-foreground">
          v1.0 · buyphone.lk
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-background/85 backdrop-blur border-b border-border flex items-center px-4 sm:px-6 gap-3">
          <button className="lg:hidden p-2 rounded hover:bg-accent" onClick={() => setSidebarOpen(true)}>
            <Menu className="size-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Search orders, products, customersâ€¦"
                className="w-full pl-9 pr-3 h-9 rounded-lg bg-muted/60 border border-transparent focus:bg-background focus:border-border outline-none text-sm"
              />
            </div>
          </div>
          <div className="flex-1 sm:hidden" />
          <button
            onClick={() => setNotifOpen(true)}
            className="relative p-2 rounded-lg hover:bg-accent"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500" />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-border h-9">
            <div className="size-8 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-primary-foreground text-xs font-bold">{initials}</div>
            <div className="hidden sm:block text-sm leading-tight">
              <div className="font-semibold">Admin</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </div>
            <ChevronDown className="size-4 text-muted-foreground hidden sm:block" />
          </div>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/admin/login" }); }}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="size-5" />
          </button>
        </header>

        {/* Page */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Notification drawer */}
      {notifOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setNotifOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full sm:w-96 bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="h-16 px-5 flex items-center justify-between border-b border-border">
              <div>
                <div className="font-semibold">Notifications</div>
                <div className="text-xs text-muted-foreground">{NOTIFICATIONS.length} recent</div>
              </div>
              <button onClick={() => setNotifOpen(false)} className="p-2 rounded hover:bg-accent"><X className="size-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className="p-4 hover:bg-accent/50 cursor-pointer flex gap-3">
                  <span className={cn("mt-1.5 size-2 rounded-full shrink-0", n.dot)} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">{n.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{n.desc}</div>
                    <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border">
              <button className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">View all</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
