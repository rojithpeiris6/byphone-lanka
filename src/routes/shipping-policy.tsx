import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Truck } from "lucide-react";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — byphone.lk" },
      { name: "description", content: "Details about our islandwide delivery options and timelines." },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
          <ChevronLeft className="size-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Shipping Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 space-y-8 leading-relaxed text-muted-foreground">
        <div className="flex items-center gap-3 text-foreground font-bold text-xl mb-4">
          <Truck className="size-6 text-primary" />
          <h2>Delivery Information</h2>
        </div>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">1. Delivery Coverage</h3>
          <p>We provide islandwide delivery across all districts of Sri Lanka. Whether you are in Colombo, Kandy, or Jaffna, we've got you covered.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">2. Shipping Options</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-border bg-muted/30">
              <p className="font-bold text-foreground">Standard Delivery</p>
              <p className="text-sm">Free for all orders. Delivered within 2-3 working days.</p>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-muted/30">
              <p className="font-bold text-foreground">Express Delivery</p>
              <p className="text-sm">Priority shipping. Delivered within 1 working day (additional fee applies).</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">3. Order Processing</h3>
          <p>Orders are processed from Monday to Saturday. Orders placed on Sundays or public holidays will be processed on the next working day.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">4. Tracking Your Order</h3>
          <p>Once your order is dispatched, we will send you a confirmation email/SMS with the tracking details provided by our courier partner.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">5. Delivery Issues</h3>
          <p>If your order is delayed or arrives damaged, please contact us immediately at support@byphone.lk with your order number and photos of the damaged item.</p>
        </section>
      </div>
    </div>
  );
}