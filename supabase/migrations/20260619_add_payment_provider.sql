-- Add payment_provider column to track which gateway was used
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_provider TEXT;

-- Add a comment for clarity
COMMENT ON COLUMN public.orders.payment_provider IS 'The specific gateway used (e.g., paypal, payhere) for card payments.';