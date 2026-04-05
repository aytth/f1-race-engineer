import { Hono } from 'hono';
import type { Env } from '../types/env';
import { aggregateSessionState } from '../services/aggregator';
import { OpenF1Client } from '../services/openf1';
import type { OpenF1CarData, OpenF1Location, OpenF1Lap } from '@f1/shared';

const app = new Hono<{ Bindings: Env }>();

// Aggregated session state — polled every 10s by frontend
app.get('/telemetry', async (c) => {
  const sessionKey = c.req.query('session_key');
  if (!sessionKey) return c.json({ error: 'session_key parameter required' }, 400);

  try {
    const lap = c.req.query('lap');
    const atLap = lap ? Number(lap) : undefined;
    const state = await aggregateSessionState(c.env, Number(sessionKey), atLap);
    return c.json(state);
  } catch (err) {
    console.error('Telemetry error:', err);
    return c.json({ error: String(err) }, 500);
  }
});

/**
 * Find a reference timestamp near mid-to-late race for sampling data.
 * Uses lap data to find a point where cars are racing at speed.
 */
async function findRacingTimestamp(client: OpenF1Client, sessionKey: number): Promise<string | null> {
  try {
    const laps = await client.getLaps(sessionKey) as OpenF1Lap[];
    if (laps.length === 0) return null;

    // Find laps with valid date_start, sorted by date
    const datedLaps = laps
      .filter((l) => l.date_start)
      .sort((a, b) => new Date(a.date_start!).getTime() - new Date(b.date_start!).getTime());

    if (datedLaps.length === 0) return null;

    // Pick a lap ~75% through the session (mid-to-late race, cars at speed)
    const targetIdx = Math.floor(datedLaps.length * 0.75);
    return datedLaps[targetIdx].date_start!;
  } catch {
    return null;
  }
}

// Latest car data for a specific driver — speed, gear, throttle, brake, DRS
app.get('/telemetry/car', async (c) => {
  const sessionKey = c.req.query('session_key');
  const driverNumber = c.req.query('driver_number');
  if (!sessionKey || !driverNumber) {
    return c.json({ error: 'session_key and driver_number required' }, 400);
  }

  const empty = { speed: 0, gear: 0, throttle: 0, brake: 0, drs: 0, rpm: 0 };

  try {
    const client = new OpenF1Client(c.env);

    // Try to get a racing timestamp to query a time window with actual data
    const racingDate = await findRacingTimestamp(client, Number(sessionKey));

    let carData: OpenF1CarData[];
    if (racingDate) {
      // Fetch a small time window (10 seconds) around a racing lap
      carData = await client.getFilteredData<OpenF1CarData>(
        'car_data',
        { session_key: sessionKey, driver_number: driverNumber },
        racingDate,
      );
    } else {
      carData = await client.getCarData(Number(sessionKey), Number(driverNumber)) as OpenF1CarData[];
    }

    if (carData.length === 0) return c.json(empty);

    // Find the last entry with speed > 0 (skip post-race stopped data)
    let latest = carData[carData.length - 1];
    for (let i = carData.length - 1; i >= 0; i--) {
      if (carData[i].speed > 0) {
        latest = carData[i];
        break;
      }
    }

    return c.json({
      speed: latest.speed,
      gear: latest.n_gear,
      throttle: latest.throttle,
      brake: latest.brake,
      drs: latest.drs,
      rpm: latest.rpm,
    });
  } catch (err) {
    console.error('Car data error:', err);
    return c.json(empty);
  }
});

// Latest location for all drivers — used by track map for car dots
app.get('/telemetry/locations', async (c) => {
  const sessionKey = c.req.query('session_key');
  if (!sessionKey) return c.json({ error: 'session_key required' }, 400);

  try {
    const client = new OpenF1Client(c.env);

    // Find a time when cars are racing to get positions on track
    const racingDate = await findRacingTimestamp(client, Number(sessionKey));

    let locations: OpenF1Location[];
    if (racingDate) {
      // Fetch a small time window of location data (much smaller than full session)
      locations = await client.getFilteredData<OpenF1Location>(
        'location',
        { session_key: sessionKey },
        racingDate,
      );
    } else {
      // Fallback: try fetching all (may be slow for completed sessions)
      locations = await client.getLocation(Number(sessionKey)) as OpenF1Location[];
    }

    // Get the latest location for each driver
    const latestLocations = new Map<number, { x: number; y: number }>();
    for (const loc of locations) {
      latestLocations.set(loc.driver_number, { x: loc.x, y: loc.y });
    }

    return c.json(Object.fromEntries(latestLocations));
  } catch (err) {
    console.error('Location error:', err);
    return c.json({});
  }
});

export default app;
