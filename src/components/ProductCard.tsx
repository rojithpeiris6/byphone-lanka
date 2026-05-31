import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/lib/shop";
import { formatLKR, useCart } from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export function ProductCard({ p }: { p: Product }) {
  const add = useCart((s) => s.add);
  const qc = useQueryClient();
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

  return (
    <div className="group relative bg-card rounded-2xl border border-border p-3 sm:p-4 flex flex-col transition-all hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5">
      {p.badge && (
        <span className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-[10px] font-bold tracking-wide px-2 py-1 rounded-full">{p.badge}</span>
      )}
      <button 
        onClick={toggleWishlist}
        aria-label="Wishlist" 
        className={cn(
          "absolute top-3 right-3 z-10 size-8 grid place-items-center rounded-full backdrop-blur border transition-colors",
          wishlist 
            ? "bg-rose-50 border-rose-200 text-rose-500" 
            : "bg-background/80 border-border text-muted-foreground hover:text-primary"
        )}
      >
        <Heart className={cn("size-4", wishlist && "fill-rose-500")} />
      </button>
      <Link to="/product/$slug" params={{ slug: p.slug }} className="aspect-square rounded-xl bg-muted/50 grid place-items-center overflow-hidden">
        <img src={p.image} alt={p.name} loading="lazy" width={400} height={400} className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
      </Link>
      <div className="mt-3 flex-1 flex flex-col">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{p.brand}</p>
        <Link to="/product/$slug" params={{ slug: p.slug }} className="mt-0.5 text-sm sm:text-[15px] font-semibold leading-snug line-clamp-2 hover:text-primary">
          {p.name}
        </Link>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">{p.rating}</span>
          <span>({p.reviews})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-extrabold text-primary">{formatLKR(p.price)}</span>
          {p.oldPrice && <span className="text-xs text-muted-foreground line-through">{formatLKR(p.oldPrice)}</span>}
        </div>
        <button
          onClick={() => { add(p.id); }}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 text-primary text-sm font-semibold py-2 hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <ShoppingCart className="size-4" /> ADD TO CART
        </button>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}