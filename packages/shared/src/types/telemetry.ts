import type { OpenF1Weather, OpenF1RaceControl } from './openf1';

export interface DriverTelemetrySnapshot {
  driverNumber: number;
  nameAcronym: string;
  teamColour: string;
  teamName: string;
  position: number;
  lastLapTime: number | null;
  bestLapTime: number | null;
  gapToLeader: number | null;
  interval: number | null;
  currentSpeed: number;
  gear: number;
  throttle: number;
  brake: number;
  drs: number;
  currentStint: {
    compound: string;
    lapStart: number;
    tyreAge: number;
  } | null;
  sectors: {
    s1: number | null;
    s2: number | null;
    s3: number | null;
  };
  location: { x: number; y: number } | null;
  lapNumber: number;
}

export interface SessionTelemetryState {
  sessionKey: number;
  currentLap: number;
  totalLaps: number | null;
  weather: OpenF1Weather | null;
  drivers: DriverTelemetrySnapshot[];
  raceControlMessages: OpenF1RaceControl[];
  timestamp: string;
}
