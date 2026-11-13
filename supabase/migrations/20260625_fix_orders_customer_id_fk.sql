-- Fix orders_customer_id_fkey constraint
-- Originally created referencing auth.users(id), but application architecture references public.customers(id)

-- 1. Clean up any invalid IDs that don't exist in public.customers
UPDATE public.orders 
SET customer_id = NULL 
WHERE customer_id IS NOT NULL 
  AND customer_id NOT IN (SELECT id FROM public.customers);

-- 2. Drop the old constraint referencing auth.users(id)
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;

-- 3. Add the correct constraint referencing public.customers(id)
ALTER TABLE public.orders 
ADD CONSTRAINT orders_customer_id_fkey 
FOREIGN KEY (customer_id) 
REFERENCES public.customers(id) 
ON DELETE SET NULL;

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

