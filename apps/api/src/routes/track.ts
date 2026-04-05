import { Hono } from 'hono';
import type { Env } from '../types/env';
import { OpenF1Client } from '../services/openf1';
import type { OpenF1Location, OpenF1Lap } from '@f1/shared';

const app = new Hono<{ Bindings: Env }>();

app.get('/track/:sessionKey', async (c) => {
  const sessionKey = Number(c.req.param('sessionKey'));
  const client = new OpenF1Client(c.env);

  // Get drivers to find one to trace the track
  const drivers = await client.getDrivers(sessionKey) as { driver_number: number }[];
  if (drivers.length === 0) return c.json({ error: 'No drivers found' }, 404);

  const driverNum = drivers[0].driver_number;

  // Get lap data to find a clean reference lap
  const laps = await client.getLaps(sessionKey, driverNum) as OpenF1Lap[];
  if (laps.length === 0) return c.json({ error: 'No lap data' }, 404);

  // Find a good reference lap: not a pit out lap, has valid duration and date_start
  const validLaps = laps.filter(
    (l) => l.date_start && l.lap_duration && l.lap_duration > 30 && !l.is_pit_out_lap
  );

  if (validLaps.length === 0) {
    return c.json({ error: 'No valid laps for track outline' }, 404);
  }

  // Pick a lap from the middle of the session for clean data
  const refLap = validLaps[Math.floor(validLaps.length / 2)];
  const lapDurationMs = (refLap.lap_duration! + 2) * 1000; // add 2s buffer

  // Fetch location data ONLY for this one lap's time window
  const locations = await client.getFilteredData<OpenF1Location>(
    'location',
    { session_key: sessionKey, driver_number: driverNum },
    refLap.date_start,
    lapDurationMs,
  );

  if (locations.length === 0) {
    return c.json({ error: 'No location data for track outline' }, 404);
  }

  // Build points from the single lap (already in chronological order)
  const points = locations.map((loc) => ({ x: loc.x, y: loc.y }));

  // Calculate bounds
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const result = {
    points,
    bounds: {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    },
  };

  return c.json(result);
});

export default app;
