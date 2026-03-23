import { create } from 'zustand';

type SessionState = 'idle' | 'active' | 'timeout';

interface SessionStore {
  state: SessionState;
  sessionId: string | null;
  cartId: string | null;
  orderId: string | null;
  documentId: string | null;
  setState: (state: SessionState) => void;
  startSession: (cartId: string, documentId?: string) => void;
  setCartId: (cartId: string | null) => void;
  setOrderId: (orderId: string | null) => void;
  setDocumentId: (documentId: string | null) => void;
  endSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  state: 'idle',
  sessionId: null,
  cartId: null,
  orderId: null,
  documentId: null,

  setState: (state) => set({ state }),
  startSession: (cartId, documentId) =>
    set({
      state: 'active',
      sessionId: crypto.randomUUID(),
      cartId,
      documentId: documentId ?? null,
    }),
  setCartId: (cartId) => set({ cartId }),
  setOrderId: (orderId) => set({ orderId }),
  setDocumentId: (documentId) => set({ documentId }),
  endSession: () =>
    set({
      state: 'idle',
      sessionId: null,
      cartId: null,
      orderId: null,
      documentId: null,
    }),
}));
