import { create } from 'zustand';
import type { EngineerMessage } from '@f1/shared';

interface EngineerStore {
  messages: EngineerMessage[];
  apiKey: string;
  connected: boolean;
  status: string;

  addMessage: (message: EngineerMessage) => void;
  setApiKey: (key: string) => void;
  setConnected: (connected: boolean) => void;
  setStatus: (status: string) => void;
  clearMessages: () => void;
}

export const useEngineerStore = create<EngineerStore>((set) => ({
  messages: [],
  apiKey: localStorage.getItem('anthropic-api-key') || '',
  connected: false,
  status: 'Offline',

  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages.slice(-50), message] })), // Keep last 50
  setApiKey: (key) => {
    localStorage.setItem('anthropic-api-key', key);
    set({ apiKey: key });
  },
  setConnected: (connected) => set({ connected }),
  setStatus: (status) => set({ status }),
  clearMessages: () => set({ messages: [] }),
}));
