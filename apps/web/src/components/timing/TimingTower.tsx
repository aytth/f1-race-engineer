import { LayoutGroup } from 'framer-motion';
import { useTelemetryStore } from '../../stores/telemetryStore';
import Panel from '../common/Panel';
import DriverRow from './DriverRow';

export default function TimingTower() {
  const { state, selectedDriver, selectDriver } = useTelemetryStore();

  if (!state) {
    return (
      <Panel title="Timing" className="h-full">
        <div className="flex items-center justify-center h-full text-sm text-f1-text-muted">
          Waiting for data...
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Timing" className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <LayoutGroup>
          {state.drivers.map((driver) => (
            <DriverRow
              key={driver.driverNumber}
              driver={driver}
              selected={selectedDriver === driver.driverNumber}
              onClick={() => selectDriver(driver.driverNumber)}
            />
          ))}
        </LayoutGroup>
      </div>
    </Panel>
  );
}
