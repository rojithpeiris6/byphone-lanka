import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund Policy — byphone.lk" },
      { name: "description", content: "Information about returns, refunds, and exchanges at byphone.lk." },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
          <ChevronLeft className="size-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Refund Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 space-y-8 leading-relaxed text-muted-foreground">
        <div className="flex items-center gap-3 text-foreground font-bold text-xl mb-4">
          <RotateCcw className="size-6 text-primary" />
          <h2>Returns & Refunds</h2>
        </div>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">1. Return Window</h3>
          <p>We offer a 7-day return policy for most products. If you are not satisfied with your purchase, you may request a return within 7 days of delivery.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">2. Eligibility for Returns</h3>
          <p>To be eligible for a return, the item must be:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Unused and in the same condition that you received it.</li>
            <li>In the original packaging with all accessories and manuals.</li>
            <li>Accompanied by the original receipt or proof of purchase.</li>
          </ul>
          <p className="text-rose-600 font-medium">Note: Products with broken seals, signs of use, or physical damage are not eligible for return.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">3. Refund Process</h3>
          <p>Once we receive and inspect your item, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed to your original method of payment within 7-14 business days.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">4. Exchanges</h3>
          <p>We only replace items if they are defective or damaged upon arrival. If you need to exchange it for the same item, please contact our support team.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">5. Shipping Costs</h3>
          <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.</p>
        </section>
      </div>
    </div>
  );
}