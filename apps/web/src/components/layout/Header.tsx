import { useNavigate } from 'react-router-dom';
import { useTelemetryStore } from '../../stores/telemetryStore';
import StatusLED from '../common/StatusLED';

export default function Header() {
  const navigate = useNavigate();
  const { state, connected } = useTelemetryStore();

  return (
    <header className="relative shrink-0 border-b border-f1-border bg-f1-bg-secondary/80">
      {/* Top red accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-f1-red via-f1-red/80 to-transparent" />

      <div className="flex items-center justify-between px-4 py-2">
        {/* Left: back + branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-7 h-7 flex items-center justify-center rounded bg-f1-bg-tertiary/60 hover:bg-f1-bg-elevated text-f1-text-secondary hover:text-f1-text transition-colors"
            title="Back to session select"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-f1-red rounded-full" />
            <span className="text-xs font-black tracking-wider uppercase text-f1-text">
              F1
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-f1-text-secondary">
              Race Engineer
            </span>
          </div>
        </div>

        {/* Center: lap + weather */}
        {state && (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            {/* Lap counter */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-f1-bg-tertiary/60 rounded border border-f1-border/50">
              <span className="text-[8px] uppercase tracking-wider text-f1-text-muted font-bold">Lap</span>
              <span className="text-sm font-black font-mono text-f1-text">
                {state.currentLap}
              </span>
              {state.totalLaps && (
                <span className="text-[10px] text-f1-text-muted font-mono">
                  /{state.totalLaps}
                </span>
              )}
            </div>

            {/* Weather pill */}
            {state.weather && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-f1-bg-tertiary/40 rounded border border-f1-border/30">
                <span className="text-[10px] font-mono">
                  <span className="text-f1-text-muted">Air </span>
                  <span className="text-f1-text">{state.weather.air_temperature}°</span>
                </span>
                <span className="text-f1-border/60">|</span>
                <span className="text-[10px] font-mono">
                  <span className="text-f1-text-muted">Trk </span>
                  <span className="text-f1-text">{state.weather.track_temperature}°</span>
                </span>
                {state.weather.wind_speed > 0 && (
                  <>
                    <span className="text-f1-border/60">|</span>
                    <span className="text-[10px] font-mono text-f1-text">
                      {state.weather.wind_speed} km/h
                    </span>
                  </>
                )}
                {state.weather.rainfall > 0 && (
                  <>
                    <span className="text-f1-border/60">|</span>
                    <span className="text-[10px] text-f1-cyan font-bold animate-pulse-glow">RAIN</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Right: driver count + status */}
        <div className="flex items-center gap-3">
          {state && (
            <span className="text-[9px] text-f1-text-muted font-mono hidden sm:inline">
              {state.drivers.length} DRIVERS
            </span>
          )}
          <StatusLED active={connected} label={connected ? 'LIVE' : 'OFFLINE'} />
        </div>
      </div>
    </header>
  );
}
