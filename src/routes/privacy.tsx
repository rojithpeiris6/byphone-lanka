import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Shield } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — byphone.lk" },
      { name: "description", content: "Learn how byphone.lk collects, uses, and protects your personal information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
          <ChevronLeft className="size-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 space-y-8 leading-relaxed text-muted-foreground">
        <div className="flex items-center gap-3 text-foreground font-bold text-xl mb-4">
          <Shield className="size-6 text-primary" />
          <h2>Your Privacy Matters</h2>
        </div>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">1. Information We Collect</h3>
          <p>We collect information you provide directly to us when you create an account, place an order, or contact our support team. This may include your name, email address, phone number, shipping address, and payment details.</p>
          <p>We also automatically collect certain information when you visit byphone.lk, such as your IP address, browser type, and how you interact with our website through cookies and similar technologies.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">2. How We Use Your Information</h3>
          <p>We use the collected information to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Process and fulfill your orders, including shipping and payment.</li>
            <li>Improve our website, products, and customer service.</li>
            <li>Communicate with you regarding your orders or promotional offers (if opted-in).</li>
            <li>Prevent fraudulent transactions and ensure the security of our platform.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">3. Information Sharing</h3>
          <p>We do not sell your personal information. We share data only with trusted third parties necessary to run our business, such as:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Payment processors (to securely handle transactions).</li>
            <li>Shipping carriers (to deliver your products).</li>
            <li>Legal authorities (if required by law or to protect our rights).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">4. Your Rights</h3>
          <p>Depending on your location, you may have the right to access, correct, or delete the personal information we hold about you. To exercise these rights, please contact us at support@byphone.lk.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">5. Changes to This Policy</h3>
          <p>We may update our Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date.</p>
        </section>
      </div>
    </div>
  );
}