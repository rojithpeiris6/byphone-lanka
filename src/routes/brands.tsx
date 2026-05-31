import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tags, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Our Brands — byphone.lk" },
      { name: "description", content: "Explore all the premium brands we carry, from Apple and Samsung to Xiaomi and OnePlus." },
    ],
  }),
  component: BrandsPage,
});

function BrandsPage() {
  const { data: brands, isLoading } = useQuery({
    queryKey: ["all-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, logo, slug")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/shop" className="p-2 rounded-full hover:bg-muted transition-colors">
          <ChevronLeft className="size-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Our Brands</h1>
          <p className="text-sm text-muted-foreground">Explore the world's leading technology brands.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : brands?.length === 0 ? (
        <div className="py-20 text-center">
          <Tags className="size-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No brands found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands?.map((brand) => (
            <Link 
              key={brand.id} 
              to="/shop" 
              search={{ brand: brand.name }}
              className="group relative aspect-square rounded-2xl border border-border bg-card p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-lg hover:border-primary hover:-translate-y-1"
            >
              <div className="size-20 rounded-full bg-muted overflow-hidden mb-4 grid place-items-center p-2">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="size-full object-contain" />
                ) : (
                  <Tags className="size-8 text-muted-foreground" />
                )}
              </div>
              <span className="font-bold text-sm group-hover:text-primary transition-colors">{brand.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}