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
      className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-left transition-colors duration-200 hover:bg-f1-bg-tertiary ${
        selected ? 'bg-f1-bg-tertiary glow-cyan' : ''
      }`}
    >
      {/* Position */}
      <span className="w-5 text-xs font-mono font-bold text-f1-text-secondary text-right">
        {driver.position || '--'}
      </span>

      {/* Team color bar */}
      <div
        className="w-1 h-5 rounded-full"
        style={{ backgroundColor: `#${driver.teamColour}` }}
      />

      {/* Driver name */}
      <span className="w-10 text-xs font-bold tracking-wider truncate">
        {driver.nameAcronym}
      </span>

      {/* Interval */}
      <span className="flex-1 text-[10px] font-mono text-f1-text-secondary text-right">
        {driver.position === 1 ? 'LEADER' : formatInterval(driver.interval)}
      </span>

      {/* Last lap */}
      <span className="w-16 text-[10px] font-mono text-right text-f1-text-secondary">
        {formatLapTime(driver.lastLapTime)}
      </span>

      {/* Tire badge */}
      {driver.currentStint && (
        <Badge compound={driver.currentStint.compound} size="sm" />
      )}
    </motion.button>
  );
}
