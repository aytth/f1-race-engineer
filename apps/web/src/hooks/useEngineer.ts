import { useEffect, useRef } from 'react';
import { useEngineerStore } from '../stores/engineerStore';
import type { EngineerMessage } from '@f1/shared';

const ANALYSIS_INTERVAL = 25000; // 25 seconds between analyses

export function useEngineer(sessionKey: number | null, driverNumber: number | null) {
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const activeRef = useRef(true);
  const analyzingRef = useRef(false);

  useEffect(() => {
    activeRef.current = true;
    // Access store actions directly to avoid re-render dependency loops
    const store = useEngineerStore.getState();
    const apiKey = store.apiKey;

    if (!sessionKey || !driverNumber || !apiKey) {
      store.setStatus(apiKey ? 'Select a driver to activate engineer' : 'Enter API key to activate');
      return;
    }

    const analyze = async () => {
      if (!activeRef.current || analyzingRef.current) return;

      // Re-read API key in case it changed
      const currentKey = useEngineerStore.getState().apiKey;
      if (!currentKey) return;

      analyzingRef.current = true;
      useEngineerStore.getState().setStatus('Analyzing telemetry...');

      try {
        const url = `/api/engineer/analyze?session_key=${sessionKey}&driver_number=${driverNumber}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'X-Anthropic-Key': currentKey },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          useEngineerStore.getState().setStatus(`Error: ${(err as { error: string }).error}`);
          return;
        }

        const { messages } = (await res.json()) as { messages: EngineerMessage[] };
        if (activeRef.current && messages) {
          const s = useEngineerStore.getState();
          for (const msg of messages) {
            s.addMessage(msg);
          }
          s.setConnected(true);
          s.setStatus('Engineer online. Listening...');
        }
      } catch (err) {
        console.error('Engineer analysis error:', err);
        useEngineerStore.getState().setStatus('Analysis failed. Will retry...');
      } finally {
        analyzingRef.current = false;
      }
    };

    // Initial analysis after short delay (let telemetry load first)
    const initialTimeout = setTimeout(analyze, 4000);

    // Periodic analysis
    intervalRef.current = setInterval(analyze, ANALYSIS_INTERVAL);

    return () => {
      activeRef.current = false;
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      useEngineerStore.getState().setConnected(false);
    };
  }, [sessionKey, driverNumber]); // Only re-run when session or driver changes
}
