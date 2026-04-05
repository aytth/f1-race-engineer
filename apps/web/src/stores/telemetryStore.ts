import { create } from 'zustand';
import type { SessionTelemetryState } from '@f1/shared';

interface TelemetryStore {
  state: SessionTelemetryState | null;
  selectedDriver: number | null;
  connected: boolean;

  setState: (state: SessionTelemetryState) => void;
  selectDriver: (driverNumber: number) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

export const useTelemetryStore = create<TelemetryStore>((set) => ({
  state: null,
  selectedDriver: null,
  connected: false,

  setState: (state) => set({ state }),
  selectDriver: (driverNumber) => set({ selectedDriver: driverNumber }),
  setConnected: (connected) => set({ connected }),
  reset: () => set({ state: null, selectedDriver: null, connected: false }),
}));
