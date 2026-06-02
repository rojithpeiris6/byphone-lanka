import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { supabase } from "@/integrations/supabase/client";

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
  paymentProvider: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    qty: z.number().int().positive(),
  })),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator(orderSchema)
  .handler(async ({ data }) => {
    const { customer, shippingMethod, paymentMethod, paymentProvider, items } = data;
    const now = new Date().toISOString();

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    let subtotal = 0;
    const orderItemsToInsert = [];
    const stockUpdates = [];

    for (const item of items) {
      const { data: product, error: pError } = await supabaseAdmin
        .from("products")
        .select("id, price, name, sku, stock_quantity, discount_price")
        .eq("id", item.productId)
        .single();

      if (pError || !product) throw new Error(`Product ${item.productId} not found`);

      if (product.stock_quantity < item.qty) {
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock_quantity} left.`);
      }

      const { data: flashSale } = await supabaseAdmin
        .from("flash_sales")
        .select("sale_price")
        .eq("product_id", item.productId)
        .eq("is_active", true)
        .lte("start_at", now)
        .gte("end_at", now)
        .maybeSingle();

      let unitPrice = flashSale?.sale_price || product.discount_price || product.price;

      if (item.variantId) {
        const { data: variant } = await supabaseAdmin
          .from("product_variants")
          .select("id, price_diff, stock_quantity")
          .eq("id", item.variantId)
          .single();

        if (variant) {
          unitPrice += variant.price_diff;
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

    let customerId: string | null = null;
    const { data: existingCustomer } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("email", customer.email)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      if (userId) {
        await supabaseAdmin
          .from("customers")
          .update({ 
            user_id: userId,
            full_name: customer.name,
            phone: customer.phone || null,
            address: customer.address || null,
            city: customer.city || null,
            district: customer.district || null,
          })
          .eq("id", customerId);
      }
    } else {
      const { data: newCust, error: newCustErr } = await supabaseAdmin
        .from("customers")
        .insert({
          user_id: userId,
          full_name: customer.name,
          email: customer.email,
          phone: customer.phone || null,
          address: customer.address || null,
          city: customer.city || null,
          district: customer.district || null,
          postal_code: customer.postalCode || null,
        })
        .select("id")
        .single();
      
      if (!newCustErr && newCust) {
        customerId = newCust.id;
      }
    }

    const { data: order, error: orderError } = await (supabaseAdmin as any)
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
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
        payment_provider: paymentProvider || null,
        payment_status: "pending",
        status: "pending",
      })
      .select()
      .single();

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

    const itemsWithOrderId = orderItemsToInsert.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await (supabaseAdmin as any)
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsError) {
      throw new Error(`Order created but items failed: ${itemsError.message}`);
    }

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