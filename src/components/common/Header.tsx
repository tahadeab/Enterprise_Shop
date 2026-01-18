import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Heart,
  Package,
  LogOut,
  Settings,
  LayoutDashboard,
  Store,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="xl:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  <Link
                    to="/"
                    className="text-sm font-medium hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/products"
                    className="text-sm font-medium hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Products
                  </Link>
                  {user && (
                    <>
                      <Link
                        to="/account"
                        className="text-sm font-medium hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      {profile?.role === "seller" && (
                        <Link
                          to="/seller"
                          className="text-sm font-medium hover:text-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Seller Dashboard
                        </Link>
                      )}
                      {profile?.role === "admin" && (
                        <Link
                          to="/admin"
                          className="text-sm font-medium hover:text-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl hidden sm:inline-block">
                Enterprise Shop
              </span>
            </Link>

            <nav className="hidden xl:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Products
              </Link>
            </nav>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="relative"
                >
                  <Link to="/wishlist">
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="relative"
                >
                  <Link to="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56" align="end">
                    <div className="flex flex-col gap-2">
                      <div className="px-2 py-1.5 text-sm font-medium">
                        {profile?.full_name || profile?.email}
                      </div>
                      <div className="px-2 py-1 text-xs text-muted-foreground capitalize">
                        {profile?.role}
                      </div>
                      <div className="h-px bg-border my-1" />
                      <Button
                        variant="ghost"
                        className="justify-start"
                        asChild
                      >
                        <Link to="/account">
                          <User className="mr-2 h-4 w-4" />
                          My Account
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        asChild
                      >
                        <Link to="/orders">
                          <Package className="mr-2 h-4 w-4" />
                          Orders
                        </Link>
                      </Button>
                      {profile?.role === "seller" && (
                        <Button
                          variant="ghost"
                          className="justify-start"
                          asChild
                        >
                          <Link to="/seller">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Seller Dashboard
                          </Link>
                        </Button>
                      )}
                      {profile?.role === "admin" && (
                        <Button
                          variant="ghost"
                          className="justify-start"
                          asChild
                        >
                          <Link to="/admin">
                            <Settings className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </Button>
                      )}
                      <div className="h-px bg-border my-1" />
                      <Button
                        variant="ghost"
                        className="justify-start text-destructive hover:text-destructive"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild className="hidden sm:inline-flex">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
