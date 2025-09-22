import { useState, useEffect } from "react";
import { cartManager } from "@/lib/cart";
import { CartItem } from "@/types";

export function useCartItems(): CartItem[] {
  const [cartItems, setCartItems] = useState<CartItem[]>(cartManager.getCart());

  useEffect(() => {
    const unsubscribe = cartManager.subscribe(() => {
      setCartItems(cartManager.getCart());
    });

    return unsubscribe;
  }, []);

  return cartItems;
}

export function useCartTotal(): number {
  const cartItems = useCartItems();
  return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

export function useCartCount(): number {
  const cartItems = useCartItems();
  return cartItems.reduce((sum, item) => sum + item.quantity, 0);
}
