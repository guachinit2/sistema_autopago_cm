export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface CheckoutStore {
  sessionId: string | null;
  items: CartItem[];
  total: number;
}

export const createCheckoutStore = (): CheckoutStore => ({
  sessionId: null,
  items: [],
  total: 0,
});
