import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Star, Heart, Truck, ShieldCheck, RotateCcw, Minus, Plus, ShoppingCart, ChevronRight, Maximize2, Timer } from "lucide-react";
import { products, formatLKR, useCart, type Product } from "@/lib/shop";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { FlashSaleTimer } from "@/components/FlashSaleTimer";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const now = new Date().toISOString();
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        brands(name),
        categories!products_category_id_fkey(name),
        product_images(url),
        product_variants(*),
        flash_sales(*)
      `)
      .eq("slug", params.slug)
      .single();

    if (error || !product) throw notFound();

    // Check for an active flash sale
    const activeFlashSale = product.flash_sales?.find((s: any) => 
      s.is_active && 
      new Date(s.start_at) <= new Date(now) && 
      new Date(s.end_at) >= new Date(now)
    );

    const basePrice = activeFlashSale ? activeFlashSale.sale_price : (product.discount_price || product.price);
    const oldPrice = activeFlashSale ? product.price : (product.discount_price ? product.price : undefined);

    return { 
      product: {
        ...product,
        brand: product.brands?.name || "Unknown Brand",
        category: product.categories?.name || "General",
        image: product.product_images?.[0]?.url || "",
        oldPrice,
        price: basePrice,
        rating: 4.7,
        reviews: 24,
        variants: product.product_variants || [],
        activeFlashSale,
      } as any
    };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.name} — byphone.lk` : "Product — byphone.lk" },
        { name: "description", content: p ? `Buy ${p.name} in Sri Lanka at ${formatLKR(p.price)}. 100% genuine with official warranty.` : "Product details" },
        { property: "og:title", content: p?.name ?? "Product" },
        { property: "og:type", content: "product" },
        { property: "og:image", content: p?.image ?? "" },
      ],
      links: [{ rel: "canonical", href: `/product/${p?.slug}` }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product: p } = Route.useLoaderData() as { product: any };
  const add = useCart((s) => s.add);
  const qc = useQueryClient();
  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [tab, setTab] = useState<"specs" | "desc" | "reviews" | "warranty">("specs");

  const { user } = useAuth();

  const { data: wishlist } = useQuery({
    queryKey: ["wishlist", user?.id, p.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", p.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Please sign in to save favorites");
      return;
    }

    if (wishlist) {
      const { error } = await supabase.from("wishlist").delete().eq("id", wishlist.id);
      if (error) return toast.error("Could not remove from wishlist");
      toast.success("Removed from wishlist");
    } else {
      const { error } = await supabase.from("wishlist").insert({ user_id: user.id, product_id: p.id });
      if (error) return toast.error("Could not save to wishlist");
      toast.success("Added to wishlist");
    }
    qc.invalidateQueries({ queryKey: ["wishlist"] });
  };

  const selectedVariant = useMemo(() => 
    p.variants?.find((v: any) => v.id === selectedVariantId), 
    [p.variants, selectedVariantId]
  );

  const currentPrice = useMemo(() => {
    const basePrice = p.price;
    const diff = selectedVariant?.price_diff || 0;
    return basePrice + diff;
  }, [p.price, selectedVariant]);

  const isOutOfStock = selectedVariant ? selectedVariant.stock_quantity <= 0 : false;

  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 5);

  function handleAdd() {
    add(p.id, selectedVariantId, qty);
    toast.success("Added to cart", { description: `${qty} × ${p.name}${selectedVariant ? ` (${selectedVariant.storage || selectedVariant.color || 'Variant'})` : ''}` });
  }

  const variantLabel = (v: any) => {
    const parts = [v.storage, v.color, v.ram, v.network].filter(Boolean);
    return parts.join(" / ");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-32 lg:pb-6">
      <p className="text-xs text-muted-foreground">
        <Link to="/">Home</Link> <ChevronRight className="inline size-3" /> <Link to="/shop">{p.category}</Link> <ChevronRight className="inline size-3" /> <span className="text-foreground">{p.name}</span>
      </p>

      <div className="mt-5 grid lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="lg:flex gap-4">
          <div className="hidden lg:flex flex-col gap-2 w-20 shrink-0">
            {[0, 1, 2, 3, 4].map((i) => (
              <button key={i} className={"aspect-square rounded-xl border-2 overflow-hidden bg-muted/40 " + (i === 0 ? "border-primary" : "border-border")}>
                <img src={p.image} alt="" className="h-full w-full object-contain p-2" />
              </button>
            ))}
          </div>
          <div className="relative flex-1 aspect-square rounded-2xl bg-muted/40 grid place-items-center overflow-hidden">
            <img src={p.image} alt={p.name} width={800} height={800} className="h-full w-full object-contain p-6" />
            <button className="absolute top-4 right-4 size-9 grid place-items-center rounded-full bg-background border border-border"><Maximize2 className="size-4" /></button>
          </div>
        </div>

        {/* Info */}
        <div>
          {p.activeFlashSale ? (
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <span className="flex h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
              Flash Deal
            </div>
          ) : p.badge ? (
            <span className="inline-block bg-primary text-primary-foreground text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full">{p.badge}</span>
          ) : null}

          {p.activeFlashSale && (
            <div className="mb-4 flex items-center gap-2 bg-rose-50 border border-rose-200/50 rounded-2xl p-3.5 max-w-sm">
              <Timer className="size-5 text-rose-600 shrink-0 animate-spin duration-3000" />
              <div>
                <p className="text-xs font-bold text-rose-600 uppercase tracking-wide">Limited Time Left</p>
                <div className="mt-0.5"><FlashSaleTimer expiresAt={p.activeFlashSale.end_at} className="text-rose-600 text-xs" /></div>
              </div>
            </div>
          )}

          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">{p.name}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={"size-4 " + (i < Math.round(p.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
              ))}
              <span className="text-primary font-semibold ml-1">({p.reviews} reviews)</span>
            </div>
            <span className="text-border">|</span>
            <span className={cn("font-semibold", isOutOfStock ? "text-destructive" : "text-[color:var(--color-success)]")}>
              {isOutOfStock ? "Out of Stock" : "In Stock"}
            </span>
          </div>
          <div className="mt-5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-primary">{formatLKR(currentPrice)}</span>
              {p.oldPrice && <span className="text-lg text-muted-foreground line-through">{formatLKR(p.oldPrice)}</span>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              or 3 interest-free payments of {formatLKR(Math.round(currentPrice / 3))} with <span className="font-bold text-foreground">KOKO</span>
            </p>
          </div>

          {p.variants && p.variants.length > 0 && (
            <div className="mt-6">
              <p className="text-sm mb-3"><span className="font-semibold">Select Configuration:</span> <span className="text-muted-foreground">{selectedVariant ? variantLabel(selectedVariant) : "Please choose one"}</span></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {p.variants.map((v: any) => (
                  <button 
                    key={v.id} 
                    onClick={() => setSelectedVariantId(v.id)} 
                    disabled={v.stock_quantity <= 0}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-xl border-2 text-left transition-all",
                      selectedVariantId === v.id 
                        ? "border-primary bg-primary-soft text-primary ring-2 ring-primary/20" 
                        : "border-border hover:border-foreground/30",
                      v.stock_quantity <= 0 && "opacity-50 cursor-not-allowed bg-muted"
                    )}
                  >
                    <div>
                      <p className="text-sm font-bold">{variantLabel(v)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {v.stock_quantity <= 0 ? "Out of stock" : `Stock: ${v.stock_quantity} units`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-semibold">Quantity:</span>
            <div className="inline-flex items-center border border-border rounded-xl">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-muted rounded-l-xl"><Minus className="size-4" /></button>
              <span className="px-4 text-sm font-semibold w-10 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-2 hover:bg-muted rounded-r-xl"><Plus className="size-4" /></button>
            </div>
          </div>

          <div className="hidden lg:flex mt-6 gap-3">
            <button 
              onClick={handleAdd} 
              disabled={isOutOfStock || (!p.variants?.length && isOutOfStock)}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl px-6 py-3.5 text-sm font-bold tracking-wide hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="size-5" /> ADD TO CART
            </button>
            <button 
              onClick={toggleWishlist}
              className={cn(
                "size-14 grid place-items-center border-2 rounded-2xl transition-all",
                wishlist ? "bg-rose-50 border-rose-500 text-rose-500" : "border-primary/30 text-primary hover:bg-primary-soft"
              )}
            >
              <Heart className={cn("size-5", wishlist && "fill-rose-500")} />
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-border p-4 grid grid-cols-3 gap-4">
            <div className="flex items-start gap-2"><Truck className="size-5 text-primary shrink-0" /><div><p className="text-xs font-bold">Free Delivery</p><p className="text-[11px] text-muted-foreground">Islandwide</p></div></div>
            <div className="flex items-start gap-2"><RotateCcw className="size-5 text-primary shrink-0" /><div><p className="text-xs font-bold">Easy Returns</p><p className="text-[11px] text-muted-foreground">Within 7 days</p></div></div>
            <div className="flex items-start gap-2"><ShieldCheck className="size-5 text-primary shrink-0" /><div><p className="text-xs font-bold">1 Year Warranty</p><p className="text-[11px] text-muted-foreground">Official</p></div></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <section className="mt-14">
        <div className="flex gap-2 border-b border-border overflow-x-auto no-scrollbar">
          {([["specs", "Specifications"], ["desc", "Description"], ["reviews", "Reviews"], ["warranty", "Warranty"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={"px-4 py-3 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap " + (tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{label}</button>
          ))}
        </div>
        <div className="py-6">
          {tab === "specs" && p.specs && (
            <div className="grid sm:grid-cols-2 gap-y-3 gap-x-10 max-w-3xl">
              {Object.entries(p.specs).map(([k, v]: any) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border py-2 text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-semibold text-right">{v}</span>
                </div>
              ))}
            </div>
          )}
          {tab === "desc" && (
            <div className="max-w-3xl text-sm leading-relaxed text-muted-foreground space-y-3">
              <p>{p.description ?? `${p.name} — premium build, flagship performance, and an incredible camera system. Backed by official warranty.`}</p>
              {p.highlights && (
                <ul className="list-disc pl-5 space-y-1.5 text-foreground">
                  {p.highlights.map((h: any) => <li key={h}>{h}</li>)}
                </ul>
              )}
            </div>
          )}
          {tab === "reviews" && (
            <div className="max-w-2xl space-y-4">
              {[{ n: "Ruwan", r: 5, c: "Original product, came sealed. Super fast delivery." }, { n: "Nimal", r: 4, c: "Great phone, excellent service from byphone." }].map((rv) => (
                <div key={rv.n} className="rounded-xl border border-border p-4">
                  <div className="flex gap-0.5 text-amber-400">{Array.from({ length: rv.r }).map((_, i) => <Star key={i} className="size-4 fill-amber-400" />)}</div>
                  <p className="mt-2 text-sm">{rv.c}</p>
                  <p className="mt-2 text-xs text-muted-foreground">— {rv.n}</p>
                </div>
              ))}
            </div>
          )}
          {tab === "warranty" && (
            <p className="max-w-3xl text-sm text-muted-foreground">All products come with 1-year official manufacturer warranty. Visit any byphone.lk store for warranty claims, or contact our 24/7 support team.</p>
          )}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight mb-5">YOU MAY ALSO LIKE</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}

      {/* Mobile sticky purchase */}
      <div className="lg:hidden fixed bottom-[64px] inset-x-0 z-30 bg-background/95 backdrop-blur border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground font-semibold">Price</p>
            <p className="text-lg font-extrabold text-primary leading-tight">{formatLKR(currentPrice)}</p>
          </div>
          <button 
            onClick={handleAdd} 
            disabled={isOutOfStock}
            className="flex-1 bg-primary text-primary-foreground rounded-2xl py-3 text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingCart className="size-4" /> ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}