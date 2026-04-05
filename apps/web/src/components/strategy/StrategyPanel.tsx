import { useTelemetryStore } from '../../stores/telemetryStore';
import { COMPOUND_COLORS } from '@f1/shared';
import Panel from '../common/Panel';

export default function StrategyPanel() {
  const { state } = useTelemetryStore();

  if (!state) {
    return (
      <Panel title="Tire Strategy" className="h-full">
        <div className="flex items-center justify-center h-full text-xs text-f1-text-muted">
          Waiting for data...
        </div>
      </Panel>
    );
  }

  // Only show drivers that have stint data
  const driversWithStints = state.drivers.filter((d) => d.currentStint);
  const maxLap = state.currentLap || 1;

  return (
    <Panel title="Tire Strategy" className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 min-h-0">
        {driversWithStints.slice(0, 10).map((driver) => {
          if (!driver.currentStint) return null;
          const compound = driver.currentStint.compound;
          const stintStart = driver.currentStint.lapStart;
          const stintWidth = ((driver.lapNumber - stintStart + 1) / maxLap) * 100;
          const stintLeft = (stintStart / maxLap) * 100;

          return (
            <div key={driver.driverNumber} className="flex items-center gap-2">
              <span className="w-8 text-[10px] font-bold text-f1-text-secondary">
                {driver.nameAcronym}
              </span>
              <div className="flex-1 h-4 bg-f1-bg rounded-sm relative">
                <div
                  className="absolute h-full rounded-sm opacity-80"
                  style={{
                    left: `${stintLeft}%`,
                    width: `${Math.min(stintWidth, 100 - stintLeft)}%`,
                    backgroundColor: COMPOUND_COLORS[compound] || '#888',
                  }}
                />
                {/* Pulsing edge for current stint */}
                <div
                  className="absolute top-0 h-full w-1 bg-white/40 animate-pulse-glow rounded-r"
                  style={{
                    left: `${Math.min(stintLeft + stintWidth, 100)}%`,
                  }}
                />
              </div>
              <span className="w-12 text-[9px] font-mono text-f1-text-muted text-right">
                {driver.currentStint.tyreAge}L old
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
