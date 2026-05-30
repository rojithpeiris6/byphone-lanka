import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
export const Route = createFileRoute("/admin/orders")({
  component: () => <PlaceholderPage title="Orders" description="Order list, details, tracking, invoice generation, and status updates." />,
});
