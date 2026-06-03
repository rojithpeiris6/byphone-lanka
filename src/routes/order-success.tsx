import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Truck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { verifyPaddlePayment } from "@/lib/api/paddle.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/order-success")({
  validateSearch: z.object({
    orderNumber: z.string().optional(),
    _ptxn: z.string().optional(),
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { orderNumber, _ptxn } = Route.useSearch();
  const [verifying, setVerifying] = useState(!!_ptxn);
  const router = useRouter();

  useEffect(() => {
    async function verifyPayment() {
      if (!_ptxn || !orderNumber) return;
      
      try {
        // Find the internal order ID from the order number
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .eq("order_number", orderNumber)
          .single();
          
        if (order) {
          // Call the server function to verify and save the payment record
          await verifyPaddlePayment({
            data: {
              transactionId: _ptxn,
              orderId: order.id,
            }
          });
        }
      } catch (err) {
        console.error("Failed to verify paddle payment:", err);
      } finally {
        setVerifying(false);
        // Clean up the URL so _ptxn doesn't stay visible
        router.navigate({ to: "/order-success", search: { orderNumber }, replace: true });
      }
    }

    if (_ptxn) {
      verifyPayment();
    }
  }, [_ptxn, orderNumber, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto size-20 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center animate-bounce">
          <CheckCircle2 className="size-12" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {verifying ? "Verifying Payment..." : "Thank you for your order!"}
          </h1>
          <p className="text-muted-foreground">
            {verifying 
              ? "Please wait a moment while we confirm your payment details." 
              : "Your order has been placed successfully. We've sent a confirmation email to your inbox."}
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