import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Bell, Loader2 } from "lucide-react";
import type { Product } from "@/lib/shop";
import { formatLKR, useCart } from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { ProductVariantSelector } from "@/components/ProductVariantSelector";
import { useAuthModalStore } from "@/lib/auth-modal-store";
import { requestOtpFn, verifyOtpFn } from "@/lib/api/ideamart.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function ProductCard({ p, showWishlist = true }: { p: Product; showWishlist?: boolean }) {
  const add = useCart((s) => s.add);
  const qc = useQueryClient();
  const { user } = useAuth();
  const openAuth = useAuthModalStore((s) => s.open);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Ideamart Notify State
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifyOtpStep, setNotifyOtpStep] = useState<"REQUEST" | "VERIFY">("REQUEST");
  const [notifyOtpCode, setNotifyOtpCode] = useState("");
  const [notifyOtpRef, setNotifyOtpRef] = useState("");
  const [notifyOtpAppId, setNotifyOtpAppId] = useState("");
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyOtpStep === "REQUEST" && !notifyPhone.trim()) return;
    if (notifyOtpStep === "VERIFY" && !notifyOtpCode.trim()) return;

    setIsSubmittingNotify(true);
    try {
      if (notifyOtpStep === "REQUEST") {
        const res = await requestOtpFn({ data: { subscriberId: notifyPhone } });
        if (res.success) {
          setNotifyOtpRef(res.referenceNo);
          setNotifyOtpAppId(res.applicationId);
          setNotifyOtpStep("VERIFY");
          toast.success("OTP sent to your phone");
        }
      } else {
        const res = await verifyOtpFn({
          data: {
            otp: notifyOtpCode,
            applicationId: notifyOtpAppId,
            referenceNo: notifyOtpRef,
            phone: notifyPhone
          }
        });

        if (res.success) {
          toast.success("You will be notified when this item is back in stock!");
          setIsNotifyOpen(false);
          setNotifyPhone("");
          setNotifyOtpCode("");
          setNotifyOtpStep("REQUEST");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process request");
    } finally {
      setIsSubmittingNotify(false);
    }
  };

  // Check if product has variants
  const { data: variants } = useQuery({
    queryKey: ["product-variants-check", p.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_variants")
        .select("id, stock_quantity")
        .eq("product_id", p.id);
      if (error) throw error;
      return data ?? [];
    },
  });

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
    enabled: !!user && showWishlist,
  });

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.info("Please sign in to save your favorites");
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
    
    // Invalidate both individual checks and list views
    qc.invalidateQueries({ queryKey: ["wishlist", user.id] });
    qc.invalidateQueries({ queryKey: ["customer-wishlist", user.id] });
  };

  const isOutOfStock = (p.stock_quantity ?? 1) <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (variants && variants.length > 0) {
      setIsSelectorOpen(true);
    } else {
      add(p.id);
      toast.success("Added to cart", { description: `${p.name} added to your cart` });
    }
  };

  return (
    <div className="group relative bg-card rounded-2xl border border-border p-3 sm:p-4 flex flex-col transition-all hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5">
      {p.badge && !isOutOfStock && (
        <span className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-[10px] font-bold tracking-wide px-2 py-1 rounded-full">{p.badge}</span>
      )}
      {isOutOfStock && (
        <span className="absolute top-3 left-3 z-10 bg-rose-600 text-white text-[10px] font-black tracking-widest px-2 py-1 rounded-full uppercase">OUT OF STOCK</span>
      )}
      {showWishlist && (
        <button 
          onClick={toggleWishlist}
          aria-label={wishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-3 right-3 z-10 size-8 grid place-items-center rounded-full backdrop-blur border transition-all active:scale-90",
            wishlist 
              ? "bg-rose-50 border-rose-200 text-rose-500 shadow-sm" 
              : "bg-background/80 border-border text-muted-foreground hover:text-primary hover:border-primary/30"
          )}
        >
          <Heart className={cn("size-4 transition-transform", wishlist && "fill-rose-500 scale-110")} />
        </button>
      )}
      <Link to="/product/$slug" params={{ slug: p.slug }} className={cn("aspect-square rounded-xl bg-muted/50 grid place-items-center overflow-hidden", isOutOfStock && "opacity-60 grayscale")}>
        <img src={p.image} alt={p.name} loading="lazy" width={400} height={400} className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
      </Link>
      <div className="mt-3 flex-1 flex flex-col">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{p.brand}</p>
        <Link to="/product/$slug" params={{ slug: p.slug }} className="mt-0.5 text-sm sm:text-[15px] font-semibold leading-snug line-clamp-2 hover:text-primary">
          {p.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-extrabold text-primary">{formatLKR(p.price)}</span>
          {p.oldPrice && <span className="text-xs text-muted-foreground line-through">{formatLKR(p.oldPrice)}</span>}
        </div>
        <button
          onClick={isOutOfStock ? (e) => { e.preventDefault(); setIsNotifyOpen(true); } : handleAddToCart}
          className={cn(
            "mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold transition-colors",
            isOutOfStock 
              ? "border-primary/30 text-primary hover:bg-primary/10" 
              : "border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
          )}
        >
          {isOutOfStock ? <><Bell className="size-4" /> NOTIFY ME</> : <><ShoppingCart className="size-4" /> ADD TO CART</>}
        </button>
      </div>

      <ProductVariantSelector 
        productId={p.id}
        productName={p.name}
        basePrice={p.price}
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onAdd={(variantId, qty) => {
          add(p.id, variantId, qty);
          toast.success("Added to cart", { description: `${qty} items added to your cart` });
        }}
      />

      <Dialog open={isNotifyOpen} onOpenChange={setIsNotifyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notify Me</DialogTitle>
            <DialogDescription>
              Get an SMS alert when <strong>{p.name}</strong> is back in stock.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNotifySubmit} className="flex flex-col gap-4 mt-2">
            {notifyOtpStep === "REQUEST" ? (
              <>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="Enter phone (e.g. 0771234567)"
                  value={notifyPhone}
                  onChange={(e) => setNotifyPhone(e.target.value.replace(/\D/g, ''))}
                  className="h-10 px-3 rounded-md border border-input bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="submit" disabled={isSubmittingNotify || !notifyPhone.trim()} className="h-10 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmittingNotify ? <Loader2 className="size-4 animate-spin" /> : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={notifyOtpCode}
                  onChange={(e) => setNotifyOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-10 px-3 rounded-md border border-input bg-transparent text-sm text-center tracking-widest font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="submit" disabled={isSubmittingNotify || !notifyOtpCode.trim()} className="h-10 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmittingNotify ? <Loader2 className="size-4 animate-spin" /> : "Verify & Notify"}
                </button>
                <button type="button" onClick={() => setNotifyOtpStep("REQUEST")} className="text-xs text-muted-foreground hover:text-foreground">Change Number</button>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}