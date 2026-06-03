import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Star, Heart, Truck, ShieldCheck, RotateCcw, Minus, Plus, ShoppingCart, ChevronRight, Maximize2, Timer, MessageSquare, Send, Loader2, X } from "lucide-react";
import { products, formatLKR, useCart } from "@/lib/shop";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { FlashSaleTimer } from "@/components/FlashSaleTimer";
import { useAuthModalStore } from "@/lib/auth-modal-store";
import { cn } from "@/lib/utils";
import { requestOtpFn, verifyOtpFn } from "@/lib/api/ideamart.functions";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const now = new Date().toISOString();
    const { data: product, error } = await (supabase as any)
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

    const activeFlashSale = (product.flash_sales as any)?.find((s: any) =>
      s.is_active &&
      new Date(s.start_at) <= new Date(now) &&
      new Date(s.end_at) >= new Date(now)
    );

    const basePrice = activeFlashSale ? activeFlashSale.sale_price : (product.discount_price || product.price);
    const oldPrice = activeFlashSale ? product.price : (product.discount_price ? product.price : undefined);

    const { data: relatedData } = await (supabase as any)
      .from("products")
      .select(`
        *,
        brands(name),
        categories!products_category_id_fkey(name),
        product_images(url)
      `)
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .eq("status", "active")
      .limit(5);

    const relatedProducts = (relatedData || []).map((rp: any) => ({
      ...rp,
      brand: rp.brands?.name || "Unknown Brand",
      category: rp.categories?.name || "General",
      image: rp.product_images?.[0]?.url || "",
      price: rp.discount_price || rp.price,
      oldPrice: rp.discount_price ? rp.price : undefined,
      rating: 4.7,
      reviews: 0,
    }));

    return {
      product: {
        ...product,
        brand: product.brands?.name || "Unknown Brand",
        category: product.categories?.name || "General",
        image: product.product_images?.[0]?.url || "",
        oldPrice,
        price: basePrice,
        rating: 4.7,
        reviews: 0,
        variants: product.product_variants || [],
        activeFlashSale,
      } as any,
      relatedProducts
    };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.name} | buyphone.lk` : "Product | buyphone.lk" },
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
  const { product: p, relatedProducts } = Route.useLoaderData() as { product: any, relatedProducts: any[] };
  const add = useCart((s) => s.add);
  const qc = useQueryClient();
  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [tab, setTab] = useState<"desc" | "reviews" | "warranty" | any>("desc");
  const openAuth = useAuthModalStore((s) => s.open);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter unique available images
  const allImages = useMemo(() => {
    const list = p.product_images?.map((img: any) => img.url) || [];
    if (list.length === 0 && p.image) {
      list.push(p.image);
    }
    return Array.from(new Set(list)) as string[];
  }, [p.product_images, p.image]);

  const [activeImage, setActiveImage] = useState(allImages[0] || p.image);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Notify Me states
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState("");
  const [otpStep, setOtpStep] = useState<"REQUEST" | "VERIFY">("REQUEST");
  const [otpCode, setOtpCode] = useState("");
  const [otpRef, setOtpRef] = useState("");
  const [otpAppId, setOtpAppId] = useState("");
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);

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
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Fetch reviews for this product
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

  // Check if user has already reviewed this product
  const { data: hasReviewedProduct } = useQuery({
    queryKey: ["user-has-reviewed-product", user?.id, p.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("product_reviews" as any)
        .select("id")
        .eq("product_id", p.id)
        .eq("user_id", user.id)
        .limit(1);
      if (error) return false;
      return (data && data.length > 0);
    },
    enabled: !!user,
  });

  // Check if user has purchased this product
  const { data: hasPurchasedProduct } = useQuery({
    queryKey: ["user-has-purchased-product", user?.id, p.id],
    queryFn: async () => {
      if (!user) return false;
      const { data: profile } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      let query = (supabase as any).from("orders").select("id").eq("status", "delivered");
      if (profile?.id) {
        query = query.or(`customer_id.eq.${profile.id},customer_email.eq.${user.email}`);
      } else if (user.email) {
        query = query.eq("customer_email", user.email);
      } else {
        return false;
      }

      const { data: orders, error: ordersError } = await query;
      if (ordersError || !orders || orders.length === 0) return false;

      const orderIds = orders.map((o: any) => o.id);
      const { data: items, error: itemsError } = await (supabase as any)
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
      toast.info("Please sign in to save favorites");
      openAuth();
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
    qc.invalidateQueries({ queryKey: ["wishlist", user.id] });
    qc.invalidateQueries({ queryKey: ["customer-wishlist", user.id] });
  };

  const selectedVariant = useMemo(() =>
    p.variants?.find((v: any) => v.id === selectedVariantId),
    [p.variants, selectedVariantId]
  );

  const currentPrice = useMemo(() => {
    const basePrice = Number(p.price) || 0;
    const diff = Number(selectedVariant?.price_diff) || 0;
    return basePrice + diff;
  }, [p.price, selectedVariant]);

  const currentOldPrice = useMemo(() => {
    if (!p.oldPrice) return undefined;
    const diff = Number(selectedVariant?.price_diff) || 0;
    return Number(p.oldPrice) + diff;
  }, [p.oldPrice, selectedVariant]);

  const hasVariants = p.variants && p.variants.length > 0;

  // Base isOutOfStock logic
  const isOutOfStock = useMemo(() => {
    if (hasVariants) {
      if (selectedVariant) return Number(selectedVariant.stock_quantity) <= 0;
      return p.variants.every((v: any) => Number(v.stock_quantity) <= 0);
    }
    return Number(p.stock_quantity) <= 0;
  }, [hasVariants, selectedVariant, p.variants, p.stock_quantity]);

  const isAddDisabled = isOutOfStock || (hasVariants && !selectedVariantId);

  const related = relatedProducts || [];

  function handleAdd() {
    if (isOutOfStock) return;
    if (hasVariants && !selectedVariantId) {
      toast.error("Please select a configuration before adding to cart");
      return;
    }
    add(p.id, selectedVariantId, qty);
    toast.success("Added to cart", { description: `${qty} Ã— ${p.name}` });
  }

  const variantLabel = (v: any) => {
    const parts = [v.storage, v.color, v.ram, v.network].filter(Boolean);
    return parts.join(" / ");
  };

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return toast.error("You must be logged in to leave a review.");
    if (hasReviewedProduct) return toast.error("You have already reviewed this product.");
    if (!reviewComment.trim()) return toast.error("Please write a comment.");

    setIsSubmittingReview(true);
    try {
      const { data: customerProfile } = await supabase.from("customers").select("full_name").eq("user_id", user.id).single();
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
      qc.invalidateQueries({ queryKey: ["user-has-reviewed-product", user.id, p.id] });
    } catch (error: any) {
      toast.error("Failed to submit review: " + error.message);
    } finally {
      setIsSubmittingReview(false);
    }
  }

  async function handleNotifySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otpStep === "REQUEST" && !notifyPhone.trim()) return;
    if (otpStep === "VERIFY" && !otpCode.trim()) return;

    setIsSubmittingNotify(true);
    try {
      if (otpStep === "REQUEST") {
        const res = await requestOtpFn({ data: { subscriberId: notifyPhone } });
        if (res.success) {
          setOtpRef(res.referenceNo);
          setOtpAppId(res.applicationId);
          setOtpStep("VERIFY");
          toast.success("OTP sent to your phone");
        }
      } else {
        const res = await verifyOtpFn({
          data: {
            otp: otpCode,
            applicationId: otpAppId,
            referenceNo: otpRef,
            productId: p.id,
            phone: notifyPhone
          }
        });

        if (res.success) {
          toast.success("Notification set!", { description: `We'll text ${notifyPhone} when it's back.` });
          setIsNotifyModalOpen(false);
          setNotifyPhone("");
          setOtpCode("");
          setOtpStep("REQUEST");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process request");
    } finally {
      setIsSubmittingNotify(false);
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
            {allImages.map((imgUrl, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(imgUrl)}
                className={cn(
                  "aspect-square rounded-xl border-2 overflow-hidden bg-muted/40 transition-all p-1",
                  activeImage === imgUrl ? "border-primary scale-[1.03] shadow-sm" : "border-border hover:border-primary/50"
                )}
              >
                <img src={imgUrl} alt="" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>

          <div
            className="relative flex-1 aspect-square rounded-2xl bg-muted/40 grid place-items-center overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => setIsLightboxOpen(true)}
          >
            <img
              src={activeImage}
              alt={p.name}
              width={800}
              height={800}
              className={cn("h-full w-full object-contain p-6", isOutOfStock && isMounted && "grayscale opacity-80")}
            />
            <div className="absolute top-4 right-4 size-9 grid place-items-center rounded-full bg-background/80 border border-border pointer-events-none shadow-sm backdrop-blur-sm">
              <Maximize2 className="size-4" />
            </div>
            {isOutOfStock && isMounted && (
              <div className="absolute inset-0 grid place-items-center bg-black/5">
                <span className="bg-rose-600 text-white text-xs font-black tracking-widest px-4 py-2 rounded-full uppercase shadow-lg border-2 border-white/20">OUT OF STOCK</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          {p.activeFlashSale && !isOutOfStock ? (
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <span className="flex h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
              Flash Deal
            </div>
          ) : p.badge && !isOutOfStock ? (
            <span className="inline-block bg-primary text-primary-foreground text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full">{p.badge}</span>
          ) : null}

          {p.activeFlashSale && !isOutOfStock && (
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
            <span className={cn("font-bold uppercase tracking-wider text-xs", isOutOfStock && isMounted ? "text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100" : "text-[color:var(--color-success)] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100")}>
              {isOutOfStock && isMounted ? "Out of Stock" : "In Stock"}
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
            <div className={cn("inline-flex items-center border border-border rounded-xl", isOutOfStock && isMounted && "opacity-50 pointer-events-none")}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-muted rounded-l-xl"><Minus className="size-4" /></button>
              <span className="px-4 text-sm font-semibold w-10 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-2 hover:bg-muted rounded-r-xl"><Plus className="size-4" /></button>
            </div>
          </div>

          <div className="hidden lg:flex mt-6 gap-3">
            {isOutOfStock && isMounted ? (
              <button
                onClick={() => setIsNotifyModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold tracking-wide transition-all uppercase bg-primary text-primary-foreground hover:bg-primary-dark shadow-lg shadow-primary/20"
              >
                NOTIFY ME
              </button>
            ) : (
              <button
                onClick={handleAdd}
                disabled={isAddDisabled && isMounted}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold tracking-wide transition-all uppercase",
                  "bg-primary text-primary-foreground hover:bg-primary-dark shadow-lg shadow-primary/20"
                )}
              >
                {hasVariants && !selectedVariantId ? "CHOOSE CONFIGURATION" : "ADD TO CART"}
              </button>
            )}
            <button
              onClick={toggleWishlist}
              aria-label={wishlist ? "Remove from wishlist" : "Add to wishlist"}
              className={cn(
                "size-14 grid place-items-center border-2 rounded-2xl transition-all active:scale-95",
                wishlist
                  ? "bg-rose-50 border-rose-200 text-rose-500 shadow-inner"
                  : "border-primary/30 text-primary hover:bg-primary-soft"
              )}
            >
              <Heart className={cn("size-5", wishlist && "fill-rose-500 scale-110")} />
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
          {([["desc", "Description"], ["reviews", "Reviews"], ["warranty", "Warranty"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={"px-4 py-3 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap " + (tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{label}</button>
          ))}
        </div>
        <div className="py-6">
          {tab === "desc" && (
            <div className="max-w-3xl text-sm leading-relaxed text-muted-foreground space-y-3">
              <p>{p.description ?? `${p.name} | premium build, flagship performance, and an incredible camera system.`}</p>
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
                hasReviewedProduct ? (
                  <div className="bg-muted/40 border border-border/50 rounded-2xl p-5 text-center text-sm text-muted-foreground">
                    You have already submitted a review for this product.
                  </div>
                ) : hasPurchasedProduct ? (
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
                          placeholder="What did you like or dislike about this product?"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:border-primary outline-none transition-all resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmittingReview ? <Loader2 className="size-4 animate-spin" /> : <>Submit Review <Send className="size-3.5" /></>}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-muted/40 border border-border/50 rounded-2xl p-5 text-center text-sm text-muted-foreground">
                    Only verified buyers can leave a review.
                  </div>
                )
              ) : (
                <div className="bg-muted/40 border border-border/50 rounded-2xl p-5 text-center text-sm text-muted-foreground">
                  Please sign in to write a review.
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Customer Feedback</h4>
                {loadingReviews ? (
                  <div className="py-6 text-center text-muted-foreground text-sm">Loading reviews...</div>
                ) : !productReviews || productReviews.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground text-sm italic">
                    No reviews yet.
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
            <p className="max-w-3xl text-sm text-muted-foreground">All products come with 1-year official manufacturer warranty.</p>
          )}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight mb-5">YOU MAY ALSO LIKE</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
            {related.map((r) => <ProductCard key={r.id} p={r as any} />)}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-white/10"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X className="size-6" />
          </button>
          <img
            src={activeImage}
            alt={p.name}
            className="max-h-[90vh] max-w-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Mobile sticky purchase */}
      <div className="lg:hidden fixed bottom-[64px] inset-x-0 z-30 bg-background/95 backdrop-blur border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          {isOutOfStock && isMounted ? (
            <button
              onClick={() => setIsNotifyModalOpen(true)}
              className="w-full rounded-2xl py-3.5 text-sm font-bold inline-flex items-center justify-center gap-2 transition-all uppercase bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            >
              NOTIFY ME
            </button>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isAddDisabled && isMounted}
              className="w-full rounded-2xl py-3.5 text-sm font-bold inline-flex items-center justify-center gap-2 transition-all uppercase bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            >
              {hasVariants && !selectedVariantId ? "CHOOSE CONFIGURATION" : "ADD TO CART"}
            </button>
          )}
        </div>
      </div>

      {/* Notify Modal */}
      {isNotifyModalOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => {
            setIsNotifyModalOpen(false);
            setOtpStep("REQUEST");
          }}
        >
          <div
            className="bg-background rounded-2xl p-6 w-full max-w-sm relative shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-full bg-muted/50 hover:bg-muted transition-colors"
              onClick={() => {
                setIsNotifyModalOpen(false);
                setOtpStep("REQUEST");
              }}
            >
              <X className="size-4" />
            </button>
            <h3 className="text-xl font-extrabold mb-2">Enable Notifications</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Enter your phone number and we'll let you know when <strong>{p.name}</strong> is back in stock.
            </p>
            <form onSubmit={handleNotifySubmit} className="space-y-4">
              {otpStep === "REQUEST" ? (
                <div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 0771234567"
                    value={notifyPhone}
                    onChange={(e) => setNotifyPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:border-primary outline-none transition-all"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Enter the OTP sent to {notifyPhone}</p>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Enter OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:border-primary outline-none transition-all text-center tracking-widest font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setOtpStep("REQUEST")}
                      className="text-muted-foreground hover:text-foreground font-semibold"
                    >
                      Change Number
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingNotify}
                      onClick={async () => {
                        setIsSubmittingNotify(true);
                        try {
                          const res = await requestOtpFn({ data: { subscriberId: notifyPhone } });
                          if (res.success) {
                            setOtpRef(res.referenceNo);
                            setOtpAppId(res.applicationId);
                            toast.success("OTP resent successfully");
                          }
                        } catch (error: any) {
                          toast.error(error.message || "Failed to resend OTP");
                        } finally {
                          setIsSubmittingNotify(false);
                        }
                      }}
                      className="text-primary hover:text-primary-dark font-bold disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSubmittingNotify || (otpStep === "REQUEST" ? !notifyPhone.trim() : !otpCode.trim())}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingNotify ? <Loader2 className="size-4 animate-spin" /> : (otpStep === "REQUEST" ? "Request OTP" : "Verify & Set Alert")}
                </button>
                {otpStep === "REQUEST" && (
                  <p className="text-center text-[10px] text-muted-foreground/80 font-medium">
                    Rs 5+tax p/d.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}