import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types/env';
import sessions from './routes/sessions';
import drivers from './routes/drivers';
import telemetry from './routes/telemetry';
import engineer from './routes/engineer';
import track from './routes/track';
import replay from './routes/replay';

const app = new Hono<{ Bindings: Env }>();

// CORS for frontend
app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  allowHeaders: ['Content-Type', 'X-Anthropic-Key'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

// Health check
app.get('/', (c) => c.json({ status: 'F1 Race Engineer API running' }));

// Mount routes
app.route('/api', sessions);
app.route('/api', drivers);
app.route('/api', telemetry);
app.route('/api', engineer);
app.route('/api', track);
app.route('/api', replay);

export default app;
