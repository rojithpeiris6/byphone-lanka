import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Search, User, ShoppingCart, Truck, ShieldCheck, RotateCcw, Home, LayoutGrid, Tag, UserCircle2 } from "lucide-react";
import { useCart } from "@/lib/shop";

export function AnnounceBar() {
  return (
    <div className="bg-primary text-primary-foreground text-[11px] sm:text-xs font-medium">
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-center gap-4 sm:gap-10 overflow-x-auto no-scrollbar">
        <span className="flex items-center gap-2 whitespace-nowrap"><Truck className="size-3.5" /> FREE DELIVERY ISLANDWIDE</span>
        <span className="hidden sm:flex items-center gap-2 whitespace-nowrap"><ShieldCheck className="size-3.5" /> 100% ORIGINAL PRODUCTS</span>
        <span className="hidden sm:flex items-center gap-2 whitespace-nowrap"><RotateCcw className="size-3.5" /> EASY RETURNS</span>
      </div>
    </div>
  );
}

export function Header() {
  const [mounted, setMounted] = useState(false);
  const count = useCart((s) => s.count());
  const openCart = useCart((s) => s.open);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nav = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/shop", label: "Brands" },
    { to: "/shop", label: "Accessories" },
    { to: "/shop", label: "Deals" },
    { to: "/contact", label: "Contact Us" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
      <AnnounceBar />
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="text-xl sm:text-2xl font-extrabold tracking-tight text-primary">
          byphone<span className="text-foreground">.lk</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          {nav.map((n, i) => (
            <Link key={i} to={n.to} className="text-foreground/80 hover:text-primary transition-colors">{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2 text-foreground">
          <button aria-label="Search" className="p-2 rounded-full hover:bg-secondary transition-colors"><Search className="size-5" /></button>
          <button aria-label="Account" className="p-2 rounded-full hover:bg-secondary transition-colors hidden sm:inline-flex"><User className="size-5" /></button>
          <button onClick={openCart} aria-label="Cart" className="relative p-2 rounded-full hover:bg-secondary transition-colors">
            <ShoppingCart className="size-5" />
            {mounted && count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full size-4 min-w-4 flex items-center justify-center px-1">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const [mounted, setMounted] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const count = useCart((s) => s.count());

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = [
    { to: "/", label: "Home", Icon: Home },
    { to: "/shop", label: "Shop", Icon: LayoutGrid },
    { to: "/shop", label: "Deals", Icon: Tag },
    { to: "/cart", label: "Cart", Icon: ShoppingCart, badge: count },
    { to: "/account", label: "Account", Icon: UserCircle2 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {items.map(({ to, label, Icon, badge }, i) => {
          const active = (to === "/" ? path === "/" : path.startsWith(to));
          return (
            <Link key={i} to={to} className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium relative">
              <span className={"relative " + (active ? "text-primary" : "text-muted-foreground")}>
                <Icon className="size-5" />
                {mounted && badge ? (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-bold rounded-full size-4 min-w-4 px-1 flex items-center justify-center">{badge}</span>
                ) : null}
              </span>
              <span className={active ? "text-primary" : "text-muted-foreground"}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Footer() {
  const cols: { title: string; links: string[] }[] = [
    { title: "Shop", links: ["Smartphones", "Tablets", "Smartwatches", "Earbuds", "Accessories"] },
    { title: "Customer Support", links: ["Help Center", "Order Tracking", "Returns", "Warranty", "Contact"] },
    { title: "Company", links: ["About Us", "Stores", "Careers", "Blog", "Press"] },
    { title: "Legal", links: ["Privacy", "Terms", "Refund Policy", "Shipping Policy"] },
  ];
  return (
    <footer className="mt-20 border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <div className="text-xl font-extrabold text-primary">byphone<span className="text-foreground">.lk</span></div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">Sri Lanka's premium destination for smartphones, tablets and tech accessories.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-bold mb-3">{c.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {c.links.map((l) => <li key={l}><a href="#" className="hover:text-primary">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} byphone.lk · All rights reserved.</p>
          <p>Visa · Mastercard · Amex · KOKO · MintPay · COD</p>
        </div>
      </div>
    </footer>
  );
}