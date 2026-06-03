import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header, BottomNav, Footer } from "@/components/layout";
import { CartDrawer } from "@/components/CartDrawer";
import { Toaster } from "@/components/ui/sonner";
import { AdminAuthProvider } from "@/lib/admin-auth";
import { CustomerAuthProvider } from "@/lib/auth";
import { AuthModal } from "@/components/AuthModal";
import { useAuthModalStore } from "@/lib/auth-modal-store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Try again</button>
          <a href="/" className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "buyphone.lk | Top Smartphone Deals & Tech in Sri Lanka" },
      { name: "description", content: "Buy 100% genuine smartphones, tablets, smartwatches, and tech accessories at buyphone.lk. Enjoy islandwide free delivery, official warranty, and easy returns in Sri Lanka." },
      { name: "keywords", content: "buy phones sri lanka, smartphones sri lanka, mobile phones online, apple iphone sri lanka, samsung galaxy sri lanka, tech accessories colombo, buyphone.lk" },
      { name: "author", content: "buyphone.lk" },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#2563EB" },
      { property: "og:site_name", content: "buyphone.lk" },
      { property: "og:locale", content: "en_LK" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "buyphone.lk | Top Smartphone Deals & Tech in Sri Lanka" },
      { property: "og:description", content: "Buy 100% genuine smartphones, tablets, smartwatches, and tech accessories at buyphone.lk. Enjoy islandwide free delivery and official warranty." },
      { property: "og:url", content: "https://buyphone.lk" },
      { property: "og:image:alt", content: "buyphone.lk Online Store" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "buyphone.lk | Top Smartphone Deals & Tech in Sri Lanka" },
      { name: "twitter:description", content: "Buy 100% genuine smartphones, tablets, and tech accessories with islandwide free delivery in Sri Lanka." },

    ],
    links: [
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WXCMVZ4M');` }} />
        <HeadContent />
      </head>
      <body>
        <noscript dangerouslySetInnerHTML={{ __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WXCMVZ4M" height="0" width="0" style="display:none;visibility:hidden"></iframe>` }} />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = path.startsWith("/admin");

  const authModalOpen = useAuthModalStore((s) => s.isOpen);
  const authModalClose = useAuthModalStore((s) => s.close);

  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <CustomerAuthProvider>
          {isAdmin ? (
            <>
              <Outlet />
              <Toaster position="top-center" richColors />
            </>
          ) : (
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 pb-20 lg:pb-0">
                <Outlet />
              </main>
              <Footer />
              <BottomNav />
              <CartDrawer />
              <AuthModal open={authModalOpen} onOpenChange={(open) => !open && authModalClose()} />
              <Toaster position="top-center" richColors />
            </div>
          )}
        </CustomerAuthProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}