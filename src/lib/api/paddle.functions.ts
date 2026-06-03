import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
// We initialize paddle lazily inside handlers to avoid top-level process.env access
// which can cause issues during Vite bundling or client-side execution.
async function getPaddle() {
  const { Environment, Paddle } = await import("@paddle/paddle-node-sdk");
  const paddleApiKey = process.env.PADDLE_API_KEY || "";
  if (!paddleApiKey) {
    throw new Error("PADDLE_API_KEY is missing from .env! Please restart your dev server if you just added it.");
  }
  const isSandbox = process.env.VITE_PADDLE_ENVIRONMENT === "sandbox" || process.env.PADDLE_ENVIRONMENT === "sandbox";
  return new Paddle(paddleApiKey, {
    environment: isSandbox ? Environment.sandbox : Environment.production,
  });
}

export const createPaddleTransaction = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    orderId: z.string(),
  }))
  .handler(async ({ data }) => {
    const { orderId } = data;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message || orderId}`);
    }

    try {
      const paddle = await getPaddle();
      const transaction = await paddle.transactions.create({
        items: [
          {
            price: {
              name: `Order ${order.order_number}`,
              description: `Order ${order.order_number} for ${order.customer_name}`,
              unitPrice: {
                // Converting LKR to USD (approximate rate 1 USD = 300 LKR) for Paddle integration
                amount: Math.round((order.total / 300) * 100).toString(),
                currencyCode: "USD",
              },
              product: {
                name: "byPhoneLk Order",
                description: `Order ${order.order_number}`,
                taxCategory: "standard",
              }
            },
            quantity: 1,
          }
        ],
        customData: {
          orderId: order.id,
        },
      });

      return {
        transactionId: transaction.id,
      };
    } catch (e: any) {
      console.error("Paddle transaction error:", e);
      throw new Error(`Failed to create Paddle transaction: ${e.message}`);
    }
  });

export const verifyPaddlePayment = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    transactionId: z.string(),
    orderId: z.string(),
  }))
  .handler(async ({ data }) => {
    const { transactionId, orderId } = data;

    try {
      const paddle = await getPaddle();
      const transaction = await paddle.transactions.get(transactionId);

      // Paddle Billing status for completed payments is typically "completed" or "paid"
      if (transaction.status === "completed" || transaction.status === "paid") {
        await supabaseAdmin.from("payment_records").insert({
          order_id: orderId,
          transaction_id: transactionId,
          provider: "paddle",
          amount: parseFloat((parseInt(transaction.details?.totals?.grandTotal || "0") / 100).toString()),
          currency: transaction.currencyCode || "LKR",
          status: "completed",
        });

        await supabaseAdmin.from("orders").update({
          payment_status: "paid",
          status: "processing"
        }).eq("id", orderId);

        return { success: true };
      }

      return { success: false, status: transaction.status };
    } catch (e: any) {
      console.error("Paddle verification error:", e);
      throw new Error(`Failed to verify payment: ${e.message}`);
    }
  });
