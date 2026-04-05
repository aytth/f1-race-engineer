import { useNavigate } from 'react-router-dom';
import { useTelemetryStore } from '../../stores/telemetryStore';
import StatusLED from '../common/StatusLED';

export default function Header() {
  const navigate = useNavigate();
  const { state, connected } = useTelemetryStore();

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-f1-border bg-f1-bg-secondary/50 shrink-0">
      <div className="flex items-center gap-4">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-f1-text-secondary hover:text-f1-text transition-colors"
          title="Back to session select"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="rotate-180">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-f1-red rounded-full" />
          <h1 className="text-sm font-bold tracking-wider uppercase">
            F1 Race Engineer
          </h1>
        </div>

        {state && (
          <div className="flex items-center gap-3 text-xs text-f1-text-secondary">
            {/* Lap counter */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-f1-bg-tertiary/50 rounded">
              <span className="text-[9px] uppercase text-f1-text-muted">Lap</span>
              <span className="text-f1-text font-bold font-mono">
                {state.currentLap}
                {state.totalLaps ? `/${state.totalLaps}` : ''}
              </span>
            </div>

            {/* Weather */}
            {state.weather && (
              <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-f1-bg-tertiary/50 rounded">
                <span className="text-[10px]">
                  <span className="text-f1-text-muted">Air </span>
                  <span className="font-mono text-f1-text">{state.weather.air_temperature}°</span>
                </span>
                <span className="text-f1-border">|</span>
                <span className="text-[10px]">
                  <span className="text-f1-text-muted">Track </span>
                  <span className="font-mono text-f1-text">{state.weather.track_temperature}°</span>
                </span>
                {state.weather.humidity > 0 && (
                  <>
                    <span className="text-f1-border">|</span>
                    <span className="text-[10px]">
                      <span className="text-f1-text-muted">Hum </span>
                      <span className="font-mono text-f1-text">{state.weather.humidity}%</span>
                    </span>
                  </>
                )}
                {state.weather.wind_speed > 0 && (
                  <>
                    <span className="text-f1-border">|</span>
                    <span className="text-[10px]">
                      <span className="text-f1-text-muted">Wind </span>
                      <span className="font-mono text-f1-text">{state.weather.wind_speed} km/h</span>
                    </span>
                  </>
                )}
                {state.weather.rainfall > 0 && (
                  <>
                    <span className="text-f1-border">|</span>
                    <span className="text-[10px] text-f1-cyan font-bold animate-pulse-glow">RAIN</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {state && (
          <span className="text-[10px] text-f1-text-muted font-mono hidden sm:inline">
            {state.drivers.length} drivers
          </span>
        )}
        <StatusLED active={connected} label={connected ? 'LIVE' : 'OFFLINE'} />
      </div>
    </header>
  );
}
