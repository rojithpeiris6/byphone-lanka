import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyTrackingReceipt } from "@/lib/tracking/receipt.server";
import type { EcommerceData } from "@/lib/tracking/types";

/** A signed checkout receipt is required; an order number/URL alone is never authority. */
export const confirmedPurchase = createServerFn({ method: "POST" })
  .inputValidator(z.object({ receipt: z.string().max(2000) }))
  .handler(async ({ data }): Promise<EcommerceData | null> => {
    const orderId = verifyTrackingReceipt(data.receipt);
    if (!orderId) return null;
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "order_number,payment_method,payment_status,status,shipping_fee,total,order_items(product_id,price,quantity,products(name))",
      )
      .eq("id", orderId)
      .maybeSingle();
    if (error) throw new Error("Could not verify purchase tracking.");
    if (
      !order ||
      order.status === "cancelled" ||
      order.status === "refunded" ||
      !(order.payment_method === "cod" || order.payment_status === "paid")
    )
      return null;
    const items = order.order_items.map((item) => ({
      item_id: item.product_id,
      item_name: item.products?.name || "Product",
      price: Number(item.price),
      quantity: item.quantity,
    }));
    const value =
      Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
    // Never send an inconsistent purchase total to advertising/analytics.
    if (!items.length || Math.abs(value + Number(order.shipping_fee) - Number(order.total)) > 0.02)
      return null;
    return {
      transaction_id: order.order_number,
      currency: "LKR",
      value,
      shipping: Number(order.shipping_fee),
      items,
    };
  });
