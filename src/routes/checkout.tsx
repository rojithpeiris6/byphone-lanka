import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Lock, ChevronRight, Truck, Zap, Banknote, CreditCard, Building2, ShieldCheck, RotateCcw, Headphones, Loader2, Ticket, Check } from "lucide-react";
import { useCart, formatLKR } from "@/lib/shop";
import { toast } from "sonner";
import { placeOrder } from "@/lib/api/orders.functions";
import { validateCoupon } from "@/lib/api/coupons.functions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Putlam", "Ratnapura", "Sampulunthurai", "Vavuniya"
];

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | buyphone.lk" },
      { name: "description", content: "Secure checkout. Pay with Card (PayPal/PayHere) or Cash on Delivery." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const { user } = useAuth();
  
  const [delivery, setDelivery] = useState<"std" | "exp">("std");
  const [payment, setPayment] = useState("card");
  const [provider, setProvider] = useState<"payhere" | "paypal">("payhere");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [activeCoupon, setActiveCoupon] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "",
  });

  const { data: profile } = useQuery({
    queryKey: ["checkout-user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("customers")
        .select("full_name, phone, email, address, city, district")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.full_name || "",
        phone: profile.phone || "",
        email: profile.email || "",
        address: profile.address || "",
        city: profile.city || "",
        district: profile.district || "",
      });
    }
  }, [profile]);

  const { data: cartData, isLoading: loadingProducts } = useQuery({
    queryKey: ["checkout-data", items],
    queryFn: async () => {
      if (items.length === 0) return { products: [], variants: {} };
      
      const productIds = items.map(i => i.productId);
      const variantIds = items.filter(i => i.variantId).map(i => i.variantId!).filter(Boolean);
      const now = new Date().toISOString();

      const { data: dbProducts, error: pError } = await supabase
        .from("products")
        .select(`*, product_images(url), flash_sales(sale_price, is_active, start_at, end_at)`)
        .in("id", productIds);
      if (pError) throw pError;

      const { data: dbVariants, error: vError } = await supabase
        .from("product_variants")
        .select("*")
        .in("id", variantIds);
      if (vError) throw vError;

      const variantMap: Record<string, any> = {};
      dbVariants?.forEach(v => { variantMap[v.id] = v; });

      return { 
        products: (dbProducts ?? []).map(p => {
          const activeFlash = p.flash_sales?.find((s: any) => 
            s.is_active && 
            new Date(s.start_at) <= new Date(now) && 
            new Date(s.end_at) >= new Date(now)
          );
          return {
            ...p,
            image: p.product_images?.[0]?.url || "",
            active_flash_sale: activeFlash,
          };
        }),
        variants: variantMap 
      };
    },
  });

  const subtotal = useMemo(() => {
    if (!cartData?.products) return 0;
    
    return items.reduce((acc, item) => {
      const product = cartData.products.find(p => p.id === item.productId);
      if (!product) return acc;

      let price = product.active_flash_sale?.sale_price || product.discount_price || product.price;
      if (item.variantId && cartData.variants[item.variantId]) {
        price += cartData.variants[item.variantId].price_diff;
      }
      return acc + (price * item.qty);
    }, 0);
  }, [items, cartData]);

  const deliveryFee = delivery === "exp" ? 490 : 0;
  const totalBeforeDiscount = subtotal + deliveryFee;
  const finalTotal = Math.max(0, totalBeforeDiscount - appliedDiscount);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const result = await validateCoupon({
        data: {
          code: couponCode.trim(),
          orderAmount: subtotal,
        },
      });
      setAppliedDiscount(result.discount);
      setActiveCoupon(result.couponCode);
      toast.success(`Coupon applied! You saved ${formatLKR(result.discount)}`);
    } catch (e: any) {
      toast.error(e.message || "Invalid coupon code");
      setAppliedDiscount(0);
      setActiveCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  }

  async function handlePlaceOrder() {
    const required = ["name", "phone", "email", "address", "city", "district"];
    const missing = required.filter(key => !form[key as keyof typeof form]);
    
    if (missing.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await placeOrder({
        data: {
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            district: form.district,
          },
          shippingMethod: delivery,
          paymentMethod: payment,
          paymentProvider: payment === "card" ? provider : undefined,
          items: items.map(i => ({
            productId: i.productId,
            variantId: i.variantId,
            qty: i.qty,
          })),
        },
      });

      toast.success("Order placed successfully!");
      clear();
      navigate({ 
        to: "/order-success", 
        search: { orderNumber: result.orderNumber } 
      });
    } catch (e: any) {
      console.error("Order error:", e);
      toast.error("Order failed", { 
        description: e.message || "An unexpected error occurred. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24">
      <p className="text-xs text-muted-foreground"><Link to="/">Home</Link> <ChevronRight className="inline size-3" /> <Link to="/cart">Cart</Link> <ChevronRight className="inline size-3" /> <span className="text-foreground">Checkout</span></p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-center">Checkout</h1>
      <p className="text-center text-xs text-muted-foreground mt-1 inline-flex items-center justify-center gap-1.5 w-full"><Lock className="size-3" /> Your information is secure and encrypted</p>

      <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="size-7 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-bold">1</div>
              <h2 className="text-lg font-extrabold">Shipping Information</h2>
            </div>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" placeholder="Enter your full name" full 
                value={form.name} onChange={(v) => setForm(f => ({ ...f, name: v }))} />
              <Field label="Phone Number" placeholder="07X XXX XXXX" 
                value={form.phone} onChange={(v) => setForm(f => ({ ...f, phone: v }))} />
              <Field label="Email Address" placeholder="youremail@gmail.com" type="email" 
                value={form.email} onChange={(v) => setForm(f => ({ ...f, email: v }))} />
              <Field label="Address" placeholder="House no, Street name, Area" full 
                value={form.address} onChange={(v) => setForm(f => ({ ...f, address: v }))} />
              <Field label="City / Town" placeholder="Enter your city" 
                value={form.city} onChange={(v) => setForm(f => ({ ...f, city: v }))} />
              <div>
                <label className="text-sm font-semibold mb-1.5 block">District <span className="text-destructive">*</span></label>
                <select 
                  value={form.district} 
                  onChange={(e) => setForm(f => ({ ...f, district: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                >
                  <option value="">Select district</option>
                  {SRI_LANKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <p className="mt-6 mb-2 text-sm font-semibold">Delivery Method</p>
            <div className="space-y-2">
              <DeliveryOption Icon={Truck} active={delivery === "std"} onClick={() => setDelivery("std")} title="Standard Delivery (2-3 Working Days)" right={<span className="text-[color:var(--color-success)] font-semibold">Free</span>} sub="Rs. 0" />
              <DeliveryOption Icon={Zap} active={delivery === "exp"} onClick={() => setDelivery("exp")} title="Express Delivery (1 Working Day)" right="Rs. 490" />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="size-7 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-bold">2</div>
              <h2 className="text-lg font-extrabold">Payment Method</h2>
            </div>
            
            <div className="mt-5 space-y-4">
              <div className="grid gap-3">
                <PayOption 
                  id="card" 
                  value={payment} 
                  onChange={setPayment} 
                  Icon={CreditCard} 
                  title="Card Payment" 
                  sub="Visa, Mastercard via Secure Gateways" 
                  right="INSTANT" 
                />
                
                {payment === "card" && (
                  <div className="ml-8 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
                    <button 
                      onClick={() => setProvider("payhere")}
                      className={cn(
                        "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                        provider === "payhere" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="h-6 flex items-center"><span className="text-sm font-black italic text-[#003087]">Pay<span className="text-[#009cde]">Here</span></span></div>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Local Gateway</span>
                      {provider === "payhere" && <div className="absolute top-2 right-2"><Check className="size-3 text-primary" /></div>}
                    </button>
                    <button 
                      onClick={() => setProvider("paypal")}
                      className={cn(
                        "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all relative",
                        provider === "paypal" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="h-6 flex items-center"><span className="text-sm font-black italic text-[#003087]">Pay<span className="text-[#009cde]">Pal</span></span></div>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Global Gateway</span>
                      {provider === "paypal" && <div className="absolute top-2 right-2"><Check className="size-3 text-primary" /></div>}
                    </button>
                  </div>
                )}

                <PayOption 
                  id="cod" 
                  value={payment} 
                  onChange={setPayment} 
                  Icon={Banknote} 
                  title="Cash on Delivery" 
                  sub="Pay when you receive your order" 
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <Link to="/cart" className="text-sm font-semibold text-primary inline-flex items-center gap-1">â† Back to Cart</Link>
              <button 
                onClick={handlePlaceOrder} 
                disabled={isSubmitting || loadingProducts}
                className="bg-primary text-primary-foreground rounded-xl px-10 py-3.5 text-sm font-bold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  payment === "card" ? "Pay & Place Order" : "Confirm Order"
                )}
              </button>
            </div>
          </section>
        </div>

        <aside className="self-start space-y-5 lg:sticky lg:top-28">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">Order Summary</h3>
              <span className="text-xs bg-primary-soft text-primary font-bold px-2 py-1 rounded-full">{items.length} items</span>
            </div>
            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
              {loadingProducts ? (
                <div className="py-4 text-center text-xs text-muted-foreground">Loading items...</div>
              ) : items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items yet.</p>
              ) : (
                items.map((i, idx) => {
                  const p = cartData?.products.find(prod => prod.id === i.productId);
                  if (!p) return null;
                  const variant = i.variantId ? cartData?.variants[i.variantId] : null;
                  
                  const basePrice = p.active_flash_sale?.sale_price || p.discount_price || p.price;
                  const finalPrice = basePrice + (variant?.price_diff || 0);

                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="size-14 rounded-lg bg-muted/40 shrink-0 overflow-hidden"><img src={p.image} alt={p.name} className="h-full w-full object-contain p-1" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight line-clamp-2">{p.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {i.qty}</p>
                      </div>
                      <p className="text-sm font-bold whitespace-nowrap">{formatLKR(finalPrice * i.qty)}</p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatLKR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{deliveryFee === 0 ? "Free" : formatLKR(deliveryFee)}</span></div>
              
              {activeCoupon && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <Ticket className="size-3" /> Coupon: {activeCoupon}
                  </span>
                  <span>-{formatLKR(appliedDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-border">
                <span className="font-extrabold">Total</span>
                <span className="text-2xl font-extrabold text-primary">{formatLKR(finalTotal)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">(Includes VAT)</p>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-muted/50 border border-border space-y-2">
              <label className="text-[11px] font-bold uppercase text-muted-foreground block">Promo Code</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" 
                />
                <button 
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary-dark disabled:opacity-50 transition-colors"
                >
                  {isValidatingCoupon ? <Loader2 className="size-3 animate-spin" /> : "Apply"}
                </button>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h4 className="font-extrabold text-sm mb-3">Why shop with buyphone.lk?</h4>
            <ul className="space-y-3 text-xs">
              <Why Icon={ShieldCheck} title="100% Original Products" sub="All products are genuine and brand new." />
              <Why Icon={Truck} title="Fast & Free Delivery" sub="Islandwide delivery on all orders." />
              <Why Icon={RotateCcw} title="Easy Returns" sub="Hassle-free returns within 7 days." />
              <Why Icon={Headphones} title="24/7 Support" sub="011 2 123 456 · support@buyphone.lk" />
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, placeholder, type = "text", full, value, onChange }: { label: string; placeholder: string; type?: string; full?: boolean; value: string; onChange: (v: string) => void }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-sm font-semibold mb-1.5 block">{label} <span className="text-destructive">*</span></label>
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" 
      />
    </div>
  );
}

function DeliveryOption({ Icon, title, sub, right, active, onClick }: any) {
  return (
    <button onClick={onClick} className={"w-full flex items-center gap-3 text-left rounded-xl border-2 p-4 transition-colors " + (active ? "border-primary bg-primary-soft/50" : "border-border hover:border-foreground/30")}>
      <span className={"size-5 rounded-full border-2 grid place-items-center shrink-0 " + (active ? "border-primary" : "border-border")}>{active && <span className="size-2.5 rounded-full bg-primary" />}</span>
      <Icon className="size-5 text-primary" />
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      <div className="text-sm">{right}</div>
    </button>
  );
}

function PayOption({ id, value, onChange, Icon, title, sub, right }: any) {
  const active = value === id;
  return (
    <button onClick={() => onChange(id)} className={"w-full flex items-center gap-3 text-left rounded-xl border-2 p-4 transition-colors " + (active ? "border-primary bg-primary-soft/50" : "border-border hover:border-foreground/30")}>
      <span className={"size-5 rounded-full border-2 grid place-items-center shrink-0 " + (active ? "border-primary" : "border-border")}>{active && <span className="size-2.5 rounded-full bg-primary" />}</span>
      <Icon className="size-5 text-primary" />
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      {right && <span className="text-[10px] font-bold text-muted-foreground">{right}</span>}
    </button>
  );
}

function Why({ Icon, title, sub }: { Icon: any; title: string; sub: string }) {
  return (
    <li className="flex gap-2.5">
      <Icon className="size-4 text-primary shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-muted-foreground">{sub}</p>
      </div>
    </li>
  );
}