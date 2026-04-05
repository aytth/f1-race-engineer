import { Hono } from 'hono';
import type { Env } from '../types/env';
import { OpenF1Client } from '../services/openf1';

const app = new Hono<{ Bindings: Env }>();

app.get('/meetings', async (c) => {
  const year = c.req.query('year');
  if (!year) return c.json({ error: 'year parameter required' }, 400);

  const client = new OpenF1Client(c.env);
  const meetings = await client.getMeetings(Number(year));
  return c.json(meetings);
});

app.get('/sessions', async (c) => {
  const meetingKey = c.req.query('meeting_key');
  if (!meetingKey) return c.json({ error: 'meeting_key parameter required' }, 400);

  const client = new OpenF1Client(c.env);
  const sessions = await client.getSessions(Number(meetingKey));
  return c.json(sessions);
});

export default app;
