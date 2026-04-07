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
  const isReplayMode = useReplayStore((s) => s.isReplayMode);
  const playing = useReplayStore((s) => s.playing);
  const speed = useReplayStore((s) => s.speed);
  const totalLaps = useReplayStore((s) => s.totalLaps);

  // Load timeline when entering replay mode
  useEffect(() => {
    if (!sessionKey || !isReplayMode) return;

    fetchApi<LapTimelineResponse>('/replay/laps', { session_key: String(sessionKey) })
      .then(({ totalLaps, timeline }) => {
        useReplayStore.getState().setTimeline(timeline, totalLaps);
      })
      .catch((err) => console.error('Failed to load replay timeline:', err));
  }, [sessionKey, isReplayMode]);

  // Auto-advance laps when playing
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    if (playing && isReplayMode && totalLaps > 0) {
      const interval = BASE_INTERVAL / speed;
      intervalRef.current = setInterval(() => {
        useReplayStore.getState().nextLap();
      }, interval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, isReplayMode, speed, totalLaps]);
}
