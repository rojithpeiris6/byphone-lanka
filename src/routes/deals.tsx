import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Tag, ShoppingBag, Timer, Ticket } from "lucide-react";
import { FlashSaleTimer } from "@/components/FlashSaleTimer";
import { CouponCard } from "@/components/CouponCard";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Hot Deals & Coupons | buyphone.lk" },
      { name: "description", content: "Grab the best deals and active discount coupons on latest smartphones and accessories at buyphone.lk." },
    ],
  }),
  component: DealsPage,
});

function DealsPage() {
  const now = new Date().toISOString();

  // 1. Fetch Active Flash Sales
  const { data: flashSales, isLoading: loadingFlash } = useQuery({
    queryKey: ["deals-flash-sales"],
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
        .order("end_at", { ascending: true });
      
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

  // 2. Fetch Active Coupons
  const { data: coupons, isLoading: loadingCoupons } = useQuery({
    queryKey: ["deals-active-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("status", "active")
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <Tag className="size-3" /> Save Big Today
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">Tech Deals & Coupons</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore limited-time flash sales and stackable discount codes for your favorite smartphones and gadgets.
        </p>
      </div>

      {/* FLASH DEALS SECTION */}
      <section className="mb-20">
        <div className="flex items-center gap-2 mb-6">
          <div className="size-8 rounded-full bg-rose-500 text-white flex items-center justify-center animate-pulse">
            <Timer className="size-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Active Flash Sales</h2>
        </div>
        
        {loadingFlash ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : flashSales?.length === 0 ? (
          <div className="py-10 text-center bg-muted/30 rounded-3xl border border-dashed border-border">
            <p className="text-muted-foreground">No active flash sales at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {flashSales?.map((p) => (
              <div key={p.id} className="group relative">
                <div className="absolute top-2.5 right-2.5 z-20 bg-rose-600 text-white px-3.5 py-2 rounded-xl shadow-lg border border-rose-500/30">
                  <FlashSaleTimer expiresAt={p.endDate || ""} className="text-white text-xs sm:text-xs" />
                </div>
                <ProductCard p={p} showWishlist={false} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* COUPONS SECTION */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center">
            <Ticket className="size-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Active Promo Codes</h2>
        </div>
        
        {loadingCoupons ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : coupons?.length === 0 ? (
          <div className="py-16 text-center bg-muted/30 rounded-3xl border border-dashed border-border">
            <Ticket className="size-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-bold text-lg">No active coupons</h3>
            <p className="text-sm text-muted-foreground mt-1">Check back later for new promotional codes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons?.map((c) => <CouponCard key={c.id} coupon={c as any} />)}
          </div>
        )}
      </section>
    </div>
  );
}