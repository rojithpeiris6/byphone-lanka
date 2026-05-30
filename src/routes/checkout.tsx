import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, ChevronRight, Check, Truck, Zap, Banknote, CreditCard, Building2, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import { useCart, getProduct, formatLKR } from "@/lib/shop";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — byphone.lk" },
      { name: "description", content: "Secure checkout. Pay with COD, Card, Bank Transfer, KOKO or MintPay." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [delivery, setDelivery] = useState<"std" | "exp">("std");
  const [payment, setPayment] = useState("cod");
  const deliveryFee = delivery === "exp" ? 490 : 0;
  const total = subtotal + deliveryFee;

  function placeOrder() {
    toast.success("Order placed!", { description: "We'll contact you shortly to confirm." });
    clear();
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24">
      <p className="text-xs text-muted-foreground"><Link to="/">Home</Link> <ChevronRight className="inline size-3" /> <Link to="/cart">Cart</Link> <ChevronRight className="inline size-3" /> <span className="text-foreground">Checkout</span></p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-center">Checkout</h1>
      <p className="text-center text-xs text-muted-foreground mt-1 inline-flex items-center justify-center gap-1.5 w-full"><Lock className="size-3" /> Your information is secure and encrypted</p>

      {/* Steps */}
      <div className="mt-6 mx-auto max-w-2xl flex items-center">
        {[1, 2, 3].map((n, i) => (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={"size-9 rounded-full grid place-items-center font-bold text-sm " + (step >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border")}>
                {step > n ? <Check className="size-4" /> : n}
              </div>
              <span className={"text-xs font-semibold mt-1 " + (step >= n ? "text-primary" : "text-muted-foreground")}>{["Shipping", "Payment", "Review"][n - 1]}</span>
            </div>
            {i < 2 && <div className={"flex-1 h-0.5 mx-2 " + (step > n ? "bg-primary" : "bg-border")} />}
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-5">
          {/* Shipping */}
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="size-7 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-bold">1</div>
              <h2 className="text-lg font-extrabold">Shipping Information</h2>
            </div>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" placeholder="Enter your full name" full />
              <Field label="Phone Number" placeholder="07X XXX XXXX" />
              <Field label="Email Address" placeholder="youremail@gmail.com" type="email" />
              <Field label="Address" placeholder="House no, Street name, Area" full />
              <Field label="City / Town" placeholder="Enter your city" />
              <div>
                <label className="text-sm font-semibold mb-1.5 block">District <span className="text-destructive">*</span></label>
                <select className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
                  <option>Select district</option>
                  <option>Colombo</option><option>Gampaha</option><option>Kandy</option><option>Galle</option>
                </select>
              </div>
              <Field label="Postal Code" placeholder="Enter postal code" />
            </div>

            <p className="mt-6 mb-2 text-sm font-semibold">Delivery Method</p>
            <div className="space-y-2">
              <DeliveryOption Icon={Truck} active={delivery === "std"} onClick={() => setDelivery("std")} title="Standard Delivery (2-3 Working Days)" right={<span className="text-[color:var(--color-success)] font-semibold">Free</span>} sub="Rs. 0" />
              <DeliveryOption Icon={Zap} active={delivery === "exp"} onClick={() => setDelivery("exp")} title="Express Delivery (1 Working Day)" right="Rs. 490" />
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="size-7 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-bold">2</div>
              <h2 className="text-lg font-extrabold">Payment Method</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Choose a payment method</p>
            <div className="mt-3 space-y-2">
              <PayOption id="cod" value={payment} onChange={setPayment} Icon={Banknote} title="Cash on Delivery" sub="Pay when you receive your order" />
              <PayOption id="card" value={payment} onChange={setPayment} Icon={CreditCard} title="Card Payment" sub="Pay securely using your debit or credit card" right="VISA · MC · AMEX" />
              <PayOption id="bank" value={payment} onChange={setPayment} Icon={Building2} title="Bank Transfer" sub="Make payment directly to our bank account" />
              <PayOption id="koko" value={payment} onChange={setPayment} Icon={Building2} title="KOKO by HNB" sub="Buy now, pay in 3 interest-free payments" right="KOKO" />
              <PayOption id="mint" value={payment} onChange={setPayment} Icon={Building2} title="MintPay" sub="Split into 3 easy installments" right="MINT" />
            </div>
            <div className="mt-6 flex items-center justify-between">
              <Link to="/cart" className="text-sm font-semibold text-primary inline-flex items-center gap-1">← Back to Cart</Link>
              <button onClick={placeOrder} className="bg-primary text-primary-foreground rounded-xl px-6 py-3 text-sm font-bold hover:bg-primary-dark">
                Place Order
              </button>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="self-start space-y-5 lg:sticky lg:top-28">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">Order Summary</h3>
              <span className="text-xs bg-primary-soft text-primary font-bold px-2 py-1 rounded-full">{items.length} items</span>
            </div>
            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.length === 0 && <p className="text-sm text-muted-foreground">No items yet.</p>}
              {items.map((i) => {
                const p = getProduct(i.id)!;
                return (
                  <div key={i.id} className="flex gap-3">
                    <div className="size-14 rounded-lg bg-muted/40 shrink-0 overflow-hidden"><img src={p.image} alt={p.name} className="h-full w-full object-contain p-1" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight line-clamp-2">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {i.qty}</p>
                    </div>
                    <p className="text-sm font-bold whitespace-nowrap">{formatLKR(p.price * i.qty)}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatLKR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{deliveryFee === 0 ? "Free" : formatLKR(deliveryFee)}</span></div>
              <div className="flex justify-between items-baseline pt-2 border-t border-border">
                <span className="font-extrabold">Total</span>
                <span className="text-2xl font-extrabold text-primary">{formatLKR(total)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">(Includes VAT)</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h4 className="font-extrabold text-sm mb-3">Why shop with byphone.lk?</h4>
            <ul className="space-y-3 text-xs">
              <Why Icon={ShieldCheck} title="100% Original Products" sub="All products are genuine and brand new." />
              <Why Icon={Truck} title="Fast & Free Delivery" sub="Islandwide delivery on all orders." />
              <Why Icon={RotateCcw} title="Easy Returns" sub="Hassle-free returns within 7 days." />
              <Why Icon={Headphones} title="24/7 Support" sub="011 2 123 456 · support@byphone.lk" />
            </ul>
          </div>
        </aside>
      </div>
      <span className="sr-only">{step}</span>
    </div>
  );
}

function Field({ label, placeholder, type = "text", full }: { label: string; placeholder: string; type?: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-sm font-semibold mb-1.5 block">{label} <span className="text-destructive">*</span></label>
      <input type={type} placeholder={placeholder} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
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
