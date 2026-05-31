import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, X, ShieldCheck, Truck } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart, getProduct, formatLKR } from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const setOpen = useCart((s) => s.setOpen);
  const close = useCart((s) => s.close);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());
  const count = items.reduce((a, b) => a + b.qty, 0);

  const FREE_SHIPPING = 50000;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING) * 100);
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col gap-0 bg-background [&>button]:hidden"
      >
        <SheetHeader className="px-5 py-4 border-b border-border flex-row items-center justify-between space-y-0">
          <SheetTitle className="flex items-center gap-2 text-base font-bold">
            <ShoppingBag className="size-5 text-primary" />
            Your Cart
            <span className="text-muted-foreground font-medium">({count})</span>
          </SheetTitle>
          <button
            onClick={close}
            aria-label="Close"
            className="size-9 grid place-items-center rounded-full hover:bg-secondary transition-colors"
          >
            <X className="size-5" />
          </button>
        </SheetHeader>

        {items.length > 0 && (
          <div className="px-5 py-3 border-b border-border bg-muted/30">
            {remaining > 0 ? (
              <p className="text-xs text-foreground/80">
                You're <span className="font-bold text-primary">{formatLKR(remaining)}</span> away from <span className="font-semibold">FREE shipping</span>
              </p>
            ) : (
              <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Truck className="size-3.5" /> You've unlocked FREE shipping!
              </p>
            )}
            <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
            <div className="size-20 rounded-full bg-muted grid place-items-center">
              <ShoppingBag className="size-9 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mt-1">Add something to get started.</p>
            </div>
            <Link
              to="/shop"
              onClick={close}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-border">
              {items.map((it) => {
                const p = getProduct(it.productId);
                if (!p) return null;
                return (
                  <VariantItem key={`${it.productId}-${it.variantId}`} item={it} product={p} close={close} setQty={setQty} remove={remove} />
                );
              })}
            </ul>

            <div className="border-t border-border px-5 py-4 space-y-3 bg-background">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-extrabold text-base">{formatLKR(subtotal)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" />
                Shipping & taxes calculated at checkout
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/cart"
                  onClick={close}
                  className="inline-flex items-center justify-center rounded-xl border border-border py-3 text-sm font-semibold hover:bg-secondary transition"
                >
                  View Cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={close}
                  className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold hover:opacity-90 transition"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function VariantItem({ item, product, close, setQty, remove }: any) {
  const { productId, variantId, qty } = item;
  
  const { data: variant } = useQuery({
    queryKey: ["cart-variant", variantId],
    queryFn: async () => {
      if (!variantId) return null;
      const { data } = await supabase.from("product_variants").select("*").eq("id", variantId).single();
      return data;
    },
    enabled: !!variantId,
  });

  const finalPrice = product.price + (variant?.price_diff || 0);
  const variantLabel = variant ? [variant.storage, variant.color, variant.ram, variant.network].filter(Boolean).join(" / ") : "";

  return (
    <li className="flex gap-3 p-4">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        onClick={close}
        className="size-20 rounded-xl bg-muted/50 shrink-0 overflow-hidden grid place-items-center"
      >
        <img src={product.image} alt={product.name} className="h-full w-full object-contain p-1.5" />
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{product.brand}</p>
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          onClick={close}
          className="block text-sm font-semibold leading-snug line-clamp-2 hover:text-primary"
        >
          {product.name}
        </Link>
        {variantLabel && <p className="text-[11px] text-muted-foreground mb-1">{variantLabel}</p>}
        <div className="mt-2 flex items-center justify-between">
          <div className="inline-flex items-center rounded-full border border-border">
            <button
              onClick={() => setQty(productId, variantId, qty - 1)}
              aria-label="Decrease"
              className="size-7 grid place-items-center text-muted-foreground hover:text-foreground"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-7 text-center text-sm font-semibold">{qty}</span>
            <button
              onClick={() => setQty(productId, variantId, qty + 1)}
              aria-label="Increase"
              className="size-7 grid place-items-center text-muted-foreground hover:text-foreground"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <span className="text-sm font-extrabold text-primary">{formatLKR(finalPrice * qty)}</span>
        </div>
      </div>
      <button
        onClick={() => remove(productId, variantId)}
        aria-label="Remove"
        className="self-start size-8 grid place-items-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}