import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
export const Route = createFileRoute("/admin/users")({
  component: () => <PlaceholderPage title="Users" description="Admin users, roles, and permissions." />,
});
