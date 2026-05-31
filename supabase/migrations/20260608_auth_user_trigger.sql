-- This function will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.customers
  -- We extract full_name and phone from the raw_user_meta_data provided during signUp
  INSERT INTO public.customers (
    user_id, 
    full_name, 
    email, 
    phone, 
    order_count, 
    total_spent
  )
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Customer'), 
    new.email, 
    new.raw_user_meta_data->>'phone', 
    0, 
    0
  );

  -- Insert into public.user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'customer');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();