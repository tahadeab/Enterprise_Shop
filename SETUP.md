# Enterprise E-Commerce Platform - Setup Guide

## Overview

A comprehensive enterprise-grade e-commerce platform featuring:
- Multi-vendor marketplace operations
- Complete buyer shopping experience
- Seller management capabilities
- Administrative control panel
- Stripe payment integration
- Role-based access control (Buyer, Seller, Admin)

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Payment**: Stripe
- **State Management**: React Context + Hooks

## Prerequisites

- Node.js 18+ and pnpm
- Supabase account
- Stripe account

## Environment Setup

The `.env` file has been pre-configured with Supabase credentials:

```
VITE_SUPABASE_URL=https://maylztbnssikkjdqvumg.supabase.co
VITE_SUPABASE_ANON_KEY=[configured]
VITE_APP_ID=app-7klbr3l9m1vl
VITE_API_ENV=production
```

## Database Setup

The database schema has been created with the following structure:

### Tables
- `profiles` - User profiles with role management
- `categories` - Product categories
- `products` - Product catalog
- `orders` - Order records
- `order_items` - Order line items
- `reviews` - Product reviews
- `addresses` - User shipping addresses
- `wishlists` - User wishlists

### User Roles
- **buyer** - Default role for new users
- **seller** - Can manage products and view sales
- **admin** - Full platform access

### Storage
- `app-7klbr3l9m1vl_product_images` - Product image storage bucket

## Payment Configuration

⚠️ **IMPORTANT**: Configure your Stripe secret key before testing payments.

1. Get your Stripe secret key from: https://dashboard.stripe.com/apikeys
2. The key is stored as a Supabase Edge Function secret named `STRIPE_SECRET_KEY`
3. Update it via Supabase Dashboard → Edge Functions → Secrets

### Payment Flow
1. User adds products to cart
2. Proceeds to checkout and enters shipping address
3. Clicks "Proceed to Payment" → redirects to Stripe Checkout
4. After payment, redirects to `/payment-success?session_id=xxx`
5. Payment verification happens automatically
6. Order is created in database

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Development Server

```bash
pnpm run dev
```

The application will be available at the URL provided by your development environment.

### 3. First User Setup

The first user to register will automatically become the platform administrator.

1. Navigate to `/register`
2. Create an account with email and password
3. You will be assigned the "admin" role automatically
4. Access the Admin Dashboard at `/admin`

### 4. Add Sample Data

Since the database is empty, you'll need to add initial data:

**Option 1: Via Admin Dashboard**
1. Log in as admin
2. Go to Admin Dashboard (`/admin`)
3. Change your role to "seller" temporarily
4. Navigate to Seller Dashboard (`/seller`)
5. Add products (note: full CRUD UI would be implemented in production)

**Option 2: Via SQL**
Insert data directly in Supabase SQL Editor:

```sql
-- Add categories
INSERT INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Electronic devices and gadgets'),
('Fashion', 'fashion', 'Clothing and accessories'),
('Home', 'home', 'Home and living products');

-- Add products (replace seller_id with your user ID)
INSERT INTO products (
  seller_id, category_id, name, slug, description,
  price, compare_at_price, sku, inventory_quantity,
  featured, status
) VALUES
(
  'your-user-id-here',
  (SELECT id FROM categories WHERE slug = 'electronics'),
  'Wireless Headphones',
  'wireless-headphones',
  'High-quality wireless headphones with noise cancellation',
  99.99,
  149.99,
  'WH-001',
  50,
  true,
  'active'
);
```

## Application Structure

### Public Pages
- `/` - Homepage with featured products
- `/products` - Product listing with filters
- `/products/:slug` - Product detail page
- `/search?q=query` - Search results
- `/cart` - Shopping cart
- `/login` - Login/Register

### Buyer Pages (Authenticated)
- `/account` - Profile settings
- `/orders` - Order history
- `/wishlist` - Saved products
- `/checkout` - Checkout process
- `/payment-success` - Payment confirmation

### Seller Pages (Seller/Admin only)
- `/seller` - Seller dashboard
- Product management overview
- Sales statistics

### Admin Pages (Admin only)
- `/admin` - Admin dashboard
- User management with role changes
- Platform statistics

## Features

### Implemented ✅
- User authentication (email/password + Google SSO)
- Product browsing and search
- Shopping cart management
- Stripe checkout integration
- Order tracking
- Wishlist functionality
- Multi-role system
- Responsive design
- Role-based access control

### Production Enhancements Needed
- Product CRUD interface for sellers
- Image upload functionality
- Advanced product filtering
- Review and rating system
- Address management UI
- Email notifications
- Order fulfillment workflow
- Advanced analytics
- Category management UI
- Payment webhook handling

## API Endpoints

### Supabase Edge Functions
- `create_stripe_checkout` - Creates Stripe checkout session
- `verify_stripe_payment` - Verifies payment completion

## Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Secure payment processing via Stripe
- Environment variables for sensitive data
- First user becomes admin automatically

## Troubleshooting

### Payment Issues
- Verify `STRIPE_SECRET_KEY` is configured in Supabase Edge Functions
- Check Stripe dashboard for test mode vs live mode
- Ensure webhook endpoints are configured (for production)

### Authentication Issues
- Email verification is disabled for easier testing
- Check Supabase Auth settings if SSO isn't working
- Verify redirect URLs in Supabase Auth settings

### Database Issues
- Check RLS policies if data isn't loading
- Verify user role assignments in profiles table
- Check Supabase logs for detailed error messages

## Development Notes

- The application uses TypeScript for type safety
- All database queries are in `src/db/api.ts`
- Authentication logic is in `src/contexts/AuthContext.tsx`
- Cart management is in `src/contexts/CartContext.tsx`
- Routes are configured in `src/routes.tsx`

## Support

For issues or questions:
1. Check the TODO.md file for implementation status
2. Review Supabase logs for backend errors
3. Check browser console for frontend errors
4. Verify environment variables are correctly set
