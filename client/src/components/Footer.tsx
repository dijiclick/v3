import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
  };

  return (
    <footer className="bg-secondary text-secondary-foreground mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-card" data-testid="footer-logo">ModernShop</h3>
            <p className="text-sm opacity-80" data-testid="footer-description">
              Your trusted destination for premium products and exceptional shopping experiences. Quality you can depend on.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-card hover:text-accent transition-colors" data-testid="social-facebook">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-card hover:text-accent transition-colors" data-testid="social-twitter">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-card hover:text-accent transition-colors" data-testid="social-instagram">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-card hover:text-accent transition-colors" data-testid="social-linkedin">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-card" data-testid="quick-links-title">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors" data-testid="footer-about">About Us</Link></li>
              <li><Link href="/contact" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors" data-testid="footer-contact">Contact</Link></li>
              <li><Link href="/faq" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors" data-testid="footer-faq">FAQs</Link></li>
              <li><Link href="/shipping" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors" data-testid="footer-shipping">Shipping Info</Link></li>
              <li><Link href="/returns" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors" data-testid="footer-returns">Returns</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold text-card" data-testid="categories-title">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/electronics" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors" data-testid="footer-electronics">Electronics</Link></li>
              <li><Link href="/home-garden" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors" data-testid="footer-home-garden">Home & Garden</Link></li>
              <li><Link href="/fashion" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors" data-testid="footer-fashion">Fashion</Link></li>
              <li><Link href="/sports" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors" data-testid="footer-sports">Sports</Link></li>
              <li><Link href="/books" className="opacity-80 hover:opacity-100 hover:text-accent transition-colors" data-testid="footer-books">Books</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-card" data-testid="newsletter-title">Stay Updated</h4>
            <p className="text-sm opacity-80" data-testid="newsletter-description">
              Get the latest products and exclusive deals delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                data-testid="newsletter-input"
              />
              <Button 
                type="submit"
                className="w-full bg-accent text-accent-foreground py-2 rounded-lg font-medium hover:bg-accent/90 transition-colors"
                data-testid="newsletter-submit"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-secondary/20 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm opacity-80">
          <p data-testid="copyright">&copy; 2024 ModernShop. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link href="/privacy" className="hover:text-accent transition-colors" data-testid="footer-privacy">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-accent transition-colors" data-testid="footer-terms">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-accent transition-colors" data-testid="footer-cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
