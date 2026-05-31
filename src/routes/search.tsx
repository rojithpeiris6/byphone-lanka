import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Search, ShoppingBag } from "lucide-react";
import { searchProducts } from "@/lib/api/products.functions";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({
    q: z.string().min(1),
  }),
  head: ({ search }) => ({
    meta: [
      { title: `Search results for "${search.q}" — byphone.lk` },
      { name: "description", content: `Browse results for ${search.q} at byphone.lk` },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();

  const { data: products, isLoading } = useQuery({
    queryKey: ["search-products", q],
    queryFn: async () => {
      const result = await searchProducts({ data: { query: q } });
      return result;
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Search Results</h1>
        <p className="text-muted-foreground mt-2">Showing results for <span className="font-bold text-foreground">"{q}"</span></p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="py-20 text-center">
          <div className="size-20 rounded-full bg-muted grid place-items-center mx-auto mb-4">
            <ShoppingBag className="size-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-bold">No products found</h3>
          <p className="text-muted-foreground mt-2">Try using different keywords or check our categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {products?.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}