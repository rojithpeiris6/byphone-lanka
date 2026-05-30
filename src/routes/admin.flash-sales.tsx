import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
export const Route = createFileRoute("/admin/flash-sales")({
  component: () => <PlaceholderPage title="Flash Sales" description="Schedule time-limited promotional sales." />,
});
