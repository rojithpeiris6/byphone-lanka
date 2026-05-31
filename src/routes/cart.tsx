import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart, formatLKR } from "@/lib/shop";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — byphone.lk" },
      { name: "description", content: "Review your cart and proceed to a secure checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  
  // Fetch all products currently in the cart from DB, joining with flash_sales
  const { data: dbProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ["cart-products", items],
    queryFn: async () => {
      if (items.length === 0) return [];
      const ids = items.map(i => i.productId);
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("products")
        .select(`
          *, 
          product_images(url),
          flash_sales(sale_price)
        `)
        .in("id", ids)
        .eq("flash_sales.is_active", true)
        .lte("flash_sales.start_at", now)
        .gte("flash_sales.end_at", now);
      if (error) throw error;
      return (data ?? []).map(p => ({
        ...p,
        image: p.product_images?.[0]?.url || "",
      }));
    },
  });

  // Calculate subtotal based on DB prices and active flash sales
  const subtotal = useQuery({
    queryKey: ["cart-subtotal", items, dbProducts],
    queryFn: async () => {
      if (!dbProducts || items.length === 0) return 0;
      
      let total = 0;
      for (const item of items) {
        const product = dbProducts.find(p => p.id === item.productId);
        if (!product) continue;

        // Priority: Flash Sale Price > Discount Price > Regular Price
        let price = product.flash_sales?.[0]?.sale_price || product.discount_price || product.price;
        
        if (item.variantId) {
          const { data: variant } = await supabase
            .from("product_variants")
            .select("price_diff")
            .eq("id", item.variantId)
            .single();
          if (variant) price += variant.price_diff;
        }
        total += price * item.qty;
      }
      return total;
    },
  }).data ?? 0;

  const shipping = 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto size-20 rounded-full bg-primary-soft text-primary grid place-items-center"><ShoppingBag className="size-9" /></div>
        <h1 className="mt-6 text-2xl font-extrabold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Start shopping the latest phones and tech.</p>
        <Link to="/shop" className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-bold">Browse Shop <ArrowRight className="size-4" /></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-32 lg:pb-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Your Cart</h1>
      <p className="text-sm text-muted-foreground">{items.length} item{items.length > 1 ? "s" : ""}</p>

      <div className="mt-6 grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-3">
          {loadingProducts ? (
            <div className="py-20 text-center text-muted-foreground">Loading your cart...</div>
          ) : (
            items.map((i) => {
              const p = dbProducts?.find(prod => prod.id === i.productId);
              if (!p) return null;
              return <CartItemRow key={`${i.productId}-${i.variantId}`} item={i} product={p} setQty={setQty} remove={remove} />;
            })
          )}
        </div>

        <aside className="lg:sticky lg:top-28 self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-lg font-extrabold">Order Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">{formatLKR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-semibold text-[color:var(--color-success)]">Free</span></div>
            </div>
            <div className="mt-3 flex gap-2">
              <input placeholder="Coupon code" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" />
              <button className="rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted">Apply</button>
            </div>
            <div className="mt-4 border-t border-border pt-4 flex justify-between items-baseline">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-2xl font-extrabold text-primary">{formatLKR(total)}</span>
            </div>
            <Link to="/checkout" className="mt-5 hidden lg:inline-flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-3.5 text-sm font-bold hover:bg-primary-dark">
              Checkout <ArrowRight className="size-4" />
            </Link>
          </div>
        </aside>
      </div>

      {/* Mobile sticky checkout */}
      <div className="lg:hidden fixed bottom-[64px] inset-x-0 z-30 bg-background/95 backdrop-blur border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground font-semibold">Total</p>
            <p className="text-lg font-extrabold text-primary leading-tight">{formatLKR(total)}</p>
          </div>
          <Link to="/checkout" className="flex-1 bg-primary text-primary-foreground rounded-2xl py-3 text-sm font-bold inline-flex items-center justify-center gap-2">
            Checkout <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function CartItemRow({ item, product, setQty, remove }: any) {
  const { productId, variantId } = item;
  
  const { data: variant } = useQuery({
    queryKey: ["cart-variant", variantId],
    queryFn: async () => {
      if (!variantId) return null;
      const { data } = await supabase.from("product_variants").select("*").eq("id", variantId).single();
      return data;
    },
    enabled: !!variantId,
  });

  const basePrice = product.flash_sales?.[0]?.sale_price || product.discount_price || product.price;
  const finalPrice = basePrice + (variant?.price_diff || 0);
  const variantLabel = variant ? [variant.storage, variant.color, variant.ram, variant.network].filter(Boolean).join(" / ") : "";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex gap-4">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="size-20 sm:size-28 rounded-xl bg-muted/40 shrink-0 overflow-hidden">
        <img src={product.image} alt={product.name} className="h-full w-full object-contain p-2" />
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase font-semibold text-muted-foreground">Store Product</p>
        <Link to="/product/$slug" params={{ slug: product.slug }} className="text-sm sm:text-base font-semibold leading-tight line-clamp-2 hover:text-primary">{product.name}</Link>
        {variantLabel && <p className="text-[11px] text-muted-foreground mt-0.5">{variantLabel}</p>}
        <p className="mt-1 text-primary font-extrabold">{formatLKR(finalPrice)}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="inline-flex items-center border border-border rounded-xl">
            <button onClick={() => setQty(productId, variantId, item.qty - 1)} className="p-1.5 hover:bg-muted rounded-l-xl"><Minus className="size-3.5" /></button>
            <span className="px-3 text-sm font-semibold w-8 text-center">{item.qty}</span>
            <button onClick={() => setQty(productId, variantId, item.qty + 1)} className="p-1.5 hover:bg-muted rounded-r-xl"><Plus className="size-3.5" /></button>
          </div>
          <button onClick={() => remove(productId, variantId)} className="text-muted-foreground hover:text-destructive p-2"><Trash2 className="size-4" /></button>
        </div>
      </div>
    </div>
  );
}