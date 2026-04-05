import { Hono } from 'hono';
import type { Env } from '../types/env';
import { aggregateSessionState } from '../services/aggregator';
import { analyzeWithClaude } from '../services/claude';
import type { EngineerMessage } from '@f1/shared';

const app = new Hono<{ Bindings: Env }>();

// POST endpoint — called by frontend on-demand or on a timer
// Returns array of engineer messages from a single Claude analysis
app.post('/engineer/analyze', async (c) => {
  const sessionKey = c.req.query('session_key');
  const driverNumber = c.req.query('driver_number');
  const apiKey = c.req.header('X-Anthropic-Key');

  if (!sessionKey) return c.json({ error: 'session_key parameter required' }, 400);
  if (!driverNumber) return c.json({ error: 'driver_number parameter required' }, 400);
  if (!apiKey) return c.json({ error: 'X-Anthropic-Key header required' }, 401);

  try {
    // Get current session state
    const state = await aggregateSessionState(c.env, Number(sessionKey));

    // Analyze with Claude
    const analysisRaw = await analyzeWithClaude(apiKey, state, Number(driverNumber));

    // Parse the response — strip markdown code fences if present
    let messages: EngineerMessage[];
    try {
      const cleaned = analysisRaw
        .replace(/^[\s\S]*?```(?:json)?\s*/i, '')
        .replace(/\s*```[\s\S]*$/, '')
        .trim();
      const jsonStr = cleaned.startsWith('[') || cleaned.startsWith('{') ? cleaned : analysisRaw;
      const parsed = JSON.parse(jsonStr);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      messages = arr.map((m: Record<string, unknown>, i: number) => ({
        id: `${Date.now()}-${i}`,
        timestamp: new Date().toISOString(),
        lap: state.currentLap,
        category: (m.category as string) || 'general',
        priority: (m.priority as string) || 'info',
        message: (m.message as string) || '',
        reasoning: m.reasoning as string | undefined,
        driverNumber: Number(driverNumber),
      } as EngineerMessage));
    } catch {
      messages = [{
        id: `${Date.now()}-0`,
        timestamp: new Date().toISOString(),
        lap: state.currentLap,
        category: 'general',
        priority: 'info',
        message: analysisRaw,
        driverNumber: Number(driverNumber),
      }];
    }

    return c.json({ messages });
  } catch (err) {
    console.error('Engineer analysis error:', err);
    return c.json({ error: String(err) }, 500);
  }
});

export default app;
