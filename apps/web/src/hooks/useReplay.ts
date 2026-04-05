import { useEffect, useRef } from 'react';
import { useReplayStore } from '../stores/replayStore';
import { fetchApi } from '../lib/api';

interface LapTimelineResponse {
  totalLaps: number;
  timeline: { lap: number; timestamp: string }[];
}

// Base interval between lap advances (ms). Divided by speed multiplier.
const BASE_INTERVAL = 3000;

export function useReplay(sessionKey: number | null) {
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const store = useReplayStore;

  // Load timeline when entering replay mode
  useEffect(() => {
    if (!sessionKey) return;

    const state = store.getState();
    if (!state.isReplayMode) return;

    fetchApi<LapTimelineResponse>('/replay/laps', { session_key: String(sessionKey) })
      .then(({ totalLaps, timeline }) => {
        store.getState().setTimeline(timeline, totalLaps);
      })
      .catch((err) => console.error('Failed to load replay timeline:', err));
  }, [sessionKey, store.getState().isReplayMode]);

  // Auto-advance laps when playing
  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }

      if (state.playing && state.isReplayMode && state.totalLaps > 0) {
        const interval = BASE_INTERVAL / state.speed;
        intervalRef.current = setInterval(() => {
          store.getState().nextLap();
        }, interval);
      }
    });

    // Initial check
    const state = store.getState();
    if (state.playing && state.isReplayMode && state.totalLaps > 0) {
      const interval = BASE_INTERVAL / state.speed;
      intervalRef.current = setInterval(() => {
        store.getState().nextLap();
      }, interval);
    }

    return () => {
      unsubscribe();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return store;
}
