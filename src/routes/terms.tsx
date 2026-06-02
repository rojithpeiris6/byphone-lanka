import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, FileText } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | buyphone.lk" },
      { name: "description", content: "Read the terms and conditions for using the buyphone.lk store." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
          <ChevronLeft className="size-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 space-y-8 leading-relaxed text-muted-foreground">
        <div className="flex items-center gap-3 text-foreground font-bold text-xl mb-4">
          <FileText className="size-6 text-primary" />
          <h2>User Agreement</h2>
        </div>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h3>
          <p>By accessing and using buyphone.lk, you agree to be bound by these Terms of Service and all applicable laws and regulations in Sri Lanka.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">2. Account Responsibility</h3>
          <p>If you create an account on our site, you are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">3. Product Pricing & Availability</h3>
          <p>We strive to ensure that our pricing is accurate. However, errors may occur. In the event of a pricing error, we reserve the right to cancel any orders placed at the incorrect price.</p>
          <p>All products are subject to availability. We will notify you if an item you ordered becomes unavailable.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">4. Prohibited Uses</h3>
          <p>You agree not to use the website for any unlawful purpose or any purpose prohibited under this agreement. You must not attempt to hack, disrupt, or interfere with the proper working of the website.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">5. Limitation of Liability</h3>
          <p>buyphone.lk shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our products or services.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">6. Governing Law</h3>
          <p>These terms are governed by and construed in accordance with the laws of Sri Lanka.</p>
        </section>
      </div>
    </div>
  );
}