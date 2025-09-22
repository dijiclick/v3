import { useState } from "react";
import { Link } from "wouter";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cartManager } from "@/lib/cart";
import { useCartItems } from "@/hooks/useCart";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartItems = useCartItems();

  const toggleCart = () => {
    // Dispatch custom event for ShoppingCart component to listen to
    window.dispatchEvent(new CustomEvent('toggleCart'));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary" data-testid="logo">
                  ModernShop
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link href="/" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors" data-testid="nav-home">
                  Home
                </Link>
                <Link href="/products" className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors" data-testid="nav-products">
                  Products
                </Link>
                <Link href="/categories" className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors" data-testid="nav-categories">
                  Categories
                </Link>
                <Link href="/about" className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors" data-testid="nav-about">
                  About
                </Link>
                <Link href="/contact" className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors" data-testid="nav-contact">
                  Contact
                </Link>
              </div>
            </nav>

            {/* Search and Cart */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Input 
                  type="search" 
                  placeholder="Search products..." 
                  className="w-64 pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  data-testid="search-input"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              </div>

              {/* Cart Button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleCart}
                className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
                data-testid="cart-button"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center" data-testid="cart-count">
                    {cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>

              {/* Mobile menu button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleMenu}
                className="md:hidden p-2 text-muted-foreground hover:text-primary"
                data-testid="mobile-menu-button"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
                <Link href="/" className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium" data-testid="mobile-nav-home">
                  Home
                </Link>
                <Link href="/products" className="text-muted-foreground hover:text-primary block px-3 py-2 text-base font-medium" data-testid="mobile-nav-products">
                  Products
                </Link>
                <Link href="/categories" className="text-muted-foreground hover:text-primary block px-3 py-2 text-base font-medium" data-testid="mobile-nav-categories">
                  Categories
                </Link>
                <Link href="/about" className="text-muted-foreground hover:text-primary block px-3 py-2 text-base font-medium" data-testid="mobile-nav-about">
                  About
                </Link>
                <Link href="/contact" className="text-muted-foreground hover:text-primary block px-3 py-2 text-base font-medium" data-testid="mobile-nav-contact">
                  Contact
                </Link>
                {/* Mobile Search */}
                <div className="px-3 pt-4">
                  <Input 
                    type="search" 
                    placeholder="Search products..." 
                    className="w-full"
                    data-testid="mobile-search-input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

    </>
  );
}
