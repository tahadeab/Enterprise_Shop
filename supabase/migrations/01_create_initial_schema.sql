/*
# Enterprise E-Commerce Platform - Initial Schema

## 1. User Roles & Profiles
- `user_role` ENUM: buyer, seller, admin
- `profiles` table: Extended user information with role-based access

## 2. Categories
- `categories` table: Product categories with hierarchical structure

## 3. Products
- `products` table: Product catalog with seller association
- Includes inventory, pricing, images, and status

## 4. Orders
- `order_status` ENUM: pending, completed, cancelled, refunded
- `orders` table: Order records with payment information
- `order_items` table: Individual items in each order

## 5. Reviews
- `reviews` table: Product reviews and ratings by buyers

## 6. Addresses
- `addresses` table: Shipping addresses for buyers

## 7. Wishlists
- `wishlists` table: Saved products for buyers

## 8. Storage Bucket
- Product images bucket with public read access

## 9. Security
- RLS enabled on all tables
- Policies for role-based access (buyers, sellers, admins)
- First registered user becomes admin
- Admins have full access to all data
- Sellers can manage their own products
- Buyers can manage their own orders, reviews, addresses, wishlists
*/

-- User role enum
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');

-- Order status enum
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  phone text,
  role user_role DEFAULT 'buyer'::user_role NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price numeric(12,2) CHECK (compare_at_price >= 0),
  cost_per_item numeric(12,2) CHECK (cost_per_item >= 0),
  inventory_quantity integer DEFAULT 0 NOT NULL CHECK (inventory_quantity >= 0),
  sku text,
  barcode text,
  images text[] DEFAULT '{}',
  status text DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  featured boolean DEFAULT false,
  rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer DEFAULT 0 CHECK (review_count >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  items jsonb NOT NULL,
  total_amount numeric(12,2) NOT NULL CHECK (total_amount >= 0),
  currency text DEFAULT 'usd' NOT NULL,
  status order_status DEFAULT 'pending'::order_status NOT NULL,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  customer_email text,
  customer_name text,
  shipping_address jsonb,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  seller_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  subtotal numeric(12,2) NOT NULL CHECK (subtotal >= 0),
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  images text[] DEFAULT '{}',
  helpful_count integer DEFAULT 0 CHECK (helpful_count >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id, order_id)
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Indexes for performance
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_seller_id ON order_items(seller_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  IF OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    SELECT COUNT(*) INTO user_count FROM profiles;
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'buyer'::user_role END
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update product rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET 
    rating = (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE product_id = NEW.product_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id),
    updated_at = now()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

-- Trigger to update product rating after review
DROP TRIGGER IF EXISTS on_review_insert ON reviews;
CREATE TRIGGER on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL USING (is_admin(auth.uid()));

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (is_admin(auth.uid()));

-- Products policies
CREATE POLICY "Active products are viewable by everyone" ON products
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Sellers can insert own products" ON products
  FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can update own products" ON products
  FOR UPDATE USING (seller_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Sellers can delete own products" ON products
  FOR DELETE USING (seller_id = auth.uid() OR is_admin(auth.uid()));

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Service role can manage orders" ON orders
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    OR seller_id = auth.uid()
    OR is_admin(auth.uid())
  );

CREATE POLICY "Service role can manage order items" ON order_items
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- Addresses policies
CREATE POLICY "Users can view own addresses" ON addresses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own addresses" ON addresses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own addresses" ON addresses
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own addresses" ON addresses
  FOR DELETE USING (user_id = auth.uid());

-- Wishlists policies
CREATE POLICY "Users can view own wishlists" ON wishlists
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own wishlists" ON wishlists
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own wishlists" ON wishlists
  FOR DELETE USING (user_id = auth.uid());

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-7klbr3l9m1vl_product_images', 'app-7klbr3l9m1vl_product_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Product images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-7klbr3l9m1vl_product_images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'app-7klbr3l9m1vl_product_images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'app-7klbr3l9m1vl_product_images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'app-7klbr3l9m1vl_product_images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
