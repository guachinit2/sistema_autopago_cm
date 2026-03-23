import { create } from 'zustand';
import type { CartItem, Product } from '../types';

interface CartItemFromApi {
  id: string;
  quantity: number;
  unitPrice: number;
  product: Product;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  addItemFromApi: (item: CartItemFromApi) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setItemsFromApi: (items: CartItemFromApi[]) => void;
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

  addItemFromApi: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.id === item.product.id);
      const newItems = existing
        ? state.items.map((i) =>
            i.product.id === item.product.id
              ? { ...i, id: item.id, quantity: item.quantity, price: item.unitPrice }
              : i
          )
        : [
            ...state.items,
            {
              id: item.id,
              product: item.product,
              quantity: item.quantity,
              price: item.unitPrice,
            },
          ];
      const subtotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const tax = subtotal * 0.16;
      return { items: newItems, subtotal, tax, total: subtotal + tax };
    });
  },

  setItemsFromApi: (items) => {
    const newItems: CartItem[] = items.map((i) => ({
      id: i.id,
      product: i.product,
      quantity: i.quantity,
      price: i.unitPrice,
    }));
    const subtotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = subtotal * 0.16;
    set({ items: newItems, subtotal, tax, total: subtotal + tax });
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
