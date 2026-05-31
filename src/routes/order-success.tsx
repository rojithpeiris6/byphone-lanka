import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Truck } from "lucide-react";

export const Route = createFileRoute("/order-success")({
  validateSearch: z.object({
    orderNumber: z.string().optional(),
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { orderNumber } = Route.useSearch();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto size-20 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center animate-bounce">
          <CheckCircle2 className="size-12" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Thank you for your order!</h1>
          <p className="text-muted-foreground">
            Your order has been placed successfully. We've sent a confirmation email to your inbox.
          </p>
        </div>

        {orderNumber && (
          <div className="bg-muted/50 border border-border rounded-2xl p-4 inline-flex flex-col items-center w-full">
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Order Number</span>
            <span className="text-xl font-mono font-bold text-primary">{orderNumber}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="p-4 rounded-2xl border border-border bg-card flex flex-col items-center gap-2">
            <Package className="size-5 text-primary" />
            <span className="text-xs font-semibold">Processing</span>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-card flex flex-col items-center gap-2">
            <Truck className="size-5 text-primary" />
            <span className="text-xs font-semibold">Shipping Soon</span>
          </div>
        </div>

        <div className="pt-6">
          <Link 
            to="/shop" 
            className="inline-flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-2xl py-4 text-sm font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            Continue Shopping <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}