import type { ReactNode } from 'react';

interface DashboardGridProps {
  timingTower: ReactNode;
  driverProfile: ReactNode;
  trackMap: ReactNode;
  telemetry: ReactNode;
  engineer: ReactNode;
  strategy: ReactNode;
  raceControl: ReactNode;
}

export default function DashboardGrid({
  timingTower,
  driverProfile,
  trackMap,
  telemetry,
  engineer,
  strategy,
  raceControl,
}: DashboardGridProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Main grid — responsive: stacks on small screens, 3-col on large */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr_320px] grid-rows-[1fr] md:grid-rows-[1fr_1fr] gap-2 p-2 min-h-0 overflow-auto md:overflow-hidden">
        {/* Timing Tower + Driver Profile - spans both rows on desktop */}
        <div className="md:row-span-2 overflow-hidden min-h-[200px] md:min-h-0 flex flex-col">
          <div className="flex-1 overflow-hidden">{timingTower}</div>
          <div className="shrink-0">{driverProfile}</div>
        </div>

        {/* Track Map - top center */}
        <div className="overflow-hidden min-h-[200px] md:min-h-0">
          {trackMap}
        </div>

        {/* Engineer - spans both rows right on desktop, after track on mobile */}
        <div className="md:row-span-2 overflow-hidden min-h-[200px] md:min-h-0 order-last lg:order-none">
          {engineer}
        </div>

        {/* Telemetry - bottom center */}
        <div className="overflow-hidden min-h-[200px] md:min-h-0">
          {telemetry}
        </div>
      </div>

      {/* Bottom bar — strategy + race control */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-2 px-2 pb-2 shrink-0" style={{ height: '120px' }}>
        <div className="overflow-hidden">{strategy}</div>
        <div className="overflow-hidden hidden md:block">{raceControl}</div>
      </div>
    </div>
  );
}
