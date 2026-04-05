import { useEffect, useRef } from 'react';
import { useTelemetryStore } from '../stores/telemetryStore';
import { useReplayStore } from '../stores/replayStore';
import { fetchApi } from '../lib/api';
import type { SessionTelemetryState } from '@f1/shared';

const POLL_INTERVAL = 10000; // 10 seconds

export function useTelemetry(sessionKey: number | null) {
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const activeRef = useRef(true);
  const storeRef = useRef(useTelemetryStore.getState());
  const lastReplayLapRef = useRef<number | null>(null);

  // Subscribe to replay store for lap changes
  const replayLap = useReplayStore((s) => s.isReplayMode ? s.currentLap : null);

  useEffect(() => {
    activeRef.current = true;
    if (!sessionKey) return;

    const fetchTelemetry = async (lap?: number) => {
      if (!activeRef.current) return;

      try {
        const params: Record<string, string> = {
          session_key: String(sessionKey),
        };
        if (lap != null) {
          params.lap = String(lap);
        }

        const state = await fetchApi<SessionTelemetryState>('/telemetry', params);
        if (activeRef.current) {
          storeRef.current.setState(state);
          storeRef.current.setConnected(true);
        }
      } catch (err) {
        console.error('Telemetry fetch error:', err);
        if (activeRef.current) {
          storeRef.current.setConnected(false);
        }
      }
    };

    // If in replay mode, fetch for the specific lap
    if (replayLap != null) {
      // Only refetch if lap actually changed
      if (replayLap !== lastReplayLapRef.current) {
        lastReplayLapRef.current = replayLap;
        fetchTelemetry(replayLap);
      }
      // No polling in replay mode — data is fetched per lap change
      return () => { activeRef.current = false; };
    }

    // Normal mode: initial fetch + polling
    lastReplayLapRef.current = null;
    fetchTelemetry();
    intervalRef.current = setInterval(() => fetchTelemetry(), POLL_INTERVAL);

    return () => {
      activeRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      storeRef.current.setConnected(false);
    };
  }, [sessionKey, replayLap]);
}
