import { useEffect, useState, useRef } from 'react';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { fetchApi } from '../../lib/api';
import Panel from '../common/Panel';
import SpeedChart from './SpeedChart';
import GearIndicator from './GearIndicator';
import DRSIndicator from './DRSIndicator';

interface CarData {
  speed: number;
  gear: number;
  throttle: number;
  brake: number;
  drs: number;
  rpm: number;
}

export default function TelemetryPanel() {
  const { state, selectedDriver } = useTelemetryStore();
  const [carData, setCarData] = useState<CarData | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const driver = state?.drivers.find((d) => d.driverNumber === selectedDriver);
  const sessionKey = state?.sessionKey;

  // Fetch car data for selected driver
  useEffect(() => {
    if (!sessionKey || !selectedDriver) {
      setCarData(null);
      return;
    }

    const fetchCarData = async () => {
      try {
        const data = await fetchApi<CarData>('/telemetry/car', {
          session_key: String(sessionKey),
          driver_number: String(selectedDriver),
        });
        setCarData(data);
      } catch (err) {
        console.error('Car data fetch error:', err);
      }
    };

    fetchCarData();
    intervalRef.current = setInterval(fetchCarData, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionKey, selectedDriver]);

  if (!driver) {
    return (
      <Panel title="Telemetry" className="h-full">
        <div className="flex items-center justify-center h-full text-sm text-f1-text-muted">
          Select a driver to view telemetry
        </div>
      </Panel>
    );
  }

  const speed = carData?.speed ?? 0;
  const gear = carData?.gear ?? 0;
  const throttle = carData?.throttle ?? 0;
  const brake = carData?.brake ?? 0;
  const drs = carData?.drs ?? 0;

  return (
    <Panel
      title={`Telemetry — ${driver.nameAcronym}`}
      className="h-full flex flex-col"
      headerRight={
        <span
          className="text-xs font-bold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `#${driver.teamColour}20`, color: `#${driver.teamColour}` }}
        >
          #{driver.driverNumber}
        </span>
      }
    >
      <div className="flex-1 flex flex-col gap-2 p-3 min-h-0">
        {/* Speed + indicators row */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-[10px] uppercase text-f1-text-secondary mb-1">Speed</div>
            <div className="font-mono text-3xl font-bold text-f1-cyan">
              {speed}
              <span className="text-sm text-f1-text-muted ml-1">km/h</span>
            </div>
          </div>

          <GearIndicator gear={gear} />
          <DRSIndicator active={drs > 0} />
        </div>

        {/* Throttle/Brake bars */}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="text-[9px] uppercase text-f1-text-muted mb-0.5">Throttle</div>
            <div className="h-3 bg-f1-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-f1-green rounded-full transition-all duration-100"
                style={{ width: `${throttle}%` }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="text-[9px] uppercase text-f1-text-muted mb-0.5">Brake</div>
            <div className="h-3 bg-f1-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-f1-red rounded-full transition-all duration-100"
                style={{ width: `${brake}%` }}
              />
            </div>
          </div>
        </div>

        {/* Speed chart */}
        <div className="flex-1 min-h-0">
          <SpeedChart driverNumber={driver.driverNumber} speed={speed} />
        </div>

        {/* Sectors */}
        <div className="flex gap-2">
          {(['s1', 's2', 's3'] as const).map((sector, i) => {
            const raw = driver.sectors[sector];
            const num = raw == null ? null : typeof raw === 'string' ? parseFloat(raw as string) : raw;
            const display = num != null && !isNaN(num) ? num.toFixed(3) : '---.---';
            return (
              <div key={sector} className="flex-1 text-center">
                <div className="text-[9px] uppercase text-f1-text-muted">S{i + 1}</div>
                <div className="font-mono text-sm font-semibold text-f1-text">
                  {display}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
