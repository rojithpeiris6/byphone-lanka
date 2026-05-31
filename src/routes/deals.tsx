import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Tag, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Hot Deals & Offers — byphone.lk" },
      { name: "description", content: "Grab the best deals on latest smartphones and accessories. Limited time offers on top brands." },
    ],
  }),
  component: DealsPage,
});

function DealsPage() {
  const { data: deals, isLoading } = useQuery({
    queryKey: ["shop-deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          brands(name),
          categories!products_category_id_fkey(name),
          product_images(url)
        `)
        .neq("discount_price", 0) // Filter for products that have a discount price
        .not("discount_price", "is", null)
        .eq("status", "active")
        .order("discount_price", { ascending: true });
      
      if (error) throw error;

      return (data ?? []).map((p: any) => ({
        ...p,
        brand: p.brands?.name || "Unknown Brand",
        category: p.categories?.name || "General",
        image: p.product_images?.[0]?.url || "",
        oldPrice: p.price,
        price: p.discount_price,
      }));
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <Tag className="size-3" /> Limited Time Offers
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">Hot Deals</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Unbeatable prices on the latest tech. Grab your favorites before they're gone!
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : deals?.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingBag className="size-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold">No deals available right now</h3>
          <p className="text-muted-foreground mt-2">Check back soon for new offers!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {deals?.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}