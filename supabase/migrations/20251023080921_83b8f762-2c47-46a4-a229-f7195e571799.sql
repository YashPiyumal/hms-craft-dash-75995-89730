-- Create products table with proper RLS
CREATE TABLE IF NOT EXISTS public.products (
  sku TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  cost NUMERIC(10,2) NOT NULL CHECK (cost >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sales_count INTEGER NOT NULL DEFAULT 0 CHECK (sales_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS policies for products - users can only access their own products
CREATE POLICY "Users can view own products" 
  ON public.products FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" 
  ON public.products FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" 
  ON public.products FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" 
  ON public.products FOR DELETE 
  USING (auth.uid() = user_id);

-- Add index for better query performance
CREATE INDEX idx_products_user_id ON public.products(user_id);

-- Update sales_transactions to enforce user_id
ALTER TABLE public.sales_transactions 
  ALTER COLUMN user_id SET NOT NULL;

-- Update RLS policies for sales_transactions to be user-specific
DROP POLICY IF EXISTS "Authenticated users can view all transactions" ON public.sales_transactions;
DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON public.sales_transactions;

CREATE POLICY "Users can view own transactions" 
  ON public.sales_transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
  ON public.sales_transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add index for better query performance
CREATE INDEX idx_sales_transactions_user_id ON public.sales_transactions(user_id);

-- Fix handle_updated_at function to set search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add trigger for products updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();