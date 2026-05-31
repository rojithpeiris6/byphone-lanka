import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Package, Search, Truck, CheckCircle2, Clock, XCircle, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/track-order")({
  component: TrackOrderPage,
});

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-600", icon: Clock },
  processing: { bg: "bg-sky-500/10", text: "text-sky-600", icon: Clock },
  shipped: { bg: "bg-violet-500/10", text: "text-violet-600", icon: Truck },
  delivered: { bg: "bg-emerald-500/10", text: "text-emerald-600", icon: CheckCircle2 },
  cancelled: { bg: "bg-rose-500/10", text: "text-rose-600", icon: XCircle },
};

function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOrder(null);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber.trim())
      .eq("customer_email", email.trim())
      .single();

    setLoading(false);
    if (error || !data) {
      toast.error("Order not found. Please check your order number and email.");
      return;
    }
    setOrder(data);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-12">
        <div className="size-16 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-4">
          <Package className="size-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Track Your Order</h1>
        <p className="text-muted-foreground mt-2">Enter your order details to see the current status of your delivery.</p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleTrack} className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Order Number</label>
            <input 
              required 
              value={orderNumber} 
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="BP-XXXXX" 
              className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:border-primary outline-none transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Email Address</label>
            <input 
              required 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" 
              className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:border-primary outline-none transition-all" 
            />
          </div>
          <button 
            disabled={loading}
            className="sm:col-span-2 h-12 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : <>Track Order <Search className="size-4" /></>}
          </button>
        </form>
      </div>

      {order && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Order Status</div>
                <div className="text-xl font-extrabold">Order {order.order_number}</div>
              </div>
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-wide",
                STATUS_STYLES[order.status]?.bg, STATUS_STYLES[order.status]?.text, "border-current/20"
              )}>
                {React.createElement(STATUS_STYLES[order.status]?.icon || Clock, { className: "size-4" })}
                {order.status}
              </div>
            </div>
            
            <div className="p-6 grid sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-primary flex items-center gap-2">
                  <User className="size-4" /> Customer Details
                </h3>
                <div className="text-sm space-y-1">
                  <p className="font-bold">{order.customer_name}</p>
                  <p className="text-muted-foreground">{order.customer_email}</p>
                  <p className="text-muted-foreground">{order.customer_phone}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-primary flex items-center gap-2">
                  <MapPin className="size-4" /> Shipping Address
                </h3>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {order.shipping_address}<br />
                  {order.city}, {order.district}<br />
                  {order.postal_code}
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-muted/30 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Order Date:</span>
                <span className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return <div className={className} style={{ width: '1rem', height: '1rem', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} />;
}

function User({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}