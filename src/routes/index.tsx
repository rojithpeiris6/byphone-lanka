import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronRight, Truck, ShieldCheck, RotateCcw, Headphones, CreditCard, Star, Sparkles } from "lucide-react";
import hero from "@/assets/hero-phones.jpg";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "byphone.lk — Latest Smartphones at the Best Prices in Sri Lanka" },
      { name: "description", content: "Shop iPhone, Samsung, OnePlus, Xiaomi & more. 100% genuine with official warranty, free islandwide delivery and easy returns." },
      { property: "og:title", content: "byphone.lk — Smartphones & Tech, Sri Lanka" },
      { property: "og:description", content: "100% genuine smartphones with official warranty and free islandwide delivery." },
      { property: "og:image", content: "/og-hero.jpg" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Feature({ Icon, title, sub }: { Icon: any; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="size-11 sm:size-12 rounded-full bg-primary-soft text-primary grid place-items-center shrink-0">
        <Icon className="size-5 sm:size-6" />
      </div>
      <div>
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wide leading-tight">{title}</p>
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight">{sub}</p>
      </div>
    </div>
  );
}

function Home() {
  // Fetch Categories
  const { data: dbCategories } = useQuery({
    queryKey: ["home-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name, image, slug")
        .eq("status", "active")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch Brands
  const { data: dbBrands } = useQuery({
    queryKey: ["home-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("name")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data?.map((b) => b.name) ?? [];
    },
  });

  // Fetch Popular Products (Sorted by Rating and Reviews)
  const { data: dbPopular } = useQuery({
    queryKey: ["home-popular"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          brands(name),
          categories(name)
        `)
        .eq("status", "active")
        .order("rating", { ascending: false })
        .order("stock_quantity", { ascending: false }) // Prioritize in-stock items
        .limit(10);
      if (error) throw error;

      // Map DB response to the Product type expected by ProductCard
      return (data ?? []).map((p: any) => ({
        ...p,
        brand: p.brands?.name || "Unknown Brand",
        category: p.categories?.name || "General",
        oldPrice: p.discount_price ? p.price : undefined,
        price: p.discount_price || p.price,
      }));
    },
  });

  return (
    <div>
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:pt-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-soft via-primary-soft to-blue-100/60">
          <div className="grid lg:grid-cols-2 items-center">
            <div className="px-6 sm:px-10 py-10 sm:py-16 lg:py-20">
              <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-3 py-1 text-[11px] font-bold tracking-wide">
                <Sparkles className="size-3" /> NEW ARRIVAL
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Latest Phones. <br />
                <span className="text-primary">Best Prices.</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-md">
                Discover the newest smartphones from top brands at unbeatable prices. 100% original with official warranty.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-bold hover:bg-primary-dark transition-colors shadow-[var(--shadow-soft)]">
                  SHOP NOW <ArrowRight className="size-4" />
                </Link>
                <Link to="/shop" className="inline-flex items-center gap-2 bg-background text-foreground rounded-full px-6 py-3 text-sm font-bold border border-border hover:border-primary hover:text-primary transition-colors">
                  View Deals
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-1.5">
                <span className="h-1.5 w-8 rounded-full bg-primary" />
                <span className="h-1.5 w-2 rounded-full bg-primary/30" />
                <span className="h-1.5 w-2 rounded-full bg-primary/30" />
              </div>
            </div>
            <div className="relative h-64 sm:h-80 lg:h-[520px]">
              <img src={hero} alt="Latest flagship smartphones" width={1536} height={1152} className="absolute inset-0 h-full w-full object-cover object-center" />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="mx-auto max-w-7xl px-4 mt-6">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 grid grid-cols-2 lg:grid-cols-4 gap-5">
          <Feature Icon={Truck} title="Free Delivery" sub="Islandwide for all orders" />
          <Feature Icon={ShieldCheck} title="100% Original" sub="Official warranty" />
          <Feature Icon={RotateCcw} title="Easy Returns" sub="Hassle-free within 7 days" />
          <Feature Icon={Headphones} title="24/7 Support" sub="We're here to help" />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 mt-14">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">SHOP BY CATEGORY</h2>
        </div>
        <div className="mt-6 flex lg:grid lg:grid-cols-6 gap-3 sm:gap-5 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
          {dbCategories?.map((c) => (
            <Link to="/shop" key={c.name} className="group flex-shrink-0 w-28 sm:w-32 lg:w-auto flex flex-col items-center gap-2">
              <div className="size-24 sm:size-28 lg:size-32 rounded-full bg-primary-soft grid place-items-center overflow-hidden transition-transform group-hover:scale-105">
                <img src={c.image || ""} alt={c.name} loading="lazy" className="h-3/4 w-3/4 object-contain" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-center">{c.name}</span>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link to="/shop" className="inline-flex items-center gap-1 text-primary text-sm font-bold">VIEW ALL CATEGORIES <ChevronRight className="size-4" /></Link>
        </div>
      </section>

      {/* POPULAR PHONES */}
      <section className="mx-auto max-w-7xl px-4 mt-14">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">POPULAR PHONES</h2>
          <Link to="/shop" className="text-primary text-xs sm:text-sm font-bold inline-flex items-center gap-1">VIEW ALL <ChevronRight className="size-4" /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
          {dbPopular?.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* PROMO BANNERS */}
      <section className="mx-auto max-w-7xl px-4 mt-14 grid md:grid-cols-2 gap-5">
        <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-7 sm:p-9">
          <p className="text-[11px] font-bold tracking-widest opacity-80">EXTENDED WARRANTY</p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold leading-tight">Peace of mind for<br />your device.</h3>
          <Link to="/shop" className="mt-5 inline-flex items-center gap-2 bg-background text-foreground rounded-full px-5 py-2.5 text-sm font-bold">
            LEARN MORE <ChevronRight className="size-4" />
          </Link>
          <div className="absolute -right-6 -bottom-6 opacity-30 text-[180px] leading-none">📱</div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-primary-soft p-7 sm:p-9">
          <p className="text-[11px] font-bold tracking-widest text-primary">SPECIAL OFFERS</p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold leading-tight">Exclusive deals<br />just for you!</h3>
          <Link to="/shop" className="mt-5 inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-bold">
            SHOP DEALS <ChevronRight className="size-4" />
          </Link>
          <div className="absolute -right-2 -bottom-4 text-[140px] leading-none">🏷️</div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="mx-auto max-w-7xl px-4 mt-14">
        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-center mb-6">SHOP BY BRAND</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {dbBrands?.map((b) => (
            <div key={b} className="aspect-[2/1] rounded-xl border border-border bg-card grid place-items-center text-sm font-bold text-foreground/70 hover:text-primary hover:border-primary transition-colors">
              {b}
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-7xl px-4 mt-14">
        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-center mb-6">WHAT CUSTOMERS SAY</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { n: "Kasun P.", t: "Genuine product, lightning fast delivery to Kandy. Will definitely buy again!", r: 5 },
            { n: "Sahani M.", t: "Best price for the iPhone 15 Pro on the island. Packaging was premium.", r: 5 },
            { n: "Dinesh F.", t: "Great support team — helped me pick the right phone for my dad. 10/10.", r: 5 },
          ].map((r) => (
            <div key={r.n} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: r.r }).map((_, i) => <Star key={i} className="size-4 fill-amber-400" />)}
              </div>
              <p className="mt-3 text-sm leading-relaxed">"{r.t}"</p>
              <p className="mt-3 text-xs font-semibold text-muted-foreground">— {r.n}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM TRUST */}
      <section className="mx-auto max-w-7xl px-4 mt-14">
        <div className="rounded-2xl bg-primary-soft p-5 grid grid-cols-2 lg:grid-cols-3 gap-5">
          <Feature Icon={ShieldCheck} title="Secure Payments" sub="100% secure checkout" />
          <Feature Icon={CreditCard} title="Multiple Payment Options" sub="Card, Bank Transfer, COD" />
          <Feature Icon={Star} title="Trusted Store" sub="Thousands of happy customers" />
        </div>
      </section>
    </div>
  );
}