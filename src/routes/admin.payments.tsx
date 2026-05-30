import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
export const Route = createFileRoute("/admin/payments")({
  component: () => <PlaceholderPage title="Payments" description="Track transactions, payouts, and payment methods." />,
});
