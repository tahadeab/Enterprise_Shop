export type UserRole = 'buyer' | 'seller' | 'admin';

export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export type ProductStatus = 'draft' | 'active' | 'archived';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_per_item: number | null;
  inventory_quantity: number;
  sku: string | null;
  barcode: string | null;
  images: string[];
  status: ProductStatus;
  featured: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  status: OrderStatus;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  shipping_address: ShippingAddress | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id: string | null;
  seller_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  images: string[];
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ProductWithSeller extends Product {
  seller?: Profile;
  category?: Category;
}

export interface ReviewWithUser extends Review {
  user?: Profile;
}

export interface OrderWithDetails extends Order {
  order_items?: OrderItemRecord[];
}
