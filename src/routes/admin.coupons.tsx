import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
export const Route = createFileRoute("/admin/coupons")({
  component: () => <PlaceholderPage title="Coupons" description="Create and manage discount coupons and promo codes." />,
});
