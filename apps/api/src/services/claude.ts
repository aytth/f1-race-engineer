import Anthropic from '@anthropic-ai/sdk';
import type { SessionTelemetryState } from '@f1/shared';
import { RACE_ENGINEER_SYSTEM_PROMPT } from '../prompts/system';

export async function analyzeWithClaude(
  apiKey: string,
  state: SessionTelemetryState,
  driverNumber: number
): Promise<string> {
  const driver = state.drivers.find((d) => d.driverNumber === driverNumber);
  if (!driver) throw new Error(`Driver ${driverNumber} not found in session`);

  const nearbyDrivers = state.drivers.filter(
    (d) => Math.abs(d.position - driver.position) <= 3 && d.driverNumber !== driverNumber
  );

  const userMessage = buildAnalysisPrompt(state, driver, nearbyDrivers);

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: RACE_ENGINEER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    return textBlock?.text ?? '[]';
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Claude API error:', errMsg);
    throw new Error(`Claude API error: ${errMsg}`);
  }
}

function safeNum(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '---';
  return val.toFixed(3);
}

function buildAnalysisPrompt(
  state: SessionTelemetryState,
  driver: SessionTelemetryState['drivers'][0],
  nearbyDrivers: SessionTelemetryState['drivers'][0][]
): string {
  const parts: string[] = [];

  parts.push(`=== SESSION STATE: Lap ${state.currentLap} ===`);
  parts.push(`Driver: ${driver.nameAcronym} (#${driver.driverNumber}) - ${driver.teamName}`);
  parts.push(`Position: P${driver.position}`);

  if (driver.lastLapTime) parts.push(`Last lap: ${safeNum(driver.lastLapTime)}s`);
  if (driver.bestLapTime) parts.push(`Best lap: ${safeNum(driver.bestLapTime)}s`);
  if (driver.gapToLeader != null) parts.push(`Gap to leader: +${safeNum(driver.gapToLeader)}s`);
  if (driver.interval != null) parts.push(`Interval: +${safeNum(driver.interval)}s`);

  if (driver.currentStint) {
    parts.push(`Tires: ${driver.currentStint.compound} (${driver.currentStint.tyreAge} laps old)`);
  }

  parts.push(`\nSectors: S1=${safeNum(driver.sectors.s1)} S2=${safeNum(driver.sectors.s2)} S3=${safeNum(driver.sectors.s3)}`);

  if (nearbyDrivers.length > 0) {
    parts.push('\n=== NEARBY DRIVERS ===');
    for (const d of nearbyDrivers) {
      const tire = d.currentStint ? `${d.currentStint.compound}(${d.currentStint.tyreAge}L)` : 'N/A';
      const gap = d.interval != null ? `+${safeNum(d.interval)}s` : '---';
      parts.push(`P${d.position} ${d.nameAcronym} - Gap: ${gap} - Tire: ${tire} - Last: ${safeNum(d.lastLapTime)}s`);
    }
  }

  if (state.weather) {
    const w = state.weather;
    parts.push('\n=== WEATHER ===');
    parts.push(`Air: ${w.air_temperature}°C | Track: ${w.track_temperature}°C | Humidity: ${w.humidity}%`);
    parts.push(`Wind: ${w.wind_speed} km/h | Rain: ${w.rainfall > 0 ? 'YES' : 'No'}`);
  }

  if (state.raceControlMessages.length > 0) {
    const recent = state.raceControlMessages.slice(-5);
    parts.push('\n=== RECENT RACE CONTROL ===');
    for (const msg of recent) {
      parts.push(`[Lap ${msg.lap_number ?? '?'}] ${msg.message}`);
    }
  }

  parts.push('\nAnalyze the current situation and provide radio messages for the driver.');

  return parts.join('\n');
}
