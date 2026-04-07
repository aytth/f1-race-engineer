import { motion, AnimatePresence } from 'framer-motion';
import { useTelemetryStore } from '../../stores/telemetryStore';
import Panel from '../common/Panel';

const FLAG_COLORS: Record<string, string> = {
  GREEN: '#00ff88',
  YELLOW: '#ffd700',
  DOUBLE_YELLOW: '#ffd700',
  RED: '#e10600',
  BLUE: '#0066ff',
  BLACK_AND_WHITE: '#888888',
  CHEQUERED: '#f0f0f0',
  CLEAR: '#00ff88',
};

const FLAG_ICONS: Record<string, string> = {
  GREEN: 'GREEN FLAG',
  YELLOW: 'YELLOW FLAG',
  DOUBLE_YELLOW: 'DBL YELLOW',
  RED: 'RED FLAG',
  BLUE: 'BLUE FLAG',
  CHEQUERED: 'CHEQUERED',
  CLEAR: 'CLEAR',
};

export default function RaceControlPanel() {
  const { state } = useTelemetryStore();

  const messages = state?.raceControlMessages ?? [];

  return (
    <Panel title="Race Control" className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-xs text-f1-text-muted">
            No race control messages
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const flagColor = msg.flag ? FLAG_COLORS[msg.flag] || '#888' : null;
            const flagLabel = msg.flag ? FLAG_ICONS[msg.flag] || msg.flag : null;
            const time = new Date(msg.date).toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <motion.div
                key={`${msg.date}-${i}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="px-3 py-2 border-b border-f1-border/30 hover:bg-f1-bg-tertiary/30 transition-colors"
              >
                <div className="flex items-start gap-2">
                  {/* Flag indicator */}
                  {flagColor && (
                    <div
                      className="w-1.5 h-full min-h-[24px] rounded-full shrink-0 mt-0.5"
                      style={{ backgroundColor: flagColor }}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-2">
                        {flagLabel && (
                          <span
                            className="text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded"
                            style={{
                              color: flagColor!,
                              backgroundColor: `${flagColor}15`,
                            }}
                          >
                            {flagLabel}
                          </span>
                        )}
                        {msg.lap_number && (
                          <span className="text-[9px] font-mono text-f1-text-muted">
                            LAP {msg.lap_number}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-f1-text-muted shrink-0">
                        {time}
                      </span>
                    </div>

                    {/* Message */}
                    <p className="text-[11px] text-f1-text leading-snug">
                      {msg.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Panel>
  );
}
