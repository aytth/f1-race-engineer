import { Hono } from 'hono';
import type { Env } from '../types/env';
import { OpenF1Client } from '../services/openf1';
import type { OpenF1Lap } from '@f1/shared';

const app = new Hono<{ Bindings: Env }>();

// Get lap timeline for replay — returns list of laps with timestamps
app.get('/replay/laps', async (c) => {
  const sessionKey = c.req.query('session_key');
  if (!sessionKey) return c.json({ error: 'session_key required' }, 400);

  try {
    const client = new OpenF1Client(c.env);
    const allLaps = await client.getLaps(Number(sessionKey)) as OpenF1Lap[];

    // Group laps by lap_number, pick the earliest date_start per lap
    const lapMap = new Map<number, string>();
    for (const lap of allLaps) {
      if (!lap.date_start) continue;
      const existing = lapMap.get(lap.lap_number);
      if (!existing || new Date(lap.date_start) < new Date(existing)) {
        lapMap.set(lap.lap_number, lap.date_start);
      }
    }

    // Sort by lap number
    const timeline = Array.from(lapMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([lap, timestamp]) => ({ lap, timestamp }));

    // Determine total laps
    const maxLap = timeline.length > 0 ? timeline[timeline.length - 1].lap : 0;

    return c.json({ totalLaps: maxLap, timeline });
  } catch (err) {
    console.error('Replay laps error:', err);
    return c.json({ error: String(err) }, 500);
  }
});

export default app;
