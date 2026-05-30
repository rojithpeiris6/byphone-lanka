import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
export const Route = createFileRoute("/admin/reviews")({
  component: () => <PlaceholderPage title="Reviews" description="Moderate product reviews and customer ratings." />,
});
