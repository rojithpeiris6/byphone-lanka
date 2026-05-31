import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(5, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    district: z.string().min(1, "District is required"),
    postalCode: z.string().min(1, "Postal code is required"),
  }),
  shippingMethod: z.enum(["std", "exp"]),
  paymentMethod: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    qty: z.number().int().positive(),
  })),
});

export const placeOrder = createServerFn({ method: "POST" })
  .validator(orderSchema)
  .handler(async ({ data }) => {
    const { customer, shippingMethod, paymentMethod, items } = data;

    // 1. Calculate totals and fetch current prices to prevent client-side tampering
    let subtotal = 0;
    const orderItemsToInsert = [];

    for (const item of items) {
      // Fetch product base price
      const { data: product } = await supabaseAdmin
        .from("products")
        .select("price, name, sku")
        .eq("id", item.productId)
        .single();

      if (!product) throw new Error(`Product ${item.productId} not found`);

      let unitPrice = product.price;

      // Fetch variant price difference if applicable
      if (item.variantId) {
        const { data: variant } = await supabaseAdmin
          .from("product_variants")
          .select("price_diff")
          .eq("id", item.variantId)
          .single();
        
        if (variant) {
          unitPrice += variant.price_diff;
        }
      }

      const itemTotal = unitPrice * item.qty;
      subtotal += itemTotal;

      orderItemsToInsert.push({
        product_id: item.productId,
        product_name: product.name,
        sku: product.sku,
        quantity: item.qty,
        price: unitPrice,
        total: itemTotal,
      });
    }

    const shippingFee = shippingMethod === "exp" ? 490 : 0;
    const total = subtotal + shippingFee;
    const orderNumber = `BP-${Math.floor(10000 + Math.random() * 90000)}-${Date.now().toString().slice(-4)}`;

    // 2. Create the Order record
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: customer.address,
        city: customer.city,
        district: customer.district,
        postal_code: customer.postalCode,
        subtotal,
        shipping_fee: shippingFee,
        total,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "cod" ? "pending" : "paid",
        status: "pending",
      })
      .select()
      .single();

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

    // 3. Create the Order Items records
    const itemsWithOrderId = orderItemsToInsert.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsError) {
      // In a real app, we'd roll this back in a transaction
      throw new Error(`Order created but items failed: ${itemsError.message}`);
    }

    return {
      success: true,
      orderNumber: orderNumber,
      orderId: order.id,
    };
  });