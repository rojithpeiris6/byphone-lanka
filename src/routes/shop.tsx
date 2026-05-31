import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";
import { z } from "zod";

const PAGE_SIZE = 12;

export const Route = createFileRoute("/shop")({
  validateSearch: z.object({
    page: z.number().catch(1),
    brand: z.string().optional(),
    sort: z.string().optional().catch("featured"),
  }),
  head: () => ({
    meta: [
      { title: "Shop Smartphones & Accessories — byphone.lk" },
      { name: "description", content: "Browse all smartphones, tablets, smartwatches, earbuds and accessories. Filter by brand, price and more." },
      { property: "og:title", content: "Shop — byphone.lk" },
      { property: "og:description", content: "Browse smartphones and accessories from top brands in Sri Lanka." },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { brand, page, sort } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [open, setOpen] = useState(false);

  // Fetch Products from DB with pagination and sorting
  const { data: dbData, isLoading: loadingProducts, error: fetchError } = useQuery({
    queryKey: ["shop-products", page, brand, sort],
    queryFn: async () => {
      // Map sort values to DB columns
      const sortMap: Record<string, { column: string; ascending: boolean }> = {
        "price-asc": { column: "price", ascending: true },
        "price-desc": { column: "price", ascending: false },
        "rating": { column: "created_at", ascending: false }, // fallback since rating isn't in DB schema
        "featured": { column: "created_at", ascending: false },
      };
      const activeSort = sortMap[sort || "featured"] || sortMap["featured"];

      let query = supabase
        .from("products")
        .select(`
          *,
          brands(name),
          categories!products_category_id_fkey(name),
          product_images(url)
        `, { count: 'exact' })
        .eq("status", "active")
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
        .order(activeSort.column, { ascending: activeSort.ascending });

      if (brand) {
        // Filter using the joined table name
        query = query.eq("brands.name", brand);
      }

      const { data, error, count } = await query;

      if (error) {
        toast.error("Database Error", { 
          description: error.message,
          duration: 5000 
        });
        throw error;
      }
      
      return {
        products: (data ?? []).map((p: any) => ({
          ...p,
          brand: p.brands?.name || "Unknown Brand",
          category: p.categories?.name || "General",
          image: p.product_images?.[0]?.url || "",
          oldPrice: p.discount_price ? p.price : undefined,
          price: p.discount_price || p.price,
        })),
        totalCount: count ?? 0,
      };
    },
  });

  // Fetch Brands from DB
  const { data: dbBrands, isLoading: loadingBrands } = useQuery({
    queryKey: ["shop-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("name")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data?.map((b) => b.name) ?? [];
    },
  });

  const products = dbData?.products ?? [];
  const totalCount = dbData?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleFilterChange = (newBrand: string | null) => {
    navigate({
      search: (prev) => ({ ...prev, brand: newBrand, page: 1 }),
    });
  };

  const handleSortChange = (newSort: string) => {
    navigate({
      search: (prev) => ({ ...prev, sort: newSort, page: 1 }),
    });
  };

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  };

  const Filters = (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold mb-3">Brand</h4>
        <div className="space-y-2">
          <button 
            onClick={() => handleFilterChange(null)} 
            className={"block w-full text-left text-sm py-1.5 px-3 rounded-lg " + (!brand ? "bg-primary-soft text-primary font-semibold" : "hover:bg-muted")}
          >
            All Brands
          </button>
          {dbBrands?.map((b) => (
            <button 
              key={b} 
              onClick={() => handleFilterChange(b)} 
              className={"block w-full text-left text-sm py-1.5 px-3 rounded-lg " + (brand === b ? "bg-primary-soft text-primary font-semibold" : "hover:bg-muted")}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-end justify-between gap-3 mb-5">
        <div>
          <p className="text-xs text-muted-foreground">Home / Shop</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">All Products</h1>
          <p className="text-sm text-muted-foreground">{totalCount} items</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOpen(true)} className="lg:hidden inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold">
            <SlidersHorizontal className="size-4" /> Filters
          </button>
          <select 
            value={sort} 
            onChange={(e) => handleSortChange(e.target.value)} 
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        <aside className="hidden lg:block">
          {loadingBrands ? <div className="text-sm text-muted-foreground">Loading filters...</div> : Filters}
        </aside>
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {loadingProducts ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
              ))
            ) : fetchError ? (
              <div className="col-span-full py-20 text-center">
                <p className="text-destructive font-semibold">Failed to load products.</p>
                <p className="text-sm text-muted-foreground mt-1">{fetchError.message}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <p className="text-muted-foreground">No products found in the database.</p>
                <p className="text-xs text-muted-foreground mt-2">Please add products via the Admin panel.</p>
              </div>
            ) : (
              products.map((p) => <ProductCard key={p.id} p={p} />)
            )}
          </div>

          {/* Pagination Controls */}
          {!loadingProducts && products.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-6">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="size-4" /> Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button 
                    key={pNum}
                    onClick={() => handlePageChange(pNum)}
                    className={`size-9 rounded-lg text-sm font-bold transition-colors ${page === pNum ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    {pNum}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85%] bg-background p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold">Filters</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-muted"><X className="size-5" /></button>
            </div>
            {loadingBrands ? <div className="text-sm text-muted-foreground">Loading filters...</div> : Filters}
          </div>
        </div>
      )}
    </div>
  );
}