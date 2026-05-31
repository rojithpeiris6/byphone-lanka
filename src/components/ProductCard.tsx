import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/lib/shop";
import { formatLKR, useCart } from "@/lib/shop";

export function ProductCard({ p }: { p: Product }) {
  const add = useCart((s) => s.add);
  return (
    <div className="group relative bg-card rounded-2xl border border-border p-3 sm:p-4 flex flex-col transition-all hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5">
      {p.badge && (
        <span className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-[10px] font-bold tracking-wide px-2 py-1 rounded-full">{p.badge}</span>
      )}
      <button aria-label="Wishlist" className="absolute top-3 right-3 z-10 size-8 grid place-items-center rounded-full bg-background/80 backdrop-blur border border-border text-muted-foreground hover:text-primary">
        <Heart className="size-4" />
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