import { motion } from 'framer-motion';
import type { EngineerMessage } from '@f1/shared';

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'border-l-f1-red glow-red',
  high: 'border-l-f1-orange glow-orange',
  medium: 'border-l-f1-cyan',
  info: 'border-l-f1-text-muted',
};

const CATEGORY_COLORS: Record<string, string> = {
  tire_strategy: '#ffd700',
  pit_window: '#e10600',
  gap_analysis: '#00d4ff',
  weather: '#00ff88',
  race_control: '#ff6b35',
  fuel_management: '#a855f7',
  risk_assessment: '#e10600',
  position_change: '#00d4ff',
  general: '#8888aa',
};

const CATEGORY_LABELS: Record<string, string> = {
  tire_strategy: 'TYRE STRATEGY',
  pit_window: 'PIT WINDOW',
  gap_analysis: 'GAP ANALYSIS',
  weather: 'WEATHER',
  race_control: 'RACE CONTROL',
  fuel_management: 'FUEL',
  risk_assessment: 'RISK',
  position_change: 'POSITION',
  general: 'INFO',
};

interface RadioMessageProps {
  message: EngineerMessage;
  isNew?: boolean;
}

export default function RadioMessage({ message, isNew }: RadioMessageProps) {
  const priorityStyle = PRIORITY_STYLES[message.priority] || '';
  const categoryColor = CATEGORY_COLORS[message.category] || '#888';
  const categoryLabel = CATEGORY_LABELS[message.category] || message.category.toUpperCase();

  const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: 40 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`border-l-2 pl-3 pr-2 py-2 ${priorityStyle} ${
        isNew ? 'radio-static-overlay active' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-f1-text-muted">
            LAP {message.lap}
          </span>
          <span className="text-[9px] font-mono text-f1-text-muted">
            {time}
          </span>
        </div>
        <span
          className="text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded"
          style={{
            color: categoryColor,
            backgroundColor: `${categoryColor}15`,
          }}
        >
          {categoryLabel}
        </span>
      </div>

      {/* Message */}
      <p className="text-sm leading-relaxed text-f1-text italic">
        "{message.message}"
      </p>

      {/* Reasoning */}
      {message.reasoning && (
        <p className="text-[10px] text-f1-text-muted mt-1">
          {message.reasoning}
        </p>
      )}
    </motion.div>
  );
}
