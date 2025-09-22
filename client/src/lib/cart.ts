import { CartItem } from "@/types";

const CART_STORAGE_KEY = "modernshop_cart";

export class CartManager {
  private static instance: CartManager;
  private listeners: Set<() => void> = new Set();

  static getInstance(): CartManager {
    if (!CartManager.instance) {
      CartManager.instance = new CartManager();
    }
    return CartManager.instance;
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  addItem(item: Omit<CartItem, "quantity"> & { quantity?: number }) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += item.quantity || 1;
    } else {
      cart.push({ ...item, quantity: item.quantity || 1 });
    }
    
    this.saveCart(cart);
    this.notify();
  }

  removeItem(id: string) {
    const cart = this.getCart().filter(item => item.id !== id);
    this.saveCart(cart);
    this.notify();
  }

  updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }

    const cart = this.getCart();
    const index = cart.findIndex(item => item.id === id);
    
    if (index >= 0) {
      cart[index].quantity = quantity;
      this.saveCart(cart);
      this.notify();
    }
  }

  getItemCount(): number {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotal(): number {
    return this.getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  clearCart() {
    this.saveCart([]);
    this.notify();
  }

  private saveCart(cart: CartItem[]) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }
}

export const cartManager = CartManager.getInstance();
