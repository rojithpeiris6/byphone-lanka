import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const searchProducts = createServerFn({ method: "POST" })
  .inputValidator(z.object({ query: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { query } = data;
    
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        *,
        brands(name),
        categories!products_category_id_fkey(name),
        product_images(url)
      `)
      .eq("status", "active")
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%,short_description.ilike.%${query}%`);

    if (error) throw error;

    return (products ?? []).map((p: any) => ({
      ...p,
      brand: p.brands?.name || "Unknown Brand",
      category: p.categories?.name || "General",
      image: p.product_images?.[0]?.url || "",
      oldPrice: p.discount_price ? p.price : undefined,
      price: p.discount_price || p.price,
    }));
  });