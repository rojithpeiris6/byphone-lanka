import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ArrowRight, ChevronRight, Truck, ShieldCheck, RotateCcw, Headphones, CreditCard, Star, Sparkles, Timer, Mail, HelpCircle } from "lucide-react";
import hero from "@/assets/hero-phones.jpg";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { FlashSaleTimer } from "@/components/FlashSaleTimer";

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
  const now = new Date().toISOString();

  // Helper to get active flash sale product IDs
  const { data: activeFlashSaleIds } = useQuery({
    queryKey: ["home-active-flash-sale-ids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flash_sales")
        .select("product_id")
        .eq("is_active", true)
        .lte("start_at", now)
        .gte("end_at", now);
      if (error) throw error;
      return data?.map(s => s.product_id) ?? [];
    }
  });

  // Fetch Parent Categories
  const { data: dbCategories } = useQuery({
    queryKey: ["home-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name, image, slug")
        .eq("status", "active")
        .is("parent_id", null)
        .order("sort_order")
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch Brands with Logos
  const { data: dbBrands } = useQuery({
    queryKey: ["home-brands-visual"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("name, logo, slug")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch Popular Products - Exclude Flash Sale Items
  const { data: dbPopular } = useQuery({
    queryKey: ["home-popular", activeFlashSaleIds],
    queryFn: async () => {
      const idsToExclude = activeFlashSaleIds || [];
      let query = supabase
        .from("products")
        .select(`*, brands(name), categories!products_category_id_fkey(name), product_images(url)`)
        .eq("status", "active");
      
      if (idsToExclude.length > 0) {
        query = query.not("id", "in", `(${idsToExclude.join(',')})`);
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return (data ?? []).map((p: any) => ({
        ...p,
        brand: p.brands?.name || "Unknown Brand",
        category: p.categories?.name || "General",
        image: p.product_images?.[0]?.url || "",
        oldPrice: p.discount_price ? p.price : undefined,
        price: p.discount_price || p.price,
      }));
    },
  });

  // Fetch Flash Sales from the flash_sales table
  const { data: dbFlashSales } = useQuery({
    queryKey: ["home-flash-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flash_sales")
        .select(`
          sale_price,
          end_at,
          products (
            *,
            brands(name),
            categories!products_category_id_fkey(name),
            product_images(url)
          )
        `)
        .eq("is_active", true)
        .lte("start_at", now)
        .gte("end_at", now)
        .limit(8);
      
      if (error) throw error;

      return (data ?? []).map((s: any) => {
        const p = s.products;
        return {
          ...p,
          endDate: s.end_at,
          brand: p.brands?.name || "Unknown Brand",
          category: p.categories?.name || "General",
          image: p.product_images?.[0]?.url || "",
          oldPrice: p.price,
          price: s.sale_price,
        };
      });
    },
  });

  // Fetch New Arrivals - Exclude Flash Sale Items
  const { data: dbNewArrivals } = useQuery({
    queryKey: ["home-new-arrivals", activeFlashSaleIds],
    queryFn: async () => {
      const idsToExclude = activeFlashSaleIds || [];
      let query = supabase
        .from("products")
        .select(`*, brands(name), categories!products_category_id_fkey(name), product_images(url)`)
        .eq("status", "active");

      if (idsToExclude.length > 0) {
        query = query.not("id", "in", `(${idsToExclude.join(',')})`);
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(8);
      if (error) throw error;
      return (data ?? []).map((p: any) => ({
        ...p,
        brand: p.brands?.name || "Unknown Brand",
        category: p.categories?.name || "General",
        image: p.product_images?.[0]?.url || "",
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
            <Link to="/shop" search={{ category: c.name }} key={c.name} className="group flex-shrink-0 w-28 sm:w-32 lg:w-auto flex flex-col items-center gap-2">
              <div className="size-24 sm:size-28 lg:size-32 rounded-full bg-primary-soft grid place-items-center overflow-hidden transition-transform group-hover:scale-105">
                <img src={c.image || ""} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-center">{c.name}</span>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link to="/categories" className="inline-flex items-center gap-1 text-primary text-sm font-bold">VIEW ALL CATEGORIES <ChevronRight className="size-4" /></Link>
        </div>
      </section>

      {/* FLASH SALES */}
      {dbFlashSales && dbFlashSales.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 mt-14">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-rose-500 text-white flex items-center justify-center animate-pulse">
                <Timer className="size-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">FLASH DEALS</h2>
            </div>
            <Link to="/deals" className="text-primary text-xs sm:text-sm font-bold inline-flex items-center gap-1">View All Deals <ChevronRight className="size-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {dbFlashSales.map((p) => (
              <div key={p.id} className="group relative">
                <div className="absolute top-2 right-2 z-20 bg-rose-600 text-white px-2 py-1 rounded-lg shadow-sm">
                  <FlashSaleTimer expiresAt={p.endDate || ""} />
                </div>
                <ProductCard p={p} />
              </div>
            ))}
          </div>
        </section>
      )}

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

      {/* NEW ARRIVALS */}
      {dbNewArrivals && dbNewArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 mt-14">
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">NEW ARRIVALS</h2>
            <Link to="/shop" className="text-primary text-xs sm:text-sm font-bold inline-flex items-center gap-1">Browse All <ChevronRight className="size-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {dbNewArrivals.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

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

      {/* BRANDS VISUAL */}
      <section className="mx-auto max-w-7xl px-4 mt-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-center">SHOP BY BRAND</h2>
          <Link to="/brands" className="text-primary text-xs sm:text-sm font-bold inline-flex items-center gap-1">VIEW ALL <ChevronRight className="size-4" /></Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-3">
          {dbBrands?.map((b) => (
            <Link to="/shop" search={{ brand: b.name }} key={b.name} className="group aspect-square rounded-2xl border border-border bg-card grid place-items-center p-4 transition-all hover:border-primary hover:shadow-sm">
              <div className="size-12 rounded-full bg-muted overflow-hidden grid place-items-center p-2 group-hover:scale-110 transition-transform">
                {b.logo ? (
                  <img src={b.logo} alt={b.name} className="size-full object-contain" />
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground">{b.name}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="mx-auto max-w-7xl px-4 mt-14">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 sm:p-12 text-center text-white">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
              <Mail className="size-3" /> JOIN THE CLUB
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Get the latest tech updates</h2>
            <p className="text-slate-400 text-sm sm:text-base">Subscribe to our newsletter for exclusive deals, new arrivals, and tech tips delivered straight to your inbox.</p>
            <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                required
                className="flex-1 h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
              />
              <button className="h-12 px-6 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20">
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-slate-500">We respect your privacy. Unsubscribe at any time.</p>
          </div>
          <div className="absolute -top-24 -left-24 size-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 size-64 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="mx-auto max-w-3xl px-4 mt-14 mb-14">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase tracking-widest mb-4">
            <HelpCircle className="size-3" /> Help Center
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {[
            { q: "Do you provide official warranties?", a: "Yes, all our products come with a 1-year official manufacturer warranty. We are authorized partners for the brands we carry." },
            { q: "How long does delivery take?", a: "Standard delivery takes 2-3 working days islandwide. Express delivery can be delivered within 1 working day for an additional fee." },
            { q: "What is your return policy?", a: "We offer a 7-day return policy for unused products in their original packaging with the original receipt." },
            { q: "Do you accept installment payments?", a: "Yes, we support KOKO and MintPay for flexible 3-month interest-free installments on eligible products." },
          ].map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
              <h3 className="font-bold text-sm sm:text-base mb-2 flex items-start gap-2">
                <span className="text-primary">Q.</span> {faq.q}
              </h3>
              <p className="text-sm text-muted-foreground pl-5 leading-relaxed">
                <span className="font-semibold text-foreground">A.</span> {faq.a}
              </p>
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