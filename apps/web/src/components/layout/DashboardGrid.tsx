import type { ReactNode } from 'react';

interface DashboardGridProps {
  timingTower: ReactNode;
  trackMap: ReactNode;
  telemetry: ReactNode;
  engineer: ReactNode;
  strategy: ReactNode;
}

export default function DashboardGrid({
  timingTower,
  trackMap,
  telemetry,
  engineer,
  strategy,
}: DashboardGridProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-44px)]">
      {/* Main grid — responsive: stacks on small screens, 3-col on large */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr_320px] grid-rows-[1fr] md:grid-rows-[1fr_1fr] gap-2 p-2 min-h-0 overflow-auto md:overflow-hidden">
        {/* Timing Tower - spans both rows on desktop */}
        <div className="md:row-span-2 overflow-hidden min-h-[200px] md:min-h-0">
          {timingTower}
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

      {/* Strategy - full width bottom */}
      <div className="h-[100px] md:h-[120px] px-2 pb-2 shrink-0">
        {strategy}
      </div>
    </div>
  );
}
