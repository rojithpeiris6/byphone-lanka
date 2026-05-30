import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { products, brands as allBrands } from "@/lib/shop";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/shop")({
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
  const [brand, setBrand] = useState<string | null>(null);
  const [sort, setSort] = useState("featured");
  const [open, setOpen] = useState(false);
  const list = useMemo(() => {
    let l = [...products];
    if (brand) l = l.filter((p) => p.brand === brand);
    if (sort === "price-asc") l.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") l.sort((a, b) => b.price - a.price);
    if (sort === "rating") l.sort((a, b) => b.rating - a.rating);
    return l;
  }, [brand, sort]);

  const Filters = (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold mb-3">Brand</h4>
        <div className="space-y-2">
          <button onClick={() => setBrand(null)} className={"block w-full text-left text-sm py-1.5 px-3 rounded-lg " + (!brand ? "bg-primary-soft text-primary font-semibold" : "hover:bg-muted")}>All Brands</button>
          {allBrands.map((b) => (
            <button key={b} onClick={() => setBrand(b)} className={"block w-full text-left text-sm py-1.5 px-3 rounded-lg " + (brand === b ? "bg-primary-soft text-primary font-semibold" : "hover:bg-muted")}>{b}</button>
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
          <p className="text-sm text-muted-foreground">{list.length} items</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOpen(true)} className="lg:hidden inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold">
            <SlidersHorizontal className="size-4" /> Filters
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        <aside className="hidden lg:block">{Filters}</aside>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {list.map((p) => <ProductCard key={p.id} p={p} />)}
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
            {Filters}
          </div>
        </div>
      )}
    </div>
  );
}
