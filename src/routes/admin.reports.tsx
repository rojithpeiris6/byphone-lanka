import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
export const Route = createFileRoute("/admin/reports")({
  component: () => <PlaceholderPage title="Reports" description="Sales, inventory, and customer analytics reports." />,
});
