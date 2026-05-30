import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
export const Route = createFileRoute("/admin/notifications")({
  component: () => <PlaceholderPage title="Notifications" description="Push, email, and SMS notification settings and history." />,
});
