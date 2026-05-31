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
    postalCode: z.string().optional(),
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
  .inputValidator(orderSchema)
  .handler(async ({ data }) => {
    const { customer, shippingMethod, paymentMethod, items } = data;

    // 1. Calculate totals, validate stock and fetch current prices
    let subtotal = 0;
    const orderItemsToInsert = [];
    const stockUpdates = [];

    for (const item of items) {
      // Fetch product with current stock
      const { data: product, error: pError } = await supabaseAdmin
        .from("products")
        .select("price, name, sku, stock_quantity")
        .eq("id", item.productId)
        .single();

      if (pError || !product) throw new Error(`Product ${item.productId} not found`);

      // Basic stock check (for products without variants)
      if (product.stock_quantity < item.qty) {
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock_quantity} left.`);
      }

      let unitPrice = product.price;

      // Fetch variant price difference if applicable
      if (item.variantId) {
        const { data: variant } = await supabaseAdmin
          .from("product_variants")
          .select("price_diff, stock_quantity")
          .eq("id", item.variantId)
          .single();
        
        if (variant) {
          unitPrice += variant.price_diff;
          // Variant stock check
          if (variant.stock_quantity < item.qty) {
            throw new Error(`Insufficient stock for ${product.name} variant. Only ${variant.stock_quantity} left.`);
          }
          stockUpdates.push({ id: variant.id, table: 'product_variants', qty: item.qty });
        }
      }

      if (!item.variantId) {
        stockUpdates.push({ id: product.id, table: 'products', qty: item.qty });
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
        postal_code: customer.postalCode || null,
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
      throw new Error(`Order created but items failed: ${itemsError.message}`);
    }

    // 4. Decrement Stock
    for (const update of stockUpdates) {
      const table = update.table === 'products' ? 'products' : 'product_variants';
      
      const { data: current } = await supabaseAdmin
        .from(table)
        .select("stock_quantity")
        .eq("id", update.id)
        .single();

      if (current) {
        await supabaseAdmin
          .from(table)
          .update({ stock_quantity: current.stock_quantity - update.qty })
          .eq("id", update.id);
      }
    }

    return {
      success: true,
      orderNumber: orderNumber,
      orderId: order.id,
    };
  });