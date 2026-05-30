import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
export const Route = createFileRoute("/admin/customers")({
  component: () => <PlaceholderPage title="Customers" description="Customer profiles, order history, wishlist, reviews, addresses, reward points, and notes." />,
});
