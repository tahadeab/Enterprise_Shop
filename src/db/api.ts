import { supabase } from "./supabase";
import type {
  Profile,
  Category,
  Product,
  Order,
  Review,
  Address,
  Wishlist,
  ProductWithSeller,
  ReviewWithUser,
  OrderWithDetails,
  ShippingAddress,
  OrderItem,
} from "@/types/types";

export const profilesApi = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("Profile not found");
    return data;
  },

  async getAllProfiles(page = 1, limit = 20): Promise<Profile[]> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async updateUserRole(userId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);
    
    if (error) throw error;
  },
};

export const categoriesApi = {
  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getCategory(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async createCategory(category: Omit<Category, "id" | "created_at" | "updated_at">): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .insert(category)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("Failed to create category");
    return data;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("Category not found");
    return data;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  },
};

export const productsApi = {
  async getAllProducts(page = 1, limit = 20, filters?: {
    category_id?: string;
    seller_id?: string;
    status?: string;
    featured?: boolean;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
  }): Promise<ProductWithSeller[]> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("products")
      .select("*, seller:profiles!seller_id(*), category:categories(*)")
      .eq("status", "active");

    if (filters?.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    if (filters?.seller_id) {
      query = query.eq("seller_id", filters.seller_id);
    }

    if (filters?.featured !== undefined) {
      query = query.eq("featured", filters.featured);
    }

    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    if (filters?.min_price !== undefined) {
      query = query.gte("price", filters.min_price);
    }

    if (filters?.max_price !== undefined) {
      query = query.lte("price", filters.max_price);
    }

    const sortBy = filters?.sort_by || "created_at";
    const ascending = sortBy === "price" || sortBy === "name";
    query = query.order(sortBy, { ascending }).range(from, to);

    const { data, error } = await query;
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getProduct(id: string): Promise<ProductWithSeller | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*, seller:profiles!seller_id(*), category:categories(*)")
      .eq("id", id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getProductBySlug(slug: string): Promise<ProductWithSeller | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*, seller:profiles!seller_id(*), category:categories(*)")
      .eq("slug", slug)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async createProduct(product: Omit<Product, "id" | "created_at" | "updated_at" | "rating" | "review_count">): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("Failed to create product");
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("Product not found");
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  },

  async getSellerProducts(sellerId: string, page = 1, limit = 20): Promise<Product[]> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },
};

export const ordersApi = {
  async getUserOrders(userId: string, page = 1, limit = 20): Promise<Order[]> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getOrder(id: string): Promise<OrderWithDetails | null> {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getOrderBySessionId(sessionId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getAllOrders(page = 1, limit = 20, filters?: {
    status?: string;
    seller_id?: string;
  }): Promise<OrderWithDetails[]> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("orders")
      .select("*, order_items(*)");

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, error } = await query;
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getSellerOrders(sellerId: string, page = 1, limit = 20): Promise<OrderWithDetails[]> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from("order_items")
      .select("*, order:orders(*)")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },
};

export const reviewsApi = {
  async getProductReviews(productId: string, page = 1, limit = 20): Promise<ReviewWithUser[]> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from("reviews")
      .select("*, user:profiles!user_id(*)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getUserReviews(userId: string, page = 1, limit = 20): Promise<ReviewWithUser[]> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from("reviews")
      .select("*, user:profiles!user_id(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async createReview(review: Omit<Review, "id" | "created_at" | "updated_at" | "helpful_count">): Promise<Review> {
    const { data, error } = await supabase
      .from("reviews")
      .insert(review)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("Failed to create review");
    return data;
  },

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const { data, error } = await supabase
      .from("reviews")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("Review not found");
    return data;
  },

  async deleteReview(id: string): Promise<void> {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  },
};

export const addressesApi = {
  async getUserAddresses(userId: string): Promise<Address[]> {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getAddress(id: string): Promise<Address | null> {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async createAddress(address: Omit<Address, "id" | "created_at" | "updated_at">): Promise<Address> {
    if (address.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", address.user_id);
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert(address)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("Failed to create address");
    return data;
  },

  async updateAddress(id: string, updates: Partial<Address>): Promise<Address> {
    if (updates.is_default) {
      const address = await this.getAddress(id);
      if (address) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", address.user_id);
      }
    }

    const { data, error } = await supabase
      .from("addresses")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("Address not found");
    return data;
  },

  async deleteAddress(id: string): Promise<void> {
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  },
};

export const wishlistsApi = {
  async getUserWishlist(userId: string): Promise<Wishlist[]> {
    const { data, error } = await supabase
      .from("wishlists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    const { data, error } = await supabase
      .from("wishlists")
      .insert({ user_id: userId, product_id: productId })
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("Failed to add to wishlist");
    return data;
  },

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);
    
    if (error) throw error;
  },

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  },
};

export const paymentApi = {
  async createCheckoutSession(items: OrderItem[], shippingAddress?: ShippingAddress): Promise<{
    url: string;
    sessionId: string;
    orderId: string;
  }> {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    const { data, error } = await supabase.functions.invoke("create_stripe_checkout", {
      body: JSON.stringify({
        items,
        shipping_address: shippingAddress,
        currency: "usd",
        payment_method_types: ["card"],
      }),
      headers,
    });

    if (error) {
      const errorMsg = await error?.context?.text();
      throw new Error(errorMsg || "Failed to create checkout session");
    }

    if (data.code !== "SUCCESS") {
      throw new Error(data.message || "Failed to create checkout session");
    }

    return data.data;
  },

  async verifyPayment(sessionId: string): Promise<{
    verified: boolean;
    status: string;
    sessionId: string;
    paymentIntentId?: string;
    amount?: number;
    currency?: string;
    customerEmail?: string;
    customerName?: string;
    orderUpdated?: boolean;
  }> {
    const { data, error } = await supabase.functions.invoke("verify_stripe_payment", {
      body: JSON.stringify({ sessionId }),
    });

    if (error) {
      const errorMsg = await error?.context?.text();
      throw new Error(errorMsg || "Failed to verify payment");
    }

    if (data.code !== "SUCCESS") {
      throw new Error(data.message || "Failed to verify payment");
    }

    return data.data;
  },
};

export const storageApi = {
  async uploadProductImage(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("app-7klbr3l9m1vl_product_images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("app-7klbr3l9m1vl_product_images")
      .getPublicUrl(data.path);

    return publicUrl;
  },

  async deleteProductImage(url: string): Promise<void> {
    const path = url.split("/").slice(-2).join("/");

    const { error } = await supabase.storage
      .from("app-7klbr3l9m1vl_product_images")
      .remove([path]);

    if (error) throw error;
  },
};
