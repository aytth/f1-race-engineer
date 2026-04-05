import type {
  OpenF1Driver,
  OpenF1Position,
  OpenF1Lap,
  OpenF1Interval,
  OpenF1Stint,
  OpenF1Weather,
  OpenF1RaceControl,
  SessionTelemetryState,
  DriverTelemetrySnapshot,
} from '@f1/shared';
import { OpenF1Client } from './openf1';
import type { Env } from '../types/env';

// Safe fetch helper ��� returns empty array on failure
async function safeFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error('OpenF1 fetch failed (using fallback):', err);
    return fallback;
  }
}

/**
 * Aggregate session telemetry state.
 * @param atLap - If provided, filter data to show state as of this lap (replay mode)
 */
export async function aggregateSessionState(
  env: Env,
  sessionKey: number,
  atLap?: number,
): Promise<SessionTelemetryState> {
  const client = new OpenF1Client(env);

  // Fetch drivers first (required), then everything else with fallbacks
  const drivers = await client.getDrivers(sessionKey) as OpenF1Driver[];

  if (drivers.length === 0) {
    return {
      sessionKey,
      currentLap: 0,
      totalLaps: null,
      weather: null,
      drivers: [],
      raceControlMessages: [],
      timestamp: new Date().toISOString(),
    };
  }

  // Fetch remaining data in parallel — each with safe fallback
  const [positions, allLaps, intervals, stints, weather, raceControl] =
    await Promise.all([
      safeFetch(() => client.getPositions(sessionKey) as Promise<OpenF1Position[]>, []),
      safeFetch(() => client.getLaps(sessionKey) as Promise<OpenF1Lap[]>, []),
      safeFetch(() => client.getIntervals(sessionKey) as Promise<OpenF1Interval[]>, []),
      safeFetch(() => client.getStints(sessionKey) as Promise<OpenF1Stint[]>, []),
      safeFetch(() => client.getWeather(sessionKey) as Promise<OpenF1Weather[]>, []),
      safeFetch(() => client.getRaceControl(sessionKey) as Promise<OpenF1RaceControl[]>, []),
    ]);

  // If replaying at a specific lap, filter laps and find the cutoff timestamp
  const laps = atLap
    ? allLaps.filter((l) => l.lap_number <= atLap)
    : allLaps;

  // Find the timestamp of the atLap for filtering time-based data
  let cutoffDate: Date | null = null;
  if (atLap) {
    const lapDates = laps
      .filter((l) => l.lap_number === atLap && l.date_start)
      .map((l) => new Date(l.date_start));
    if (lapDates.length > 0) {
      // Use the latest date_start for this lap (covers all drivers)
      cutoffDate = new Date(Math.max(...lapDates.map((d) => d.getTime())));
      // Add some buffer for lap duration (~2 minutes)
      cutoffDate = new Date(cutoffDate.getTime() + 120000);
    }
  }

  // Filter time-based data for replay
  const filteredPositions = cutoffDate
    ? positions.filter((p) => new Date(p.date) <= cutoffDate!)
    : positions;
  const filteredIntervals = cutoffDate
    ? intervals.filter((i) => new Date(i.date) <= cutoffDate!)
    : intervals;
  const filteredWeather = cutoffDate
    ? weather.filter((w) => new Date(w.date) <= cutoffDate!)
    : weather;
  const filteredRaceControl = cutoffDate
    ? raceControl.filter((r) => new Date(r.date) <= cutoffDate!)
    : raceControl;
  const filteredStints = atLap
    ? stints.filter((s) => s.lap_start <= atLap)
    : stints;

  // Get latest position for each driver
  const latestPositions = new Map<number, number>();
  for (const pos of filteredPositions) {
    latestPositions.set(pos.driver_number, pos.position);
  }

  // Get latest interval for each driver
  const latestIntervals = new Map<number, { gap: number | null; interval: number | null }>();
  for (const int of filteredIntervals) {
    latestIntervals.set(int.driver_number, {
      gap: int.gap_to_leader,
      interval: int.interval,
    });
  }

  // Get latest lap for each driver
  const latestLaps = new Map<number, OpenF1Lap>();
  for (const lap of laps) {
    const existing = latestLaps.get(lap.driver_number);
    if (!existing || lap.lap_number > existing.lap_number) {
      latestLaps.set(lap.driver_number, lap);
    }
  }

  // Get best lap time for each driver (up to current lap)
  const bestLapTimes = new Map<number, number>();
  for (const lap of laps) {
    if (lap.lap_duration !== null) {
      const current = bestLapTimes.get(lap.driver_number);
      if (!current || lap.lap_duration < current) {
        bestLapTimes.set(lap.driver_number, lap.lap_duration);
      }
    }
  }

  // Get current stint for each driver
  const currentStints = new Map<number, OpenF1Stint>();
  for (const stint of filteredStints) {
    const existing = currentStints.get(stint.driver_number);
    if (!existing || stint.stint_number > existing.stint_number) {
      currentStints.set(stint.driver_number, stint);
    }
  }

  // Calculate total laps from all data
  const totalLapsFromData = allLaps.length > 0
    ? Math.max(...allLaps.map((l) => l.lap_number))
    : null;

  // Build driver snapshots
  const driverSnapshots: DriverTelemetrySnapshot[] = drivers.map((d) => {
    const latestLap = latestLaps.get(d.driver_number);
    const intervalData = latestIntervals.get(d.driver_number);
    const stint = currentStints.get(d.driver_number);
    const lapNum = latestLap?.lap_number ?? 0;

    return {
      driverNumber: d.driver_number,
      nameAcronym: d.name_acronym,
      teamColour: d.team_colour,
      teamName: d.team_name,
      position: latestPositions.get(d.driver_number) ?? 0,
      lastLapTime: latestLap?.lap_duration ?? null,
      bestLapTime: bestLapTimes.get(d.driver_number) ?? null,
      gapToLeader: intervalData?.gap ?? null,
      interval: intervalData?.interval ?? null,
      currentSpeed: 0,
      gear: 0,
      throttle: 0,
      brake: 0,
      drs: 0,
      currentStint: stint
        ? {
            compound: stint.compound,
            lapStart: stint.lap_start,
            tyreAge: lapNum - stint.lap_start + stint.tyre_age_at_start,
          }
        : null,
      sectors: {
        s1: latestLap?.duration_sector_1 ?? null,
        s2: latestLap?.duration_sector_2 ?? null,
        s3: latestLap?.duration_sector_3 ?? null,
      },
      location: null,
      lapNumber: lapNum,
    };
  });

  // Sort by position
  driverSnapshots.sort((a, b) => (a.position || 99) - (b.position || 99));

  // Find current lap (max across all drivers)
  const currentLap = atLap ?? Math.max(...driverSnapshots.map((d) => d.lapNumber), 0);

  // Latest weather
  const latestWeather = filteredWeather.length > 0 ? filteredWeather[filteredWeather.length - 1] : null;

  return {
    sessionKey,
    currentLap,
    totalLaps: totalLapsFromData,
    weather: latestWeather,
    drivers: driverSnapshots,
    raceControlMessages: filteredRaceControl.slice(-20),
    timestamp: new Date().toISOString(),
  };
}
