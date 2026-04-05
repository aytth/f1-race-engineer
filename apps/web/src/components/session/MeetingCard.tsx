import { motion } from 'framer-motion';
import type { OpenF1Meeting } from '@f1/shared';

interface MeetingCardProps {
  meeting: OpenF1Meeting;
  index: number;
  selected: boolean;
  onClick: () => void;
}

// Country code → flag emoji
function countryFlag(code: string): string {
  try {
    return code
      .toUpperCase()
      .replace(/./g, (c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)));
  } catch {
    return code;
  }
}

export default function MeetingCard({ meeting, index, selected, onClick }: MeetingCardProps) {
  const startDate = new Date(meeting.date_start);
  const month = startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = startDate.getDate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={onClick}
      className={`group relative glass-panel text-left transition-all duration-200 hover:scale-[1.02] overflow-hidden ${
        selected
          ? 'border-f1-red shadow-[0_0_20px_rgba(225,6,0,0.2)]'
          : 'hover:border-f1-bg-elevated'
      }`}
    >
      {/* Top red accent on selected */}
      {selected && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-f1-red" />
      )}

      {/* Round number / date badge */}
      <div className="flex items-start justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">{countryFlag(meeting.country_code)}</span>
          <span className="text-[10px] font-mono font-bold text-f1-text-muted">
            R{String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-f1-text-muted tracking-wider">{month}</div>
          <div className="text-sm font-mono font-bold text-f1-text-secondary leading-none">{day}</div>
        </div>
      </div>

      {/* Meeting info */}
      <div className="px-4 pb-3">
        <h3 className="text-sm font-bold text-f1-text mb-0.5 truncate group-hover:text-white transition-colors">
          {meeting.meeting_name}
        </h3>
        <p className="text-[11px] text-f1-text-muted truncate">
          {meeting.circuit_short_name}
        </p>
      </div>

      {/* Bottom border accent on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-f1-red scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
    </motion.button>
  );
}
