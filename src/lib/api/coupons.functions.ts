import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const validateCoupon = createServerFn({ method: "POST" })
  .inputValidator(z.object({ 
    code: z.string(),
    orderAmount: z.number() 
  }))
  .handler(async ({ data }) => {
    const { code, orderAmount } = data;
    const normalizedCode = code.toUpperCase().trim();

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", normalizedCode)
      .eq("status", "active")
      .single();

    if (error || !coupon) throw new Error("Invalid or expired coupon code.");

    // Check min order amount
    if (orderAmount < coupon.min_order_amount) {
      throw new Error(`Minimum order amount for this coupon is Rs. ${coupon.min_order_amount.toLocaleString()}.`);
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      throw new Error("This coupon has reached its usage limit.");
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = (orderAmount * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, coupon.max_discount_amount);
      }
    } else {
      discount = coupon.discount_value;
    }

    return {
      discount,
      couponCode: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
    };
  });