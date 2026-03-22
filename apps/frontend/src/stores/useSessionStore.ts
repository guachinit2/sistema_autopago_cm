import { create } from 'zustand';

type SessionState = 'idle' | 'active' | 'timeout';

interface SessionStore {
  state: SessionState;
  sessionId: string | null;
  setState: (state: SessionState) => void;
  startSession: () => void;
  endSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  state: 'idle',
  sessionId: null,

  setState: (state) => set({ state }),
  startSession: () => set({ state: 'active', sessionId: crypto.randomUUID() }),
  endSession: () => set({ state: 'idle', sessionId: null }),
}));
