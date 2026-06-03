import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";
import { z } from "zod";
import { ShopFilters } from "@/components/shop/ShopFilters";

const PAGE_SIZE = 12;

export const Route = createFileRoute("/shop")({
  validateSearch: z.object({
    page: z.number().catch(1),
    brand: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    sort: z.string().optional().catch("featured"),
  }),
  head: () => ({
    meta: [
      { title: "Shop Smartphones & Accessories | buyphone.lk" },
      { name: "description", content: "Browse all smartphones, tablets, smartwatches, earbuds and accessories. Filter by brand, price and more." },
      { property: "og:title", content: "Shop | buyphone.lk" },
      { property: "og:description", content: "Browse smartphones and accessories from top brands in Sri Lanka." },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { brand, category, minPrice, maxPrice, page, sort } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [open, setOpen] = useState(false);
  const now = new Date().toISOString();

  // Fetch active flash sale IDs first to exclude them
  const { data: activeFlashSaleIds } = useQuery({
    queryKey: ["shop-active-flash-sale-ids"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("flash_sales")
        .select("product_id")
        .eq("is_active", true)
        .lte("start_at", now)
        .gte("end_at", now);
      if (error) throw error;
      return data?.map((s: any) => s.product_id) ?? [];
    }
  });

  // Fetch Products from DB with pagination, sorting and advanced filters
  const { data: dbData, isLoading: loadingProducts, error: fetchError } = useQuery({
    queryKey: ["shop-products", page, brand, category, minPrice, maxPrice, sort, activeFlashSaleIds],
    queryFn: async () => {
      const sortMap: Record<string, { column: string; ascending: boolean }> = {
        "price-asc": { column: "price", ascending: true },
        "price-desc": { column: "price", ascending: false },
        "rating": { column: "created_at", ascending: false },
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
        .eq("status", "active");

      // EXCLUDE active flash sale items
      if (activeFlashSaleIds && activeFlashSaleIds.length > 0) {
        query = query.not("id", "in", `(${activeFlashSaleIds.join(',')})`);
      }

      query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
        .order(activeSort.column, { ascending: activeSort.ascending });

      if (brand) {
        query = query.eq("brands.name", brand);
      }
      if (category) {
        query = query.eq("categories.name", category);
      }
      if (minPrice !== undefined) {
        query = query.gte("price", minPrice);
      }
      if (maxPrice !== undefined) {
        query = query.lte("price", maxPrice);
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

  // Fetch Categories from DB including id and parent_id
  const { data: dbCategories, isLoading: loadingCategories } = useQuery({
    queryKey: ["shop-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id")
        .eq("status", "active")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const products = dbData?.products ?? [];
  const totalCount = dbData?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleFilterChange = (filters: { brand?: string; category?: string; minPrice?: number; maxPrice?: number }) => {
    navigate({
      search: (prev: any) => ({ 
        ...prev, 
        ...filters,
        page: 1 
      }),
    });
  };

  const handleSortChange = (newSort: string) => {
    navigate({
      search: (prev: any) => ({ ...prev, sort: newSort, page: 1 }),
    });
  };

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev: any) => ({ ...prev, page: newPage }),
    });
  };

  const FiltersUI = (
    <ShopFilters 
      brands={dbBrands ?? []} 
      categories={dbCategories ?? []} 
      activeBrand={brand} 
      activeCategory={category}
      minPrice={minPrice}
      maxPrice={maxPrice}
      onFilterChange={handleFilterChange}
    />
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
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

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="hidden lg:block">
          {(loadingBrands || loadingCategories) ? (
            <div className="text-sm text-muted-foreground">Loading filters...</div>
          ) : FiltersUI}
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
                <p className="text-muted-foreground">No products found matching your filters.</p>
                <button 
                  onClick={() => handleFilterChange({ brand: undefined, category: undefined, minPrice: undefined, maxPrice: undefined })}
                  className="mt-4 text-primary font-bold text-sm hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              products.map((p) => <ProductCard key={p.id} p={p} />)
            )}
          </div>

          {/* Pagination Controls */}
          {!loadingProducts && products.length > 0 && totalPages > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-center gap-4 py-6">
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
            </nav>
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
            {(loadingBrands || loadingCategories) ? (
              <div className="text-sm text-muted-foreground">Loading filters...</div>
            ) : FiltersUI}
          </div>
        </div>
      )}

      {/* JSON-LD ItemList Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": products.map((p, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://buyphone.lk/product/${p.slug}`
          }))
        })
      }} />
    </main>
  );
}