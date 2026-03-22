import { create } from 'zustand';
import type { CartItem, Product } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      const newItems = existing
        ? state.items.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [...state.items, { id: crypto.randomUUID(), product, quantity, price: product.price }];
      const subtotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const tax = subtotal * 0.16;
      return { items: newItems, subtotal, tax, total: subtotal + tax };
    });
  },

  removeItem: (itemId) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== itemId);
      const subtotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const tax = subtotal * 0.16;
      return { items: newItems, subtotal, tax, total: subtotal + tax };
    });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set((state) => {
      const newItems = state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i));
      const subtotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const tax = subtotal * 0.16;
      return { items: newItems, subtotal, tax, total: subtotal + tax };
    });
  },

  clearCart: () => set({ items: [], subtotal: 0, tax: 0, total: 0 }),
}));
