import { create } from 'zustand';

interface LapTimeline {
  lap: number;
  timestamp: string;
}

interface ReplayStore {
  // Replay state
  isReplayMode: boolean;
  playing: boolean;
  speed: number;       // 1, 2, 5, 10
  currentLap: number;
  totalLaps: number;
  timeline: LapTimeline[];

  // Actions
  setReplayMode: (enabled: boolean) => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setCurrentLap: (lap: number) => void;
  setTimeline: (timeline: LapTimeline[], totalLaps: number) => void;
  nextLap: () => void;
  prevLap: () => void;
  reset: () => void;
}

export const useReplayStore = create<ReplayStore>((set, get) => ({
  isReplayMode: false,
  playing: false,
  speed: 1,
  currentLap: 1,
  totalLaps: 0,
  timeline: [],

  setReplayMode: (enabled) => set({ isReplayMode: enabled, playing: false }),
  setPlaying: (playing) => set({ playing }),
  setSpeed: (speed) => set({ speed }),
  setCurrentLap: (lap) => {
    const { totalLaps } = get();
    set({ currentLap: Math.max(1, Math.min(lap, totalLaps)) });
  },
  setTimeline: (timeline, totalLaps) => set({ timeline, totalLaps, currentLap: 1 }),
  nextLap: () => {
    const { currentLap, totalLaps } = get();
    if (currentLap < totalLaps) set({ currentLap: currentLap + 1 });
    else set({ playing: false }); // Stop at end
  },
  prevLap: () => {
    const { currentLap } = get();
    if (currentLap > 1) set({ currentLap: currentLap - 1 });
  },
  reset: () => set({
    isReplayMode: false,
    playing: false,
    speed: 1,
    currentLap: 1,
    totalLaps: 0,
    timeline: [],
  }),
}));
