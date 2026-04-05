import { Hono } from 'hono';
import type { Env } from '../types/env';
import { OpenF1Client } from '../services/openf1';

const app = new Hono<{ Bindings: Env }>();

app.get('/drivers', async (c) => {
  const sessionKey = c.req.query('session_key');
  if (!sessionKey) return c.json({ error: 'session_key parameter required' }, 400);

  const client = new OpenF1Client(c.env);
  const drivers = await client.getDrivers(Number(sessionKey));
  return c.json(drivers);
});

export default app;
