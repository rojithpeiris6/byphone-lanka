import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

export const getReportSummary = createServerFn({ method: "POST" })
  .handler(async () => {
    const [ordersRes, customersRes] = await Promise.all([
      supabaseAdmin.from("orders").select("total"),
      supabaseAdmin.from("customers").select("id"),
    ]);

    if (ordersRes.error) throw ordersRes.error;
    if (customersRes.error) throw customersRes.error;

    const orders = ordersRes.data || [];
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const totalCustomers = customersRes.data?.length || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      avgOrderValue,
    };
  });

export const getRevenueTrend = createServerFn({ method: "POST" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("total, created_at")
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Aggregate by date (YYYY-MM-DD)
    const trendMap: Record<string, number> = {};
    data.forEach((o) => {
      const date = o.created_at.split("T")[0];
      trendMap[date] = (trendMap[date] || 0) + o.total;
    });

    return Object.entries(trendMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  });

export const getCategorySales = createServerFn({ method: "POST" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("order_items")
      .select(`
        quantity,
        products (
          categories (name)
        )
      `);

    if (error) throw error;

    const categoryMap: Record<string, number> = {};
    data.forEach((item: any) => {
      const catName = item.products?.categories?.name || "Uncategorized";
      categoryMap[catName] = (categoryMap[catName] || 0) + item.quantity;
    });

    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  });

export const getTopProducts = createServerFn({ method: "POST" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("order_items")
      .select(`
        quantity,
        products (name)
      `);

    if (error) throw error;

    const productMap: Record<string, number> = {};
    data.forEach((item: any) => {
      const name = item.products?.name || "Unknown Product";
      productMap[name] = (productMap[name] || 0) + item.quantity;
    });

    return Object.entries(productMap)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
  });

export const getInventoryStats = createServerFn({ method: "POST" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("stock_quantity, stock_alert_quantity");

    if (error) throw error;

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    data.forEach((p) => {
      if (p.stock_quantity <= 0) {
        outOfStock++;
      } else if (p.stock_quantity <= p.stock_alert_quantity) {
        lowStock++;
      } else {
        inStock++;
      }
    });

    return { inStock, lowStock, outOfStock };
  });