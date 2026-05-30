import { Construction } from "lucide-react";

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      <div className="mt-6 bg-card border border-border rounded-2xl p-10 text-center">
        <div className="mx-auto size-14 rounded-2xl bg-primary/10 text-primary grid place-items-center">
          <Construction className="size-6" />
        </div>
        <h3 className="mt-4 font-semibold">Module coming soon</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          This module is part of the admin spec. The layout, navigation and routing are wired — let me know which section to build out next and I'll add full functionality.
        </p>
      </div>
    </div>
  );
}
