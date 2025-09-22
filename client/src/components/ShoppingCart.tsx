import { useState, useEffect } from "react";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cartManager } from "@/lib/cart";
import { useCartItems } from "@/hooks/useCart";

export default function ShoppingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useCartItems();

  useEffect(() => {
    const handleToggleCart = () => {
      setIsOpen(prev => !prev);
    };

    // Listen for custom cart toggle events
    window.addEventListener('toggleCart', handleToggleCart);
    
    return () => {
      window.removeEventListener('toggleCart', handleToggleCart);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    cartManager.updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    cartManager.removeItem(id);
  };

  const total = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  return (
    <>
      {/* Cart Overlay */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-96 max-w-full cart-overlay ${isOpen ? 'open' : ''}`}
        data-testid="cart-overlay"
      >
        <div className="flex h-full flex-col bg-card shadow-xl">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-medium text-foreground" data-testid="cart-title">Shopping Cart</h2>
              <div className="ml-3 flex h-7 items-center">
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="relative -m-2 p-2 text-muted-foreground hover:text-foreground"
                  data-testid="cart-close-button"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="mt-8">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2" data-testid="empty-cart-title">
                    Your cart is empty
                  </h3>
                  <p className="text-muted-foreground" data-testid="empty-cart-description">
                    Add some products to get started.
                  </p>
                </div>
              ) : (
                <div className="flow-root">
                  <ul className="-my-6 divide-y divide-border">
                    {cartItems.map((item: any) => (
                      <li key={item.id} className="flex py-6" data-testid={`cart-item-${item.id}`}>
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border">
                          <img 
                            src={item.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=96&h=96"} 
                            alt={item.title} 
                            className="h-full w-full object-cover object-center"
                            data-testid={`cart-item-image-${item.id}`}
                          />
                        </div>

                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-foreground">
                              <h3 data-testid={`cart-item-title-${item.id}`}>{item.title}</h3>
                              <p className="ml-4" data-testid={`cart-item-price-${item.id}`}>
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            {item.color && (
                              <p className="mt-1 text-sm text-muted-foreground" data-testid={`cart-item-color-${item.id}`}>
                                {item.color}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                data-testid={`decrease-quantity-${item.id}`}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-foreground font-medium" data-testid={`cart-item-quantity-${item.id}`}>
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                data-testid={`increase-quantity-${item.id}`}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="flex">
                              <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                className="font-medium text-accent hover:text-accent/80"
                                data-testid={`remove-item-${item.id}`}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-border px-6 py-6">
              <div className="flex justify-between text-base font-medium text-foreground">
                <p data-testid="cart-subtotal-label">Subtotal</p>
                <p data-testid="cart-subtotal-amount">${total.toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground" data-testid="cart-shipping-note">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="mt-6">
                <Button 
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  data-testid="checkout-button"
                >
                  Checkout
                </Button>
              </div>
              <div className="mt-6 flex justify-center text-center text-sm text-muted-foreground">
                <p>
                  or
                  <Button 
                    variant="ghost"
                    onClick={handleClose}
                    className="font-medium text-primary hover:text-primary/80 ml-1 p-0 h-auto"
                    data-testid="continue-shopping-button"
                  >
                    Continue Shopping →
                  </Button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={handleClose}
          data-testid="cart-backdrop"
        />
      )}
    </>
  );
}
