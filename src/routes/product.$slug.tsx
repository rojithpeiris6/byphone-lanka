import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Star, Heart, Truck, ShieldCheck, RotateCcw, Minus, Plus, ShoppingCart, ChevronRight, Maximize2, Timer, MessageSquare, Send, Loader2 } from "lucide-react";
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

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { user } = useAuth();

  // Check if product is in wishlist
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

  // Fetch reviews for this product from public.product_reviews
  const { data: productReviews, isLoading: loadingReviews } = useQuery({
    queryKey: ["product-reviews-list", p.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews" as any)
        .select("*")
        .eq("product_id", p.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Check if user has purchased this product
  const { data: hasPurchasedProduct } = useQuery({
    queryKey: ["user-has-purchased-product", user?.id, p.id],
    queryFn: async () => {
      if (!user) return false;

      // 1. Get all delivered orders belonging to this user
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "delivered");

      if (ordersError || !orders || orders.length === 0) return false;

      const orderIds = orders.map(o => o.id);

      // 2. See if any of those orders contained this product
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("id")
        .in("order_id", orderIds)
        .eq("product_id", p.id)
        .limit(1);

      if (itemsError) return false;
      return (items && items.length > 0);
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

  const currentOldPrice = useMemo(() => {
    if (!p.oldPrice) return undefined;
    const diff = selectedVariant?.price_diff || 0;
    return p.oldPrice + diff;
  }, [p.oldPrice, selectedVariant]);

  const isOutOfStock = selectedVariant ? selectedVariant.stock_quantity <= 0 : false;
  const hasVariants = p.variants && p.variants.length > 0;
  const isAddDisabled = isOutOfStock || (hasVariants && !selectedVariantId);

  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 5);

  function handleAdd() {
    if (hasVariants && !selectedVariantId) {
      toast.error("Please select a configuration before adding to cart");
      return;
    }
    add(p.id, selectedVariantId, qty);
    toast.success("Added to cart", { description: `${qty} × ${p.name}${selectedVariant ? ` (${selectedVariant.storage || selectedVariant.color || 'Variant'})` : ''}` });
  }

  const variantLabel = (v: any) => {
    const parts = [v.storage, v.color, v.ram, v.network].filter(Boolean);
    return parts.join(" / ");
  };

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return toast.error("You must be logged in to leave a review.");
    if (!reviewComment.trim()) return toast.error("Please write a comment.");

    setIsSubmittingReview(true);
    try {
      // Fetch user profile metadata
      const { data: customerProfile } = await supabase
        .from("customers")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      const customerName = customerProfile?.full_name || user.email?.split("@")[0] || "Verified Buyer";

      const { error } = await supabase
        .from("product_reviews" as any)
        .insert({
          product_id: p.id,
          user_id: user.id,
          customer_name: customerName,
          rating: reviewRating,
          comment: reviewComment.trim(),
        });

      if (error) throw error;

      toast.success("Review submitted! Thank you.");
      setReviewComment("");
      setReviewRating(5);
      qc.invalidateQueries({ queryKey: ["product-reviews-list", p.id] });
    } catch (error: any) {
      toast.error("Failed to submit review: " + error.message);
    } finally {
      setIsSubmittingReview(false);
    }
  }

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
              {currentOldPrice && <span className="text-lg text-muted-foreground line-through">{formatLKR(currentOldPrice)}</span>}
            </div>
          </div>

          {hasVariants && (
            <div className="mt-6">
              <p className="text-sm mb-3">
                <span className="text-muted-foreground font-semibold">{selectedVariant ? variantLabel(selectedVariant) : "Please choose one"}</span>
              </p>
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
              disabled={isAddDisabled}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl px-6 py-3.5 text-sm font-bold tracking-wide hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="size-5" /> 
              {hasVariants && !selectedVariantId ? "CHOOSE CONFIGURATION" : "ADD TO CART"}
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
            <div className="max-w-3xl space-y-8">
              {/* Write a Review Section */}
              {user ? (
                hasPurchasedProduct ? (
                  <div className="bg-primary-soft/50 border border-primary/10 rounded-2xl p-5 sm:p-6 space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                      <MessageSquare className="size-4" /> Share Your Experience
                    </div>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rating</label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star className={`size-6 ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Review</label>
                        <textarea
                          rows={4}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="What did you like or dislike about this product? Sharing your authentic experience helps other shoppers make better choices."
                          required
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:border-primary outline-none transition-all resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmittingReview ? (
                          <>
                            <Loader2 className="size-4 animate-spin" /> Submitting...
                          </>
                        ) : (
                          <>
                            Submit Review <Send className="size-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-muted/40 border border-border/50 rounded-2xl p-5 text-center text-sm text-muted-foreground">
                    Only verified buyers who have purchased this product can leave a review.
                  </div>
                )
              ) : (
                <div className="bg-muted/40 border border-border/50 rounded-2xl p-5 text-center text-sm text-muted-foreground">
                  Please sign in to write a review. Only customers who purchased this product can review.
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Customer Feedback</h4>
                {loadingReviews ? (
                  <div className="py-6 text-center text-muted-foreground text-sm">Loading reviews...</div>
                ) : !productReviews || productReviews.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground text-sm italic">
                    No reviews yet. Be the first verified purchaser to leave feedback!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productReviews.map((rv: any) => (
                      <div key={rv.id} className="rounded-xl border border-border p-4 bg-card shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-foreground">{rv.customer_name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(rv.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`size-3.5 ${i < rv.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">"{rv.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
            disabled={isAddDisabled}
            className="flex-1 bg-primary text-primary-foreground rounded-2xl py-3 text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingCart className="size-4" /> 
            {hasVariants && !selectedVariantId ? "CHOOSE CONFIGURATION" : "ADD TO CART"}
          </button>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}