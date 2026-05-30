import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Bell,
  Store,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Panel — byphone.lk" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLayout,
});

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/settings", label: "Settings", Icon: Settings },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const Sidebar = (
    <aside className="flex flex-col h-full bg-slate-900 text-white">
      <div className="px-5 py-5 border-b border-slate-700/60 flex items-center gap-3">
        <div className="size-9 rounded-xl bg-blue-600 grid place-items-center shrink-0">
          <Store className="size-5" />
        </div>
        <div>
          <p className="font-extrabold text-sm leading-tight">byphone.lk</p>
          <p className="text-[10px] text-slate-400 font-medium">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, Icon }) => {
          const active = path.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors " +
                (active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white")
              }
            >
              <Icon className="size-4.5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-slate-700/60">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          Back to Store
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:z-30">{Sidebar}</div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="w-60 h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {Sidebar}
          </div>
          <button
            className="absolute top-4 left-64 text-white p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-6" />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100"
            >
              <Menu className="size-5" />
            </button>
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <span>Admin</span>
              <ChevronRight className="size-3" />
              <span className="text-slate-800 font-semibold capitalize">
                {path.split("/").pop()}
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600">
              <Bell className="size-4.5" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
            </button>
            <div className="size-8 rounded-full bg-blue-600 grid place-items-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
