import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FolderTree, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — byphone.lk" },
      { name: "description", content: "Browse all product categories including smartphones, tablets, and accessories." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["all-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, image, slug")
        .eq("status", "active")
        .order("sort_order");
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
          <h1 className="text-3xl font-extrabold tracking-tight">Product Categories</h1>
          <p className="text-sm text-muted-foreground">Find exactly what you're looking for.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : categories?.length === 0 ? (
        <div className="py-20 text-center">
          <FolderTree className="size-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No categories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories?.map((cat) => (
            <Link 
              key={cat.id} 
              to="/shop" 
              search={{ category: cat.name }}
              className="group flex flex-col items-center gap-3"
            >
              <div className="size-32 sm:size-40 rounded-full bg-primary-soft overflow-hidden transition-transform group-hover:scale-105 border-2 border-transparent group-hover:border-primary shadow-sm">
                <img 
                  src={cat.image || ""} 
                  alt={cat.name} 
                  className="h-full w-full object-contain p-4" 
                />
              </div>
              <span className="text-sm font-bold text-center group-hover:text-primary transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}