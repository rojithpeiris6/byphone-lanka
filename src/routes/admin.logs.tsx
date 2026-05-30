import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
export const Route = createFileRoute("/admin/logs")({
  component: () => <PlaceholderPage title="Logs" description="System activity, audit trail, and error logs." />,
});
