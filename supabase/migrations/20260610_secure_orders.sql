ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders (via user_id or email)
CREATE POLICY "Users can view their own orders" 
ON public.orders FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  (auth.jwt() ->> 'email') = customer_email
);

-- Policy: Admin can do everything (assuming admin role is handled via a separate check or role)
-- In a real app, we'd check the user_roles table here.