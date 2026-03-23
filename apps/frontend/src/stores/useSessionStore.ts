import { create } from 'zustand';

type SessionState = 'idle' | 'active' | 'timeout';

interface SessionStore {
  state: SessionState;
  sessionId: string | null;
  cartId: string | null;
  orderId: string | null;
  setState: (state: SessionState) => void;
  startSession: (cartId: string) => void;
  setCartId: (cartId: string | null) => void;
  setOrderId: (orderId: string | null) => void;
  endSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  state: 'idle',
  sessionId: null,
  cartId: null,
  orderId: null,

  setState: (state) => set({ state }),
  startSession: (cartId) => set({ state: 'active', sessionId: crypto.randomUUID(), cartId }),
  setCartId: (cartId) => set({ cartId }),
  setOrderId: (orderId) => set({ orderId }),
  endSession: () => set({ state: 'idle', sessionId: null, cartId: null, orderId: null }),
}));
