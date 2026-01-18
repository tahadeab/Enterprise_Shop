import { Link } from "react-router-dom";
import { Store } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Store className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Enterprise Shop</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted marketplace for quality products from verified sellers.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/products" className="hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?featured=true" className="hover:text-foreground transition-colors">
                  Featured
                </Link>
              </li>
              <li>
                <Link to="/products?sort=price" className="hover:text-foreground transition-colors">
                  Best Deals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/account" className="hover:text-foreground transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-foreground transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-foreground transition-colors">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Sell</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/seller" className="hover:text-foreground transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-foreground transition-colors">
                  Become a Seller
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>{currentYear} Enterprise E-Commerce Platform</p>
        </div>
      </div>
    </footer>
  );
}
