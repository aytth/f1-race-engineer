import { motion } from 'framer-motion';
import type { DriverTelemetrySnapshot } from '@f1/shared';
import { formatLapTime, formatInterval } from '@f1/shared';
import Badge from '../common/Badge';

interface DriverRowProps {
  driver: DriverTelemetrySnapshot;
  selected: boolean;
  onClick: () => void;
}

export default function DriverRow({ driver, selected, onClick }: DriverRowProps) {
  return (
    <motion.button
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-2 text-left transition-colors duration-200 hover:bg-f1-bg-tertiary ${
        selected ? 'bg-f1-bg-tertiary glow-cyan' : ''
      }`}
    >
      {/* Position */}
      <span className="w-5 text-sm font-mono font-bold text-white text-right">
        {driver.position || '--'}
      </span>

      {/* Team color bar */}
      <div
        className="w-1 h-6 rounded-full"
        style={{ backgroundColor: `#${driver.teamColour}` }}
      />

      {/* Driver name */}
      <span className="w-12 text-sm font-bold tracking-wider truncate text-white">
        {driver.nameAcronym}
      </span>

      {/* Interval */}
      <span className="flex-1 text-xs font-mono text-white/70 text-right">
        {driver.position === 1 ? 'LEADER' : formatInterval(driver.interval)}
      </span>

      {/* Last lap */}
      <span className="w-20 text-xs font-mono text-right text-white/70">
        {formatLapTime(driver.lastLapTime)}
      </span>

      {/* Tire badge */}
      {driver.currentStint && (
        <Badge compound={driver.currentStint.compound} size="sm" />
      )}
    </motion.button>
  );
}
