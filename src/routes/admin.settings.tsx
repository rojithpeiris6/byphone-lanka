import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
export const Route = createFileRoute("/admin/settings")({
  component: () => <PlaceholderPage title="Settings" description="Store settings, branding, tax, currency, and integrations." />,
});
