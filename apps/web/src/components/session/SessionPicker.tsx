import { motion } from 'framer-motion';
import type { OpenF1Session } from '@f1/shared';

interface SessionPickerProps {
  sessions: OpenF1Session[];
  selected: OpenF1Session | null;
  onSelect: (session: OpenF1Session) => void;
}

const SESSION_ORDER = ['Practice 1', 'Practice 2', 'Practice 3', 'Sprint Qualifying', 'Sprint', 'Qualifying', 'Race'];

const SESSION_SHORT: Record<string, string> = {
  'Practice 1': 'FP1',
  'Practice 2': 'FP2',
  'Practice 3': 'FP3',
  'Sprint Qualifying': 'SQ',
  'Sprint': 'SPR',
  'Qualifying': 'QUALI',
  'Race': 'RACE',
};

const SESSION_ICONS: Record<string, string> = {
  'Practice 1': 'P',
  'Practice 2': 'P',
  'Practice 3': 'P',
  'Sprint Qualifying': 'Q',
  'Sprint': 'S',
  'Qualifying': 'Q',
  'Race': 'R',
};

export default function SessionPicker({ sessions, selected, onSelect }: SessionPickerProps) {
  const sorted = [...sessions].sort((a, b) => {
    const aIdx = SESSION_ORDER.indexOf(a.session_name);
    const bIdx = SESSION_ORDER.indexOf(b.session_name);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {sorted.map((session, i) => {
        const isSelected = selected?.session_key === session.session_key;
        const isRace = session.session_name === 'Race';
        const short = SESSION_SHORT[session.session_name] || session.session_name;
        const icon = SESSION_ICONS[session.session_name] || '?';
        const date = new Date(session.date_start);
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        return (
          <motion.button
            key={session.session_key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(session)}
            className={`relative flex flex-col items-center gap-1 px-3 py-4 rounded-lg transition-all duration-200 w-[100px] ${
              isSelected
                ? 'bg-f1-red text-white shadow-[0_0_20px_rgba(225,6,0,0.3)]'
                : isRace
                ? 'bg-f1-bg-elevated hover:bg-f1-red/20 text-f1-text border border-f1-border hover:border-f1-red/50'
                : 'bg-f1-bg-secondary hover:bg-f1-bg-tertiary text-f1-text-secondary hover:text-f1-text border border-transparent'
            }`}
          >
            {/* Icon circle */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
              isSelected
                ? 'bg-white/20'
                : isRace
                ? 'bg-f1-red/20 text-f1-red'
                : 'bg-f1-bg-tertiary text-f1-text-muted'
            }`}>
              {icon}
            </div>

            {/* Session name */}
            <span className="text-xs font-bold tracking-wider">
              {short}
            </span>

            {/* Time */}
            <span className={`text-[9px] font-mono ${isSelected ? 'text-white/70' : 'text-f1-text-muted'}`}>
              {timeStr}
            </span>

            {/* Race gets a special indicator */}
            {isRace && !isSelected && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-f1-red rounded-full animate-pulse-glow" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
