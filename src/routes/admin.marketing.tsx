import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
export const Route = createFileRoute("/admin/marketing")({
  component: () => <PlaceholderPage title="Marketing" description="Email campaigns, banners, and promotions." />,
});
