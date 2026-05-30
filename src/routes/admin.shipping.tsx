import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
export const Route = createFileRoute("/admin/shipping")({
  component: () => <PlaceholderPage title="Shipping" description="Shipping zones, rates, and carriers." />,
});
