import { supabase } from "@/integrations/supabase/client";

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  short_description: string | null;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  sku: string | null;
  brands: { name: string } | null;
  categories: { name: string } | null;
  product_images: { url: string; sort_order: number }[];
  product_variants: { stock_quantity: number }[];
  flash_sales: { sale_price: number; is_active: boolean; start_at: string; end_at: string }[];
};
export function catalogRows(products: CatalogProduct[], now = Date.now()) {
  return products.flatMap((p) => {
    const image = [...p.product_images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .find((i) => /^https?:\/\//.test(i.url))?.url;
    const sale = p.flash_sales.find(
      (s) => s.is_active && Date.parse(s.start_at) <= now && Date.parse(s.end_at) >= now,
    );
    const price = Number(sale?.sale_price ?? p.discount_price ?? p.price);
    if (!image || !Number.isFinite(price) || price <= 0) return [];
    const stock = p.product_variants.length
      ? p.product_variants.reduce((n, v) => n + v.stock_quantity, 0)
      : p.stock_quantity;
    return [
      {
        id: p.id,
        title: p.name,
        description: (p.description || p.short_description || p.name)
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
        link: "https://buyphone.lk/product/" + encodeURIComponent(p.slug),
        image_link: image,
        availability: stock > 0 ? "in stock" : "out of stock",
        condition: "new",
        price: price.toFixed(2) + " LKR",
        brand: p.brands?.name || "buyphone.lk",
        product_type: p.categories?.name || "Electronics",
        ...(p.sku ? { mpn: p.sku } : {}),
      },
    ];
  });
}
const escapeXml = (value: string) =>
  Array.from(value)
    .filter((c) => c.charCodeAt(0) >= 32 || "\t\n\r".includes(c))
    .join("")
    .replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!,
    );
export function renderCatalog(products: CatalogProduct[], format: "xml" | "csv"): string {
  const rows = catalogRows(products);
  if (format === "xml")
    return (
      '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>Buyphone.lk</title><link>https://buyphone.lk</link><description>Buyphone product catalog</description>' +
      rows
        .map(
          (row) =>
            "<item>" +
            Object.entries(row)
              .map(([k, v]) => "<g:" + k + ">" + escapeXml(v) + "</g:" + k + ">")
              .join("") +
            "</item>",
        )
        .join("") +
      "</channel></rss>"
    );
  const keys = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "availability",
    "condition",
    "price",
    "brand",
    "product_type",
    "mpn",
  ];
  return [
    keys.join(","),
    ...rows.map((row) =>
      keys
        .map((key) => '"' + String(row[key as keyof typeof row] ?? "").replaceAll('"', '""') + '"')
        .join(","),
    ),
  ].join("\r\n");
}
export async function catalogResponse(format: "xml" | "csv"): Promise<Response> {
  try {
    const products: CatalogProduct[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,slug,name,description,short_description,price,discount_price,stock_quantity,sku,brands(name),categories!products_category_id_fkey(name),product_images(url,sort_order),product_variants(stock_quantity),flash_sales(sale_price,is_active,start_at,end_at)",
        )
        .eq("status", "active")
        .order("id")
        .range(offset, offset + 499);
      if (error) throw error;
      products.push(...data);
      if (data.length < 500) break;
    }
    return new Response(renderCatalog(products, format), {
      headers: {
        "Content-Type":
          format === "xml" ? "application/xml; charset=utf-8" : "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=900",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Catalog temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
